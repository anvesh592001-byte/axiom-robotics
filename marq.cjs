// Park each ribbon at several vertical positions so it actually crosses the
// machine; one of these is bound to show the occlusion.
const { chromium } = require('playwright');
(async () => {
  const mode = process.argv[2] || 'desktop';
  const vp = mode === 'mobile' ? { width: 390, height: 844 } : { width: 1600, height: 900 };
  const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] });
  const page = await b.newPage({ viewport: vp });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type()==='error' && !/Failed to load resource|WebSocket/.test(m.text())) errs.push(m.text()); });
  await page.goto('http://localhost:5173/', { waitUntil:'networkidle' });
  await page.waitForTimeout(7000);
  const n = await page.evaluate(() => document.querySelectorAll('.marquee').length);
  for (let i = 0; i < n; i++) {
    for (const frac of [0.25, 0.6]) {
      const y = await page.evaluate(([i, frac]) => {
        const el = document.querySelectorAll('.marquee')[i];
        const r = el.getBoundingClientRect();
        return Math.round(r.top + window.scrollY + r.height / 2 - window.innerHeight * frac);
      }, [i, frac]);
      await page.evaluate((y) => window.scrollTo(0, Math.max(0, y)), y);
      await page.waitForTimeout(9000);
      await page.screenshot({ path:`/home/user/shots/${mode}-marq${i}-${frac}.png` });
    }
  }
  console.log('ERRORS:', errs.length ? errs : 'none');
  await b.close();
})();
