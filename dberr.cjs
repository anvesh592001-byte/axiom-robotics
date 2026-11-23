const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1400,height:800} });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message.split('\n')[0]));
  p.on('console', m => { if (m.type()==='error') console.log('CONSOLE:', m.text().slice(0,200)); });
  await p.goto('http://localhost:5173/', { waitUntil:'networkidle' });
  await p.waitForTimeout(8000);
  await b.close();
})();
