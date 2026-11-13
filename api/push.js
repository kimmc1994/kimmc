// Đăng ký thiết bị nhận thông báo + gửi thử
const gh = require('./_lib/gh');
const push = require('./_lib/push');
const { requireAuth } = require('./_lib/auth');
const DEF_CFG = () => ({ version: 1, shows: [], bauShows: [], pushSubs: [], sent: {} });

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Chỉ nhận POST' });
  if (!gh.configured()) return res.status(500).json({ error: 'Chưa cài GITHUB_TOKEN / GITHUB_REPO' });
  if (!push.ready()) return res.status(400).json({ error: 'Chưa cài khóa thông báo (VAPID) — xem HUONG-DAN.md Bước 7' });
  const b = req.body || {};
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  try {
    if (b.action === 'subscribe') {
      const s = b.sub || {};
      if (!/^https:\/\//.test(s.endpoint || '') || !s.keys || !s.keys.p256dh || !s.keys.auth) return res.status(400).json({ error: 'Đăng ký không hợp lệ' });
      await gh.updateFile('config.json', DEF_CFG, c => {
        c.pushSubs = (c.pushSubs || []).filter(x => x.endpoint !== s.endpoint);
        c.pushSubs.push({ endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth }, addedAt: Date.now(), ua: String(req.headers['user-agent'] || '').slice(0, 120) });
        c.pushSubs = c.pushSubs.slice(-20);
      }, 'Thêm thiết bị nhận thông báo');
      return res.json({ ok: true });
    }
    if (b.action === 'test') {
      const { data } = await gh.getFile('config.json');
      const subs = (data && data.pushSubs) || [];
      if (!subs.length) return res.status(400).json({ error: 'Chưa có thiết bị nào bật thông báo' });
      const r = await push.sendAll(host, subs, { title: '🔔 Thử thông báo', body: 'Quản Lý $ Của Kim đã gửi thông báo thành công!', tag: 'test' });
      if (r.dead.length) await gh.updateFile('config.json', DEF_CFG, c => { c.pushSubs = (c.pushSubs || []).filter(x => !r.dead.includes(x.endpoint)); }, 'Bỏ thiết bị hết hạn');
      return res.json({ ok: true, sent: r.sent, total: subs.length });
    }
    return res.status(400).json({ error: 'Thao tác không hợp lệ' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || 'Lỗi máy chủ' });
  }
};
