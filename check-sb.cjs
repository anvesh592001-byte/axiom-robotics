const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1600,height:900} });
  await p.goto('http://localhost:5173/', { waitUntil:'networkidle' });
  await p.waitForTimeout(6000);
  const r = await p.evaluate(() => ({
    scrollbarWidth: window.innerWidth - document.documentElement.clientWidth,
    canScroll: document.documentElement.scrollHeight > window.innerHeight,
  }));
  const y0 = await p.evaluate(() => window.scrollY);
  await p.mouse.wheel(0, 1400); await p.waitForTimeout(2500);
  const y1 = await p.evaluate(() => window.scrollY);
  console.log(JSON.stringify({ ...r, scrolledFrom: y0, scrolledTo: Math.round(y1) }));
  await b.close();
})();
