// Lịch show công khai (KHÔNG cần đăng nhập) để mở app là thấy ngay.
// Chỉ trả thông tin lịch: tên show, ngày giờ, địa điểm, bản đồ, trạng thái.
// KHÔNG trả số điện thoại, tiền show, ghi chú, người liên hệ của bầu show.
const gh = require('./_lib/gh');

module.exports = async (req, res) => {
  if (!gh.configured()) return res.status(500).json({ error: 'Chưa cài GITHUB_TOKEN và GITHUB_REPO' });
  try {
    const { data } = await gh.getFile('config.json');
    const c = data || {};
    const shows = (c.shows || []).map(s => {
      const overrides = {};
      for (const [k, v] of Object.entries(s.overrides || {})) if (v && v.status) overrides[k] = { status: v.status };
      return {
        id: s.id, name: s.name, host: s.host || '', bauId: s.bauId || '', bauName: s.bauName || '',
        address: s.address || '', map: s.map || '', dateType: s.dateType, date: s.date, lunar: s.lunar,
        time: s.time, repeat: s.repeat || 'none', overrides, createdAt: s.createdAt
      };
    });
    const bauShows = (c.bauShows || []).map(b => ({ id: b.id, name: b.name }));
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ shows, bauShows, public: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Lỗi máy chủ' });
  }
};
