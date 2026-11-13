const { checkPassword, makeToken } = require('./_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Chỉ nhận POST' });
  const p = (req.body || {}).password;
  if (!checkPassword(p)) {
    await new Promise(r => setTimeout(r, 700)); // chống dò mật khẩu
    return res.status(401).json({ error: 'Sai mật khẩu' });
  }
  res.status(200).json({ token: makeToken() });
};
