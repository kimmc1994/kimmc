// Được cron-job.org gọi mỗi 15 phút: gửi nhắc trước show 3 ngày, 1 ngày, 1 tiếng
const gh = require('./_lib/gh');
const push = require('./_lib/push');
const { cronKey, safeEqual } = require('./_lib/auth');
const Core = require('../lib/core.js');

const TH = [
  { k: '1h', ms: 3600e3, label: 'Còn 1 tiếng nữa' },
  { k: '1d', ms: 86400e3, label: 'Còn 1 ngày nữa' },
  { k: '3d', ms: 3 * 86400e3, label: 'Còn 3 ngày nữa' }
];

module.exports = async (req, res) => {
  if (!safeEqual(String(req.query.key || ''), cronKey())) return res.status(403).json({ error: 'Sai key' });
  if (!gh.configured()) return res.status(500).json({ error: 'Chưa cài GITHUB_TOKEN / GITHUB_REPO' });
  if (!push.ready()) return res.json({ ok: true, note: 'Chưa cài khóa VAPID nên chưa gửi' });
  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const now = Date.now();
    const vn = new Date(now + 7 * 3600e3);
    const today = Core.iso(vn.getUTCFullYear(), vn.getUTCMonth() + 1, vn.getUTCDate());
    const { data } = await gh.getFile('config.json');
    const cfg = data || {};
    const subs = cfg.pushSubs || [];
    if (!subs.length) return res.json({ ok: true, note: 'Chưa có thiết bị nào bật thông báo' });
    const sent = cfg.sent || {};
    const upcoming = Core.activeOcc(cfg.shows || [], Core.addDays(today, -1), Core.addDays(today, 4))
      .map(o => Object.assign({}, o, { at: Core.showTimeUTC(o.iso, o.show.time) }))
      .filter(o => o.at > now);
    const badge = upcoming.filter(o => o.at - now <= 3 * 86400e3).length;

    const toSend = [], newKeys = [];
    for (const o of upcoming) {
      const hit = TH.filter(t => now >= o.at - t.ms);
      if (!hit.length) continue;
      const base = o.show.id + '|' + o.iso + '|';
      if (!sent[base + hit[0].k]) toSend.push({ o, t: hit[0], tag: base + hit[0].k });
      for (const t of hit) if (!sent[base + t.k]) newKeys.push(base + t.k);
    }
    if (!newKeys.length) return res.json({ ok: true, sent: 0, badge });

    let total = 0; const dead = new Set();
    for (const { o, t, tag } of toSend) {
      const P = Core.period(o.show.time);
      const L = Core.toLunar(o.iso);
      const p = Core.parse(o.iso);
      const body = `${P.icon} Show ${P.name.toLowerCase()} lúc ${P.clock} • ${Core.weekday(o.iso)} ${p.d}/${p.m} (âm ${L.day}/${L.month})` +
        (o.show.address ? ` • ${o.show.address}` : '');
      const r = await push.sendAll(host, subs, { title: `🔔 ${t.label}: ${o.show.name}`, body, tag, badge });
      total += r.sent; r.dead.forEach(d => dead.add(d));
    }
    await gh.updateFile('config.json', () => ({ version: 1, shows: [], bauShows: [], pushSubs: [], sent: {} }), c => {
      c.sent = c.sent || {};
      for (const k of newKeys) c.sent[k] = now;
      const cut = Core.addDays(today, -10);
      for (const k of Object.keys(c.sent)) { const d = k.split('|')[1]; if (!d || d < cut) delete c.sent[k]; }
      if (dead.size) c.pushSubs = (c.pushSubs || []).filter(s => !dead.has(s.endpoint));
    }, 'Ghi nhận đã gửi nhắc show');
    return res.json({ ok: true, sent: total, badge });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};
