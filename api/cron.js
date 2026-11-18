// Được cron-job.org gọi mỗi 15 phút:
//  1) Nhắc trước show 3 ngày, 1 ngày, 1 tiếng
//  2) Mỗi sáng (mặc định 7:00 giờ VN) gửi 1 thông báo tóm tắt + cập nhật SỐ TRÊN ICON app
const gh = require('./_lib/gh');
const push = require('./_lib/push');
const { cronKey, safeEqual } = require('./_lib/auth');
const Core = require('../lib/core.js');

const TH = [
  { k: '1h', ms: 3600e3, label: 'Còn 1 tiếng nữa' },
  { k: '1d', ms: 86400e3, label: 'Còn 1 ngày nữa' },
  { k: '3d', ms: 3 * 86400e3, label: 'Còn 3 ngày nữa' }
];
const MORNING_HOUR = Math.min(23, Math.max(0, parseInt(process.env.MORNING_HOUR || '7', 10) || 7));
const DEF = () => ({ version: 1, shows: [], bauShows: [], pushSubs: [], sent: {} });

function vnToday(now) {
  const vn = new Date(now + 7 * 3600e3);
  return { iso: Core.iso(vn.getUTCFullYear(), vn.getUTCMonth() + 1, vn.getUTCDate()), hour: vn.getUTCHours() };
}
// Số trên icon = sự kiện của NGÀY HÔM ĐÓ: show hôm nay (chưa xác nhận) + show chờ xác nhận hoàn thành
function counts(shows, now, today) {
  const up = Core.activeOcc(shows, Core.addDays(today, -1), Core.addDays(today, 4))
    .filter(o => !Core.money(o.show, o.iso).status)
    .map(o => Object.assign({}, o, { at: Core.showTimeUTC(o.iso, o.show.time) }))
    .filter(o => o.at > now);
  const soon = up.filter(o => o.at - now <= 3 * 86400e3);
  const pending = Core.occList(shows, Core.addDays(today, -120), today).filter(o => {
    if (Core.money(o.show, o.iso).status) return false;
    if (Core.showTimeUTC(o.iso, o.show.time) > now) return false;
    if ((o.show.repeat || 'none') !== 'none' && o.show.createdAt) {
      const c = new Date(Number(o.show.createdAt) + 7 * 3600e3);
      if (o.iso < Core.iso(c.getUTCFullYear(), c.getUTCMonth() + 1, c.getUTCDate())) return false;
    }
    return true;
  });
  const todayShows = up.filter(o => o.iso === today);
  const todayPast = pending.filter(o => o.iso === today).length;
  return { up, soon, pending, todayShows, badge: todayShows.length + pending.length, todayAll: todayShows.length + todayPast };
}
function fakePhone(p) { return /(\d)\1{4,}/.test(String(p || '').replace(/\D/g, '')); }
function line(o) {
  const P = Core.period(o.show.time);
  return `${P.icon} ${P.clock} ${P.name.toLowerCase()} – ${o.show.name}`;
}

module.exports = async (req, res) => {
  // Ai được gọi: Vercel Cron (tự chạy mỗi sáng, cài sẵn trong vercel.json) hoặc link có key (cron-job.org, không bắt buộc)
  const ua = String(req.headers['user-agent'] || '');
  const auth = String(req.headers.authorization || '');
  const okKey = safeEqual(String((req.query || {}).key || ''), cronKey());
  const okVercel = /vercel-cron/i.test(ua) && (!process.env.CRON_SECRET || auth === 'Bearer ' + process.env.CRON_SECRET);
  if (!okKey && !okVercel) return res.status(403).json({ error: 'Sai key' });
  if (!gh.configured()) return res.status(500).json({ error: 'Chưa cài GITHUB_TOKEN / GITHUB_REPO' });
  if (!(await push.ready())) return res.json({ ok: true, note: 'Chưa tạo được khóa thông báo' });
  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const now = Date.now();
    const { iso: today, hour } = vnToday(now);
    const { data } = await gh.getFile('config.json');
    const cfg = data || DEF();
    const subs = cfg.pushSubs || [];
    if (!subs.length) return res.json({ ok: true, note: 'Chưa có thiết bị nào bật thông báo' });
    const sent = cfg.sent || {};
    const C = counts(cfg.shows || [], now, today);
    const badge = C.badge;

    const msgs = [], newKeys = [];
    // 1) Nhắc trước giờ show
    for (const o of C.up) {
      const hit = TH.filter(t => now >= o.at - t.ms);
      if (!hit.length) continue;
      const base = o.show.id + '|' + o.iso + '|';
      if (!sent[base + hit[0].k]) {
        const P = Core.period(o.show.time), L = Core.toLunar(o.iso), p = Core.parse(o.iso);
        msgs.push({
          title: `🔔 ${hit[0].label}: ${o.show.name}`,
          body: `${P.icon} Show ${P.name.toLowerCase()} lúc ${P.clock} • ${Core.weekday(o.iso)} ${p.d}/${p.m} (âm ${L.day}/${L.month})` + (o.show.address ? ` • ${o.show.address}` : ''),
          tag: base + hit[0].k
        });
      }
      for (const t of hit) if (!sent[base + t.k]) newKeys.push(base + t.k);
    }
    // 2) Bản tin buổi sáng: CHỈ gửi khi ngày hôm đó có sự kiện. Hết sự kiện thì không gửi gì.
    const mk = 'morning|' + today;
    let morning = sent[mk] ? 'đã gửi sáng nay' : 'chưa tới giờ (' + MORNING_HOUR + 'h)';
    if (hour >= MORNING_HOUR && !sent[mk]) {
      newKeys.push(mk);
      if (badge > 0) {
        const parts = [];
        if (C.todayShows.length) parts.push(`Hôm nay ${C.todayShows.length} show: ` + C.todayShows.map(line).join('; '));
        if (C.pending.length) parts.push(`⏳ ${C.pending.length} show chờ xác nhận hoàn thành`);
        const phones = (cfg.shows || []).filter(s => fakePhone(s.phone) && !((s.repeat || 'none') === 'none' && s.date < today)).length +
          (cfg.bauShows || []).filter(b => fakePhone(b.phone)).length;
        if (phones) parts.push(`📞 ${phones} số điện thoại cần cập nhật`);
        msgs.push({ title: `☀️ Hôm nay bạn có ${badge} sự kiện`, body: parts.join(' • '), tag: mk });
        morning = 'đã gửi';
      } else morning = 'hôm nay không có sự kiện, không gửi';
    }
    if (!newKeys.length) return res.json({ ok: true, sent: 0, badge, morning });

    let total = 0; const dead = new Set();
    for (const m of msgs) {
      const r = await push.sendAll(host, subs, Object.assign(m, { badge }));
      total += r.sent; r.dead.forEach(d => dead.add(d));
    }
    await gh.updateFile('config.json', DEF, c => {
      c.sent = c.sent || {};
      for (const k of newKeys) c.sent[k] = now;
      if (total) c.lastPushAt = now;
      const cut = Core.addDays(today, -10);
      for (const k of Object.keys(c.sent)) { const d = k.split('|')[1]; if (!d || d < cut) delete c.sent[k]; }
      if (dead.size) c.pushSubs = (c.pushSubs || []).filter(s => !dead.has(s.endpoint));
    }, 'Ghi nhận đã gửi thông báo');
    return res.json({ ok: true, sent: total, badge, morning });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
};
module.exports.counts = counts;
module.exports.vnToday = vnToday;
