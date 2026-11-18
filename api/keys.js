// Link hẹn giờ (không bắt buộc) cho cron-job.org để nhắc sát giờ show (trước 1 tiếng)
const { requireAuth, cronKey } = require('./_lib/auth');
module.exports = (req, res) => {
  if (!requireAuth(req, res, 'v')) return;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  res.json({ cronUrl: `https://${host}/api/cron?key=${cronKey()}` });
};
