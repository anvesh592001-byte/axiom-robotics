const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1600,height:900} });
  await p.goto('http://localhost:5173/', { waitUntil:'networkidle' });
  await p.waitForTimeout(7000);
  await p.evaluate(() => { const el=document.querySelector('#section-specs'); window.scrollTo(0, el.getBoundingClientRect().top+window.scrollY + (el.getBoundingClientRect().height-window.innerHeight)*0.5); });
  await p.waitForTimeout(6000);
  const out = await p.evaluate(() => {
    const t = document.querySelector('.specs__table');
    const r = t.getBoundingClientRect();
    const cs = getComputedStyle(t);
    const els = [];
    let n = t;
    while (n && n !== document.documentElement) { const c = getComputedStyle(n); els.push([n.className||n.tagName, c.zIndex, c.position, c.transform, c.filter, c.opacity]); n = n.parentElement; }
    return { z: cs.zIndex, rect: [r.x|0, r.y|0, r.width|0, r.height|0], chain: els,
      hit: document.elementFromPoint(r.x + r.width/2, r.y + 60)?.className,
      canvasZ: getComputedStyle(document.querySelector('.scene-layer')).zIndex };
  });
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
