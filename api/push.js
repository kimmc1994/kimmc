// Bật / tắt thông báo trên 1 máy + gửi thử
const gh = require('./_lib/gh');
const push = require('./_lib/push');
const { requireAuth } = require('./_lib/auth');
const DEF_CFG = () => ({ version: 1, shows: [], bauShows: [], pushSubs: [], sent: {} });

function deviceName(ua) {
  ua = String(ua || '');
  if (/iPad/.test(ua)) return 'iPad';
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/Android/.test(ua)) return 'Điện thoại Android';
  if (/Macintosh/.test(ua)) return 'Máy Mac';
  if (/Windows/.test(ua)) return 'Máy tính Windows';
  return 'Thiết bị khác';
}

module.exports = async (req, res) => {
  if (!requireAuth(req, res, 'v')) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Chỉ nhận POST' });
  if (!gh.configured()) return res.status(500).json({ error: 'Chưa cài GITHUB_TOKEN / GITHUB_REPO' });
  const b = req.body || {};
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  try {
    if (!(await push.ready())) return res.status(500).json({ error: 'Chưa tạo được khóa thông báo, thử lại sau' });
    if (b.action === 'subscribe') {
      const s = b.sub || {};
      if (!/^https:\/\//.test(s.endpoint || '') || !s.keys || !s.keys.p256dh || !s.keys.auth) return res.status(400).json({ error: 'Đăng ký không hợp lệ' });
      const name = deviceName(req.headers['user-agent']) + (b.standalone ? ' (app màn hình chính)' : '');
      await gh.updateFile('config.json', DEF_CFG, c => {
        const old = (c.pushSubs || []).find(x => x.endpoint === s.endpoint);
        c.pushSubs = (c.pushSubs || []).filter(x => x.endpoint !== s.endpoint);
        c.pushSubs.push({ endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth }, addedAt: old ? old.addedAt : Date.now(), ua: name });
        c.pushSubs = c.pushSubs.slice(-20);
      }, 'Bật thông báo: ' + name);
      return res.json({ ok: true });
    }
    if (b.action === 'unsubscribe') {
      await gh.updateFile('config.json', DEF_CFG, c => { c.pushSubs = (c.pushSubs || []).filter(x => x.endpoint !== b.endpoint); }, 'Tắt thông báo trên 1 máy');
      return res.json({ ok: true });
    }
    if (b.action === 'test') {
      const { data } = await gh.getFile('config.json');
      const all = (data && data.pushSubs) || [];
      const subs = b.endpoint ? all.filter(x => x.endpoint === b.endpoint) : all;
      if (!subs.length) return res.status(400).json({ error: 'Máy này chưa bật thông báo' });
      const { counts, vnToday } = require('./cron');
      const badge = counts(data.shows || [], Date.now(), vnToday(Date.now()).iso).badge;
      const r = await push.sendAll(host, subs, { title: '🔔 Thử thông báo', body: 'Thông báo đã chạy! Số trên icon app hiện là ' + badge + '.', tag: 'test', badge });
      if (r.dead.length) await gh.updateFile('config.json', DEF_CFG, c => { c.pushSubs = (c.pushSubs || []).filter(x => !r.dead.includes(x.endpoint)); }, 'Bỏ thiết bị hết hạn');
      return res.json({ ok: true, sent: r.sent, total: subs.length });
    }
    return res.status(400).json({ error: 'Thao tác không hợp lệ' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Lỗi máy chủ' });
  }
};
