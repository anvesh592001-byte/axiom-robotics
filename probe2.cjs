const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1600,height:900} });
  await p.goto('http://localhost:5173/', { waitUntil:'networkidle' });
  await p.waitForTimeout(7000);
  await p.evaluate(() => { const el=document.querySelector('#section-specs'); window.scrollTo(0, el.getBoundingClientRect().top+window.scrollY + (el.getBoundingClientRect().height-window.innerHeight)*0.5); });
  await p.waitForTimeout(6000);
  await p.screenshot({ path:'/home/user/shots/probe-with-canvas.png', clip:{x:1066,y:429,width:470,height:200} });
  await p.evaluate(() => { document.querySelector('.scene-layer').style.display='none'; });
  await p.waitForTimeout(1500);
  await p.screenshot({ path:'/home/user/shots/probe-no-canvas.png', clip:{x:1066,y:429,width:470,height:200} });
  await b.close();
})();
