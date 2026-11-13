// Gửi thông báo đẩy (Web Push) tới iPhone / iPad / máy tính
function ready() { return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY); }
function lib(host) {
  const webpush = require('web-push');
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || ('https://' + host), process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  return webpush;
}
async function sendAll(host, subs, payload) {
  const webpush = lib(host);
  const dead = []; let sent = 0;
  await Promise.all((subs || []).map(async s => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, JSON.stringify(payload), { TTL: 6 * 3600, urgency: 'high' });
      sent++;
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) dead.push(s.endpoint);
      else console.error('push lỗi', e.statusCode, e.body || e.message);
    }
  }));
  return { sent, dead };
}
module.exports = { ready, sendAll };
