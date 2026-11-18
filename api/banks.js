// Số tài khoản ngân hàng: XEM công khai (để gửi link cho khách chuyển khoản), THÊM / SỬA / XÓA cần đăng nhập.
// Lưu ở data/banks.json trong kho dữ liệu riêng tư.
const gh = require('./_lib/gh');
const { requireAuth } = require('./_lib/auth');

const DEF = () => ({ version: 1, banks: [] });
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const id = v => String(v || '').replace(/[^\w-]/g, '').slice(0, 40);
const MAX_QR = 450 * 1024; // ảnh QR đã thu nhỏ trên máy, tối đa ~450KB

function clean(b) {
  b = b || {};
  if (!id(b.id) || !str(b.bank, 120) || !str(b.number, 40)) throw Object.assign(new Error('Nhập đủ Tên ngân hàng và Số tài khoản'), { code: 400 });
  let qr = typeof b.qr === 'string' ? b.qr : '';
  if (qr && (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(qr) || qr.length > MAX_QR)) throw Object.assign(new Error('Ảnh QR không hợp lệ hoặc quá lớn'), { code: 400 });
  return { id: id(b.id), bank: str(b.bank, 120), owner: str(b.owner, 120), number: str(b.number, 40), branch: str(b.branch, 120), note: str(b.note, 200), qr, updatedAt: Date.now() };
}

module.exports = async (req, res) => {
  if (!gh.configured()) return res.status(500).json({ error: 'Chưa cài GITHUB_TOKEN và GITHUB_REPO' });
  try {
    if (req.method === 'GET') {
      const { data } = await gh.getFile('banks.json');
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ banks: (data && data.banks) || [] });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Phương thức không hỗ trợ' });
    if (!requireAuth(req, res, 'e')) return;
    const b = req.body || {};
    if (b.action === 'upsert') {
      const item = clean(b.item);
      await gh.updateFile('banks.json', DEF, d => {
        d.banks = d.banks || [];
        const i = d.banks.findIndex(x => x.id === item.id);
        if (i >= 0) d.banks[i] = item; else d.banks.push(item);
      }, 'Lưu số tài khoản: ' + item.bank);
      return res.json({ ok: true });
    }
    if (b.action === 'delete') {
      const k = id(b.id);
      await gh.updateFile('banks.json', DEF, d => { d.banks = (d.banks || []).filter(x => x.id !== k); }, 'Xóa 1 số tài khoản');
      return res.json({ ok: true });
    }
    if (b.action === 'order') {
      const ids = Array.isArray(b.ids) ? b.ids.map(id) : [];
      await gh.updateFile('banks.json', DEF, d => {
        d.banks = (d.banks || []).slice().sort((x, y) => (ids.indexOf(x.id) + 1 || 999) - (ids.indexOf(y.id) + 1 || 999));
      }, 'Sắp xếp số tài khoản');
      return res.json({ ok: true });
    }
    return res.status(400).json({ error: 'Thao tác không hợp lệ' });
  } catch (e) {
    console.error(e);
    return res.status(e.code || 500).json({ error: e.message || 'Lỗi máy chủ' });
  }
};
