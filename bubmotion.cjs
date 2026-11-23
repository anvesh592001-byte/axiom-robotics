const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1600,height:900} });
  await p.goto('http://localhost:5173/', { waitUntil:'networkidle' });
  await p.waitForTimeout(9000);
  await p.screenshot({ path:'shots/m1.png', clip:{x:1000,y:60,width:600,height:500} });
  await p.waitForTimeout(2500);
  await p.screenshot({ path:'shots/m2.png', clip:{x:1000,y:60,width:600,height:500} });
  await b.close();
})();
