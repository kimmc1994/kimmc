// Tạo khóa thông báo (VAPID) và link hẹn giờ — chỉ hiện khi đã đăng nhập
const crypto = require('crypto');
const { requireAuth, cronKey } = require('./_lib/auth');

module.exports = (req, res) => {
  if (!requireAuth(req, res)) return;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const cronUrl = `https://${host}/api/cron?key=${cronKey()}`;
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) return res.json({ configured: true, cronUrl });
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const jp = publicKey.export({ format: 'jwk' });
  const jk = privateKey.export({ format: 'jwk' });
  const pub = Buffer.concat([Buffer.from([4]), Buffer.from(jp.x, 'base64url'), Buffer.from(jp.y, 'base64url')]).toString('base64url');
  res.json({ configured: false, publicKey: pub, privateKey: jk.d, cronUrl });
};
