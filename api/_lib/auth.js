// Đăng nhập bằng mật khẩu, cấp "vé" (token) có hạn 1 năm.
const crypto = require('crypto');

const PASSWORD = () => process.env.APP_PASSWORD || '08051994@'; // mật khẩu mặc định
const baseSecret = () => process.env.SECRET_KEY || crypto.createHash('sha256')
  .update('kim1994|' + (process.env.GITHUB_TOKEN || 'no-token')).digest('hex');
const hmac = (key, s) => crypto.createHmac('sha256', key).update(s).digest('base64url');
// Đổi mật khẩu thì mọi thiết bị phải đăng nhập lại
const tokenKey = () => baseSecret() + '|' + PASSWORD();

function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
function checkPassword(p) { return safeEqual(p || '', PASSWORD()); }
function makeToken() {
  const exp = String(Date.now() + 365 * 24 * 3600 * 1000);
  return exp + '.' + hmac(tokenKey(), 't' + exp);
}
function checkToken(t) {
  const [exp, sig] = String(t || '').split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return safeEqual(sig, hmac(tokenKey(), 't' + exp));
}
function requireAuth(req, res) {
  const t = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!checkToken(t)) { res.status(401).json({ error: 'Phiên đăng nhập đã hết, vui lòng đăng nhập lại' }); return false; }
  return true;
}
// Khóa cho link hẹn giờ (cron) — không đổi khi đổi mật khẩu
function cronKey() { return hmac(baseSecret(), 'cron').slice(0, 24); }

module.exports = { checkPassword, makeToken, checkToken, requireAuth, cronKey, safeEqual };
