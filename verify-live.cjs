const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1600,height:900} });
  const errs=[];
  p.on('pageerror', e=>errs.push('PAGEERROR '+e.message));
  p.on('console', m=>{ if(m.type()==='error' && !/WebSocket/.test(m.text())) errs.push(m.text().slice(0,140)); });
  await p.goto('https://axiom-robotics-liard.vercel.app/', { waitUntil:'networkidle', timeout:60000 });
  await p.waitForTimeout(9000);
  const st = await p.evaluate(()=>({ canvas: !!document.querySelector('.scene-layer canvas'), hotspots: document.querySelectorAll('.hotspot').length, marquees: document.querySelectorAll('.marquee').length, hbox: document.querySelectorAll('.hbox').length, progress: window.__axiomProgress }));
  await p.screenshot({ path:'/home/user/shots/live-hero.png' });
  console.log('state', JSON.stringify(st));
  console.log('ERRORS:', errs.length?errs:'none');
  await b.close();
})();
