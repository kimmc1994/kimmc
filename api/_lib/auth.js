// Đăng nhập bằng mật khẩu. 2 loại "vé":
//  - vé XEM (v): nhớ trên máy 1 năm → mở app là xem được, không cần nhập mật khẩu
//  - vé SỬA (e): chỉ 20 phút → thêm / sửa / xóa phải nhập mật khẩu
const crypto = require('crypto');

const PASSWORD = () => process.env.APP_PASSWORD || '08051994@'; // mật khẩu mặc định
const EDIT_MINUTES = 20;
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
function makeToken(scope) {
  scope = scope === 'v' ? 'v' : 'e';
  const exp = String(Date.now() + (scope === 'v' ? 365 * 24 * 3600e3 : EDIT_MINUTES * 60e3));
  return scope + '.' + exp + '.' + hmac(tokenKey(), scope + exp);
}
// Trả về 'e' (được sửa), 'v' (chỉ xem) hoặc '' (không hợp lệ)
function tokenScope(t) {
  const [scope, exp, sig] = String(t || '').split('.');
  if (!['v', 'e'].includes(scope) || !exp || !sig || Number(exp) < Date.now()) return '';
  return safeEqual(sig, hmac(tokenKey(), scope + exp)) ? scope : '';
}
function bearer(req) { return String(req.headers.authorization || '').replace(/^Bearer\s+/i, ''); }
// need = 'v' (xem) hoặc 'e' (sửa)
function requireAuth(req, res, need) {
  const sc = tokenScope(bearer(req));
  if (!sc) { res.status(401).json({ error: 'Cần đăng nhập', need: need || 'e' }); return false; }
  if ((need || 'e') === 'e' && sc !== 'e') { res.status(401).json({ error: 'Phiên sửa đã hết 20 phút, nhập lại mật khẩu', need: 'e' }); return false; }
  return true;
}
// Khóa cho link hẹn giờ (cron) — không đổi khi đổi mật khẩu
function cronKey() { return hmac(baseSecret(), 'cron').slice(0, 24); }

module.exports = { checkPassword, makeToken, tokenScope, requireAuth, cronKey, safeEqual, EDIT_MINUTES };
