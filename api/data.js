// Đọc / ghi dữ liệu: show, bầu show, thu chi (lưu trong kho GitHub riêng tư)
const gh = require('./_lib/gh');
const { requireAuth } = require('./_lib/auth');

const LIMIT = 1024 * 1024 * 1024; // mốc hiển thị 1 GB (GitHub khuyên kho < 1 GB)
const DEF_CFG = () => ({ version: 1, shows: [], bauShows: [], pushSubs: [], sent: {} });
const DEF_TC = y => ({ version: 1, year: Number(y), entries: [] });
const CATS = ['hottoc', 'massage', 'botiem', 'khac', 'chi'];
const ISO = /^\d{4}-\d{2}-\d{2}$/;

const str = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const money = v => Math.max(0, Math.round(Number(v) || 0));
const id = v => String(v || '').replace(/[^\w-]/g, '').slice(0, 40);

function cleanEntry(e) {
  e = e || {};
  const cat = CATS.includes(e.cat) ? e.cat : null;
  if (!id(e.id) || !ISO.test(e.date || '') || !cat) throw Object.assign(new Error('Dữ liệu thu chi không hợp lệ'), { code: 400 });
  return { id: id(e.id), date: e.date, type: cat === 'chi' ? 'chi' : 'thu', cat, amount: money(e.amount), note: str(e.note, 300), updatedAt: Number(e.updatedAt) || Date.now() };
}
function cleanShow(s) {
  s = s || {};
  if (!id(s.id) || !str(s.name) || !ISO.test(s.date || '')) throw Object.assign(new Error('Dữ liệu show không hợp lệ'), { code: 400 });
  const lunar = s.lunar ? { d: +s.lunar.d || 1, m: +s.lunar.m || 1, y: +s.lunar.y || 2000, leap: s.lunar.leap ? 1 : 0 } : null;
  const overrides = {};
  for (const [k, v] of Object.entries(s.overrides || {})) if (ISO.test(k) && v) overrides[k] = { received: money(v.received), tip: money(v.tip) };
  return {
    id: id(s.id), name: str(s.name, 120), host: str(s.host, 120), bauId: id(s.bauId), bauName: str(s.bauName, 120),
    address: str(s.address, 400), map: str(s.map, 600), phone: str(s.phone, 30),
    dateType: s.dateType === 'duong' ? 'duong' : 'am', date: s.date, lunar,
    time: /^\d{2}:\d{2}$/.test(s.time || '') ? s.time : '',
    repeat: ['none', 'month', 'year'].includes(s.repeat) ? s.repeat : 'none',
    received: money(s.received), tip: money(s.tip), note: str(s.note, 500), overrides,
    createdAt: Number(s.createdAt) || Date.now(), updatedAt: Date.now()
  };
}
function cleanBau(b) {
  b = b || {};
  if (!id(b.id) || !str(b.name)) throw Object.assign(new Error('Dữ liệu bầu show không hợp lệ'), { code: 400 });
  return { id: id(b.id), name: str(b.name, 120), phone: str(b.phone, 30) };
}
function applyOp(arr, action, x) {
  const key = action === 'delete' ? x : x.id;
  const i = arr.findIndex(v => v.id === key);
  if (action === 'delete') { if (i >= 0) arr.splice(i, 1); }
  else if (i >= 0) arr[i] = x; else arr.push(x);
}
const storageInfo = files => ({ used: files.reduce((a, f) => a + (f.size || 0), 0), limit: LIMIT, files });

module.exports = async (req, res) => {
  if (!gh.configured()) return res.status(500).json({ error: 'Chưa cài GITHUB_TOKEN và GITHUB_REPO trong Vercel (xem HUONG-DAN.md, Bước 4)' });
  if (!requireAuth(req, res)) return;
  try {
    if (req.method === 'GET') {
      const year = /^\d{4}$/.test(req.query.year || '') ? req.query.year : String(new Date().getFullYear());
      const [files, cfg, tc] = await Promise.all([gh.listData(), gh.getFile('config.json'), gh.getFile(`thuchi-${year}.json`)]);
      const c = cfg.data || DEF_CFG();
      const years = files.map(f => (f.name.match(/^thuchi-(\d{4})\.json$/) || [])[1]).filter(Boolean);
      return res.status(200).json({
        year, years, shows: c.shows || [], bauShows: c.bauShows || [],
        entries: (tc.data && tc.data.entries) || [],
        storage: storageInfo(files), vapidPublic: process.env.VAPID_PUBLIC_KEY || null
      });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Phương thức không hỗ trợ' });
    const b = req.body || {};

    if (b.action === 'deleteYear') {
      const y = String(b.year || '');
      if (!/^\d{4}$/.test(y)) return res.status(400).json({ error: 'Năm không hợp lệ' });
      await gh.deleteFile(`thuchi-${y}.json`, `Xóa thu chi năm ${y}`);
      await gh.updateFile('config.json', DEF_CFG, c => {
        c.shows = (c.shows || []).filter(s => !((s.repeat || 'none') === 'none' && String(s.date).startsWith(y + '-')));
        for (const s of c.shows) for (const k of Object.keys(s.overrides || {})) if (k.startsWith(y + '-')) delete s.overrides[k];
      }, `Xóa show năm ${y}`);
      return res.status(200).json({ ok: true });
    }

    const { action, kind } = b;
    if (!['upsert', 'delete'].includes(action)) return res.status(400).json({ error: 'Thao tác không hợp lệ' });

    if (kind === 'show' || kind === 'bau') {
      const key = kind === 'show' ? 'shows' : 'bauShows';
      const item = action === 'delete' ? id(b.id) : (kind === 'show' ? cleanShow(b.item) : cleanBau(b.item));
      const label = kind === 'show' ? 'show' : 'bầu show';
      await gh.updateFile('config.json', DEF_CFG, c => { c[key] = c[key] || []; applyOp(c[key], action, item); },
        `${action === 'delete' ? 'Xóa' : 'Lưu'} ${label}${action === 'delete' ? '' : ': ' + item.name}`);
      return res.status(200).json({ ok: true });
    }

    if (kind === 'entry') {
      const item = action === 'delete' ? id(b.id) : cleanEntry(b.item);
      const y = action === 'delete' ? String(b.year || '') : item.date.slice(0, 4);
      if (!/^\d{4}$/.test(y)) return res.status(400).json({ error: 'Thiếu năm' });
      await gh.updateFile(`thuchi-${y}.json`, () => DEF_TC(y), d => {
        d.entries = d.entries || [];
        applyOp(d.entries, action, item);
        d.entries.sort((a, z) => (a.date === z.date ? 0 : a.date < z.date ? -1 : 1));
      }, `${action === 'delete' ? 'Xóa' : 'Lưu'} thu chi${action === 'delete' ? '' : ' ngày ' + item.date}`);
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ error: 'Loại dữ liệu không hợp lệ' });
  } catch (e) {
    console.error(e);
    return res.status(e.code || 500).json({ error: e.message || 'Lỗi máy chủ' });
  }
};
