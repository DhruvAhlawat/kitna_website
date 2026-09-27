// Hero category ring. August from the demo ledger, colours from the app.
(function () {
  const data = [
    { name: 'Rent & housing', amount: 32000, color: '#FB923C' },
    { name: 'Shopping', amount: 11091, color: '#C084FC' },
    { name: 'Family support', amount: 10000, color: '#BE4A6A' },
    { name: 'Groceries', amount: 8755, color: '#6B8F71' },
    { name: 'Food & dining', amount: 8141, color: '#FF6B4A' },
    { name: 'Travel', amount: 7790, color: '#0EA5E9' },
    { name: 'Bills & utilities', amount: 3899, color: '#FFC14A' },
    { name: 'Health', amount: 3151, color: '#34D1BF' },
    { name: 'People', amount: 3001, color: '#A8A29E' },
    { name: 'Transport', amount: 2640, color: '#5B8CFF' },
  ];
  const featured = 'Food & dining';

  const svg = document.getElementById('ring');
  if (!svg) return;
  const label = document.getElementById('rc-label');
  const amount = document.getElementById('rc-amount');
  const sub = document.getElementById('rc-sub');
  const NS = 'http://www.w3.org/2000/svg';
  const total = data.reduce((s, d) => s + d.amount, 0);
  const R = 112, W = 46, GAP = 1.4, PULL = 14;
  const inr = (n) => '₹' + n.toLocaleString('en-IN');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const polar = (deg, r) => {
    const a = (deg - 90) * Math.PI / 180;
    return [r * Math.cos(a), r * Math.sin(a)];
  };
  const arc = (a0, a1) => {
    const [x0, y0] = polar(a0, R), [x1, y1] = polar(a1, R);
    return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${R} ${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  };

  let start = 0;
  const slices = data.map((d, i) => {
    const sweep = d.amount / total * 360;
    const a0 = start + GAP / 2, a1 = start + sweep - GAP / 2;
    const mid = start + sweep / 2;
    start += sweep;
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', arc(a0, a1));
    p.setAttribute('class', 'slice');
    p.setAttribute('stroke', d.color);
    p.setAttribute('stroke-width', W);
    p.setAttribute('pathLength', '100');
    p.setAttribute('tabindex', '0');
    p.setAttribute('role', 'button');
    const share = Math.round(d.amount / total * 100);
    p.setAttribute('aria-label', `${d.name}, ${inr(d.amount)}, ${share} percent of spend`);
    const [dx, dy] = polar(mid, PULL);
    const s = { el: p, d, share, dx, dy };
    const on = () => activate(s);
    p.addEventListener('mouseenter', on);
    p.addEventListener('focus', on);
    p.addEventListener('click', on);
    svg.appendChild(p);
    if (!reduce) {
      p.style.strokeDasharray = '0 100';
      p.style.transition = 'none';
      setTimeout(() => {
        p.style.transition = 'stroke-dasharray 700ms cubic-bezier(.3,.7,.2,1), transform 260ms cubic-bezier(.2,.8,.2,1), opacity 200ms';
        p.style.strokeDasharray = '100 0';
      }, 120 + i * 70);
    }
    return s;
  });

  function pull(s, out) {
    s.el.style.transform = out ? `translate(${s.dx.toFixed(2)}px, ${s.dy.toFixed(2)}px)` : '';
  }

  function activate(s) {
    slices.forEach((o) => { o.el.classList.toggle('active', o === s); pull(o, o === s); });
    svg.classList.add('has-active');
    label.textContent = s.d.name;
    amount.textContent = inr(s.d.amount);
    sub.textContent = `${s.share}% of spend`;
  }

  function rest() {
    svg.classList.remove('has-active');
    slices.forEach((o) => { o.el.classList.remove('active'); pull(o, o.d.name === featured); });
    label.textContent = 'August';
    amount.textContent = inr(total);
    sub.textContent = 'spent';
  }

  svg.addEventListener('mouseleave', rest);
  svg.addEventListener('focusout', (e) => { if (!svg.contains(e.relatedTarget)) rest(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') rest(); });
  setTimeout(rest, reduce ? 0 : 120 + data.length * 70 + 500);
})();
