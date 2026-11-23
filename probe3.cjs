const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1600,height:900} });
  await p.goto('http://localhost:5173/', { waitUntil:'networkidle' });
  await p.waitForTimeout(7000);
  await p.evaluate(() => { const el=document.querySelector('#section-specs'); window.scrollTo(0, el.getBoundingClientRect().top+window.scrollY + (el.getBoundingClientRect().height-window.innerHeight)*0.5); });
  await p.waitForTimeout(6000);
  const clip = {x:1066,y:429,width:470,height:150};

  // A: push the card to a huge z-index
  await p.evaluate(() => { document.querySelector('.specs__table').style.zIndex='9999'; });
  await p.waitForTimeout(1200);
  await p.screenshot({ path:'/home/user/shots/t-a-zindex.png', clip });

  // B: promote the card to its own composited layer
  await p.evaluate(() => { const t=document.querySelector('.specs__table'); t.style.zIndex=''; t.style.transform='translateZ(0)'; });
  await p.waitForTimeout(1200);
  await p.screenshot({ path:'/home/user/shots/t-b-layer.png', clip });

  // C: canvas itself pushed down
  await p.evaluate(() => { const t=document.querySelector('.specs__table'); t.style.transform=''; document.querySelector('.scene-layer').style.zIndex='-1'; });
  await p.waitForTimeout(1200);
  await p.screenshot({ path:'/home/user/shots/t-c-canvasdown.png', clip });
  await b.close();
})();
