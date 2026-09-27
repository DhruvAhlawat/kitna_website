// Live recreations of four Kitna flows. Each scene is a pure function of its own
// clock t (seconds): it loops, pauses when scrolled away or when Pause is pressed,
// and shows its end state when the visitor prefers reduced motion.
// Wording copies the app (add_transaction_page, rule_editor_page, import sheet).
(function () {
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  const ph = (t, a, b) => ease(clamp((t - a) / (b - a)));
  const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const typed = (s, t, a, b) => s.slice(0, Math.round(s.length * clamp((t - a) / (b - a))));

  // Material icon paths (Apache 2.0), the same glyphs the app uses.
  const P = {
    menu: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
    search: 'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
    back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
    car: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
    food: 'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z',
    grocery: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42a.25.25 0 0 1-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z',
    coffee: 'M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 5h-2V5h2v3zM4 19h16v2H4z',
    other: 'M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    upload: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11z',
    check: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    receipt: 'M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z',
    chevron: 'M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
    drop: 'M7 10l5 5 5-5z',
    wallet: 'M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14c1.1 0 2 .9 2 2v1h-9a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
    arrow: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
    health: 'M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z',
    movie: 'M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z',
    bolt: 'M7 2v11h3v9l7-12h-4l4-8z',
  };
  const ic = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[name]}"/></svg>`;
  const CAT = {
    Transport: { c: '#5B8CFF', i: 'car' },
    'Food & dining': { c: '#FF6B4A', i: 'food' },
    Groceries: { c: '#6B8F71', i: 'grocery' },
    Other: { c: '#8A857C', i: 'other' },
    Health: { c: '#34D1BF', i: 'health' },
    Entertainment: { c: '#FF7AB6', i: 'movie' },
    'Bills & utilities': { c: '#FFC14A', i: 'bolt' },
  };
  const swatch = (cat) => `<span class="sw" style="--c:${CAT[cat].c}">${ic(CAT[cat].i)}</span>`;
  const row = (title, cat, sub, amt, extra = '') =>
    `<div class="row ${extra}">${swatch(cat)}<div class="row-main"><b>${title}</b><small>${sub}</small></div><span class="amt">−${inr(amt)}</span></div>`;
  const bar = (title) => `<div class="bar"><span class="bar-l">${ic('menu')}${ic('search')}</span><span class="bar-r"><em>LEDGER</em><strong>${title}</strong></span></div>`;
  const pageBar = (title) => `<div class="bar page">${ic('back')}<span><em>LEDGER</em><strong>${title}</strong></span></div>`;
  const tabs = `<div class="tabs"><span class="on">This month</span><span>Last month</span><span>90 days</span><span>All time</span></div>`;

  // ------------------------------------------------------------ 1. Notifications
  const NOTES = [
    { app: 'HDFC Bank', body: 'Rs.450 spent on HDFC Bank Card 4321 at UBER INDIA on 27-09-26.', title: 'Uber India', cat: 'Transport', amt: 450, time: '9:41 PM' },
    { app: 'Google Pay', body: 'You paid ₹386 to Swiggy. UPI Ref 526912345678.', title: 'Swiggy', cat: 'Food & dining', amt: 386, time: '9:52 PM' },
    { app: 'PhonePe', body: 'Paid ₹812 to Blinkit from HDFC Bank a/c 4321.', title: 'Blinkit', cat: 'Groceries', amt: 812, time: '10:05 PM' },
  ];
  function notify(el) {
    const base = 71344;
    el.innerHTML = `
      ${bar('Kitna')}${tabs}
      <div class="hero-sum"><small>Spent, this month</small><b class="js-total">${inr(base)}</b></div>
      <div class="day">Today</div>
      <div class="list js-list">
        ${NOTES.map((n, i) => row(n.title, n.cat, `${n.cat} · via xx4321 · ${n.time}`, n.amt, `new js-new${i}`)).reverse().join('')}
        ${row('Blue Tokai Coffee', 'Food & dining', 'Food & dining · via xx4321 · 9:12 AM', 640)}
        ${row('Rapido', 'Transport', 'Transport · via xx4321 · 8:40 AM', 94)}
        <div class="day">Yesterday</div>
        ${row('Zepto', 'Groceries', 'Groceries · via xx4321 · 7:18 PM', 1120)}
        ${row('Zomato', 'Food & dining', 'Food & dining · via xx4321 · 1:05 PM', 452)}
        ${row('Airtel Broadband', 'Bills & utilities', 'Bills & utilities · via xx4321 · 11:20 AM', 1179)}
        ${row('Uber India', 'Transport', 'Transport · via xx4321 · 9:02 AM', 318)}
        <div class="day">Thu 25 Sep</div>
        ${row('Bigbasket', 'Groceries', 'Groceries · via xx4321 · 8:45 PM', 2140)}
        ${row('Third Wave Coffee', 'Food & dining', 'Food & dining · via xx4321 · 4:10 PM', 310)}
        ${row('Rapido', 'Transport', 'Transport · via xx4321 · 9:15 AM', 88)}
      </div>
      <div class="notif js-notif"><span class="n-app"><i class="n-dot"></i><b class="js-napp"></b><small>now</small></span><p class="js-nbody"></p></div>
      <div class="toast js-toast">Added by Kitna</div>`;
    const q = (s) => el.querySelector(s);
    const total = q('.js-total'), notif = q('.js-notif'), napp = q('.js-napp'), nbody = q('.js-nbody'), toast = q('.js-toast');
    const news = NOTES.map((_, i) => q('.js-new' + i));
    const SEG = 4.2;
    return {
      duration: SEG * NOTES.length + 1.6,
      render(t) {
        let sum = base, showN = -1, nIn = 0, tIn = 0;
        NOTES.forEach((n, i) => {
          const s = i * SEG + 0.6;
          const drop = ph(t, s, s + 0.45) - ph(t, s + 2.0, s + 2.4);
          if (drop > 0) { showN = i; nIn = drop; }
          const added = ph(t, s + 2.2, s + 2.8);
          news[i].style.setProperty('--h', added);
          news[i].classList.toggle('lit', t > s + 2.2 && t < s + 3.9);
          sum += n.amt * ph(t, s + 2.4, s + 3.1);
          tIn = Math.max(tIn, ph(t, s + 2.4, s + 2.7) - ph(t, s + 3.5, s + 3.8));
        });
        if (showN >= 0) { napp.textContent = NOTES[showN].app; nbody.textContent = NOTES[showN].body; }
        notif.style.transform = `translateY(${(-120 + 136 * nIn).toFixed(1)}%)`;
        notif.style.opacity = nIn;
        toast.style.opacity = tIn;
        total.textContent = inr(sum);
      },
    };
  }

  // ------------------------------------------------------------ 2. Statement upload
  function statement(el) {
    el.innerHTML = `
      ${bar('Kitna')}${tabs}
      <div class="empty js-empty">${ic('receipt', 'big')}<b>No transactions yet</b><p>Upload a bank or card statement to see where your money went.</p><span class="pill js-btn">${ic('upload')}Upload statement</span></div>
      <div class="filled js-filled">
        <div class="hero-sum"><small>Spent, this month</small><b>₹72,644</b></div>
        <div class="mini-ring">${ringSvg()}</div>
        <div class="legend"><span><i style="background:#FB923C"></i>Rent &amp; housing 44%</span><span><i style="background:#6B8F71"></i>Groceries 13%</span><span><i style="background:#BE4A6A"></i>Family support 14%</span><span><i style="background:#FF6B4A"></i>Food &amp; dining 7%</span></div>
      </div>
      <div class="file js-file">${ic('upload')}<span>Acct_Statement_4321.pdf</span></div>
      <div class="sheet js-sheet"><i class="grab"></i>
        <b class="js-stitle">Reading statement</b><small class="js-ssub">Acct_Statement_4321.pdf</small>
        <div class="prog"><i class="js-prog"></i></div>
        <div class="s-row">${ic('check', 'ok js-ok')}<span><b>Acct_Statement_4321.pdf</b><small class="js-count">0 added</small></span></div>
        <span class="pill wide js-done">Done</span>
      </div>`;
    const q = (s) => el.querySelector(s);
    const [empty, filled, file, sheet, prog, count, stitle, ssub, ok, done, btn] =
      ['.js-empty', '.js-filled', '.js-file', '.js-sheet', '.js-prog', '.js-count', '.js-stitle', '.js-ssub', '.js-ok', '.js-done', '.js-btn'].map(q);
    return {
      duration: 9.5,
      render(t) {
        btn.classList.toggle('press', t > 0.9 && t < 1.25);
        const f = ph(t, 1.3, 1.9) - ph(t, 2.3, 2.6);
        file.style.opacity = f; file.style.transform = `translate(-50%, ${(30 - 30 * ph(t, 1.3, 1.9)).toFixed(1)}px)`;
        const s = ph(t, 2.4, 2.9) - ph(t, 7.0, 7.4);
        sheet.style.transform = `translateY(${(100 - 100 * s).toFixed(1)}%)`;
        const p = ph(t, 2.9, 5.4);
        prog.style.width = (p * 100).toFixed(1) + '%';
        const n = Math.round(692 * p);
        count.textContent = `${n} added`;
        const fin = t > 5.5;
        stitle.textContent = fin ? 'Added 692 transactions' : 'Reading statement';
        ssub.textContent = fin ? 'Everything was categorised.' : 'Acct_Statement_4321.pdf';
        ok.style.opacity = fin ? 1 : 0.25;
        done.classList.toggle('press', t > 6.7 && t < 7.0);
        const show = ph(t, 7.1, 7.6);
        empty.style.opacity = 1 - show; filled.style.opacity = show;
        filled.style.setProperty('--draw', ph(t, 7.2, 8.4));
      },
    };
  }
  function ringSvg() {
    const d = [[44, '#FB923C'], [14, '#BE4A6A'], [13, '#6B8F71'], [10, '#C084FC'], [7, '#FF6B4A'], [6, '#0EA5E9'], [6, '#5B8CFF']];
    let a = 0;
    return `<svg viewBox="-60 -60 120 120">${d.map(([p, c]) => {
      const s = `<circle r="44" pathLength="100" stroke="${c}" stroke-dasharray="${p - 0.8} ${100 - p + 0.8}" stroke-dashoffset="${-a}" transform="rotate(-90)"/>`;
      a += p; return s;
    }).join('')}</svg>`;
  }

  // ------------------------------------------------------------ 3. Cash entry
  function cash(el) {
    el.innerHTML = `
      <div class="js-form">
      ${pageBar('Add transaction')}
      <p class="hint">Use this for money that never shows up in statements or SMS, mostly cash. Swipes and UPI come in by themselves.</p>
      <div class="seg"><span class="on">Payment</span><span>Income</span></div>
      <label class="fld js-f0"><small>Amount</small><span>₹ <b class="js-amt"></b><i class="caret"></i></span></label>
      <label class="fld js-f1"><small>To who</small><span><b class="js-to"></b><i class="caret"></i></span></label>
      <label class="fld js-f2"><small>Description</small><span><b class="js-desc"></b><i class="caret"></i></span></label>
      <label class="fld"><small>Account</small><span>${ic('wallet')}Cash</span></label>
      <label class="fld js-f3"><small>Category</small><span class="js-cat">${swatch('Other')}Other</span>${ic('chevron', 'end')}</label>
      <label class="fld"><small>Date</small><span>Sun 27 Sep 2026</span>${ic('chevron', 'end')}</label>
      <label class="fld js-f4"><small>Approximate time</small><span class="js-time">N/A</span>${ic('drop', 'end')}</label>
      <span class="pill wide js-save">Add payment</span>
      </div>
      <div class="js-after after">
        ${bar('Kitna')}${tabs}
        <div class="hero-sum"><small>Spent, this month</small><b>₹72,894</b></div>
        <div class="day">Today</div>
        ${row('Taxi', 'Transport', 'Transport · Cash · 6 PM', 250, 'lit')}
        ${row('Blue Tokai Coffee', 'Food & dining', 'Food & dining · via xx4321 · 9:12 AM', 640)}
        ${row('Rapido', 'Transport', 'Transport · via xx4321 · 8:40 AM', 94)}
        <div class="day">Yesterday</div>
        ${row('Zepto', 'Groceries', 'Groceries · via xx4321 · 7:18 PM', 1120)}
        ${row('Zomato', 'Food & dining', 'Food & dining · via xx4321 · 1:05 PM', 452)}
        ${row('Chai Point', 'Food & dining', 'Food & dining · Cash · 11 AM', 60)}
        ${row('Uber India', 'Transport', 'Transport · via xx4321 · 9:02 AM', 318)}
        ${row('Blinkit', 'Groceries', 'Groceries · via xx4321 · 8:30 AM', 540)}
      </div>`;
    const q = (s) => el.querySelector(s);
    const [amt, to, desc, cat, time, save, form, after] = ['.js-amt', '.js-to', '.js-desc', '.js-cat', '.js-time', '.js-save', '.js-form', '.js-after'].map(q);
    const f = [0, 1, 2, 3, 4].map((i) => q('.js-f' + i));
    return {
      duration: 9.5,
      render(t) {
        amt.textContent = typed('250', t, 0.5, 1.0);
        to.textContent = typed('Taxi', t, 1.4, 1.9);
        desc.textContent = typed('Airport drop', t, 2.3, 3.2);
        const focus = t < 1.2 ? 0 : t < 2.1 ? 1 : t < 3.5 ? 2 : t < 4.4 ? 3 : t < 5.4 ? 4 : -1;
        f.forEach((x, i) => x.classList.toggle('focus', i === focus));
        cat.innerHTML = t > 4.0 ? `${swatch('Transport')}Transport` : `${swatch('Other')}Other`;
        time.textContent = t > 5.0 ? '6 PM to 7 PM' : 'N/A';
        save.classList.toggle('press', t > 5.8 && t < 6.2);
        const a = ph(t, 6.3, 6.8);
        form.style.opacity = 1 - a; after.style.opacity = a;
        after.style.transform = `translateX(${(24 - 24 * a).toFixed(1)}px)`;
      },
    };
  }

  // ------------------------------------------------------------ 4. Rule
  const MOVES = [['Swiggy', 'Other', 386], ['Zomato', 'Other', 452], ['Swiggy Instamart', 'Groceries', 612], ['Zomato', 'Other', 298]];
  function rule(el) {
    el.innerHTML = `
      ${pageBar('Add a rule')}
      <p class="summary js-sum"></p>
      <div class="lbl">Match in</div>
      <div class="chips"><span class="chip on">✓ Merchant</span><span class="chip">Narration</span></div>
      <div class="lbl">Condition</div>
      <div class="chips"><span class="chip">Equals</span><span class="chip">Begins with</span><span class="chip on">✓ Contains</span></div>
      <label class="fld focus"><small>Text</small><span><b class="js-pat"></b><i class="caret"></i></span></label>
      <p class="hint small">Use / between alternatives (swiggy/zomato).</p>
      <div class="lbl">File as</div>
      <label class="fld js-file"><span class="js-cat">${swatch('Other')}Other</span>${ic('chevron', 'end')}</label>
      <span class="pill wide js-save">Save rule</span>
      <div class="sheet tall js-sheet"><i class="grab"></i>
        <b>Review changes</b>
        <small>${MOVES.length} transactions would move to Food &amp; dining. Total moving: ₹1,748.</small>
        ${MOVES.map(([m, from, a]) => `<div class="mv">${swatch(from)}<span><b>${m}</b><small>${from} ${ic('arrow', 'tiny')} Food &amp; dining</small></span><span class="amt">−${inr(a)}</span></div>`).join('')}
        <span class="pill wide js-done">Done</span>
      </div>`;
    const q = (s) => el.querySelector(s);
    const [pat, cat, save, sheet, sum, file, done] = ['.js-pat', '.js-cat', '.js-save', '.js-sheet', '.js-sum', '.js-file', '.js-done'].map(q);
    return {
      duration: 10,
      render(t) {
        const p = typed('swiggy/zomato', t, 0.5, 2.0);
        pat.textContent = p;
        const food = t > 3.0;
        cat.innerHTML = food ? `${swatch('Food & dining')}Food &amp; dining` : `${swatch('Other')}Other`;
        file.classList.toggle('focus', t > 2.4 && t < 3.4);
        sum.textContent = `If merchant contains "${p || '...'}", file as ${food ? 'Food & dining' : 'Other'}.`;
        save.classList.toggle('press', t > 3.9 && t < 4.3);
        const s = ph(t, 4.3, 4.8) - ph(t, 9.0, 9.4);
        sheet.style.transform = `translateY(${(100 - 100 * s).toFixed(1)}%)`;
        done.classList.toggle('press', t > 8.4 && t < 8.8);
      },
    };
  }

  // ------------------------------------------------------------ 5. Automatic classification
  const RAW = [
    ['UPI-SWIGGY-swiggy@icici-ICIC0DC0099-512000442507', 'Swiggy', 'Food & dining', 609],
    ['UPI-UBER INDIA SYSTEMS P-uber.rides@hdfcbank-5120286', 'Uber India', 'Transport', 272],
    ['UPI-BLINKIT-blinkit.payu@hdfcbank-HDFC0MERUPI-51203', 'Blinkit', 'Groceries', 1210],
    ['POS 416021XXXXXX4321 BLUE TOKAI COFFEE ROA', 'Blue Tokai Coffee', 'Food & dining', 380],
    ['UPI-RAPIDO-rapido.bike@axisbank-UTIB0000553-512004', 'Rapido', 'Transport', 94],
    ['UPI-ZEPTO MARKETPLACE PVT-zepto@ybl-YESB0PTMUPI-51', 'Zepto', 'Groceries', 745],
    ['UPI-ZOMATO LIMITED-zomato-order@ptybl-HDFC0MERUPI-5', 'Zomato', 'Food & dining', 452],
    ['POS 416021XXXXXX4321 INDIAN OIL PETROL PUMP', 'Indian Oil', 'Transport', 1850],
    ['UPI-TATA 1MG HEALTHCARE-1mg@hdfcbank-HDFC0MERUPI-512', 'Tata 1mg', 'Health', 640],
    ['UPI-BOOKMYSHOW-bookmyshow@icici-ICIC0DC0099-5120091', 'BookMyShow', 'Entertainment', 760],
  ];
  function classify(el) {
    el.innerHTML = `
      ${pageBar('Upload history')}
      <div class="cls-head"><small>Acct_Statement_4321.pdf</small><b class="js-n">0 of 692 sorted</b><div class="prog"><i class="js-prog"></i></div></div>
      <div class="cls-list">${RAW.map(([raw, name, cat, amt], i) => `
        <div class="cls js-c${i}">
          <div class="cls-raw"><span class="sw grey">${ic('receipt')}</span><code>${raw}</code></div>
          <div class="cls-done">${row(name, cat, `${cat} · via xx4321`, amt)}</div>
        </div>`).join('')}
      </div>
      <p class="cls-foot js-foot">Everything was categorised.</p>`;
    const q = (s) => el.querySelector(s);
    const items = RAW.map((_, i) => q('.js-c' + i));
    const [n, prog, foot] = ['.js-n', '.js-prog', '.js-foot'].map(q);
    return {
      duration: 9,
      render(t) {
        items.forEach((x, i) => {
          const s = 0.6 + i * 0.55;
          x.style.setProperty('--k', ph(t, s, s + 0.5));
          x.classList.toggle('lit', t > s + 0.2 && t < s + 1.1);
        });
        const p = ph(t, 0.6, 6.2);
        prog.style.width = (p * 100).toFixed(1) + '%';
        n.textContent = `${Math.round(692 * p)} of 692 sorted`;
        foot.style.opacity = ph(t, 6.3, 6.7);
      },
    };
  }

  const SCENES = { notify, statement, cash, rule, classify };

  // ------------------------------------------------------------ runner
  document.querySelectorAll('[data-demo]').forEach((box) => {
    const make = SCENES[box.dataset.demo];
    if (!make) return;
    const screen = document.createElement('div');
    screen.className = 'app';
    box.appendChild(screen);
    const scene = make(screen);
    const fit = () => screen.style.setProperty('--s', box.clientWidth / 412);
    new ResizeObserver(fit).observe(box);
    fit();

    const btn = box.parentElement.parentElement.querySelector('.demo-toggle');
    let t = 0, last = 0, visible = false, paused = REDUCE;
    const frame = (now) => {
      if (!visible || paused) { last = 0; return; }
      if (last) t += (now - last) / 1000;
      last = now;
      if (t > scene.duration) t = 0;
      const fade = Math.min(ph(t, 0, 0.35), 1 - ph(t, scene.duration - 0.35, scene.duration));
      screen.style.opacity = 0.15 + 0.85 * fade;
      scene.render(t);
      requestAnimationFrame(frame);
    };
    const start = () => { if (visible && !paused) requestAnimationFrame(frame); };
    const endState = () => { screen.style.opacity = 1; scene.render(scene.duration - 0.6); };

    if (REDUCE) endState(); else scene.render(0);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { threshold: 0.25 }).observe(box);
    if (btn) {
      btn.textContent = paused ? 'Play' : 'Pause';
      btn.addEventListener('click', () => {
        paused = !paused;
        btn.textContent = paused ? 'Play' : 'Pause';
        btn.setAttribute('aria-pressed', String(paused));
        start();
      });
    }
  });
})();
