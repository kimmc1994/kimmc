// Đọc / ghi file JSON trong kho GitHub riêng tư dùng làm "cơ sở dữ liệu".
const API = 'https://api.github.com';

function cfg() {
  const repo = String(process.env.GITHUB_REPO || '').trim()
    .replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/\/+$/, '');
  return { token: String(process.env.GITHUB_TOKEN || '').trim(), repo, branch: process.env.GITHUB_BRANCH || 'main' };
}
function configured() { const c = cfg(); return !!(c.token && /^[^/\s]+\/[^/\s]+$/.test(c.repo)); }

function gh(path, opts = {}) {
  const c = cfg();
  const headers = Object.assign({
    Authorization: 'Bearer ' + c.token,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'kim1994-app'
  }, opts.headers || {});
  return fetch(API + path, Object.assign({}, opts, { headers }));
}
const filePath = name => `/repos/${cfg().repo}/contents/data/${encodeURIComponent(name)}`;

async function fail(r, what) {
  let hint = '';
  if (r.status === 401) hint = ' — GITHUB_TOKEN sai hoặc đã hết hạn';
  if (r.status === 403) hint = ' — token chưa có quyền Contents: Read and write';
  if (r.status === 404) hint = ' — sai GITHUB_REPO hoặc token chưa được chọn kho dữ liệu';
  const e = new Error(`GitHub báo lỗi ${r.status} khi ${what}${hint}`);
  e.status = r.status;
  return e;
}

async function listData() {
  const c = cfg();
  const r = await gh(`/repos/${c.repo}/contents/data?ref=${encodeURIComponent(c.branch)}`);
  if (r.status === 404) {
    const rr = await gh(`/repos/${c.repo}`);
    if (!rr.ok) throw await fail(rr, 'mở kho dữ liệu');
    return [];
  }
  if (!r.ok) throw await fail(r, 'đọc danh sách dữ liệu');
  const a = await r.json();
  return Array.isArray(a) ? a.filter(f => f.type === 'file').map(f => ({ name: f.name, size: f.size })) : [];
}

async function getFile(name) {
  const c = cfg();
  const p = filePath(name) + '?ref=' + encodeURIComponent(c.branch);
  const r = await gh(p);
  if (r.status === 404) return { data: null, sha: null, size: 0 };
  if (!r.ok) throw await fail(r, 'đọc ' + name);
  const j = await r.json();
  let txt;
  if (j.encoding === 'base64' && j.content) txt = Buffer.from(j.content, 'base64').toString('utf8');
  else {
    const r2 = await gh(p, { headers: { Accept: 'application/vnd.github.raw+json' } });
    if (!r2.ok) throw await fail(r2, 'đọc ' + name);
    txt = await r2.text();
  }
  let data;
  try { data = JSON.parse(txt); } catch (e) { throw new Error('File ' + name + ' bị hỏng định dạng JSON'); }
  return { data, sha: j.sha, size: j.size };
}

async function putFile(name, data, sha, message) {
  const c = cfg();
  const body = {
    message: message || ('Cập nhật ' + name),
    content: Buffer.from(JSON.stringify(data, null, 1), 'utf8').toString('base64'),
    branch: c.branch
  };
  if (sha) body.sha = sha;
  const r = await gh(filePath(name), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (r.status === 409 || r.status === 422) { const e = new Error('conflict'); e.conflict = true; throw e; }
  if (!r.ok) throw await fail(r, 'lưu ' + name);
  return r.json();
}

// Đọc → sửa → ghi, tự thử lại nếu 2 thiết bị lưu cùng lúc
async function updateFile(name, makeDefault, mutate, message) {
  for (let i = 0; i < 5; i++) {
    const { data, sha } = await getFile(name);
    const d = data || makeDefault();
    const out = mutate(d);
    try { await putFile(name, d, sha, message); return out; }
    catch (e) {
      if (!e.conflict) throw e;
      await new Promise(res => setTimeout(res, 300 * (i + 1)));
    }
  }
  throw new Error('Đang có thiết bị khác lưu cùng lúc, thử lại sau vài giây');
}

async function deleteFile(name, message) {
  const { sha } = await getFile(name);
  if (!sha) return false;
  const c = cfg();
  const r = await gh(filePath(name), {
    method: 'DELETE', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: message || ('Xóa ' + name), sha, branch: c.branch })
  });
  if (!r.ok) throw await fail(r, 'xóa ' + name);
  return true;
}

module.exports = { configured, listData, getFile, putFile, updateFile, deleteFile };
