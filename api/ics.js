// Tạo file lịch (.ics) để thêm vào Lịch của iPhone/Android/Google với 3 lần nhắc:
// trước 3 ngày, trước 1 ngày, trước 1 tiếng.
module.exports = (req, res) => {
  let p;
  try { p = JSON.parse(Buffer.from(String(req.query.d || ''), 'base64url').toString('utf8')); }
  catch (e) { return res.status(400).send('Sai dữ liệu'); }
  const start = new Date(Number(p.s));
  if (isNaN(start.getTime())) return res.status(400).send('Sai giờ');
  const T = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const E = s => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  const uid = String(p.u || Date.now()).replace(/[^\w-]/g, '');
  const end = new Date(start.getTime() + 3 * 3600e3);
  const pre = new Date(start.getTime() - 3 * 86400e3);
  const desc = [p.w && ('Thời gian: ' + p.w), p.h && ('Chủ tiệc: ' + p.h), p.b && ('Bầu show: ' + p.b), p.p && ('SĐT: ' + p.p), p.a && ('Địa chỉ: ' + p.a), p.m && ('Bản đồ: ' + p.m)].filter(Boolean).join('\n');
  const now = T(new Date());
  const alarm = (trigger, text) => ['BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + E(text), 'TRIGGER:' + trigger, 'END:VALARM'];
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Kim1994//QuanLy//VI', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', `UID:${uid}-show@kim1994`, 'DTSTAMP:' + now, 'DTSTART:' + T(start), 'DTEND:' + T(end),
    'SUMMARY:' + E('🎤 ' + p.n), 'LOCATION:' + E(p.a), 'DESCRIPTION:' + E(desc),
    ...(/^https?:\/\//.test(p.m || '') ? ['URL:' + p.m] : []),
    ...alarm('-P1D', 'Còn 1 ngày tới show: ' + p.n),
    ...alarm('-PT1H', 'Còn 1 tiếng tới show: ' + p.n),
    'END:VEVENT',
    'BEGIN:VEVENT', `UID:${uid}-nhac3ngay@kim1994`, 'DTSTAMP:' + now, 'DTSTART:' + T(pre), 'DTEND:' + T(new Date(pre.getTime() + 15 * 60e3)),
    'SUMMARY:' + E('⏰ Còn 3 ngày tới show: ' + p.n), 'DESCRIPTION:' + E(desc),
    ...alarm('PT0M', 'Còn 3 ngày tới show: ' + p.n),
    'END:VEVENT', 'END:VCALENDAR'
  ];
  // gấp dòng dài theo chuẩn iCalendar
  const fold = l => { const c = Array.from(l), out = []; for (let i = 0; i < c.length; i += 60) out.push((i ? ' ' : '') + c.slice(i, i + 60).join('')); return out.join('\r\n'); };
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'inline; filename="show-kim.ics"');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(lines.map(fold).join('\r\n') + '\r\n');
};
