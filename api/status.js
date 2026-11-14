// Kiểm tra kết nối dữ liệu: biến môi trường, token GitHub, quyền đọc/ghi kho, thư mục data, khóa thông báo
const { requireAuth } = require('./_lib/auth');

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;
  const t0 = Date.now();
  const checks = [];
  const add = (name, ok, detail, fix) => checks.push({ name, ok, detail, fix: ok ? '' : (fix || '') });
  const host = process.env.RENDER ? 'Render' : process.env.VERCEL ? 'Vercel' : 'Máy chủ khác';
  add('Máy chủ app', true, 'Đang chạy trên ' + host);

  const token = String(process.env.GITHUB_TOKEN || '').trim();
  const repo = String(process.env.GITHUB_REPO || '').trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/\/+$/, '');
  const branch = process.env.GITHUB_BRANCH || 'main';
  const where = host === 'Render' ? 'Render → dịch vụ kim1994 → Environment' : 'Vercel → kim1994 → Settings → Environment Variables';
  add('Biến GITHUB_TOKEN', !!token, token ? 'Đã có (…' + token.slice(-4) + ')' : 'Chưa cài', 'Thêm GITHUB_TOKEN ở ' + where + ' rồi deploy lại');
  const repoOk = /^[^/\s]+\/[^/\s]+$/.test(repo);
  add('Biến GITHUB_REPO', repoOk, repo || 'Chưa cài', 'GITHUB_REPO phải có dạng tên-tài-khoản/tên-kho (VD kimmc1994/kimmc) ở ' + where);
  add('Mật khẩu riêng (APP_PASSWORD)', true, process.env.APP_PASSWORD ? 'Đã cài' : 'Đang dùng mật khẩu mặc định');

  if (token && repoOk) {
    const gh = (p, o = {}) => fetch('https://api.github.com' + p, Object.assign({}, o, {
      headers: Object.assign({ Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'kim1994-app' }, o.headers || {})
    }));
    try {
      const u = await gh('/user');
      if (u.status === 401) add('Token GitHub hợp lệ', false, 'Token sai, đã bị xóa hoặc hết hạn', 'Tạo token mới (HUONG-DAN.md Bước 3) rồi dán vào GITHUB_TOKEN ở ' + where);
      else add('Token GitHub hợp lệ', true, 'GitHub chấp nhận token');

      const r = await gh('/repos/' + repo);
      if (r.ok) {
        const j = await r.json();
        add('Mở được kho dữ liệu', true, repo + (j.private ? ' (riêng tư ✓)' : ' (⚠️ đang CÔNG KHAI, nên đổi sang Private)'));
        const d = await gh(`/repos/${repo}/contents/data?ref=${encodeURIComponent(branch)}`);
        let cfgSha = null;
        if (d.ok) {
          const files = await d.json();
          const cfg = Array.isArray(files) && files.find(f => f.name === 'config.json');
          cfgSha = cfg ? cfg.sha : null;
          add('Thư mục data', true, (Array.isArray(files) ? files.length : 0) + ' file dữ liệu');
        } else add('Thư mục data', true, 'Chưa có — sẽ tự tạo khi lưu lần đầu');
        if (cfgSha) {
          // Thử ghi với mã sai: có quyền ghi → GitHub trả 409 (không thay đổi gì); không có quyền → 403/404
          const w = await gh(`/repos/${repo}/contents/data/config.json`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'kiem tra', content: Buffer.from('{}').toString('base64'), sha: '0000000000000000000000000000000000000000', branch })
          });
          const canWrite = w.status === 409 || w.status === 422;
          add('Quyền ghi dữ liệu', canWrite, canWrite ? 'Ghi được' : 'Không ghi được (lỗi ' + w.status + ')',
            'Vào GitHub → Settings → Developer settings → Fine-grained tokens → bấm token → Edit → Contents: Read and write');
        }
      } else {
        add('Mở được kho dữ liệu', false, 'GitHub báo lỗi ' + r.status,
          r.status === 404 ? 'Sai tên kho trong GITHUB_REPO, hoặc token chưa được chọn kho này (token → Edit → Repository access)' : 'Kiểm tra lại token và tên kho');
      }
    } catch (e) {
      add('Kết nối tới GitHub', false, 'Không gọi được GitHub: ' + e.message, 'Thử lại sau vài phút');
    }
  }
  const vapid = !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
  add('Khóa thông báo (không bắt buộc)', true, vapid ? 'Đã cài' : 'Chưa cài — chỉ nhắc khi đang mở app (xem HUONG-DAN.md Bước 8)');
  res.status(200).json({ ok: checks.every(c => c.ok), host, ms: Date.now() - t0, checks, at: Date.now() });
};
