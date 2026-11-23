const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args:['--no-sandbox'] });
  const p = await b.newPage();
  p.on('requestfailed', r => console.log('FAIL', r.url().slice(0,110), r.failure()?.errorText));
  await p.goto('http://localhost:5173/', { waitUntil:'networkidle' }).catch(e=>console.log('nav',e.message));
  await p.waitForTimeout(4000);
  await b.close();
})();
