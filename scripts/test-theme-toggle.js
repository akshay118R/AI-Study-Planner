import { app, BrowserWindow } from 'electron';

app.disableHardwareAcceleration();

async function testThemeToggle() {
  await app.whenReady();
  const win = new BrowserWindow({ width: 390, height: 844, show: false });
  await win.loadURL('http://localhost:3000/#dashboard');
  await new Promise(r => setTimeout(r, 600));

  const result = await win.webContents.executeJavaScript(`
    (() => {
      const btnTheme = document.getElementById('btn-theme-toggle');
      const initialTheme = document.body.getAttribute('data-theme');
      
      // Click theme button to toggle
      btnTheme.click();
      const themeAfterFirstClick = document.body.getAttribute('data-theme');

      // Check colors and contrast
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      const textMain = window.getComputedStyle(document.body).color;
      
      // Click again
      btnTheme.click();
      const themeAfterSecondClick = document.body.getAttribute('data-theme');
      const bodyBgReverted = window.getComputedStyle(document.body).backgroundColor;

      return {
        initialTheme,
        themeAfterFirstClick,
        bodyBg,
        textMain,
        themeAfterSecondClick,
        bodyBgReverted
      };
    })()
  `);

  console.log('Theme toggle test result:');
  console.log(JSON.stringify(result, null, 2));
  app.quit();
}

testThemeToggle().catch(e => { console.error(e); app.quit(); });
