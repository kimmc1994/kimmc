/*
 * Lịch âm Việt Nam (múi giờ +7) — thuật toán của Hồ Ngọc Đức.
 * Dùng chung cho trình duyệt (window.Lunar) và máy chủ Vercel (require).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Lunar = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var PI = Math.PI;
  var TZ = 7;
  function INT(d) { return Math.floor(d); }

  function jdFromDate(dd, mm, yy) {
    var a = INT((14 - mm) / 12);
    var y = yy + 4800 - a;
    var m = mm + 12 * a - 3;
    var jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
    if (jd < 2299161) jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
    return jd;
  }

  function jdToDate(jd) {
    var a, b, c;
    if (jd > 2299160) { a = jd + 32044; b = INT((4 * a + 3) / 146097); c = a - INT((b * 146097) / 4); }
    else { b = 0; c = jd + 32082; }
    var d = INT((4 * c + 3) / 1461);
    var e = c - INT((1461 * d) / 4);
    var m = INT((5 * e + 2) / 153);
    var day = e - INT((153 * m + 2) / 5) + 1;
    var month = m + 3 - 12 * INT(m / 10);
    var year = b * 100 + d - 4800 + INT(m / 10);
    return [day, month, year];
  }

  function NewMoon(k) {
    var T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = PI / 180;
    var Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    var M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    var Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    var F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    var C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
    C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
    C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
    C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
    C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
    var deltat;
    if (T < -11) deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
    else deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
    return Jd1 + C1 - deltat;
  }

  function SunLongitude(jdn) {
    var T = (jdn - 2451545.0) / 36525, T2 = T * T, dr = PI / 180;
    var M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    var L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    var DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
    var L = (L0 + DL) * dr;
    L = L - PI * 2 * INT(L / (PI * 2));
    return L;
  }

  function getSunLongitude(dayNumber, tz) { return INT(SunLongitude(dayNumber - 0.5 - tz / 24) / PI * 6); }
  function getNewMoonDay(k, tz) { return INT(NewMoon(k) + 0.5 + tz / 24); }

  function getLunarMonth11(yy, tz) {
    var off = jdFromDate(31, 12, yy) - 2415021;
    var k = INT(off / 29.530588853);
    var nm = getNewMoonDay(k, tz);
    if (getSunLongitude(nm, tz) >= 9) nm = getNewMoonDay(k - 1, tz);
    return nm;
  }

  function getLeapMonthOffset(a11, tz) {
    var k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    var last, i = 1;
    var arc = getSunLongitude(getNewMoonDay(k + i, tz), tz);
    do { last = arc; i++; arc = getSunLongitude(getNewMoonDay(k + i, tz), tz); } while (arc != last && i < 14);
    return i - 1;
  }

  function convertSolar2Lunar(dd, mm, yy, tz) {
    var dayNumber = jdFromDate(dd, mm, yy);
    var k = INT((dayNumber - 2415021.076998695) / 29.530588853);
    var monthStart = getNewMoonDay(k + 1, tz);
    if (monthStart > dayNumber) monthStart = getNewMoonDay(k, tz);
    var a11 = getLunarMonth11(yy, tz), b11 = a11, lunarYear;
    if (a11 >= monthStart) { lunarYear = yy; a11 = getLunarMonth11(yy - 1, tz); }
    else { lunarYear = yy + 1; b11 = getLunarMonth11(yy + 1, tz); }
    var lunarDay = dayNumber - monthStart + 1;
    var diff = INT((monthStart - a11) / 29);
    var lunarLeap = 0, lunarMonth = diff + 11;
    if (b11 - a11 > 365) {
      var leapMonthDiff = getLeapMonthOffset(a11, tz);
      if (diff >= leapMonthDiff) {
        lunarMonth = diff + 10;
        if (diff == leapMonthDiff) lunarLeap = 1;
      }
    }
    if (lunarMonth > 12) lunarMonth = lunarMonth - 12;
    if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
    return [lunarDay, lunarMonth, lunarYear, lunarLeap];
  }

  function convertLunar2Solar(lunarDay, lunarMonth, lunarYear, lunarLeap, tz) {
    var a11, b11;
    if (lunarMonth < 11) { a11 = getLunarMonth11(lunarYear - 1, tz); b11 = getLunarMonth11(lunarYear, tz); }
    else { a11 = getLunarMonth11(lunarYear, tz); b11 = getLunarMonth11(lunarYear + 1, tz); }
    var k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
    var off = lunarMonth - 11;
    if (off < 0) off += 12;
    if (b11 - a11 > 365) {
      var leapOff = getLeapMonthOffset(a11, tz);
      var leapMonth = leapOff - 2;
      if (leapMonth < 0) leapMonth += 12;
      if (lunarLeap != 0 && lunarMonth != leapMonth) return [0, 0, 0];
      else if (lunarLeap != 0 || off >= leapOff) off += 1;
    }
    var monthStart = getNewMoonDay(k + off, tz);
    return jdToDate(monthStart + lunarDay - 1);
  }

  /* ===== API gọn ===== */
  function s2l(d, m, y) {
    var r = convertSolar2Lunar(d, m, y, TZ);
    return { day: r[0], month: r[1], year: r[2], leap: r[3] };
  }
  // Trả về null nếu ngày âm không tồn tại (VD: tháng nhuận không có, ngày 30 của tháng thiếu)
  function l2s(d, m, y, leap) {
    leap = leap ? 1 : 0;
    var r = convertLunar2Solar(d, m, y, leap, TZ);
    if (!r[0]) return null;
    var b = convertSolar2Lunar(r[0], r[1], r[2], TZ);
    if (b[0] !== d || b[1] !== m || b[2] !== y || b[3] !== leap) return null;
    return { day: r[0], month: r[1], year: r[2] };
  }
  // Số ngày của tháng âm (29 hoặc 30), 0 nếu tháng không tồn tại
  function monthLen(m, y, leap) {
    var s = l2s(1, m, y, leap);
    if (!s) return 0;
    var t = jdToDate(jdFromDate(s.day, s.month, s.year) + 29);
    var b = convertSolar2Lunar(t[0], t[1], t[2], TZ);
    return b[0] === 30 ? 30 : 29;
  }
  var CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  var CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  function canChi(y) { return CAN[(y + 6) % 10] + ' ' + CHI[(y + 8) % 12]; }

  return { s2l: s2l, l2s: l2s, monthLen: monthLen, canChi: canChi, jdFromDate: jdFromDate, jdToDate: jdToDate };
});
