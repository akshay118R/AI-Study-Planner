import fs from 'fs';
import path from 'path';
import { screen } from 'electron';

export function createWindowStateManager(userDataPath, defaultBounds = { width: 1280, height: 820 }) {
  const stateFilePath = path.join(userDataPath, 'career-tracker-window-state.json');

  let state = {
    ...defaultBounds,
    x: undefined,
    y: undefined,
    isMaximized: false
  };

  try {
    if (fs.existsSync(stateFilePath)) {
      const data = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
      if (typeof data.width === 'number' && typeof data.height === 'number') {
        state = { ...state, ...data };
      }
    }
  } catch (err) {
    console.warn('[Career Tracker] Could not load saved window state, using defaults:', err.message);
  }

  // Validate state against currently connected screens
  function isVisibleOnAnyScreen(bounds) {
    if (typeof bounds.x !== 'number' || typeof bounds.y !== 'number') return false;
    const displays = screen.getAllDisplays();
    return displays.some(display => {
      const { x, y, width, height } = display.bounds;
      return (
        bounds.x >= x - 50 &&
        bounds.y >= y - 50 &&
        bounds.x + 100 <= x + width &&
        bounds.y + 100 <= y + height
      );
    });
  }

  const validPlacement = isVisibleOnAnyScreen(state);
  const initialX = validPlacement ? state.x : undefined;
  const initialY = validPlacement ? state.y : undefined;

  let saveTimeout = null;

  function save(win) {
    if (!win || win.isDestroyed()) return;

    try {
      const isMaximized = win.isMaximized();
      if (!isMaximized && !win.isMinimized()) {
        const bounds = win.getBounds();
        state.x = bounds.x;
        state.y = bounds.y;
        state.width = bounds.width;
        state.height = bounds.height;
      }
      state.isMaximized = isMaximized;

      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        try {
          fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2), 'utf8');
        } catch (err) {
          console.warn('[Career Tracker] Failed to save window state:', err.message);
        }
      }, 300);
    } catch (err) {
      console.warn('[Career Tracker] Error updating state:', err.message);
    }
  }

  function track(win) {
    win.on('resize', () => save(win));
    win.on('move', () => save(win));
    win.on('close', () => save(win));
  }

  return {
    bounds: {
      width: Math.max(960, state.width || defaultBounds.width),
      height: Math.max(600, state.height || defaultBounds.height),
      x: initialX,
      y: initialY
    },
    isMaximized: Boolean(state.isMaximized),
    track
  };
}
