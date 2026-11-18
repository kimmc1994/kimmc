// Gửi thông báo đẩy (Web Push) tới iPhone / iPad / máy tính.
// Khóa VAPID: dùng biến môi trường nếu có, nếu không TỰ TẠO 1 lần và cất trong kho dữ liệu riêng tư (data/push-keys.json).
const crypto = require('crypto');
const gh = require('./gh');
let cache = null;

function genKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const jp = publicKey.export({ format: 'jwk' }), jk = privateKey.export({ format: 'jwk' });
  const pub = Buffer.concat([Buffer.from([4]), Buffer.from(jp.x, 'base64url'), Buffer.from(jp.y, 'base64url')]).toString('base64url');
  return { publicKey: pub, privateKey: jk.d, createdAt: Date.now() };
}
async function getKeys() {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) return { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY };
  if (cache) return cache;
  if (!gh.configured()) return null;
  const f = await gh.getFile('push-keys.json');
  if (f.data && f.data.publicKey && f.data.privateKey) return (cache = f.data);
  const k = genKeys();
  try { await gh.putFile('push-keys.json', k, null, 'Tạo khóa thông báo'); }
  catch (e) { if (e.conflict) { const g = await gh.getFile('push-keys.json'); if (g.data) return (cache = g.data); } throw e; }
  return (cache = k);
}
async function ready() { try { return !!(await getKeys()); } catch (e) { return false; } }
async function sendAll(host, subs, payload) {
  const keys = await getKeys();
  const webpush = require('web-push');
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || ('https://' + host), keys.publicKey, keys.privateKey);
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
module.exports = { ready, sendAll, getKeys };
