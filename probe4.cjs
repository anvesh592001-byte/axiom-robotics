const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1600,height:900} });
  await p.goto('http://localhost:5173/', { waitUntil:'networkidle' });
  await p.waitForTimeout(7000);
  await p.evaluate(() => { const el=document.querySelector('#section-specs'); window.scrollTo(0, el.getBoundingClientRect().top+window.scrollY + (el.getBoundingClientRect().height-window.innerHeight)*0.5); });
  await p.waitForTimeout(5000);
  const out = await p.evaluate(() => {
    const t = document.querySelector('.specs__table');
    const r = t.getBoundingClientRect();
    const stack = document.elementsFromPoint(r.x + r.width/2, r.y + 60).map(e => `${e.tagName}.${e.className||''}`);
    const app = getComputedStyle(document.querySelector('.app'));
    const cv = document.querySelector('.scene-layer canvas');
    const ccv = getComputedStyle(cv);
    const scene = document.querySelector('.scene-layer');
    return { stack, appIsolation: app.isolation, appZ: app.zIndex, appPos: app.position,
      sceneZ: scene.zIndex, sceneStyle: scene.getAttribute('style'),
      canvasFilter: ccv.filter, canvasWillChange: ccv.willChange, canvasTransform: ccv.transform,
      canvasMix: ccv.mixBlendMode, canvasOpacity: ccv.opacity };
  });
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
