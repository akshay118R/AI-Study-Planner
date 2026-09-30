import { app, BrowserWindow } from 'electron';

app.disableHardwareAcceleration();

async function testTimer() {
  await app.whenReady();
  const win = new BrowserWindow({ width: 390, height: 844, show: false });
  await win.loadURL('http://localhost:3000/#dashboard');
  await new Promise(r => setTimeout(r, 600));

  const result = await win.webContents.executeJavaScript(`
    (async () => {
      const btnStart = document.getElementById('btn-focus-start');
      const btnPause = document.getElementById('btn-focus-pause');
      const btnStop = document.getElementById('btn-focus-stop');
      const display = document.getElementById('dash-timer-display');
      const status = document.getElementById('dash-timer-status');

      const initialTime = display ? display.textContent.trim() : null;
      
      // Start
      btnStart.click();
      const statusRunning = status ? status.textContent.trim() : null;

      // Wait 1.2 seconds
      await new Promise(r => setTimeout(r, 1200));
      const runningTime = display ? display.textContent.trim() : null;

      // Pause
      btnPause.click();
      const statusPaused = status ? status.textContent.trim() : null;

      // Wait 0.5s while paused
      await new Promise(r => setTimeout(r, 500));
      const pausedTime = display ? display.textContent.trim() : null;

      // Resume
      btnStart.click();
      await new Promise(r => setTimeout(r, 600));

      // Stop
      btnStop.click();
      const statusStopped = status ? status.textContent.trim() : null;

      return {
        initialTime,
        statusRunning,
        runningTime,
        statusPaused,
        pausedTime,
        statusStopped
      };
    })()
  `);

  console.log('Focus timer test results:');
  console.log(JSON.stringify(result, null, 2));
  app.quit();
}

testTimer().catch(e => { console.error(e); app.quit(); });
