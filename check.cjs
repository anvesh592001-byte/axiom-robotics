const { chromium } = require('playwright');
(async () => {
  const base = process.argv[2] || 'http://localhost:5173/';
  const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(base, { waitUntil: 'networkidle' });
  await p.waitForTimeout(7000);

  const scrollTo = async (sel, frac=0) => {
    const y = await p.evaluate(([sel, frac]) => {
      const el = document.querySelector(sel);
      const top = el.getBoundingClientRect().top + window.scrollY;
      const h = el.getBoundingClientRect().height;
      return Math.round(top + Math.max(0, h - window.innerHeight) * frac);
    }, [sel, frac]);
    await p.evaluate(y => window.scrollTo(0, y), y);
    await p.waitForTimeout(4500);
  };
  const probe = async () => p.evaluate(() => {
    const read = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { opacity: +cs.opacity, transform: cs.transform };
    };
    return {
      hbox: read('.hbox'),
      bookImg: read('.type-band__mark img'),
      introTitle: read('.intro__title'),
      specsRow: read('.specs__row'),
      finaleSub: read('.finale__sub'),
    };
  });

  // 1. before visiting the lower sections: everything should be at its "from" state
  const before = await probe();

  // 2. scroll down through the band + intro + specs so the reveals play
  await scrollTo('.type-band', 0);
  await scrollTo('#section-intro', 0.5);
  await scrollTo('#section-specs', 0.3);
  const played = await probe();

  // 3. scroll back to the top: the reversible tweens must return to "from"
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(4500);
  const reversed = await probe();

  console.log(JSON.stringify({ before, played, reversed }, null, 1));
  console.log('ERRORS:', errs.length ? errs : 'none');
  await b.close();
})();
