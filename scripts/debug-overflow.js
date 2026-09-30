import { app, BrowserWindow } from 'electron';

app.disableHardwareAcceleration();

async function check() {
  await app.whenReady();
  const win = new BrowserWindow({ width: 370, height: 800, show: false });
  await win.loadURL('http://localhost:3000/#month');
  await new Promise(r => setTimeout(r, 800));

  const report = await win.webContents.executeJavaScript(`
    (() => {
      const items = [];
      const vw = window.innerWidth;
      document.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.right > vw + 1) {
          // Find topmost or relevant elements
          items.push({
            tag: el.tagName,
            id: el.id,
            className: typeof el.className === 'string' ? el.className.slice(0, 40) : '',
            right: Math.round(r.right),
            width: Math.round(r.width),
            text: (el.innerText || '').slice(0, 40).replace(/\\n/g, ' ')
          });
        }
      });
      return items;
    })()
  `);

  console.log('Overflow elements in #month on 370px screen:');
  console.log(JSON.stringify(report, null, 2));
  app.quit();
}

check().catch(e => { console.error(e); app.quit(); });
