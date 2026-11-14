/* Quản Lý $ Của Kim — ứng dụng chính */
(function () {
  'use strict';
  var C = window.Core;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var uid = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); };
  var pad = C.pad, fmt = C.vnd;
  var num = function (v) { return parseInt(String(v == null ? '' : v).replace(/\D/g, ''), 10) || 0; };
  function todayISO() { var t = new Date(); return C.iso(t.getFullYear(), t.getMonth() + 1, t.getDate()); }
  var dm = function (s) { var p = C.parse(s); return pad(p.d) + '/' + pad(p.m); };
  var dmy = function (s) { var p = C.parse(s); return pad(p.d) + '/' + pad(p.m) + '/' + p.y; };
  var lunarTxt = function (L) { return 'ngày ' + L.day + ' tháng ' + L.month + (L.leap ? ' nhuận' : ''); };
  var STORAGE_LIMIT = 1024 * 1024 * 1024;

  var CATS = {
    hottoc: { name: 'Hớt tóc', icon: '✂️' },
    massage: { name: 'Massage', icon: '💆' },
    botiem: { name: 'Tiền bo tiệm tóc', icon: '💝' },
    khac: { name: 'Tiền khác', icon: '💰' },
    chi: { name: 'Chi tiêu', icon: '🧾' }
  };
  var REPEAT = { none: 'Không lặp lại', month: 'Hằng tháng', year: 'Hằng năm' };

  var ICONS = {
    cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M16 15h2"/>',
    chart: '<path d="M4 20V11M10 20V5M16 20v-6M21 20H3"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    zalo: '<path d="M4 5h16v11H10l-5 4v-4H4z"/><path d="M9 9h6l-6 4h6"/>',
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    chevL: '<path d="M15 5l-7 7 7 7"/>',
    chevR: '<path d="M9 5l7 7-7 7"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    alarm: '<circle cx="12" cy="13" r="7"/><path d="M12 9v4l2.5 2M5 4L2.5 6.5M19 4l2.5 2.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    note: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h5"/>',
    money: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
    out: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'
  };
  function icon(n) { return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[n] || '') + '</svg>'; }

  var now0 = new Date();
  var state = {
    token: sessionStorage.getItem('kim_token') || '', statKey: 'day', calIdx: 0,
    shows: [], baus: [], entries: {}, fresh: {}, loadingYear: {}, years: [], storage: null, vapidPublic: null,
    view: 'home',
    cal: { y: now0.getFullYear(), m: now0.getMonth() + 1 },
    moneyDate: todayISO(),
    rep: { mode: 'month', y: now0.getFullYear(), m: now0.getMonth() + 1 },
    showFilter: 'upcoming', showTab: 'list', showQuery: '', afterLogin: null
  };
  var logged = function () { return !!state.token; };

  /* ================= Máy chủ ================= */
  function api(path, opts) {
    opts = opts || {};
    var headers = { 'Content-Type': 'application/json' };
    if (state.token) headers.Authorization = 'Bearer ' + state.token;
    return fetch(path, Object.assign({}, opts, { headers: headers })).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.status === 401) { logout(true); throw new Error(j.error || 'Cần đăng nhập lại'); }
        if (!r.ok) throw new Error(j.error || ('Máy chủ lỗi ' + r.status));
        return j;
      });
    }, function () { throw new Error('Không có mạng hoặc không kết nối được máy chủ'); });
  }
  function applyData(j) {
    state.shows = j.shows || [];
    state.baus = j.bauShows || [];
    state.entries[j.year] = j.entries || [];
    state.years = j.years || [];
    state.storage = j.storage || null;
    state.vapidPublic = j.vapidPublic || null;
    saveCache();
  }
  function saveCache() {
    try { sessionStorage.setItem('kim_cache', JSON.stringify({ shows: state.shows, baus: state.baus, entries: state.entries, years: state.years, storage: state.storage, vapidPublic: state.vapidPublic })); } catch (e) { }
  }
  function loadCache() {
    try {
      var c = JSON.parse(sessionStorage.getItem('kim_cache') || 'null');
      if (c) { state.shows = c.shows || []; state.baus = c.baus || []; state.entries = c.entries || {}; state.years = c.years || []; state.storage = c.storage || null; state.vapidPublic = c.vapidPublic || null; }
    } catch (e) { }
  }
  function ensureYear(y) {
    y = String(y);
    if (state.fresh[y] === true) return Promise.resolve();
    return api('/api/data?year=' + y).then(function (j) { applyData(j); state.fresh[y] = true; });
  }
  // Tải năm cần xem ở chế độ nền, xong thì vẽ lại
  function needYear(y) {
    y = String(y);
    if (!logged() || state.fresh[y] || state.loadingYear[y]) return;
    state.loadingYear[y] = ensureYear(y).catch(function (e) { toast(e.message, 'err'); state.fresh[y] = 'loi'; })
      .then(function () { state.loadingYear[y] = null; render(); });
  }
  function persist(kind, action, payload, year) {
    if (kind === 'show' || kind === 'bau') {
      var arr = kind === 'show' ? state.shows : state.baus;
      upsertLocal(arr, action, payload);
    } else {
      var y = String(year || payload.date.slice(0, 4));
      upsertLocal(state.entries[y] || (state.entries[y] = []), action, payload);
      if (action === 'upsert' && state.years.indexOf(y) < 0) state.years.push(y);
    }
    saveCache();
    var body = { action: action, kind: kind };
    if (action === 'delete') { body.id = payload; if (year) body.year = String(year); } else body.item = payload;
    return api('/api/data', { method: 'POST', body: JSON.stringify(body) }).then(function () { return true; }, function (e) {
      toast('Chưa lưu được: ' + e.message, 'err');
      state.fresh = {};
      ensureYear(new Date().getFullYear()).catch(function () { }).then(render);
      return false;
    });
  }
  function upsertLocal(arr, action, x) {
    var key = action === 'delete' ? x : x.id;
    var i = arr.findIndex(function (v) { return v.id === key; });
    if (action === 'delete') { if (i >= 0) arr.splice(i, 1); }
    else if (i >= 0) arr[i] = x; else arr.push(x);
  }

  /* ================= Tiện ích giao diện ================= */
  var toastTimer;
  function toast(msg, kind) {
    var el = $('#toast'); el.textContent = msg; el.className = 'toast show ' + (kind || '');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.className = 'toast'; }, 3400);
  }
  var sheetGen = 0;
  function openSheet(title, body, footer) {
    sheetGen++;
    var s = $('#sheet');
    s.innerHTML = '<div class="sheet-backdrop" data-act="close-sheet"></div>' +
      '<div class="sheet-panel glass-strong" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
      '<div class="grabber"></div><header class="sheet-h"><h2>' + esc(title) + '</h2><button class="icon-btn sm" data-act="close-sheet" aria-label="Đóng">' + icon('close') + '</button></header>' +
      '<div class="sheet-b">' + body + '</div>' + (footer ? '<footer class="sheet-f">' + footer + '</footer>' : '') + '</div>';
    var wasOpen = !s.hidden && s.classList.contains('open');
    s.hidden = false; document.body.classList.add('noscroll');
    if (!wasOpen) { s.classList.remove('open'); requestAnimationFrame(function () { requestAnimationFrame(function () { s.classList.add('open'); }); }); }
  }
  function closeSheet() {
    var s = $('#sheet'), g = sheetGen;
    s.classList.remove('open'); document.body.classList.remove('noscroll');
    setTimeout(function () { if (g === sheetGen) { s.hidden = true; s.innerHTML = ''; } }, 260);
  }
  function busy(btn, on, label) {
    if (!btn) return;
    if (on) { btn.disabled = true; btn.dataset.t = btn.innerHTML; btn.innerHTML = label || 'Đang lưu…'; }
    else if (btn.dataset.t) { btn.disabled = false; btn.innerHTML = btn.dataset.t; }
  }
  function line(label, val, cls) { return '<div class="line"><span>' + label + '</span><b class="' + (cls || '') + '">' + fmt(val) + '</b></div>'; }
  function fmtBytes(b) { if (b < 1024) return b + ' B'; if (b < 1048576) return (b / 1024).toFixed(1).replace('.', ',') + ' KB'; return (b / 1048576).toFixed(2).replace('.', ',') + ' MB'; }
  function safeUrl(u) { return /^https?:\/\//i.test(u || '') ? u : '#'; }
  function telOf(p) { return String(p || '').replace(/[^\d+]/g, ''); }
  function contactBtns(phone) {
    var p = telOf(phone); if (!p) return '';
    var z = p.replace(/^\+84/, '0');
    return '<a class="btn btn-sm call" href="tel:' + p + '">' + icon('phone') + ' Gọi</a>' +
      '<a class="btn btn-sm zalo" href="https://zalo.me/' + z + '" target="_blank" rel="noopener">' + icon('zalo') + ' Zalo</a>';
  }
  function bauOf(sh) { return state.baus.find(function (b) { return b.id === sh.bauId; }) || null; }
  function bauName(sh) { var b = bauOf(sh); return b ? b.name : (sh.bauName || ''); }
  function entriesOf(s) { return (state.entries[s.slice(0, 4)] || []).filter(function (e) { return e.date === s; }); }
  function findEntry(id) {
    for (var y in state.entries) { var f = (state.entries[y] || []).find(function (x) { return x.id === id; }); if (f) return f; }
    return null;
  }

  /* ================= Tính tiền ================= */
  function sumRange(from, to) {
    var t = todayISO();
    var S = { huyList: [], hottoc: 0, massage: 0, botiem: 0, khac: 0, chi: 0, showNhan: 0, showBo: 0, showKhac: 0, showCount: 0, upNhan: 0, upCount: 0, pendCount: 0, pendSum: 0, huyCount: 0, khacList: [], chiList: [] };
    var now = Date.now();
    var ys = {}; ys[from.slice(0, 4)] = 1; ys[to.slice(0, 4)] = 1;
    Object.keys(ys).forEach(function (y) {
      (state.entries[y] || []).forEach(function (e) {
        if (e.date < from || e.date > to || !(e.cat in S)) return;
        S[e.cat] += Number(e.amount) || 0;
        if (e.cat === 'khac') S.khacList.push(e);
        if (e.cat === 'chi') S.chiList.push(e);
      });
    });
    C.occList(state.shows, from, to).forEach(function (o) {
      var m = C.money(o.show, o.iso);
      // Chỉ cộng tiền show khi đã bấm "Đã hoàn thành show"
      if (m.status === 'done') { S.showNhan += m.received; S.showBo += m.tip; S.showKhac += m.other; S.showCount++; }
      else if (m.status === 'cancel') { S.huyCount++; S.huyList.push({ o: o, reason: m.cancelReason }); }
      else if (C.showTimeUTC(o.iso, o.show.time) <= now) { S.pendCount++; S.pendSum += m.received + m.tip; }
      else { S.upNhan += m.received + m.tip; S.upCount++; }
    });
    S.lam = S.hottoc + S.massage;
    S.tiem = S.lam + S.botiem;
    S.show = S.showNhan + S.showBo + S.showKhac;
    S.thu = S.tiem + S.show + S.khac;
    S.con = S.thu - S.chi;
    return S;
  }

  /* ================= Nhắc show ================= */
  function alerts() {
    if (!logged()) return [];
    var now = Date.now(), t = todayISO();
    return C.activeOcc(state.shows, C.addDays(t, -1), C.addDays(t, 4)).filter(function (o) { return !C.money(o.show, o.iso).status; }).map(function (o) {
      return Object.assign({}, o, { at: C.showTimeUTC(o.iso, o.show.time) });
    }).filter(function (o) { return o.at > now && o.at - now <= 3 * 86400000; }).map(function (o) {
      var diff = o.at - now, label;
      if (diff <= 3600000) label = 'Còn dưới 1 tiếng';
      else if (diff < 86400000) label = 'Còn ' + Math.round(diff / 3600000) + ' tiếng';
      else { var d = Math.floor(diff / 86400000), h = Math.round((diff % 86400000) / 3600000); label = 'Còn ' + d + ' ngày' + (h ? ' ' + h + ' tiếng' : ''); }
      return Object.assign(o, { label: label });
    });
  }
  // Show đã qua giờ diễn nhưng chưa bấm "Đã hoàn thành" hoặc "Hủy"
  function pendingShows() {
    if (!logged()) return [];
    var t = todayISO(), now = Date.now();
    return C.occList(state.shows, C.addDays(t, -120), t).filter(function (o) {
      if (C.money(o.show, o.iso).status) return false;
      if (C.showTimeUTC(o.iso, o.show.time) > now) return false;
      if ((o.show.repeat || 'none') !== 'none' && o.show.createdAt) {
        var c = new Date(o.show.createdAt), ci = C.iso(c.getFullYear(), c.getMonth() + 1, c.getDate());
        if (o.iso < ci) return false;
      }
      return true;
    });
  }
  function updateBadge() {
    var n = alerts().length + pendingShows().length;
    if (navigator.setAppBadge) { (n ? navigator.setAppBadge(n) : navigator.clearAppBadge()).catch(function () { }); }
  }
  // Khi app đang mở mà chưa bật thông báo máy chủ: nhắc ngay trên máy
  function localNotify() {
    if (!logged() || !('Notification' in window) || Notification.permission !== 'granted') return;
    if (localStorage.getItem('kim_push') === '1' || !navigator.serviceWorker) return;
    var fired; try { fired = JSON.parse(localStorage.getItem('kim_fired') || '{}'); } catch (e) { fired = {}; }
    var now = Date.now(), changed = false;
    alerts().forEach(function (o) {
      var diff = o.at - now, k = diff <= 3600000 ? '1h' : diff <= 86400000 ? '1d' : '3d';
      var key = o.show.id + '|' + o.iso + '|' + k;
      if (fired[key]) return;
      fired[key] = now; changed = true;
      var P = C.period(o.show.time);
      navigator.serviceWorker.ready.then(function (reg) {
        reg.showNotification('🔔 ' + o.label + ': ' + o.show.name, {
          body: P.icon + ' Show ' + P.name.toLowerCase() + ' lúc ' + P.clock + ', ' + C.weekday(o.iso) + ' ' + dm(o.iso) + (o.show.address ? ' • ' + o.show.address : ''),
          icon: '/icons/icon-192.png', tag: key
        });
      });
    });
    if (changed) localStorage.setItem('kim_fired', JSON.stringify(fired));
  }

  /* ================= Vẽ giao diện ================= */
  var TABS = [['home', 'cal', 'Trang chủ'], ['shows', 'mic', 'Show'], ['money', 'wallet', 'Thu chi'], ['report', 'chart', 'Báo cáo'], ['settings', 'gear', 'Cài đặt']];
  function render() {
    document.body.classList.toggle('locked', !logged());
    if (!logged()) { renderLock(); return; }
    $('#lock').hidden = true; $('#lock').innerHTML = '';
    $('#tabbar').innerHTML = TABS.map(function (t) {
      return '<button class="tab' + (state.view === t[0] ? ' active' : '') + '" data-act="tab" data-view="' + t[0] + '" aria-label="' + t[2] + '">' + icon(t[1]) + '<span>' + t[2] + '</span></button>';
    }).join('');
    renderHeader();
    $$('.view').forEach(function (el) { el.hidden = el.id !== 'view-' + state.view; });
    if (state.view === 'home') renderHome();
    else if (state.view === 'shows') renderShows();
    else if (state.view === 'money') renderMoney();
    else if (state.view === 'report') renderReport();
    else if (state.view === 'settings') renderSettings();
    updateBadge();
  }
  function renderHeader() {
    var a = alerts();
    var nb = a.length + pendingShows().length;
    $('#hdr-right').innerHTML = '<button class="icon-btn" data-act="bell" aria-label="Thông báo show">' + icon('bell') + (nb ? '<span class="badge">' + nb + '</span>' : '') + '</button>' +
      '<button class="icon-btn" data-act="lock-now" aria-label="Khóa app">' + icon('lock') + '</button>';
  }

  /* ---------- Màn hình khóa: mở app là hỏi mật khẩu ---------- */
  function renderLock() {
    var el = $('#lock');
    if (!el.hidden && $('#lg-pass')) return;
    var t = todayISO(), p = C.parse(t);
    el.innerHTML = '<div class="lock-box glass-strong">' +
      '<img src="/icons/icon-192.png" alt="" width="76" height="76" class="lock-icon">' +
      '<h1>Quản Lý $ Của Kim</h1><p class="hint">' + C.weekday(t) + ', ' + p.d + '/' + p.m + '/' + p.y + '</p>' +
      '<form id="lock-form" autocomplete="on"><label class="sr" for="lg-pass">Mật khẩu</label>' +
      '<input class="inp lock-inp" id="lg-pass" name="password" type="password" autocomplete="current-password" placeholder="Nhập mật khẩu" enterkeyhint="go">' +
      '<label class="check"><input type="checkbox" id="lg-show"> Hiện mật khẩu</label>' +
      '<button class="btn btn-primary lock-btn" type="submit" data-act="do-login">Mở khóa</button></form>' +
      '<p class="hint lock-note">Vì bảo mật, mỗi lần mở app đều phải nhập mật khẩu.</p></div>';
    el.hidden = false;
    setTimeout(function () { var i = $('#lg-pass'); if (i) i.focus(); }, 250);
  }

  /* ---------- Thống kê hôm nay / tuần này / tháng này ---------- */
  function periods() {
    var t = todayISO(), p = C.parse(t), mon = C.addDays(t, -((C.dow(t) + 6) % 7));
    return {
      day: { from: t, to: t, name: 'Hôm nay', sub: dm(t) },
      week: { from: mon, to: C.addDays(mon, 6), name: 'Tuần này', sub: dm(mon) + ' – ' + dm(C.addDays(mon, 6)) },
      month: { from: C.iso(p.y, p.m, 1), to: C.iso(p.y, p.m, C.dim(p.y, p.m)), name: 'Tháng ' + p.m, sub: 'từ 1/' + p.m + ' đến ' + C.dim(p.y, p.m) + '/' + p.m }
    };
  }
  function short(n) {
    var a = Math.abs(n), s = n < 0 ? '−' : '';
    if (a >= 1e9) return s + (a / 1e9).toFixed(a % 1e9 ? 2 : 0).replace('.', ',').replace(/,?0+$/, '') + ' tỷ';
    if (a >= 1e6) return s + (a / 1e6).toFixed(2).replace('.', ',').replace(/,?0+$/, '') + ' tr';
    if (a >= 1e3) return s + Math.round(a / 1e3) + 'k';
    return s + a + 'đ';
  }
  function statsBlock(addBtn) {
    var P = periods(), key = state.statKey || 'day', cur = P[key];
    // chỉ kiểm tra năm, không cần chờ dữ liệu năm trước nếu tuần vắt qua năm
    needYear(cur.from.slice(0, 4)); needYear(cur.to.slice(0, 4));
    var tiles = ['day', 'week', 'month'].map(function (k) {
      var S = sumRange(P[k].from, P[k].to);
      return '<button class="stat-tile' + (k === key ? ' on' : '') + '" data-act="stat" data-k="' + k + '" aria-pressed="' + (k === key) + '">' +
        '<span class="st-name">' + P[k].name + '</span><span class="st-val ' + (S.con < 0 ? 'neg' : '') + '">' + short(S.con) + '</span><span class="st-sub">còn lại</span></button>';
    }).join('');
    var S = sumRange(cur.from, cur.to);
    var row = function (dot, label, val, cls, sub) {
      return '<div class="srow' + (sub ? ' sub' : '') + '"><span>' + (dot ? '<i class="dot" style="--c:' + dot + '"></i>' : '') + label + '</span><b class="' + (cls || '') + '">' + fmt(val) + '</b></div>';
    };
    return '<section class="card glass stats"><div class="sec-h"><h2>Thu chi</h2>' + (addBtn ? '<button class="btn btn-sm btn-primary" data-act="add-entry">' + icon('plus') + ' Ghi thu chi</button>' : '') + '</div>' +
      '<div class="stat-tiles">' + tiles + '</div>' +
      '<div class="stat-detail"><div class="sd-h"><b>' + cur.name + '</b><span>' + cur.sub + '</span></div>' +
      '<div class="sd-grid">' +
      '<div class="sd-col"><div class="sd-t">Tiệm tóc</div>' +
      row('#5B8DEF', 'Tiền làm', S.lam, '') + row('', 'Hớt tóc', S.hottoc, '', 1) + row('', 'Massage', S.massage, '', 1) +
      row('#F08BA8', 'Tiền bo tiệm', S.botiem, '') + '</div>' +
      '<div class="sd-col"><div class="sd-t">Show & khác</div>' +
      row('#A78BFA', 'Thu show (' + S.showCount + ' đã xong)', S.show, '') + row('', 'Nhận show', S.showNhan, '', 1) + row('', 'Bo show', S.showBo, '', 1) + (S.showKhac ? row('', 'Tiền khác show', S.showKhac, '', 1) : '') +
      row('#5CC8B0', 'Thu khác', S.khac, '') + '</div></div>' +
      '<div class="sd-sum"><div><span>Tổng thu</span><b class="pos">' + fmt(S.thu) + '</b></div><div><span>Tổng chi</span><b class="neg">' + fmt(S.chi) + '</b></div>' +
      '<div class="sd-con"><span>Còn lại</span><b class="' + (S.con < 0 ? 'neg' : 'pos') + '">' + fmt(S.con) + '</b></div></div>' +
      (S.pendCount ? '<p class="hint sd-note pend">⏳ ' + S.pendCount + ' show chờ xác nhận hoàn thành (dự kiến ' + fmt(S.pendSum) + '), chưa cộng vào tổng.</p>' : '') +
      (S.upCount ? '<p class="hint sd-note">Còn ' + S.upCount + ' show sắp diễn trong ' + (key === 'day' ? 'hôm nay' : key === 'week' ? 'tuần' : 'tháng') + ' (dự kiến ' + fmt(S.upNhan) + '), chưa cộng vào tổng.</p>' : '') +
      '</div></section>';
  }

  /* ---------- Lịch show (gọn) ---------- */
  function dayLabel(s) {
    var t = todayISO();
    if (s === t) return 'Hôm nay';
    if (s === C.addDays(t, 1)) return 'Ngày mai';
    if (s === C.addDays(t, 2)) return 'Ngày kia';
    return C.weekday(s);
  }
  function showRow(o) {
    var sh = o.show, P = C.period(sh.time), L = C.toLunar(o.iso), bn = bauName(sh);
    var place = sh.address ? esc(sh.address) : '';
    return '<button class="srow-show" data-act="open-show" data-id="' + sh.id + '" data-d="' + o.iso + '">' +
      '<span class="ss-time t-' + P.key + '-soft"><b>' + P.clock + '</b><small>' + P.name.toLowerCase() + '</small></span>' +
      '<span class="ss-main"><span class="ss-name">' + esc(sh.name) + '</span>' +
      '<span class="ss-meta">' + [bn ? (/^bầu/i.test(bn) ? '' : 'Bầu ') + esc(bn) : '', place].filter(Boolean).join(' · ') + '</span></span>' +
      '<span class="ss-chev">' + icon('chevR') + '</span></button>';
  }
  function showSchedule() {
    var t = todayISO(), now = Date.now();
    var occ = C.activeOcc(state.shows, t, C.addDays(t, 45)).filter(function (o) { return !C.money(o.show, o.iso).status && C.showTimeUTC(o.iso, o.show.time) > now; });
    var shown = occ.slice(0, 8), groups = [], last = null;
    shown.forEach(function (o) {
      if (!last || last.iso !== o.iso) { last = { iso: o.iso, items: [] }; groups.push(last); }
      last.items.push(o);
    });
    var body = groups.length ? groups.map(function (g) {
      var p = C.parse(g.iso), L = C.toLunar(g.iso);
      return '<div class="sday"><div class="sday-h"><span class="sday-d">' + p.d + '<small>/' + p.m + '</small></span><span><b>' + dayLabel(g.iso) + '</b>' +
        (dayLabel(g.iso) !== C.weekday(g.iso) ? ' · ' + C.weekday(g.iso) : '') + '<br><small>Âm ' + L.day + '/' + L.month + (L.leap ? ' nhuận' : '') + '</small></span>' +
        (g.items.length > 1 ? '<span class="sday-n">' + g.items.length + ' show</span>' : '') + '</div>' +
        g.items.map(showRow).join('') + '</div>';
    }).join('') : '<p class="empty-state">45 ngày tới chưa có show nào.</p>';
    return '<section class="card glass"><div class="sec-h"><h2>Lịch show</h2><button class="btn btn-sm btn-primary" data-act="add-show">' + icon('plus') + ' Thêm show</button></div>' +
      body + (occ.length > shown.length ? '<button class="btn btn-sm more" data-act="tab" data-view="shows">Xem tất cả ' + occ.length + ' show sắp tới</button>' : '') + '</section>';
  }
  function openShowDetail(id, s) {
    var sh = state.shows.find(function (x) { return x.id === id; }); if (!sh) return;
    openSheet('Chi tiết show', showCard({ show: sh, iso: s }, true));
  }

  /* ---------- Trang chủ ---------- */
  function renderHome() {
    var t = todayISO(), p = C.parse(t), L = C.toLunar(t), hs = C.holidays(t);
    var todayShows = C.activeOcc(state.shows, t, t).length;
    var sun = C.dow(t) === 0 ? ' sun' : '';
    var h = '<section class="hero glass"><div class="hero2">' +
      '<div class="h-sol"><div class="h-lbl">Dương lịch</div><div class="h-big' + sun + '">' + p.d + '</div><div class="h-wd' + sun + '">' + C.weekday(t) + '</div><div class="h-my">Tháng ' + p.m + ' năm ' + p.y + '</div></div>' +
      '<div class="h-lun"><div class="h-lbl">Âm lịch</div><div class="h-big lunar">' + L.day + '</div><div class="h-wd">Tháng ' + L.month + (L.leap ? ' nhuận' : '') + '</div><div class="h-my">Năm ' + C.canChi(L.year) + '</div></div></div>' +
      '<div class="hero-chips">' + (todayShows ? '<span class="chip-show">🎤 Hôm nay có ' + todayShows + ' show</span>' : '<span class="chip-soft">Hôm nay không có show</span>') +
      hs.map(function (x) { return '<span class="chip-hol ' + x.type + '">🎉 ' + esc(x.name) + '</span>'; }).join('') + '</div></section>';
    h += confirmBlock() + phoneAlert();
    h += '<div class="wide-2">' + showSchedule() + statsBlock(true) + '</div>';
    h += calendarBlock();
    $('#view-home').innerHTML = h;
  }

  var YEAR_COLORS = ['#16A34A', '#2563EB', '#E11D48', '#D97706', '#7C3AED'];
  function yearColor(y) { return YEAR_COLORS[((y - 2026) % 5 + 5) % 5]; }

  /* ---------- Xác nhận show hoàn thành ---------- */
  function confirmBlock() {
    var list = pendingShows(); if (!list.length) return '';
    return '<section class="card confirm-box"><div class="cf-h">🎤 Xác nhận show hoàn thành (' + list.length + ')</div>' +
      '<p class="cf-sub">Show đã qua giờ diễn. Tiền show chỉ được cộng vào thu chi sau khi bạn bấm <b>Đã hoàn thành show</b>.</p>' +
      list.map(function (o) {
        var P = C.period(o.show.time), m = C.money(o.show, o.iso);
        return '<div class="cf-row"><div class="cf-info"><b class="cf-name">' + esc(o.show.name) + '</b>' +
          '<small>' + C.weekday(o.iso) + ' ' + dmy(o.iso) + ' · ' + P.icon + ' ' + P.text + ' · dự kiến ' + fmt(m.received + m.tip) + '</small></div>' +
          '<div class="cf-btns"><button class="btn btn-sm btn-done" data-act="confirm-show" data-id="' + o.show.id + '" data-d="' + o.iso + '">✅ Đã hoàn thành show</button>' +
          '<button class="btn btn-sm btn-cancel" data-act="cancel-show" data-id="' + o.show.id + '" data-d="' + o.iso + '">❌ Hủy show</button></div></div>';
      }).join('') + '</section>';
  }
  function statusOf(sh, s) {
    var m = C.money(sh, s);
    if (m.status) return m.status;
    return C.showTimeUTC(s, sh.time) <= Date.now() ? 'pending' : 'future';
  }
  function openConfirm(id, s) {
    var sh = state.shows.find(function (x) { return x.id === id; }); if (!sh) return;
    var m = C.money(sh, s), P = C.period(sh.time), st = m.status;
    var b = '<div class="cf-head"><b class="cf-name">' + esc(sh.name) + '</b><br>' + C.weekday(s) + ', ' + dmy(s) + ' · ' + P.icon + ' ' + P.text +
      (st === 'done' ? '<div class="st st-done">✅ Đã hoàn thành — đang sửa lại tiền</div>' : '') + '</div>' +
      '<input type="hidden" id="cf-id" value="' + esc(id) + '"><input type="hidden" id="cf-d" value="' + s + '">' +
      '<p class="hint">Kiểm tra và sửa đúng số tiền thực nhận rồi bấm lưu. Tiền chỉ được cộng vào thu chi sau bước này.</p>' +
      '<div class="field"><label for="cf-recv">Tiền nhận show</label><input class="inp amount big-inp" id="cf-recv" inputmode="numeric" autocomplete="off" placeholder="0" value="' + (m.received ? C.dots(m.received) : '') + '"></div>' +
      '<div class="field"><label for="cf-tip">Tiền bo show</label><input class="inp amount big-inp" id="cf-tip" inputmode="numeric" autocomplete="off" placeholder="0" value="' + (m.tip ? C.dots(m.tip) : '') + '"></div>' +
      '<div class="grid2"><div class="field"><label for="cf-other">Tiền khác của show</label><input class="inp amount" id="cf-other" inputmode="numeric" autocomplete="off" placeholder="0" value="' + (m.other ? C.dots(m.other) : '') + '"></div>' +
      '<div class="field"><label for="cf-onote">Nội dung tiền khác</label><input class="inp" id="cf-onote" maxlength="200" placeholder="VD: tiền xe, quà…" value="' + esc(m.otherNote) + '"></div></div>' +
      '<div class="cf-total">Tổng tiền show: <b id="cf-sum">' + fmt(m.received + m.tip + m.other) + '</b></div>' +
      (st ? '<button class="btn btn-sm cf-reset" data-act="reset-show">↩️ Đặt lại: chưa xác nhận</button>' : '');
    openSheet('Xác nhận show hoàn thành', b,
      '<button class="btn btn-cancel" data-act="cancel-show" data-id="' + esc(id) + '" data-d="' + s + '">❌ Hủy show</button>' +
      '<button class="btn btn-done" data-act="save-confirm">✅ ' + (st === 'done' ? 'Lưu tiền' : 'Đã hoàn thành show') + '</button>');
  }
  function setStatus(id, s, patch, msg, btn) {
    var src = state.shows.find(function (x) { return x.id === id; }); if (!src) return;
    var sh = JSON.parse(JSON.stringify(src));
    sh.overrides = sh.overrides || {};
    var o = Object.assign({}, sh.overrides[s] || {});
    if (patch === null) { delete o.status; delete o.doneAt; delete o.other; delete o.otherNote; delete o.cancelReason; }
    else { Object.assign(o, patch); if (patch.status === 'done') delete o.cancelReason; }
    if (Object.keys(o).length) sh.overrides[s] = o; else delete sh.overrides[s];
    sh.updatedAt = Date.now();
    if (btn) busy(btn, true);
    persist('show', 'upsert', sh).then(function (ok) { if (btn) busy(btn, false); if (ok) { closeSheet(); toast(msg); render(); } });
    render();
  }
  function saveConfirm(btn) {
    var id = $('#cf-id').value, s = $('#cf-d').value;
    var other = num($('#cf-other').value), note = $('#cf-onote').value.trim();
    if (other && !note) return toast('Nhập nội dung tiền khác', 'err');
    setStatus(id, s, { status: 'done', doneAt: Date.now(), received: num($('#cf-recv').value), tip: num($('#cf-tip').value), other: other, otherNote: note },
      'Đã xác nhận hoàn thành, tiền show đã được cộng vào thu chi', btn);
  }
  function cancelShow(id, s) {
    var sh = state.shows.find(function (x) { return x.id === id; }); if (!sh) return;
    var future = C.showTimeUTC(s, sh.time) > Date.now(), P = C.period(sh.time), m = C.money(sh, s);
    var REASONS = ['Khách hủy tiệc', 'Đổi ngày tiệc', 'Trùng lịch show khác', 'Bận việc riêng', 'Sức khỏe', 'Thời tiết xấu', 'Bầu show đổi người'];
    var b = '<div class="cf-head"><b class="cf-name">' + esc(sh.name) + '</b><br>' + C.weekday(s) + ', ' + dmy(s) + ' · ' + P.icon + ' ' + P.text + '</div>' +
      '<div class="cancel-warn">Show này sẽ <b>không tính tiền</b>' + (future ? ' và <b>không nhắc nữa</b>' : '') + ', bị gạch tên và bỏ khỏi lịch.</div>' +
      '<input type="hidden" id="cx-id" value="' + esc(id) + '"><input type="hidden" id="cx-d" value="' + s + '">' +
      '<div class="field"><span class="lbl">Chọn nhanh lý do</span><div class="chips">' + REASONS.map(function (r) {
        return '<button type="button" class="chip" data-act="cx-reason" data-r="' + esc(r) + '">' + esc(r) + '</button>';
      }).join('') + '</div></div>' +
      '<div class="field"><label for="cx-note">Lý do hủy show *</label><textarea class="inp" id="cx-note" rows="3" maxlength="300" placeholder="VD: Khách báo hoãn tiệc sang tháng sau, đã trả lại tiền cọc…">' + esc(m.cancelReason || '') + '</textarea>' +
      '<div class="hint">Ghi rõ để sau này xem lại vì sao show bị hủy.</div></div>';
    openSheet('Hủy show', b, '<button class="btn" data-act="close-sheet">Không hủy</button><button class="btn btn-red" data-act="save-cancel">Xác nhận hủy show</button>');
    setTimeout(function () { var t = $('#cx-note'); if (t && !t.value) t.focus(); }, 320);
  }
  function saveCancel(btn) {
    var note = $('#cx-note').value.trim();
    if (!note) { $('#cx-note').focus(); return toast('Nhập lý do hủy show', 'err'); }
    setStatus($('#cx-id').value, $('#cx-d').value, { status: 'cancel', doneAt: Date.now(), cancelReason: note }, 'Đã hủy show, không tính tiền', btn);
  }

  /* ---------- Số điện thoại tạm (00000, 11111…) cần cập nhật ---------- */
  function fakePhone(p) { var d = String(p || '').replace(/\D/g, ''); return /(\d)\1{4,}/.test(d); }
  function phoneTodo() {
    var t = todayISO(), out = [];
    state.shows.forEach(function (sh) {
      if (!fakePhone(sh.phone)) return;
      var next = C.occurrences(sh, t, C.addDays(t, 400))[0];
      if ((sh.repeat || 'none') === 'none' && sh.date < t) return;
      out.push({ kind: 'show', id: sh.id, name: sh.name, phone: sh.phone, when: next || sh.date });
    });
    state.baus.forEach(function (b) { if (fakePhone(b.phone)) out.push({ kind: 'bau', id: b.id, name: b.name, phone: b.phone }); });
    return out;
  }
  function phoneAlert() {
    var list = phoneTodo(); if (!list.length) return '';
    return '<section class="card warn"><div class="warn-h">📞 Cần cập nhật số điện thoại (' + list.length + ')</div>' +
      list.map(function (x) {
        return '<div class="warn-row"><span><b>' + (x.kind === 'bau' ? 'Bầu show ' : 'Show ') + esc(x.name) + '</b><br><small>Đang để số tạm ' + esc(x.phone) +
          (x.when ? ' · diễn ' + dm(x.when) : '') + '</small></span>' +
          '<button class="btn btn-sm" data-act="' + (x.kind === 'bau' ? 'edit-bau' : 'edit-show') + '" data-id="' + x.id + '">' + icon('edit') + ' Cập nhật</button></div>';
      }).join('') + '</section>';
  }

  /* ---------- Lịch âm dương 3 tháng ---------- */
  function calMonths() {
    return [0, 1, 2].map(function (i) { var y = state.cal.y, m = state.cal.m + i; while (m > 12) { m -= 12; y++; } return [y, m]; });
  }
  function calendarBlock() {
    var months = calMonths(), sel = Math.min(state.calIdx || 0, 2);
    return '<section class="cal-wrap"><div class="cal-nav"><h2>Lịch âm dương</h2><div class="row-btns">' +
      '<button class="icon-btn sm" data-act="cal-prev" aria-label="Lùi 1 tháng">' + icon('chevL') + '</button>' +
      '<button class="btn btn-sm" data-act="cal-today">Tháng này</button>' +
      '<button class="icon-btn sm" data-act="cal-next" aria-label="Tới 1 tháng">' + icon('chevR') + '</button></div></div>' +
      '<div class="seg cal-tabs">' + months.map(function (x, i) {
        return '<button class="' + (i === sel ? 'on' : '') + '" data-act="cal-pick" data-i="' + i + '">Tháng ' + x[1] + ' <span class="yr-tag" style="--yc:' + yearColor(x[0]) + '">' + x[0] + '</span></button>';
      }).join('') + '</div>' +
      '<div class="months" data-sel="' + sel + '">' + months.map(function (x, i) { return monthHTML(x[0], x[1], i === sel); }).join('') + '</div>' +
      '<div class="cal-legend"><span><i class="lg lg-show"></i>Có show</span><span><i class="lg lg-today"></i>Hôm nay</span><span><i class="lg lg-hol"></i>Ngày lễ</span><span><b>15</b> dương · <small>12</small> âm</span></div></section>';
  }
  function monthHTML(y, m, active) {
    var first = C.iso(y, m, 1), n = C.dim(y, m), last = C.iso(y, m, n);
    var lead = (C.dow(first) + 6) % 7, t = todayISO();
    var byDay = {};
    var tips = {};
    C.activeOcc(state.shows, first, last).forEach(function (o) {
      var P = C.period(o.show.time);
      (byDay[o.iso] = byDay[o.iso] || []).push(P.key);
      (tips[o.iso] = tips[o.iso] || []).push(P.icon + ' ' + P.clock + ' ' + P.name.toLowerCase() + ' – ' + o.show.name + (o.show.address ? '\n   📍 ' + o.show.address : ''));
    });
    var cells = '', hols = [];
    for (var i = 0; i < lead; i++) cells += '<div class="cell empty"></div>';
    for (var d = 1; d <= n; d++) {
      var s = C.iso(y, m, d), L = C.toLunar(s), hs = C.holidays(s), sh = byDay[s] || [];
      if (hs.length) hols.push({ s: s, L: L, hs: hs });
      var cls = 'cell' + (s === t ? ' today' : '') + (sh.length ? ' show' : '') + (hs.length ? ' hol' : '') + (s < t ? ' past' : '') + (C.dow(s) === 0 ? ' sun' : '');
      var tip = (tips[s] || []).concat(hs.map(function (x) { return '🎉 ' + x.name; })).join('\n');
      var lun = L.day === 1 ? '1/' + L.month + (L.leap ? 'n' : '') : L.day;
      var lbl = d + ' tháng ' + m + ', âm ' + L.day + '/' + L.month + (L.leap ? ' nhuận' : '') + (sh.length ? ', có ' + sh.length + ' show' : '') + (hs.length ? ', ' + hs.map(function (x) { return x.name; }).join(', ') : '');
      cells += '<button class="' + cls + '" data-act="day" data-d="' + s + '" aria-label="' + esc(lbl) + '"' + (tip ? ' data-tip="' + esc(tip) + '"' : '') + '><span class="sol">' + d + '</span><span class="lun' + (L.day === 1 ? ' l1' : '') + '">' + lun + '</span>' +
        (sh.length ? '<span class="pips">' + sh.slice(0, 3).map(function (k) { return '<i class="pip p-' + k + '"></i>'; }).join('') + '</span>' : (hs.length ? '<i class="hdot"></i>' : '')) + '</button>';
    }
    var L1 = C.toLunar(first), L2 = C.toLunar(last);
    var lr = 'Âm: tháng ' + L1.month + (L1.leap ? ' nhuận' : '') + (L1.month !== L2.month || L1.leap !== L2.leap ? ' – ' + L2.month + (L2.leap ? ' nhuận' : '') : '');
    return '<section class="month glass' + (active ? ' active' : '') + '" style="--yc:' + yearColor(y) + '"><header class="month-h"><h3>Tháng ' + m + ' <span class="yr-tag">' + y + '</span></h3><p>' + lr + '</p></header>' +
      '<div class="wk"><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span></div>' +
      '<div class="grid">' + cells + '</div>' +
      (hols.length ? '<ul class="hols">' + hols.map(function (x) {
        return x.hs.map(function (hh) { return '<li class="hol-' + hh.type + '"><b>' + dm(x.s) + '</b><span>🎉 ' + esc(hh.name) + (hh.type === 'am' ? ' <span class="am">(' + x.L.day + '/' + x.L.month + ' âm)</span>' : '') + '</span></li>'; }).join('');
      }).join('') + '</ul>' : '') + '</section>';
  }

  function openDay(s) {
    var draw = function () {
      var p = C.parse(s), L = C.toLunar(s), hs = C.holidays(s);
      var b = '<div class="day-head"><div class="hero-day sm">' + p.d + '</div><div><div class="hero-wd">' + C.weekday(s) + ', ' + dmy(s) + '</div><div class="hint">Âm lịch: ' + lunarTxt(L) + ' năm ' + C.canChi(L.year) + '</div></div></div>';
      if (hs.length) b += '<div class="row-btns">' + hs.map(function (x) { return '<span class="pill">🎉 ' + esc(x.name) + '</span>'; }).join('') + '</div>';
      var f;
      if (logged()) {
        var occ = C.occList(state.shows, s, s), es = entriesOf(s), S = sumRange(s, s);
        b += '<h3 class="sub-h">Show trong ngày</h3>' + (occ.length ? '<div class="stack">' + occ.map(function (o) { return showCard(o, true); }).join('') + '</div>' : '<p class="hint">Chưa có show.</p>');
        b += '<h3 class="sub-h">Thu chi trong ngày</h3>' + (es.length ? '<div class="stack">' + es.map(entryRow).join('') + '</div>' : '<p class="hint">Chưa ghi thu chi.</p>') +
          '<div style="margin-top:8px">' + line('Tổng thu (gồm show)', S.thu, 'pos') + line('Tổng chi', S.chi, 'neg') + line('Còn lại', S.con, S.con < 0 ? 'neg' : 'pos') + '</div>';
        f = '<button class="btn" data-act="add-entry" data-d="' + s + '">' + icon('plus') + ' Thu chi</button><button class="btn btn-primary" data-act="add-show" data-d="' + s + '">' + icon('plus') + ' Thêm show</button>';
      } else {
        b += '<p class="hint" style="margin-top:14px">Đăng nhập để xem và thêm show, thu chi của ngày này.</p>';
        f = '<button class="btn btn-primary" data-act="login">Đăng nhập</button>';
      }
      openSheet('Chi tiết ngày', b, f);
    };
    draw();
    var y = s.slice(0, 4);
    if (logged() && state.fresh[y] !== true) {
      var g = sheetGen;
      ensureYear(y).then(function () { if (g === sheetGen) draw(); }).catch(function () { });
    }
  }

  /* ---------- Thẻ show ---------- */
  function showCard(o, compact) {
    var sh = o.show, s = o.iso, p = C.parse(s), L = C.toLunar(s), P = C.period(sh.time), m = C.money(sh, s);
    var st = statusOf(sh, s), past = st !== 'future', bn = bauName(sh), bau = bauOf(sh);
    var stTag = st === 'done' ? '<div class="st st-done">✅ Đã hoàn thành</div>' : st === 'cancel' ? '<div class="st st-cancel">❌ Đã hủy — không tính tiền</div>' + (m.cancelReason ? '<div class="cx-reason">📝 Lý do hủy: ' + esc(m.cancelReason) + '</div>' : '') : st === 'pending' ? '<div class="st st-pend">⏳ Chờ xác nhận hoàn thành</div>' : '';
    var rep = sh.repeat && sh.repeat !== 'none' ? ' · 🔁 ' + REPEAT[sh.repeat] + ' (lịch ' + (sh.dateType === 'am' ? 'âm' : 'dương') + ')' : '';
    var mapBtn = sh.map ? '<a class="btn btn-sm" href="' + esc(safeUrl(sh.map)) + '" target="_blank" rel="noopener">' + icon('pin') + ' Bản đồ</a>'
      : (sh.address ? '<a class="btn btn-sm" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(sh.address) + '" target="_blank" rel="noopener">' + icon('pin') + ' Bản đồ</a>' : '');
    var actions = st === 'future'
      ? '<button class="btn btn-sm" data-act="ics" data-id="' + sh.id + '" data-d="' + s + '">' + icon('alarm') + ' Thêm vào lịch nhắc</button>' +
        '<button class="btn btn-sm" data-act="show-money" data-id="' + sh.id + '" data-d="' + s + '">' + icon('money') + ' Sửa tiền</button>' +
        '<button class="btn btn-sm danger" data-act="cancel-show" data-id="' + sh.id + '" data-d="' + s + '">Hủy lần này</button>'
      : st === 'pending'
        ? '<button class="btn btn-sm btn-done" data-act="confirm-show" data-id="' + sh.id + '" data-d="' + s + '">✅ Đã hoàn thành show</button>' +
          '<button class="btn btn-sm btn-cancel" data-act="cancel-show" data-id="' + sh.id + '" data-d="' + s + '">❌ Hủy show</button>'
        : st === 'done'
          ? '<button class="btn btn-sm" data-act="confirm-show" data-id="' + sh.id + '" data-d="' + s + '">' + icon('money') + ' Sửa tiền</button>'
          : '<button class="btn btn-sm" data-act="cancel-show" data-id="' + sh.id + '" data-d="' + s + '">📝 Sửa lý do</button>' +
            '<button class="btn btn-sm" data-act="reset-show" data-id="' + sh.id + '" data-d="' + s + '">↩️ Khôi phục show</button>';
    return '<article class="show-card ' + (compact ? 'inner' : 'glass') + (past ? ' past' : '') + (st === 'cancel' ? ' cancelled' : '') + '">' +
      '<div class="sc-date"><div class="sc-d">' + p.d + '</div><div class="sc-m">Tháng ' + p.m + '</div><div class="sc-l">' + L.day + '/' + L.month + (L.leap ? 'N' : '') + ' âm</div></div>' +
      '<div class="sc-body"><span class="tbadge t-' + P.key + '">' + P.icon + ' Show ' + P.name.toLowerCase() + ' · ' + P.clock + '</span>' +
      '<h3>' + esc(sh.name) + '</h3><div class="hint">' + C.weekday(s) + ', ' + dmy(s) + rep + '</div>' + stTag +
      '<div class="info">' +
      (sh.host ? '<div>' + icon('user') + '<span>Chủ tiệc: <b>' + esc(sh.host) + '</b></span></div>' : '') +
      (bn ? '<div>' + icon('star') + '<span>Bầu show: <b>' + esc(bn) + '</b></span></div>' : '') +
      (sh.address ? '<div>' + icon('pin') + '<span>' + esc(sh.address) + '</span></div>' : '') +
      (sh.note ? '<div>' + icon('note') + '<span>' + esc(sh.note) + '</span></div>' : '') + '</div>' +
      (sh.phone ? '<div class="contact"><span class="who">SĐT liên hệ: ' + esc(sh.phone) + '</span>' + contactBtns(sh.phone) + '</div>' : '') +
      (bau && bau.phone ? '<div class="contact"><span class="who">Bầu show ' + esc(bau.name) + ': ' + esc(bau.phone) + '</span>' + contactBtns(bau.phone) + '</div>' : '') +
      (st === 'cancel' ? '' : '<div class="money-line' + (st === 'done' ? '' : ' expected') + '"><span>' + (st === 'done' ? 'Đã nhận' : 'Dự kiến nhận') + ': <b>' + fmt(m.received) + '</b></span><span>Bo show: <b>' + (m.tip ? fmt(m.tip) : 'chưa nhập') + '</b></span>' +
        (m.other ? '<span>Khác: <b>' + fmt(m.other) + '</b>' + (m.otherNote ? ' (' + esc(m.otherNote) + ')' : '') + '</span>' : '') + '</div>') +
      '<div class="sc-actions">' + mapBtn +
      actions +
      '<button class="btn btn-sm" data-act="edit-show" data-id="' + sh.id + '">' + icon('edit') + ' Sửa</button>' +
      '<button class="btn btn-sm danger" data-act="del-show" data-id="' + sh.id + '" aria-label="Xóa show">' + icon('trash') + '</button>' +
      '</div></div></article>';
  }

  /* ---------- Trang Show ---------- */
  function renderShows() {
    var h = '<div class="seg big-seg"><button class="' + (state.showTab === 'list' ? 'on' : '') + '" data-act="show-tab" data-t="list">🎤 Danh sách show</button>' +
      '<button class="' + (state.showTab === 'bau' ? 'on' : '') + '" data-act="show-tab" data-t="bau">⭐ Bầu show (' + state.baus.length + ')</button></div>';
    if (state.showTab === 'list') {
      h += '<div class="toolbar"><div class="seg"><button class="' + (state.showFilter === 'upcoming' ? 'on' : '') + '" data-act="show-filter" data-f="upcoming">Sắp tới</button>' +
        '<button class="' + (state.showFilter === 'past' ? 'on' : '') + '" data-act="show-filter" data-f="past">Đã diễn</button></div>' +
        '<button class="btn btn-primary" data-act="add-show">' + icon('plus') + ' Thêm show</button></div>' +
        '<input class="inp" id="show-q" type="search" placeholder="Tìm tên show, chủ tiệc, bầu show, địa chỉ…" value="' + esc(state.showQuery) + '" aria-label="Tìm show">' +
        '<div id="show-list" class="stack"></div>';
      $('#view-shows').innerHTML = h;
      fillShowList();
    } else {
      h += '<section class="card glass"><div class="sec-h"><h2>Danh sách bầu show</h2><button class="btn btn-sm btn-primary" data-act="add-bau">' + icon('plus') + ' Thêm bầu</button></div>' +
        '<p class="hint" style="margin-top:0">Nhập sẵn ở đây, khi thêm show chỉ cần chọn tên.</p>' +
        (state.baus.length ? '<div class="stack">' + state.baus.slice().sort(function (a, b) { return a.name.localeCompare(b.name, 'vi'); }).map(function (b) {
          var cnt = state.shows.filter(function (s) { return s.bauId === b.id; }).length;
          return '<div class="entry"><span class="emo">⭐</span><div class="t"><div class="n">' + esc(b.name) + '</div><div class="d">' + (b.phone ? esc(b.phone) + ' · ' : '') + cnt + ' show</div>' +
            (b.phone ? '<div class="contact" style="margin:6px 0 0">' + contactBtns(b.phone) + '</div>' : '') + '</div>' +
            '<button class="icon-btn sm" data-act="edit-bau" data-id="' + b.id + '" aria-label="Sửa">' + icon('edit') + '</button>' +
            '<button class="icon-btn sm danger" data-act="del-bau" data-id="' + b.id + '" aria-label="Xóa">' + icon('trash') + '</button></div>';
        }).join('') + '</div>' : '<p class="empty-state">Chưa có bầu show nào. Bấm “Thêm bầu” để nhập.</p>') + '</section>';
      $('#view-shows').innerHTML = h;
    }
  }
  function fillShowList() {
    var box = $('#show-list'); if (!box) return;
    var t = todayISO(), q = C.fold(state.showQuery.trim());
    var occ = state.showFilter === 'upcoming' ? C.occList(state.shows, t, C.addDays(t, 365)) : C.occList(state.shows, C.addDays(t, -730), C.addDays(t, -1)).reverse();
    if (q) occ = occ.filter(function (o) { return C.fold([o.show.name, o.show.host, o.show.address, bauName(o.show), o.show.phone].join(' ')).indexOf(q) >= 0; });
    box.innerHTML = occ.length ? occ.slice(0, 150).map(function (o) { return showCard(o); }).join('')
      : '<div class="card glass empty-state">' + (state.shows.length ? 'Không có show phù hợp.' : 'Chưa có show nào. Bấm “Thêm show” để bắt đầu.') + '</div>';
  }

  /* ---------- Biểu mẫu show ---------- */
  function opt(v, sel, label) { return '<option value="' + esc(v) + '"' + (String(v) === String(sel) ? ' selected' : '') + '>' + (label == null ? esc(v) : label) + '</option>'; }
  function range(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }
  function openShowForm(id, preset) {
    var sh = id ? state.shows.find(function (x) { return x.id === id; }) : null;
    var base = sh ? sh.date : (preset || todayISO());
    var dt = sh ? sh.dateType : 'am';
    var L0 = C.toLunar(base);
    var lun = sh && sh.lunar ? sh.lunar : { d: L0.day, m: L0.month, y: L0.year, leap: L0.leap ? 1 : 0 };
    var ly = C.toLunar(todayISO()).year;
    var years = range(Math.min(ly - 1, lun.y), Math.max(ly + 4, lun.y));
    var v = function (k) { return esc(sh ? sh[k] : ''); };
    var b = '<div id="show-form"><input type="hidden" id="sf-id" value="' + (sh ? sh.id : '') + '"><input type="hidden" id="sf-dtype" value="' + dt + '">' +
      '<div class="field"><label for="sf-name">Tên show *</label><input class="inp" id="sf-name" maxlength="120" value="' + v('name') + '" placeholder="VD: Đám cưới anh Tuấn – chị Lan"></div>' +
      '<div class="field"><label for="sf-host">Chủ tiệc</label><input class="inp" id="sf-host" maxlength="120" value="' + v('host') + '"></div>' +
      '<div class="field"><label for="sf-bau">Bầu show</label><select class="inp" id="sf-bau"><option value="">Không có bầu show</option>' +
      state.baus.map(function (x) { return opt(x.id, sh ? sh.bauId : '', esc(x.name) + (x.phone ? ' · ' + esc(x.phone) : '')); }).join('') +
      '<option value="__new">+ Thêm bầu show mới…</option></select>' +
      '<div id="sf-nb" class="grid2" hidden><input class="inp" id="sf-nb-name" placeholder="Tên bầu show mới"><input class="inp" id="sf-nb-phone" type="tel" inputmode="tel" placeholder="SĐT bầu show"></div></div>' +
      '<div class="field"><label for="sf-addr">Địa chỉ</label><textarea class="inp" id="sf-addr" rows="2" maxlength="400">' + v('address') + '</textarea></div>' +
      '<div class="field"><label for="sf-map">Link Google Map</label><input class="inp" id="sf-map" inputmode="url" maxlength="600" value="' + v('map') + '" placeholder="Dán link Google Maps vào đây"></div>' +
      '<div class="field"><label for="sf-phone">SĐT liên hệ (chủ tiệc)</label><input class="inp" id="sf-phone" type="tel" inputmode="tel" maxlength="30" value="' + v('phone') + '"></div>' +
      '<div class="field"><span class="lbl">Ngày nhận show</span><div class="seg"><button type="button" data-act="date-type" data-t="am" class="' + (dt === 'am' ? 'on' : '') + '">🌙 Âm lịch</button>' +
      '<button type="button" data-act="date-type" data-t="duong" class="' + (dt === 'duong' ? 'on' : '') + '">☀️ Dương lịch</button></div>' +
      '<div id="sf-am"' + (dt === 'am' ? '' : ' hidden') + ' style="margin-top:8px"><div class="grid3">' +
      '<label class="mini">Ngày âm<select class="inp" id="sf-ld"></select></label>' +
      '<label class="mini">Tháng âm<select class="inp" id="sf-lm"></select></label>' +
      '<label class="mini">Năm âm<select class="inp" id="sf-ly">' + years.map(function (n) { return opt(n, lun.y); }).join('') + '</select></label></div>' +
      '<div class="hint" id="sf-leapinfo"></div></div>' +
      '<div id="sf-duong"' + (dt === 'duong' ? '' : ' hidden') + ' style="margin-top:8px"><input class="inp" type="date" id="sf-sd" value="' + base + '" aria-label="Ngày dương"></div>' +
      '<div class="preview" id="sf-dprev"></div></div>' +
      '<div class="field"><label for="sf-time">Giờ tiệc *</label><input class="inp" type="time" id="sf-time" value="' + v('time') + '"><div id="sf-tprev"></div></div>' +
      '<div class="field"><label for="sf-repeat">Lặp lại</label><select class="inp" id="sf-repeat">' +
      Object.keys(REPEAT).map(function (k) { return opt(k, sh ? sh.repeat : 'none', REPEAT[k]); }).join('') + '</select>' +
      '<div class="hint">Lặp theo loại lịch đã chọn ở trên (âm hoặc dương).</div></div>' +
      '<div class="grid2"><div class="field"><label for="sf-recv">Tiền nhận show</label><input class="inp amount" id="sf-recv" inputmode="numeric" autocomplete="off" placeholder="0" value="' + (sh && sh.received ? C.dots(sh.received) : '') + '"></div>' +
      '<div class="field"><label for="sf-tip">Tiền bo show</label><input class="inp amount" id="sf-tip" inputmode="numeric" autocomplete="off" placeholder="Nhập sau" value="' + (sh && sh.tip ? C.dots(sh.tip) : '') + '"></div></div>' +
      (sh && sh.repeat !== 'none' ? '<p class="hint">Show lặp lại: đây là tiền mặc định mỗi lần diễn. Muốn sửa tiền riêng một lần, bấm “Sửa tiền” trên thẻ show của ngày đó.</p>' : '') +
      '<div class="field"><label for="sf-note">Ghi chú</label><textarea class="inp" id="sf-note" rows="2" maxlength="500">' + v('note') + '</textarea></div></div>';
    var f = '<button class="btn" data-act="close-sheet">Hủy</button><button class="btn btn-primary" data-act="save-show">' + (sh ? 'Lưu thay đổi' : 'Lưu show') + '</button>';
    openSheet(sh ? 'Sửa show' : 'Thêm show', b, f);
    fillLunar(lun.d, lun.m, lun.y, lun.leap);
    updateShowPreview();
  }
  // Tự dựng danh sách tháng âm (có tháng nhuận nếu năm đó có) và số ngày đúng của tháng
  function leapMonthOf(y) { for (var m = 1; m <= 12; m++) if (C.lunarMonthLen(m, y, 1)) return m; return 0; }
  function fillLunar(d, m, y, leap) {
    var lm = $('#sf-lm'), ld = $('#sf-ld'), info = $('#sf-leapinfo'); if (!lm) return;
    var lp = leapMonthOf(y);
    if (leap && lp !== m) leap = 0;
    var mo = '';
    for (var i = 1; i <= 12; i++) {
      mo += opt(i + '-0', m + '-' + (leap ? 1 : 0), String(i));
      if (i === lp) mo += opt(i + '-1', m + '-' + (leap ? 1 : 0), i + ' nhuận');
    }
    lm.innerHTML = mo;
    var len = C.lunarMonthLen(m, y, leap) || 30;
    d = Math.min(d, len);
    ld.innerHTML = range(1, len).map(function (n) { return opt(n, d); }).join('');
    info.textContent = 'Tháng ' + m + (leap ? ' nhuận' : '') + ' năm ' + y + ' có ' + len + ' ngày' + (lp ? ' · năm ' + C.canChi(y) + ' có tháng ' + lp + ' nhuận' : '') + '.';
  }
  function readLunarSel() {
    var mv = String($('#sf-lm').value || '1-0').split('-');
    return { d: +$('#sf-ld').value || 1, m: +mv[0], y: +$('#sf-ly').value, leap: +mv[1] ? 1 : 0 };
  }
  function readShowDate() {
    if ($('#sf-dtype').value === 'am') {
      var x = readLunarSel();
      var s = C.fromLunarClamp(x.d, x.m, x.y, x.leap);
      if (!s) return { error: 'Ngày âm lịch không hợp lệ.' };
      return { iso: s, lunar: { d: x.d, m: x.m, y: x.y, leap: x.leap } };
    }
    var iso = $('#sf-sd').value;
    if (!iso) return { error: 'Chọn ngày dương lịch.' };
    var L = C.toLunar(iso);
    return { iso: iso, lunar: { d: L.day, m: L.month, y: L.year, leap: L.leap ? 1 : 0 } };
  }
  function updateShowPreview() {
    var el = $('#sf-dprev'); if (!el) return;
    var D = readShowDate();
    if (D.error) { el.className = 'preview err'; el.textContent = D.error; }
    else {
      el.className = 'preview';
      el.innerHTML = $('#sf-dtype').value === 'am'
        ? '☀️ Dương lịch: <b>' + C.weekday(D.iso) + ', ' + dmy(D.iso) + '</b>'
        : '🌙 Âm lịch: <b>' + lunarTxt({ day: D.lunar.d, month: D.lunar.m, leap: D.lunar.leap }) + '</b> năm ' + C.canChi(D.lunar.y);
    }
    var t = $('#sf-time').value, P = C.period(t);
    $('#sf-tprev').innerHTML = t ? '<div class="tprev"><span class="tbadge t-' + P.key + '">' + P.icon + ' Show ' + P.name.toLowerCase() + ' lúc ' + P.clock + '</span></div>'
      : '<div class="hint">Chọn giờ để thấy rõ show sáng, trưa, chiều hay tối.</div>';
  }
  function setSel(id, val) {
    var el = $('#' + id); if (!el) return;
    if (!$$('option', el).some(function (o) { return o.value === String(val); })) { var o = document.createElement('option'); o.value = val; o.textContent = val; el.appendChild(o); }
    el.value = String(val);
  }
  function setDateType(t) {
    if ($('#sf-dtype').value === t) return;
    var D = readShowDate();
    $('#sf-dtype').value = t;
    if (t === 'duong') { if (D.iso) $('#sf-sd').value = D.iso; }
    else {
      var iso = $('#sf-sd').value;
      if (iso) { var L = C.toLunar(iso); setSel('sf-ly', L.year); fillLunar(L.day, L.month, L.year, L.leap); }
    }
    $('#sf-am').hidden = t !== 'am'; $('#sf-duong').hidden = t !== 'duong';
    $$('[data-act="date-type"]').forEach(function (b) { b.classList.toggle('on', b.dataset.t === t); });
    updateShowPreview();
  }
  function saveShow(btn) {
    var id = $('#sf-id').value, name = $('#sf-name').value.trim();
    if (!name) return toast('Nhập tên show', 'err');
    var D = readShowDate(); if (D.error) return toast(D.error, 'err');
    var time = $('#sf-time').value; if (!time) return toast('Chọn giờ tiệc', 'err');
    var old = id ? state.shows.find(function (s) { return s.id === id; }) : null;
    var bauId = $('#sf-bau').value, pre = Promise.resolve(true), newBau = null;
    if (bauId === '__new') {
      var bn = $('#sf-nb-name').value.trim();
      if (!bn) return toast('Nhập tên bầu show mới', 'err');
      newBau = { id: uid(), name: bn, phone: $('#sf-nb-phone').value.trim() };
      bauId = newBau.id;
    }
    var show = {
      id: id || uid(), name: name, host: $('#sf-host').value.trim(), bauId: bauId || '', bauName: '',
      address: $('#sf-addr').value.trim(), map: $('#sf-map').value.trim(), phone: $('#sf-phone').value.trim(),
      dateType: $('#sf-dtype').value, date: D.iso, lunar: D.lunar, time: time, repeat: $('#sf-repeat').value,
      received: num($('#sf-recv').value), tip: num($('#sf-tip').value), note: $('#sf-note').value.trim(),
      overrides: old ? old.overrides || {} : {}, createdAt: old ? old.createdAt : Date.now(), updatedAt: Date.now()
    };
    busy(btn, true);
    if (newBau) pre = persist('bau', 'upsert', newBau);
    pre.then(function (ok) {
      if (!ok) return false;
      var b = bauOf(show); show.bauName = b ? b.name : '';
      return persist('show', 'upsert', show);
    }).then(function (ok) {
      busy(btn, false);
      if (!ok) return;
      closeSheet(); toast(old ? 'Đã lưu thay đổi' : 'Đã thêm show “' + name + '”');
      render();
    });
  }
  function delShow(id) {
    var sh = state.shows.find(function (s) { return s.id === id; }); if (!sh) return;
    var msg = sh.repeat && sh.repeat !== 'none' ? 'Show “' + sh.name + '” đang lặp lại. Xóa sẽ xóa tất cả các lần. Xóa chứ?' : 'Xóa show “' + sh.name + '”?';
    if (!confirm(msg)) return;
    persist('show', 'delete', id).then(function (ok) { if (ok) { closeSheet(); toast('Đã xóa show'); render(); } });
    render();
  }
  function openShowMoney(id, s) {
    var sh = state.shows.find(function (x) { return x.id === id; }); if (!sh) return;
    var m = C.money(sh, s), rec = sh.repeat && sh.repeat !== 'none';
    var b = '<p class="hint" style="margin-top:0"><b>' + esc(sh.name) + '</b><br>' + C.weekday(s) + ', ' + dmy(s) + (rec ? ' — chỉ sửa cho lần diễn này' : '') + '</p>' +
      '<input type="hidden" id="sm-id" value="' + esc(id) + '"><input type="hidden" id="sm-d" value="' + s + '">' +
      '<div class="field"><label for="sm-recv">Tiền nhận show</label><input class="inp amount big-inp" id="sm-recv" inputmode="numeric" autocomplete="off" placeholder="0" value="' + (m.received ? C.dots(m.received) : '') + '"></div>' +
      '<div class="field"><label for="sm-tip">Tiền bo show</label><input class="inp amount big-inp" id="sm-tip" inputmode="numeric" autocomplete="off" placeholder="0" value="' + (m.tip ? C.dots(m.tip) : '') + '"></div>';
    openSheet('Sửa tiền show', b, '<button class="btn" data-act="close-sheet">Hủy</button><button class="btn btn-primary" data-act="save-show-money">Lưu tiền</button>');
  }
  function saveShowMoney(btn) {
    var src = state.shows.find(function (x) { return x.id === $('#sm-id').value; }); if (!src) return;
    var sh = JSON.parse(JSON.stringify(src)), s = $('#sm-d').value;
    var received = num($('#sm-recv').value), tip = num($('#sm-tip').value);
    sh.overrides = sh.overrides || {};
    if ((!sh.repeat || sh.repeat === 'none') && !sh.overrides[s]) { sh.received = received; sh.tip = tip; }
    else sh.overrides[s] = Object.assign({}, sh.overrides[s] || {}, { received: received, tip: tip });
    sh.updatedAt = Date.now();
    busy(btn, true);
    persist('show', 'upsert', sh).then(function (ok) { busy(btn, false); if (ok) { closeSheet(); toast('Đã lưu tiền show'); render(); } });
  }
  function openIcs(id, s) {
    var sh = state.shows.find(function (x) { return x.id === id; }); if (!sh) return;
    var P = C.period(sh.time), L = C.toLunar(s);
    var payload = {
      n: sh.name, s: C.showTimeUTC(s, sh.time), a: sh.address || '', p: sh.phone || '', m: sh.map || '', h: sh.host || '', b: bauName(sh),
      w: 'Show ' + P.name.toLowerCase() + ' lúc ' + P.clock + ', ' + C.weekday(s) + ' ' + dmy(s) + ' (âm ' + L.day + '/' + L.month + ')', u: sh.id + '-' + s
    };
    var b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    var a = document.createElement('a'); a.href = '/api/ics?d=' + b64; a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    toast('Đang mở Lịch — bấm “Thêm tất cả” để lưu 3 lần nhắc');
  }

  /* ---------- Bầu show ---------- */
  function openBau(id) {
    var b = id ? state.baus.find(function (x) { return x.id === id; }) : null;
    openSheet(b ? 'Sửa bầu show' : 'Thêm bầu show',
      '<input type="hidden" id="bf-id" value="' + (b ? b.id : '') + '"><div class="field"><label for="bf-name">Tên bầu show *</label><input class="inp" id="bf-name" maxlength="120" value="' + esc(b ? b.name : '') + '"></div>' +
      '<div class="field"><label for="bf-phone">SĐT</label><input class="inp" id="bf-phone" type="tel" inputmode="tel" maxlength="30" value="' + esc(b ? b.phone : '') + '"></div>',
      '<button class="btn" data-act="close-sheet">Hủy</button><button class="btn btn-primary" data-act="save-bau">Lưu</button>');
  }
  function saveBau(btn) {
    var name = $('#bf-name').value.trim(); if (!name) return toast('Nhập tên bầu show', 'err');
    var b = { id: $('#bf-id').value || uid(), name: name, phone: $('#bf-phone').value.trim() };
    busy(btn, true);
    persist('bau', 'upsert', b).then(function (ok) { busy(btn, false); if (ok) { closeSheet(); toast('Đã lưu bầu show'); render(); } });
  }
  function delBau(id) {
    var b = state.baus.find(function (x) { return x.id === id; }); if (!b) return;
    if (!confirm('Xóa bầu show “' + b.name + '”? Các show cũ vẫn giữ nguyên.')) return;
    persist('bau', 'delete', id).then(function (ok) { if (ok) toast('Đã xóa'); render(); });
    render();
  }

  /* ---------- Thu chi ---------- */
  function entryRow(e) {
    var c = CATS[e.cat] || CATS.khac, chi = e.cat === 'chi';
    return '<div class="entry"><span class="emo">' + c.icon + '</span><div class="t"><div class="n">' + esc(c.name) + '</div>' + (e.note ? '<div class="d">' + esc(e.note) + '</div>' : '') + '</div>' +
      '<b class="a ' + (chi ? 'neg' : 'pos') + '">' + (chi ? '−' : '+') + fmt(e.amount) + '</b>' +
      '<button class="icon-btn sm" data-act="edit-entry" data-id="' + e.id + '" aria-label="Sửa">' + icon('edit') + '</button>' +
      '<button class="icon-btn sm danger" data-act="del-entry" data-id="' + e.id + '" aria-label="Xóa">' + icon('trash') + '</button></div>';
  }
  function renderMoney() {
    var s = state.moneyDate; needYear(s.slice(0, 4));
    var S = sumRange(s, s), es = entriesOf(s), occ = C.occList(state.shows, s, s), L = C.toLunar(s);
    var h = '<section class="datebar glass">' +
      '<label class="mid"><div class="dtitle">' + C.weekday(s) + ', ' + dmy(s) + '</div><div class="dsub">Âm lịch ' + L.day + '/' + L.month + (L.leap ? ' nhuận' : '') + ' · chạm để chọn ngày khác</div>' +
      '<input type="date" id="money-date" value="' + s + '" aria-label="Chọn ngày"></label>' +
      '<span class="pick-ic">' + icon('cal') + '</span></section>';
    var isToday = s === todayISO();
    h += '<div class="day-nav"><button class="btn day-btn today-btn' + (isToday ? ' is-today' : '') + '" data-act="money-today">' + (isToday ? '✓ Đang xem ngày hôm nay' : '📅 Chọn về ngày hôm nay') + '</button>' +
      '<button class="btn day-btn" data-act="money-prev">' + icon('chevL') + ' Ngày hôm trước</button>' +
      '<button class="btn day-btn" data-act="money-next">Ngày hôm sau ' + icon('chevR') + '</button></div>';
    h += '<div class="wide-2"><section class="sum glass"><div class="hint">Ngày đang xem · còn lại (thu − chi)</div><div class="big ' + (S.con < 0 ? 'neg' : 'pos') + '">' + fmt(S.con) + '</div>' +
      '<div class="line"><span>Tiền làm tiệm tóc</span><b>' + fmt(S.lam) + '</b></div>' +
      '<div class="line sub"><span>Hớt tóc</span><span>' + fmt(S.hottoc) + '</span></div>' +
      '<div class="line sub"><span>Massage</span><span>' + fmt(S.massage) + '</span></div>' +
      '<div class="line"><span>Tiền bo tiệm tóc</span><b>' + fmt(S.botiem) + '</b></div>' +
      '<div class="line"><span>Thu show (' + S.showCount + ' show)</span><b>' + fmt(S.show) + '</b></div>' +
      (S.showCount ? '<div class="line sub"><span>Tiền nhận show</span><span>' + fmt(S.showNhan) + '</span></div><div class="line sub"><span>Tiền bo show</span><span>' + fmt(S.showBo) + '</span></div>' : '') +
      '<div class="line"><span>Thu khác</span><b>' + fmt(S.khac) + '</b></div>' +
      '<div class="line total"><span>Tổng thu</span><b class="pos">' + fmt(S.thu) + '</b></div>' +
      '<div class="line total"><span>Tổng chi</span><b class="neg">' + fmt(S.chi) + '</b></div></section>' +
      '<section class="card glass"><h2>Ghi nhanh</h2><div class="qa">' + Object.keys(CATS).map(function (k) {
        return '<button class="qa-b' + (k === 'chi' ? ' qa-chi' : '') + '" data-act="add-entry" data-cat="' + k + '" data-d="' + s + '"><span class="emo">' + CATS[k].icon + '</span>' + CATS[k].name + '</button>';
      }).join('') + '</div>' +
      '<h3 class="sub-h">Các khoản trong ngày</h3>' + (es.length ? '<div class="stack">' + es.map(entryRow).join('') + '</div>' : '<p class="hint">Chưa có khoản nào. Bấm một ô ở trên để ghi.</p>') +
      (occ.length ? '<h3 class="sub-h">Tiền show trong ngày</h3><div class="stack">' + occ.map(function (o) {
        var m = C.money(o.show, o.iso), P = C.period(o.show.time), st = statusOf(o.show, o.iso);
        return '<div class="entry"><span class="emo">🎤</span><div class="t"><div class="n">' + esc(o.show.name) + '</div><div class="d">' + P.icon + ' ' + P.text + ' · nhận ' + fmt(m.received) + ' · bo ' + fmt(m.tip) + '</div></div>' +
          '<button class="btn btn-sm' + (st === 'pending' ? ' btn-done' : '') + '" data-act="' + (st === 'future' ? 'show-money' : st === 'cancel' ? 'reset-show' : 'confirm-show') + '" data-id="' + o.show.id + '" data-d="' + o.iso + '">' +
          (st === 'pending' ? '✅ Xác nhận' : st === 'done' ? '✅ Sửa tiền' : st === 'cancel' ? '❌ Đã hủy · khôi phục' : 'Sửa tiền') + '</button></div>';
      }).join('') + '</div>' : '') + '</section></div>';
    h += statsBlock(false);
    $('#view-money').innerHTML = h;
  }
  function noteLabel(c) { return c === 'khac' ? 'Nội dung tiền khác *' : c === 'chi' ? 'Nội dung chi *' : 'Ghi chú (không bắt buộc)'; }
  function notePh(c) { return c === 'khac' ? 'VD: Bán đồ cũ, được cho…' : c === 'chi' ? 'VD: Tiền điện, đi chợ, xăng…' : 'VD: Khách quen anh Hùng'; }
  function openEntry(id, cat, date) {
    var e = id ? findEntry(id) : null;
    var c0 = e ? e.cat : (cat || 'hottoc'), d0 = e ? e.date : (date || state.moneyDate);
    var b = '<input type="hidden" id="ef-id" value="' + (e ? e.id : '') + '"><input type="hidden" id="ef-cat" value="' + c0 + '">' +
      '<div class="field"><span class="lbl">Loại</span><div class="chips">' + Object.keys(CATS).map(function (k) {
        return '<button type="button" class="chip' + (k === c0 ? ' on' : '') + '" data-act="pick-cat" data-cat="' + k + '">' + CATS[k].icon + ' ' + CATS[k].name + '</button>';
      }).join('') + '</div></div>' +
      '<div class="field"><label for="ef-date">Ngày</label><input class="inp" type="date" id="ef-date" value="' + d0 + '"><div class="hint" id="ef-lunar">Âm lịch: ' + lunarTxt(C.toLunar(d0)) + '</div></div>' +
      '<div class="field"><label for="ef-amount">Số tiền (đồng) *</label><input class="inp amount big-inp" id="ef-amount" inputmode="numeric" autocomplete="off" placeholder="0" value="' + (e ? C.dots(e.amount) : '') + '">' +
      '<div class="chips">' + [10000, 20000, 50000, 100000, 200000, 500000].map(function (v) { return '<button type="button" class="chip" data-act="amt-add" data-v="' + v + '">+' + (v / 1000) + 'k</button>'; }).join('') +
      '<button type="button" class="chip" data-act="amt-clear">Xóa số</button></div></div>' +
      '<div class="field"><label for="ef-note" id="ef-note-l">' + noteLabel(c0) + '</label><input class="inp" id="ef-note" maxlength="200" value="' + esc(e ? e.note : '') + '" placeholder="' + notePh(c0) + '"></div>';
    var f = (e ? '<button class="btn danger" data-act="del-entry" data-id="' + e.id + '">Xóa</button>' : '<button class="btn" data-act="close-sheet">Hủy</button>') +
      '<button class="btn btn-primary" data-act="save-entry">' + (e ? 'Lưu thay đổi' : 'Lưu') + '</button>';
    openSheet(e ? 'Sửa thu chi' : 'Thêm thu chi', b, f);
  }
  function saveEntry(btn) {
    var id = $('#ef-id').value, cat = $('#ef-cat').value, date = $('#ef-date').value;
    var amount = num($('#ef-amount').value), note = $('#ef-note').value.trim();
    if (!date) return toast('Chọn ngày', 'err');
    if (!amount) return toast('Nhập số tiền', 'err');
    if ((cat === 'khac' || cat === 'chi') && !note) return toast(cat === 'chi' ? 'Nhập nội dung chi' : 'Nhập nội dung tiền khác', 'err');
    var old = id ? findEntry(id) : null;
    var item = { id: id || uid(), date: date, type: cat === 'chi' ? 'chi' : 'thu', cat: cat, amount: amount, note: note, updatedAt: Date.now() };
    busy(btn, true);
    var p = Promise.resolve(true);
    if (old && old.date.slice(0, 4) !== date.slice(0, 4)) p = persist('entry', 'delete', old.id, old.date.slice(0, 4));
    p.then(function (ok) { return ok ? persist('entry', 'upsert', item) : false; }).then(function (ok) {
      busy(btn, false);
      if (!ok) return;
      closeSheet(); toast((old ? 'Đã lưu: ' : 'Đã thêm: ') + CATS[cat].name + ' ' + fmt(amount));
      if (state.view === 'money') state.moneyDate = date;
      render();
    });
  }
  function delEntry(id) {
    var e = findEntry(id); if (!e) return;
    if (!confirm('Xóa khoản ' + (CATS[e.cat] || CATS.khac).name + ' ' + fmt(e.amount) + ' ngày ' + dmy(e.date) + '?')) return;
    persist('entry', 'delete', id, e.date.slice(0, 4)).then(function (ok) { if (ok) toast('Đã xóa'); render(); });
    closeSheet(); render();
  }

  /* ---------- Báo cáo ---------- */
  function groupList(list) {
    if (!list.length) return '<p class="hint">Không có.</p>';
    var g = {};
    list.forEach(function (e) { var k = (e.note || 'Không ghi nội dung').trim(); var kk = C.fold(k); if (!g[kk]) g[kk] = { name: k, sum: 0, n: 0 }; g[kk].sum += e.amount; g[kk].n++; });
    var arr = Object.keys(g).map(function (k) { return g[k]; }).sort(function (a, b) { return b.sum - a.sum; });
    return arr.slice(0, 15).map(function (x) { return '<div class="line"><span>' + esc(x.name) + ' <small>(' + x.n + ' lần)</small></span><b>' + fmt(x.sum) + '</b></div>'; }).join('') +
      (arr.length > 15 ? '<p class="hint">…và ' + (arr.length - 15) + ' mục khác</p>' : '');
  }
  function reportBody(S, label) {
    var parts = [['Tiền làm', S.lam, '#0A6CDB'], ['Bo tiệm tóc', S.botiem, '#FF5E8A'], ['Show', S.show, '#8E44C9'], ['Thu khác', S.khac, '#14A391']];
    var tot = S.thu || 1;
    return '<section class="sum glass"><div class="hint">Tiết kiệm được ' + label + '</div><div class="big ' + (S.con < 0 ? 'neg' : 'pos') + '">' + fmt(S.con) + '</div>' +
      '<div class="kv"><span>Tổng thu <b class="pos">' + fmt(S.thu) + '</b></span><span>Tổng chi <b class="neg">' + fmt(S.chi) + '</b></span>' +
      (S.thu ? '<span>Để dành được <b>' + Math.round(S.con / S.thu * 100) + '%</b> số thu</span>' : '') + '</div>' +
      '<div class="bar">' + parts.map(function (x) { return x[1] > 0 ? '<i style="width:' + (x[1] / tot * 100) + '%;background:' + x[2] + '" title="' + x[0] + '"></i>' : ''; }).join('') + '</div>' +
      '<div class="legend">' + parts.map(function (x) { return '<span style="--c:' + x[2] + '">' + x[0] + ' ' + (S.thu ? Math.round(x[1] / tot * 100) : 0) + '%</span>'; }).join('') + '</div></section>' +
      '<div class="wide-2">' +
      '<section class="card glass"><h2>✂️ Tiệm tóc</h2>' + line('Hớt tóc', S.hottoc) + line('Massage', S.massage) +
      '<div class="line total"><span>Tiền làm (hớt tóc + massage)</span><b>' + fmt(S.lam) + '</b></div>' +
      '<div class="line total"><span>Tiền bo tiệm tóc (riêng)</span><b>' + fmt(S.botiem) + '</b></div>' +
      '<div class="line total"><span>Tổng tiệm tóc</span><b class="pos">' + fmt(S.tiem) + '</b></div></section>' +
      '<section class="card glass"><h2>🎤 Show</h2><div class="line"><span>Số show đã hoàn thành</span><b>' + S.showCount + '</b></div>' +
      line('Tiền nhận show', S.showNhan) + line('Tiền bo show', S.showBo) +
      '<div class="line total"><span>Tổng thu show</span><b class="pos">' + fmt(S.show) + '</b></div>' +
      (S.showKhac ? line('Tiền khác của show', S.showKhac) : '') +
      (S.pendCount ? '<div class="line sub"><span>⏳ Chờ xác nhận: ' + S.pendCount + ' show (chưa tính)</span><span>' + fmt(S.pendSum) + '</span></div>' : '') +
      (S.huyCount ? '<div class="line sub"><span>❌ Đã hủy: ' + S.huyCount + ' show (không tính)</span><span></span></div>' +
        '<details class="cx-list"><summary>Xem lý do các show đã hủy</summary>' + S.huyList.map(function (x) {
          return '<div class="cx-item"><b>' + dm(x.o.iso) + ' · ' + esc(x.o.show.name) + '</b><br><small>📝 ' + esc(x.reason || 'Không ghi lý do') + '</small></div>';
        }).join('') + '</details>' : '') +
      (S.upCount ? '<div class="line sub"><span>Sắp diễn: ' + S.upCount + ' show (chưa tính vào tổng)</span><span>' + fmt(S.upNhan) + '</span></div>' : '') + '</section>' +
      '<section class="card glass"><h2>💰 Thu khác · ' + fmt(S.khac) + '</h2>' + groupList(S.khacList) + '</section>' +
      '<section class="card glass"><h2>🧾 Chi tiêu · ' + fmt(S.chi) + '</h2>' + groupList(S.chiList) + '</section></div>';
  }
  function tableRow(label, S, act) {
    return '<tr' + (act || '') + '><td>' + label + '</td><td>' + C.dots(S.lam) + '</td><td>' + C.dots(S.botiem) + '</td><td>' + C.dots(S.show) + '</td><td>' + C.dots(S.khac) + '</td>' +
      '<td class="pos">' + C.dots(S.thu) + '</td><td class="neg">' + C.dots(S.chi) + '</td><td class="' + (S.con < 0 ? 'neg' : '') + '"><b>' + C.dots(S.con) + '</b></td></tr>';
  }
  var THEAD = '<thead><tr><th>FIRST</th><th>Tiền làm</th><th>Bo tiệm</th><th>Show</th><th>Khác</th><th>Tổng thu</th><th>Chi</th><th>Tiết kiệm</th></tr></thead>';
  function renderReport() {
    var r = state.rep; needYear(r.y);
    var isM = r.mode === 'month';
    var from = isM ? C.iso(r.y, r.m, 1) : C.iso(r.y, 1, 1), to = isM ? C.iso(r.y, r.m, C.dim(r.y, r.m)) : C.iso(r.y, 12, 31);
    var S = sumRange(from, to);
    var h = '<div class="seg big-seg"><button class="' + (isM ? 'on' : '') + '" data-act="rep-mode" data-m="month">Theo tháng</button><button class="' + (!isM ? 'on' : '') + '" data-act="rep-mode" data-m="year">Theo năm</button></div>' +
      '<section class="datebar glass"><button class="icon-btn" data-act="rep-prev" aria-label="Trước">' + icon('chevL') + '</button><div class="mid"><div class="dtitle">' + (isM ? 'Tháng ' + r.m + ' năm ' + r.y : 'Năm ' + r.y) + '</div><div class="dsub">Đơn vị: đồng</div></div>' +
      '<button class="icon-btn" data-act="rep-next" aria-label="Sau">' + icon('chevR') + '</button></section>' +
      reportBody(S, isM ? 'tháng ' + r.m : 'năm ' + r.y);
    var rows = '';
    if (isM) {
      for (var d = 1; d <= C.dim(r.y, r.m); d++) {
        var s = C.iso(r.y, r.m, d), Sd = sumRange(s, s);
        if (Sd.thu || Sd.chi) rows += tableRow(pad(d) + '/' + pad(r.m) + ' <small>' + C.weekdayShort(s) + '</small>', Sd, ' data-act="day" data-d="' + s + '"');
      }
      h += '<section class="card glass"><h2>Chi tiết từng ngày</h2>' + (rows ? '<div class="tbl-wrap"><table class="tbl">' + THEAD.replace('FIRST', 'Ngày') + '<tbody>' + rows + tableRow('Cộng tháng', S, ' class="tot"') + '</tbody></table></div><p class="hint">Chạm vào một dòng để xem chi tiết ngày đó.</p>' : '<p class="empty-state">Tháng này chưa có dữ liệu.</p>') + '</section>';
    } else {
      var best = null;
      for (var m = 1; m <= 12; m++) {
        var Sm = sumRange(C.iso(r.y, m, 1), C.iso(r.y, m, C.dim(r.y, m)));
        if (Sm.thu || Sm.chi) { rows += tableRow('Tháng ' + m, Sm, ' data-act="rep-goto" data-m="' + m + '"'); if (!best || Sm.con > best.con) best = { m: m, con: Sm.con }; }
      }
      h += '<section class="card glass"><h2>Tổng kết từng tháng</h2>' + (rows ? (best ? '<p class="hint" style="margin-top:0">Tháng để dành nhiều nhất: <b>tháng ' + best.m + '</b> (' + fmt(best.con) + ')</p>' : '') +
        '<div class="tbl-wrap"><table class="tbl">' + THEAD.replace('FIRST', 'Tháng') + '<tbody>' + rows + tableRow('Cả năm', S, ' class="tot"') + '</tbody></table></div><p class="hint">Chạm vào một tháng để xem báo cáo tháng đó.</p>' : '<p class="empty-state">Năm này chưa có dữ liệu.</p>') + '</section>';
    }
    $('#view-report').innerHTML = h;
  }

  /* ---------- Cài đặt ---------- */
  function yearsList() {
    var ys = {};
    state.years.forEach(function (y) { ys[y] = 1; });
    Object.keys(state.entries).forEach(function (y) { if ((state.entries[y] || []).length) ys[y] = 1; });
    state.shows.forEach(function (s) { if ((s.repeat || 'none') === 'none' && s.date) ys[s.date.slice(0, 4)] = 1; });
    return Object.keys(ys).sort().reverse();
  }
  function renderSettings() {
    var st = state.storage, used = st ? st.used : 0, pct = used / STORAGE_LIMIT * 100;
    var perm = 'Notification' in window ? Notification.permission : 'unsupported';
    var pushOn = localStorage.getItem('kim_push') === '1';
    var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    var h = '<section class="card glass"><div class="sec-h"><h2>💾 Dung lượng dữ liệu</h2><button class="btn btn-sm" data-act="refresh">Cập nhật</button></div>' +
      '<div class="storage-bar" role="progressbar" aria-valuenow="' + pct.toFixed(2) + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + Math.max(pct, .5) + '%"></i></div>' +
      '<p style="margin:0"><b>' + fmtBytes(used) + '</b> / 1 GB miễn phí · đã dùng ' + (pct < 0.01 ? 'chưa tới 0,01' : pct.toFixed(2).replace('.', ',')) + '%</p>' +
      '<p class="hint">Dữ liệu lưu trong kho GitHub riêng tư của bạn. Mỗi năm thu chi chỉ vài trăm KB nên dùng được rất nhiều năm.</p>' +
      (st && st.files && st.files.length ? '<details><summary>Xem từng file</summary>' + st.files.map(function (f) { return '<div class="line"><span>' + esc(f.name) + '</span><b>' + fmtBytes(f.size) + '</b></div>'; }).join('') + '</details>' : '') + '</section>';

    h += '<section class="card glass"><h2>🔔 Thông báo nhắc show</h2>' +
      '<p class="hint" style="margin-top:0">Nhắc trước 3 ngày, trước 1 ngày và trước giờ show 1 tiếng. Số show sắp tới hiện trên chuông và trên icon app.</p>' +
      (!standalone ? '<p class="preview">Trên iPhone/iPad: phải <b>thêm app vào Màn hình chính</b> rồi mở bằng icon thì mới bật được thông báo (xem hướng dẫn bên dưới).</p>' : '') +
      '<div class="line"><span>Quyền thông báo trên máy này</span><b>' + (perm === 'granted' ? '✅ Đã cho phép' : perm === 'denied' ? '⛔ Đã chặn' : perm === 'unsupported' ? 'Chưa hỗ trợ' : 'Chưa bật') + '</b></div>' +
      '<div class="line"><span>Nhắc cả khi đóng app</span><b>' + (pushOn ? '✅ Đang bật' : 'Chưa bật') + '</b></div>' +
      '<div class="row-btns" style="margin-top:10px"><button class="btn btn-primary" data-act="push-on">' + icon('bell') + ' Bật thông báo</button>' +
      (pushOn ? '<button class="btn" data-act="push-test">Gửi thử</button>' : '') + '</div>' +
      '<details><summary>Cài đặt nhắc khi đóng app (làm 1 lần)</summary><p class="hint">Bấm nút dưới để lấy mã, rồi làm theo Bước 8 trong file HUONG-DAN.md.</p>' +
      '<button class="btn btn-sm" data-act="push-keys">Lấy mã cài đặt</button><div id="keys-out"></div></details>' +
      '<p class="hint">Cách chắc chắn nhất: bấm “Thêm vào lịch nhắc” trên mỗi thẻ show. Lịch của điện thoại sẽ tự nhắc đúng 3 mốc giờ, kể cả khi không mở app.</p></section>';

    var ys = yearsList();
    h += '<section class="card glass"><h2>🗑️ Xóa dữ liệu theo năm</h2><p class="hint" style="margin-top:0">Xóa toàn bộ thu chi của năm đã chọn và các show không lặp lại của năm đó, cho nhẹ dung lượng. Nên tải file sao lưu trước.</p>' +
      (ys.length ? '<div class="row-btns"><select class="inp" id="del-year" style="width:auto;min-width:130px">' + ys.map(function (y) { return '<option>' + y + '</option>'; }).join('') + '</select>' +
        '<button class="btn btn-red" data-act="del-year">' + icon('trash') + ' Xóa năm này</button></div>' : '<p class="hint">Chưa có dữ liệu.</p>') + '</section>';

    h += '<section class="card glass"><h2>📦 Sao lưu</h2><p class="hint" style="margin-top:0">Tải toàn bộ show, bầu show và thu chi về máy dưới dạng 1 file.</p><button class="btn" data-act="backup">Tải file sao lưu</button></section>';

    h += '<section class="card glass"><h2>📱 Thêm app vào màn hình</h2><ol class="steps">' +
      '<li><b>iPhone / iPad:</b> mở kim1994.vercel.app bằng <b>Safari</b> → bấm nút <b>Chia sẻ</b> (ô vuông có mũi tên lên) → kéo xuống chọn <b>Thêm vào MH chính</b> → bấm <b>Thêm</b>.</li>' +
      '<li><b>Android:</b> mở bằng Chrome → bấm <b>⋮</b> góc phải trên → <b>Thêm vào màn hình chính</b>.</li>' +
      '<li><b>Máy tính:</b> mở bằng Chrome/Edge → bấm biểu tượng <b>Cài đặt ứng dụng</b> ở cuối thanh địa chỉ.</li></ol></section>';

    h += '<section class="card glass"><h2>🔑 Tài khoản</h2><p class="hint" style="margin-top:0">Muốn đổi mật khẩu: vào Vercel → dự án kim1994 → Settings → Environment Variables → sửa <b>APP_PASSWORD</b> → Redeploy (xem Bước 9 trong HUONG-DAN.md). Nếu dùng Render thì đổi cả bên Render.</p>' +
      '<button class="btn danger" data-act="lock-now">' + icon('lock') + ' Khóa app</button></section>';
    h += '<section class="card glass"><div class="sec-h"><h2>🔌 Kiểm tra kết nối dữ liệu</h2><button class="btn btn-sm btn-primary" data-act="check-conn">Kiểm tra lại</button></div><div id="conn-out">' + connHTML() + '</div></section>';
    $('#view-settings').innerHTML = h;
    if (!state.conn || Date.now() - state.conn.at > 60000) checkConn();
  }
  function connHTML() {
    var c = state.conn;
    if (!c) return '<p class="hint">Đang kiểm tra…</p>';
    var rows = (c.checks || []).map(function (x) {
      return '<div class="conn-row ' + (x.ok ? 'ok' : 'bad') + '"><span class="conn-ic">' + (x.ok ? '✅' : '❌') + '</span><div><b>' + esc(x.name) + '</b><br><small>' + esc(x.detail) + '</small>' +
        (x.fix ? '<div class="conn-fix">👉 Cách sửa: ' + esc(x.fix) + '</div>' : '') + '</div></div>';
    }).join('');
    var head = c.ok
      ? '<div class="conn-sum ok">✅ Kết nối dữ liệu tốt — đang chạy trên ' + esc(c.host || '') + (c.ms != null ? ' (' + c.ms + ' ms)' : '') + '</div>'
      : '<div class="conn-sum bad">❌ ' + esc(c.title || 'Có lỗi kết nối, xem dòng có dấu ❌ bên dưới') + '</div>';
    var when = new Date(c.at), hm = pad(when.getHours()) + ':' + pad(when.getMinutes());
    return head + rows + '<p class="hint">Kiểm tra lúc ' + hm + '</p>';
  }
  function checkConn(btn) {
    var out = function () { var el = $('#conn-out'); if (el) el.innerHTML = connHTML(); };
    if (btn) busy(btn, true, 'Đang kiểm tra…');
    var mk = function (title, name, detail, fix) { return { ok: false, at: Date.now(), title: title, checks: [{ name: name, ok: false, detail: detail, fix: fix }] }; };
    if (!navigator.onLine) { state.conn = mk('Máy đang mất mạng', 'Mạng Internet', 'Điện thoại / máy tính chưa có Wi-Fi hoặc 4G', 'Bật Wi-Fi hoặc dữ liệu di động rồi bấm Kiểm tra lại'); out(); if (btn) busy(btn, false); return; }
    fetch('/api/status', { headers: { Authorization: 'Bearer ' + state.token } }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.status === 401) state.conn = mk('Phiên đăng nhập hết hạn', 'Đăng nhập', 'Cần nhập lại mật khẩu', 'Bấm nút Khóa app rồi nhập lại mật khẩu');
        else if (r.status === 404) state.conn = mk('Máy chủ đang chạy code cũ', 'Phiên bản code', 'Chưa có chức năng kiểm tra (lỗi 404)', 'Tải bản code mới nhất lên kho kim1994 trên GitHub (HUONG-DAN.md Bước 10)');
        else if (!r.ok) state.conn = mk('Máy chủ báo lỗi ' + r.status, 'Máy chủ app', j.error || 'Lỗi ' + r.status, 'Xem nhật ký (Logs) trên Vercel/Render');
        else { j.checks = j.checks || []; j.checks.unshift({ name: 'Mạng Internet', ok: true, detail: 'Đã có mạng' }); state.conn = j; }
      });
    }, function () {
      state.conn = mk('Không kết nối được máy chủ app', 'Máy chủ app', 'Không gọi được máy chủ', 'Nếu dùng link Render: chờ 30–60 giây cho máy chủ thức dậy rồi bấm Kiểm tra lại. Nếu vẫn lỗi, vào Vercel/Render xem dịch vụ có đang Live không');
    }).then(function () { out(); if (btn) busy(btn, false); });
  }
  function b64ToU8(b) {
    var p = '='.repeat((4 - b.length % 4) % 4), s = atob((b + p).replace(/-/g, '+').replace(/_/g, '/'));
    var u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u;
  }
  function enablePush(btn) {
    if (!('Notification' in window) || !navigator.serviceWorker) {
      return toast('Máy này chưa hỗ trợ. Trên iPhone hãy thêm app vào Màn hình chính rồi mở từ icon.', 'err');
    }
    Notification.requestPermission().then(function (p) {
      if (p !== 'granted') { toast('Bạn chưa cho phép thông báo. Vào Cài đặt của máy → Thông báo để mở lại.', 'err'); render(); return; }
      if (!state.vapidPublic) { toast('Đã bật nhắc trong app. Làm thêm Bước 8 (HUONG-DAN.md) để được nhắc cả khi đóng app.'); localNotify(); render(); return; }
      busy(btn, true);
      return navigator.serviceWorker.ready.then(function (reg) {
        return reg.pushManager.getSubscription().then(function (sub) {
          return sub || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(state.vapidPublic) });
        });
      }).then(function (sub) {
        return api('/api/push', { method: 'POST', body: JSON.stringify({ action: 'subscribe', sub: sub.toJSON() }) });
      }).then(function () {
        localStorage.setItem('kim_push', '1'); toast('Đã bật thông báo, kể cả khi đóng app'); render();
      }).catch(function (e) { toast('Chưa bật được: ' + e.message, 'err'); busy(btn, false); });
    });
  }
  function getKeys(btn) {
    busy(btn, true);
    api('/api/keys').then(function (j) {
      busy(btn, false);
      var row = function (label, val) { return '<div class="lbl" style="margin-top:8px">' + label + '</div><div class="code">' + esc(val) + '</div><button class="btn btn-sm" data-act="copy" data-text="' + esc(val) + '">Sao chép</button>'; };
      $('#keys-out').innerHTML = j.configured
        ? '<p class="hint">✅ Đã cài khóa thông báo. Link hẹn giờ để dán vào cron-job.org:</p>' + row('Link hẹn giờ (cron)', j.cronUrl)
        : row('VAPID_PUBLIC_KEY', j.publicKey) + row('VAPID_PRIVATE_KEY (giữ bí mật)', j.privateKey) + row('Link hẹn giờ (cron) — dùng sau khi Redeploy', j.cronUrl) +
          '<p class="hint">Lưu ý: mỗi lần bấm “Lấy mã” sẽ ra cặp khóa mới. Chỉ dùng 1 cặp và dán cả 2 khóa cùng lúc.</p>';
    }).catch(function (e) { busy(btn, false); toast(e.message, 'err'); });
  }
  function delYear(btn) {
    var y = $('#del-year').value; if (!y) return;
    if (!confirm('Xóa TOÀN BỘ thu chi năm ' + y + ' và các show không lặp lại của năm ' + y + '? Không thể khôi phục.')) return;
    var typed = prompt('Gõ ' + y + ' để xác nhận xóa:');
    if (typed !== y) return toast('Đã hủy, chưa xóa gì');
    busy(btn, true);
    api('/api/data', { method: 'POST', body: JSON.stringify({ action: 'deleteYear', year: y }) }).then(function () {
      delete state.entries[y]; state.years = state.years.filter(function (x) { return x !== y; });
      state.fresh = {};
      return ensureYear(new Date().getFullYear());
    }).then(function () { toast('Đã xóa dữ liệu năm ' + y); render(); })
      .catch(function (e) { busy(btn, false); toast(e.message, 'err'); });
  }
  function backup(btn) {
    busy(btn, true);
    var ys = yearsList(), all = { app: 'Quản Lý $ Của Kim', exportedAt: new Date().toISOString(), shows: state.shows, bauShows: state.baus, thuchi: {} };
    ys.reduce(function (p, y) { return p.then(function () { return ensureYear(y).catch(function () { }); }); }, Promise.resolve()).then(function () {
      ys.forEach(function (y) { all.thuchi[y] = state.entries[y] || []; });
      var blob = new Blob([JSON.stringify(all, null, 1)], { type: 'application/json' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'kim1994-saoluu-' + todayISO() + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      busy(btn, false); toast('Đã tạo file sao lưu');
    });
  }

  /* ---------- Đăng nhập ---------- */
  function doLogin(btn) {
    var i = $('#lg-pass'); if (!i) return;
    var p = i.value; if (!p) { i.focus(); return toast('Nhập mật khẩu', 'err'); }
    if (btn) { btn.disabled = true; btn.textContent = 'Đang mở…'; }
    fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: p }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || 'Không đăng nhập được'); return j; }); })
      .then(function (j) {
        state.token = j.token; sessionStorage.setItem('kim_token', j.token);
        state.fresh = {}; state.view = 'home';
        $('#lock').innerHTML = '';
        render();
        return ensureYear(new Date().getFullYear()).then(render);
      })
      .catch(function (e) {
        if (btn) { btn.disabled = false; btn.textContent = 'Mở khóa'; }
        var box = $('.lock-box'); if (box) { box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); }
        if (i) { i.value = ''; i.focus(); }
        toast(e.message === 'Failed to fetch' ? 'Không kết nối được máy chủ' : e.message, 'err');
      });
  }
  function logout(expired) {
    state.token = ''; sessionStorage.removeItem('kim_token'); sessionStorage.removeItem('kim_cache');
    localStorage.removeItem('kim_token'); localStorage.removeItem('kim_cache');
    state.shows = []; state.baus = []; state.entries = {}; state.fresh = {}; state.years = []; state.storage = null;
    state.view = 'home';
    closeSheet();
    if (expired) toast('Phiên đăng nhập đã hết, vui lòng nhập lại mật khẩu', 'err');
    render();
  }

  function openBell() {
    var a = alerts(), pend = pendingShows();
    var perm = 'Notification' in window ? Notification.permission : 'unsupported';
    var b = (pend.length ? '<div class="al-l pend">⏳ Chờ xác nhận hoàn thành (' + pend.length + ')</div>' + pend.map(function (o) { return '<div class="alert-row">' + showCard(o, true) + '</div>'; }).join('') + '<div class="al-l">⏰ Sắp diễn</div>' : '') +
      (a.length ? a.map(function (o) { return '<div class="alert-row"><div class="al-l">⏰ ' + o.label + '</div>' + showCard(o, true) + '</div>'; }).join('')
      : '<p class="empty-state">Không có show nào trong 3 ngày tới.</p>');
    openSheet('Thông báo show', b, perm !== 'granted' ? '<button class="btn btn-primary" data-act="push-on">' + icon('bell') + ' Bật thông báo</button>' : '');
  }

  /* ================= Sự kiện ================= */
  var ACT = {
    'close-sheet': function () { closeSheet(); },
    tab: function (el) {
      var v = el.dataset.view;
      closeSheet(); state.view = v; render(); window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    'lock-now': function () { logout(); },
    stat: function (el) { state.statKey = el.dataset.k; render(); },
    'cal-pick': function (el) { state.calIdx = +el.dataset.i; renderHome(); },
    'open-show': function (el) { openShowDetail(el.dataset.id, el.dataset.d); },
    logout: function () { if (confirm('Đăng xuất khỏi máy này?')) logout(); },
    bell: openBell,
    'cal-prev': function () { state.cal.m--; if (state.cal.m < 1) { state.cal.m = 12; state.cal.y--; } renderHome(); },
    'cal-next': function () { state.cal.m++; if (state.cal.m > 12) { state.cal.m = 1; state.cal.y++; } renderHome(); },
    'cal-today': function () { var t = new Date(); state.cal = { y: t.getFullYear(), m: t.getMonth() + 1 }; state.calIdx = 0; renderHome(); },
    day: function (el) { openDay(el.dataset.d); },
    'add-show': function (el) { openShowForm(null, el.dataset.d); },
    'edit-show': function (el) { openShowForm(el.dataset.id); },
    'del-show': function (el) { delShow(el.dataset.id); },
    'save-show': function (el) { saveShow(el); },
    'date-type': function (el) { setDateType(el.dataset.t); },
    'show-money': function (el) { openShowMoney(el.dataset.id, el.dataset.d); },
    'confirm-show': function (el) { openConfirm(el.dataset.id, el.dataset.d); },
    'save-confirm': function (el) { saveConfirm(el); },
    'save-cancel': function (el) { saveCancel(el); },
    'cx-reason': function (el) {
      var t = $('#cx-note'), r = el.dataset.r;
      t.value = t.value.trim() ? (t.value.indexOf(r) >= 0 ? t.value : t.value.trim() + '. ' + r) : r;
      el.classList.add('on'); t.focus();
    },
    'cancel-show': function (el) { cancelShow(el.dataset.id, el.dataset.d); },
    'reset-show': function (el) {
      var id = el.dataset.id || ($('#cf-id') && $('#cf-id').value), d = el.dataset.d || ($('#cf-d') && $('#cf-d').value);
      if (confirm('Đặt lại show này về "chờ xác nhận"? Tiền sẽ chưa được tính cho tới khi bạn xác nhận lại.')) setStatus(id, d, null, 'Đã đặt lại, show đang chờ xác nhận');
    },
    'save-show-money': function (el) { saveShowMoney(el); },
    ics: function (el) { openIcs(el.dataset.id, el.dataset.d); },
    'show-tab': function (el) { state.showTab = el.dataset.t; renderShows(); },
    'show-filter': function (el) { state.showFilter = el.dataset.f; renderShows(); },
    'add-bau': function () { openBau(); },
    'edit-bau': function (el) { openBau(el.dataset.id); },
    'del-bau': function (el) { delBau(el.dataset.id); },
    'save-bau': function (el) { saveBau(el); },
    'money-prev': function () { state.moneyDate = C.addDays(state.moneyDate, -1); renderMoney(); },
    'money-next': function () { state.moneyDate = C.addDays(state.moneyDate, 1); renderMoney(); },
    'money-today': function () { state.moneyDate = todayISO(); renderMoney(); },
    'add-entry': function (el) { openEntry(null, el.dataset.cat, el.dataset.d); },
    'edit-entry': function (el) { openEntry(el.dataset.id); },
    'del-entry': function (el) { delEntry(el.dataset.id); },
    'save-entry': function (el) { saveEntry(el); },
    'pick-cat': function (el) {
      var c = el.dataset.cat; $('#ef-cat').value = c;
      $$('[data-act="pick-cat"]').forEach(function (b) { b.classList.toggle('on', b.dataset.cat === c); });
      $('#ef-note-l').textContent = noteLabel(c); $('#ef-note').placeholder = notePh(c);
    },
    'amt-add': function (el) { var i = $('#ef-amount'); i.value = C.dots(num(i.value) + num(el.dataset.v)); },
    'amt-clear': function () { $('#ef-amount').value = ''; },
    'rep-mode': function (el) { state.rep.mode = el.dataset.m; renderReport(); },
    'rep-prev': function () { var r = state.rep; if (r.mode === 'year') r.y--; else { r.m--; if (r.m < 1) { r.m = 12; r.y--; } } renderReport(); },
    'rep-next': function () { var r = state.rep; if (r.mode === 'year') r.y++; else { r.m++; if (r.m > 12) { r.m = 1; r.y++; } } renderReport(); },
    'rep-goto': function (el) { state.rep.mode = 'month'; state.rep.m = +el.dataset.m; renderReport(); window.scrollTo({ top: 0, behavior: 'smooth' }); },
    'push-on': function (el) { enablePush(el); },
    'push-test': function (el) {
      busy(el, true);
      api('/api/push', { method: 'POST', body: JSON.stringify({ action: 'test' }) }).then(function (j) { toast('Đã gửi tới ' + j.sent + '/' + j.total + ' thiết bị'); })
        .catch(function (e) { toast(e.message, 'err'); }).then(function () { busy(el, false); });
    },
    'push-keys': function (el) { getKeys(el); },
    'check-conn': function (el) { checkConn(el); },
    copy: function (el) {
      var t = el.dataset.text;
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast('Đã sao chép'); }, function () { prompt('Sao chép đoạn này:', t); });
    },
    'del-year': function (el) { delYear(el); },
    backup: function (el) { backup(el); },
    refresh: function (el) {
      busy(el, true); state.fresh = {};
      ensureYear(new Date().getFullYear()).then(function () { toast('Đã cập nhật'); render(); }, function (e) { toast(e.message, 'err'); busy(el, false); });
    }
  };

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || el.closest('#lock-form')) return;
    var fn = ACT[el.dataset.act];
    if (!fn) return;
    e.preventDefault();
    try { fn(el, e); } catch (err) { console.error(err); toast(err.message || 'Có lỗi xảy ra', 'err'); }
  });
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.classList.contains('amount')) { var n = num(t.value); t.value = n ? C.dots(n) : ''; }
    if (/^cf-(recv|tip|other)$/.test(t.id)) $('#cf-sum').textContent = fmt(num($('#cf-recv').value) + num($('#cf-tip').value) + num($('#cf-other').value));
    if (t.id === 'show-q') { state.showQuery = t.value; fillShowList(); }
    if (t.closest && t.closest('#show-form')) updateShowPreview();
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'sf-bau') { $('#sf-nb').hidden = t.value !== '__new'; }
    if (t.id === 'sf-lm' || t.id === 'sf-ly') { var x = readLunarSel(); fillLunar(x.d, x.m, x.y, x.leap); }
    if (t.closest && t.closest('#show-form')) updateShowPreview();
    if (t.id === 'money-date' && t.value) { state.moneyDate = t.value; renderMoney(); }
    if (t.id === 'ef-date' && t.value) { $('#ef-lunar').textContent = 'Âm lịch: ' + lunarTxt(C.toLunar(t.value)); }
    if (t.id === 'lg-show') { $('#lg-pass').type = t.checked ? 'text' : 'password'; }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('#sheet').hidden) closeSheet();
  });
  var hiddenAt = 0;
  document.addEventListener('submit', function (e) {
    if (e.target.id === 'lock-form') { e.preventDefault(); doLogin($('#lock-form button[type=submit]')); }
  });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { hiddenAt = Date.now(); return; }
    if (logged() && hiddenAt && Date.now() - hiddenAt > 5 * 60000) { hiddenAt = 0; logout(); return; }
    if (document.visibilityState === 'visible' && logged()) {
      state.fresh = {};
      ensureYear(new Date().getFullYear()).then(render, function () { });
    }
  });

  /* ================= Khởi động ================= */
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function () { });
  if (logged()) loadCache();
  render();
  if (logged()) ensureYear(new Date().getFullYear()).then(render, function (e) { toast(e.message, 'err'); });
  setInterval(function () { if (logged()) { renderHeader(); updateBadge(); localNotify(); } }, 60000);
  setTimeout(localNotify, 3000);
})();
