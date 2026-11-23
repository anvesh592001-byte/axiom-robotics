const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] });
  const p = await b.newPage({ viewport:{width:1600,height:900} });
  p.on('console', m => { if (m.type()==='error') console.log('ERR', m.text().slice(0,120)); });
  await p.goto('http://localhost:5173/', { waitUntil:'networkidle' });
  await p.waitForTimeout(7000);
  await p.evaluate(() => { const el=document.querySelector('#section-specs'); window.scrollTo(0, el.getBoundingClientRect().top+window.scrollY + (el.getBoundingClientRect().height-window.innerHeight)*0.5); });
  await p.waitForTimeout(5000);
  const info = await p.evaluate(() => {
    const scene = document.querySelector('.scene-layer');
    const cs = getComputedStyle(scene);
    return { layerZ: cs.zIndex, layerPos: cs.position,
             parentChain: (() => { let n = scene, o=[]; while(n && n.tagName!=='HTML'){ o.push([n.tagName+'.'+(n.className||''), getComputedStyle(n).zIndex, getComputedStyle(n).position, getComputedStyle(n).isolation]); n=n.parentElement;} return o; })() };
  });
  console.log(JSON.stringify(info));
  // count canvases + hide grid helper via bridge if exposed
  const n = await p.evaluate(() => document.querySelectorAll('canvas').length);
  console.log('canvases:', n);
  await b.close();
})();
