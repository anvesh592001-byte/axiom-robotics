const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://localhost:4180/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(9000);
  const state = await p.evaluate(() => ({
    loaderGone: !!document.querySelector('.loader--gone'),
    canvas: !!document.querySelector('.scene-layer canvas'),
    hotspots: document.querySelectorAll('.hotspot').length,
    marquees: document.querySelectorAll('.marquee').length,
    hboxes: document.querySelectorAll('.hbox').length,
    heroTitle: document.querySelector('.hero__title')?.innerText.replace(/\n/g, ' '),
    docWidthOverflow: document.documentElement.scrollWidth - window.innerWidth,
  }));
  const seq = [];
  for (const f of [0, 0.25, 0.5, 0.75, 1]) {
    await p.evaluate((f) => window.scrollTo(0, (document.body.scrollHeight - innerHeight) * f), f);
    await p.waitForTimeout(2600);
    seq.push(await p.evaluate(() => window.__axiomProgress?.toFixed(2)));
  }
  await p.evaluate(() => window.scrollTo(0,0));
  await p.waitForTimeout(3000);
  await p.screenshot({ path: '/home/user/shots/prod-hero.png' });
  console.log(JSON.stringify({ state, seq, errs: errs.length ? errs : 'none' }, null, 1));
  await b.close();
})();
