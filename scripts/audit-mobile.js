import { app, BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';

// Force offscreen rendering for headless execution
app.disableHardwareAcceleration();

const SCREEN_SIZES = [
  { name: 'small-phone', width: 360, height: 780 },
  { name: 'normal-phone', width: 390, height: 844 },
  { name: 'large-phone', width: 412, height: 915 },
  { name: 'tall-phone-20-9', width: 384, height: 854 }
];

const ROUTES = ['dashboard', 'month', 'week', 'today', 'settings'];

async function runAudit() {
  await app.whenReady();

  const results = [];

  for (const screen of SCREEN_SIZES) {
    const win = new BrowserWindow({
      width: screen.width,
      height: screen.height,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    win.setSize(screen.width, screen.height);

    for (const route of ROUTES) {
      const url = `http://localhost:3000/#${route}`;
      await win.loadURL(url);
      await new Promise(r => setTimeout(r, 600));

      const evaluation = await win.webContents.executeJavaScript(`
        (() => {
          const docEl = document.documentElement;
          const body = document.body;
          const innerW = window.innerWidth;
          const scrollW = Math.max(docEl.scrollWidth, body.scrollWidth);
          const hasHorizontalOverflow = scrollW > innerW;

          // Find elements exceeding viewport width
          const overflowingElements = [];
          document.querySelectorAll('*').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.right > innerW + 1) {
              overflowingElements.push({
                tag: el.tagName,
                id: el.id,
                className: (el.className || '').toString().slice(0, 50),
                right: Math.round(rect.right),
                width: Math.round(rect.width)
              });
            }
          });

          // Check header elements
          const header = document.querySelector('.app-header');
          let headerInfo = null;
          if (header) {
            const hRect = header.getBoundingClientRect();
            headerInfo = {
              width: Math.round(hRect.width),
              height: Math.round(hRect.height),
              childrenCount: header.children.length
            };
          }

          // Check bottom nav
          const bottomNav = document.querySelector('.mobile-bottom-nav');
          let bottomNavInfo = null;
          if (bottomNav) {
            const bRect = bottomNav.getBoundingClientRect();
            const btns = Array.from(bottomNav.querySelectorAll('.mobile-nav-btn')).map(b => b.textContent.trim());
            bottomNavInfo = {
              visible: window.getComputedStyle(bottomNav).display !== 'none',
              height: Math.round(bRect.height),
              buttons: btns
            };
          }

          // Check live clock
          const clock = document.querySelector('#dashboard-live-clock-time') || document.querySelector('#today-live-datetime');
          const clockText = clock ? clock.textContent.trim() : null;

          return {
            route: '${route}',
            innerW,
            scrollW,
            hasHorizontalOverflow,
            overflowingCount: overflowingElements.length,
            overflowingElements: overflowingElements.slice(0, 5),
            headerInfo,
            bottomNavInfo,
            clockText
          };
        })()
      `);

      results.push({
        screen: screen.name,
        width: screen.width,
        height: screen.height,
        ...evaluation
      });

      // Take a screenshot of the normal phone dashboard
      if (screen.name === 'normal-phone' && (route === 'dashboard' || route === 'today')) {
        const image = await win.webContents.capturePage();
        fs.writeFileSync(`mobile-screenshot-${route}.png`, image.toPNG());
      }
    }

    win.close();
  }

  console.log(JSON.stringify(results, null, 2));
  app.quit();
}

runAudit().catch(err => {
  console.error('Audit error:', err);
  app.quit();
});
