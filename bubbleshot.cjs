const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1600,height:900} });
  const errs=[];
  p.on('pageerror', e=>errs.push('PAGEERROR '+e.message));
  p.on('console', m=>{ if(m.type()==='error' && !/WebSocket|Download the React/.test(m.text())) errs.push(m.text().slice(0,160)); });
  await p.goto('http://localhost:5173/', { waitUntil:'networkidle' });
  await p.waitForTimeout(9000);
  await p.screenshot({ path:'shots/bub-hero.png' });
  await p.evaluate(()=>window.scrollTo(0, document.documentElement.scrollHeight*0.42));
  await p.waitForTimeout(8000);
  await p.screenshot({ path:'shots/bub-mid.png' });
  console.log('ERRORS:', errs.length?errs:'none');
  await b.close();
})();
