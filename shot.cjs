const { chromium } = require('playwright');
const targets = JSON.parse(process.argv[3] || '{"hero":["#section-hero",0],"intro":["#section-intro",0.4],"explore":["#section-explore",0.35],"specs":["#section-specs",0.45],"band":[".type-band",0],"finale":["#section-final",0.15]}');
(async () => {
  const mode = process.argv[2] || 'desktop';
  const vp = mode === 'mobile' ? { width: 390, height: 844 } : { width: 1600, height: 900 };
  const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] });
  const page = await b.newPage({ viewport: vp });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type()==='error' && !/localhost|Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await page.goto('http://localhost:5173/', { waitUntil:'networkidle' });
  await page.waitForTimeout(7000);
  for (const [name, [sel, frac]] of Object.entries(targets)) {
    const y = await page.evaluate(([sel, frac]) => {
      const el = document.querySelector(sel);
      const top = el.getBoundingClientRect().top + window.scrollY;
      const h = el.getBoundingClientRect().height;
      return Math.round(top + Math.max(0, h - window.innerHeight) * frac);
    }, [sel, frac]);
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(8000);
    await page.screenshot({ path:`/home/user/shots/${mode}-${name}.png` });
  }
  console.log('ERRORS:', errs.length ? errs : 'none');
  await b.close();
})();
