import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM 환경에서 __dirname 정의하기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // Vite로 빌드된 React 앱이 정상 작동하려면 아래 설정이 안전합니다.
      nodeIntegration: false, 
      contextIsolation: true,
    },
  });

  // 경로 확인: 빌드된 dist 폴더 안의 index.html을 로드
  win.loadFile(path.join(__dirname, 'dist/index.html'));

  // 에러 확인을 위해 개발자 도구를 자동으로 엽니다. (성공 후 삭제)
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});