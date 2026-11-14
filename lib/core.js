/*
 * Logic dùng chung: ngày tháng, ngày lễ, lặp lại show, tiền, buổi sáng/chiều.
 * Trình duyệt: window.Core — Máy chủ: require('../lib/core.js')
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./lunar.js'));
  else root.Core = factory(root.Lunar);
})(typeof self !== 'undefined' ? self : this, function (Lunar) {
  'use strict';
  var pad = function (n) { return String(n).padStart(2, '0'); };
  function iso(y, m, d) { return y + '-' + pad(m) + '-' + pad(d); }
  function parse(s) { var a = String(s).split('-').map(Number); return { y: a[0], m: a[1], d: a[2] }; }
  function dim(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
  function addDays(s, n) {
    var p = parse(s); var t = new Date(Date.UTC(p.y, p.m - 1, p.d + n));
    return iso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
  }
  function dow(s) { var p = parse(s); return new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay(); }
  var WD = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  var WDS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  function weekday(s) { return WD[dow(s)]; }
  function weekdayShort(s) { return WDS[dow(s)]; }

  var lcache = {};
  function toLunar(s) {
    if (lcache[s]) return lcache[s];
    var p = parse(s); var r = Lunar.s2l(p.d, p.m, p.y);
    lcache[s] = r; return r;
  }
  function fromLunar(d, m, y, leap) {
    var r = Lunar.l2s(d, m, y, leap ? 1 : 0);
    return r ? iso(r.year, r.month, r.day) : null;
  }
  function lunarMonthLen(m, y, leap) { return Lunar.monthLen(m, y, leap ? 1 : 0); }
  function fromLunarClamp(d, m, y, leap) {
    var len = lunarMonthLen(m, y, leap);
    if (!len) return null;
    return fromLunar(Math.min(d, len), m, y, leap);
  }
  function canChi(y) { return Lunar.canChi(y); }

  /* ===== Ngày lễ ===== */
  var SOLAR_H = {
    '1-1': 'Tết Dương lịch', '3-2': 'Thành lập Đảng CSVN', '14-2': 'Lễ Tình nhân',
    '8-3': 'Quốc tế Phụ nữ', '30-4': 'Giải phóng miền Nam', '1-5': 'Quốc tế Lao động',
    '19-5': 'Sinh nhật Bác Hồ', '1-6': 'Quốc tế Thiếu nhi', '28-6': 'Ngày Gia đình Việt Nam',
    '27-7': 'Thương binh Liệt sĩ', '2-9': 'Quốc khánh', '20-10': 'Phụ nữ Việt Nam',
    '20-11': 'Nhà giáo Việt Nam', '22-12': 'Quân đội Nhân dân', '24-12': 'Đêm Giáng sinh',
    '25-12': 'Lễ Giáng sinh'
  };
  var LUNAR_H = {
    '1-1': 'Tết Nguyên Đán', '2-1': 'Mùng 2 Tết', '3-1': 'Mùng 3 Tết', '15-1': 'Rằm tháng Giêng',
    '3-3': 'Tết Hàn thực', '10-3': 'Giỗ Tổ Hùng Vương', '15-4': 'Lễ Phật Đản',
    '5-5': 'Tết Đoan Ngọ', '15-7': 'Lễ Vu Lan', '15-8': 'Tết Trung Thu',
    '9-9': 'Tết Trùng Cửu', '23-12': 'Ông Công Ông Táo'
  };
  function holidays(s) {
    var p = parse(s), L = toLunar(s), out = [];
    var k1 = p.d + '-' + p.m;
    if (SOLAR_H[k1]) out.push({ name: SOLAR_H[k1], type: 'duong' });
    var k2 = L.day + '-' + L.month;
    if (!L.leap && LUNAR_H[k2]) out.push({ name: LUNAR_H[k2], type: 'am' });
    var nx = toLunar(addDays(s, 1));
    if (nx.day === 1 && nx.month === 1 && !nx.leap) out.push({ name: 'Giao thừa', type: 'am' });
    return out;
  }

  /* ===== Lặp lại show ===== */
  function occurrences(show, from, to) {
    var res = [];
    var start = show && show.date;
    if (!start) return res;
    var lo = from > start ? from : start;
    if (lo > to) return res;
    var rep = show.repeat || 'none';
    if (rep === 'none') { if (start >= from && start <= to) res.push(start); return res; }
    var s, y, m, i, lp;
    if (show.dateType === 'am' && show.lunar) {
      var ld = show.lunar.d, lm = show.lunar.m;
      var a = toLunar(lo), b = toLunar(to);
      if (rep === 'year') {
        for (y = a.year - 1; y <= b.year + 1; y++) {
          s = fromLunarClamp(ld, lm, y, 0);
          if (s && s >= lo && s <= to) res.push(s);
        }
      } else {
        y = a.year; m = a.month;
        for (i = 0; i < 60; i++) {
          for (lp = 0; lp <= 1; lp++) {
            s = fromLunarClamp(ld, m, y, lp);
            if (s && s >= lo && s <= to) res.push(s);
          }
          if (y > b.year || (y === b.year && m >= b.month)) break;
          m++; if (m > 12) { m = 1; y++; }
        }
      }
    } else {
      var sp = parse(start), A = parse(lo), B = parse(to);
      if (rep === 'year') {
        for (y = A.y; y <= B.y; y++) {
          s = iso(y, sp.m, Math.min(sp.d, dim(y, sp.m)));
          if (s >= lo && s <= to) res.push(s);
        }
      } else {
        y = A.y; m = A.m;
        while (y < B.y || (y === B.y && m <= B.m)) {
          s = iso(y, m, Math.min(sp.d, dim(y, m)));
          if (s >= lo && s <= to) res.push(s);
          m++; if (m > 12) { m = 1; y++; }
        }
      }
    }
    var seen = {}, out = [];
    res.sort().forEach(function (x) { if (!seen[x]) { seen[x] = 1; out.push(x); } });
    return out;
  }
  function occList(shows, from, to) {
    var out = [];
    (shows || []).forEach(function (sh) {
      occurrences(sh, from, to).forEach(function (s) { out.push({ show: sh, iso: s }); });
    });
    out.sort(function (a, b) {
      if (a.iso !== b.iso) return a.iso < b.iso ? -1 : 1;
      return String(a.show.time || '').localeCompare(String(b.show.time || ''));
    });
    return out;
  }
  // Tiền + trạng thái của 1 lần diễn. status: '' (chưa xác nhận) | 'done' (đã hoàn thành) | 'cancel' (đã hủy)
  function money(show, s) {
    var o = (show.overrides || {})[s] || {};
    return {
      received: o.received != null ? Number(o.received) || 0 : Number(show.received) || 0,
      tip: o.tip != null ? Number(o.tip) || 0 : Number(show.tip) || 0,
      other: Number(o.other) || 0, otherNote: o.otherNote || '', cancelReason: o.cancelReason || '',
      status: o.status === 'done' || o.status === 'cancel' ? o.status : '',
      doneAt: o.doneAt || 0
    };
  }
  // Danh sách lần diễn, bỏ các lần đã hủy
  function activeOcc(shows, from, to) {
    return occList(shows, from, to).filter(function (o) { return money(o.show, o.iso).status !== 'cancel'; });
  }

  /* ===== Buổi trong ngày ===== */
  function period(t) {
    if (!t || !/^\d{1,2}:\d{2}$/.test(t)) return { key: 'none', name: 'Chưa có giờ', icon: '🕒', clock: '--:--', text: 'chưa có giờ' };
    var a = t.split(':').map(Number), h = a[0], mi = a[1], key, name, icon;
    if (h >= 4 && h < 11) { key = 'sang'; name = 'Sáng'; icon = '☀️'; }
    else if (h >= 11 && h < 13) { key = 'trua'; name = 'Trưa'; icon = '🌤️'; }
    else if (h >= 13 && h < 18) { key = 'chieu'; name = 'Chiều'; icon = '🌇'; }
    else if (h >= 18 && h < 23) { key = 'toi'; name = 'Tối'; icon = '🌙'; }
    else { key = 'dem'; name = 'Đêm'; icon = '🌙'; }
    var h12 = h % 12 === 0 ? 12 : h % 12;
    var clock = h12 + ':' + pad(mi);
    return { key: key, name: name, icon: icon, clock: clock, text: clock + ' ' + name.toLowerCase(), h: h, mi: mi };
  }
  // Mốc giờ show (giờ Việt Nam) đổi ra mili-giây UTC
  function showTimeUTC(s, t) {
    var p = parse(s);
    var hm = /^\d{1,2}:\d{2}$/.test(t || '') ? t.split(':').map(Number) : [7, 0];
    return Date.UTC(p.y, p.m - 1, p.d, hm[0], hm[1]) - 7 * 3600 * 1000;
  }

  /* ===== Tiền ===== */
  function dots(n) {
    n = Math.round(Number(n) || 0);
    var neg = n < 0; n = Math.abs(n);
    return (neg ? '-' : '') + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  function vnd(n) { return dots(n) + 'đ'; }
  function fold(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  }

  return {
    pad: pad, iso: iso, parse: parse, dim: dim, addDays: addDays, dow: dow, weekday: weekday, weekdayShort: weekdayShort,
    toLunar: toLunar, fromLunar: fromLunar, fromLunarClamp: fromLunarClamp, lunarMonthLen: lunarMonthLen, canChi: canChi,
    holidays: holidays, occurrences: occurrences, occList: occList, activeOcc: activeOcc, money: money,
    period: period, showTimeUTC: showTimeUTC, dots: dots, vnd: vnd, fold: fold
  };
});
