const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { exec, spawn } = require('child_process');

function safeSend(window, channel, ...args) {
  if (window && !window.isDestroyed() && window.webContents && !window.webContents.isDestroyed()) {
    window.webContents.send(channel, ...args);
  }
}

const sendStatus = (window, text) => safeSend(window, 'splash-status', text);
const sendProgress = (window, downloaded, total, speed) => safeSend(window, 'splash-progress', downloaded, total, speed);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(text) {
  try {
    fs.appendFileSync(path.join(app.getPath('userData'), 'splash.log'), `[${new Date().toISOString()}] ${text}\n`);
  } catch {}
}

function checkInternet() {
  return new Promise(resolve => {
    const req = https.request(
      {
        hostname: 'russcord.ru',
        method: 'HEAD',
        timeout: 3000,
      },
      () => resolve(true)
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function waitForInternet(window, timeout = 60000) {
  sendStatus(window, 'Проверка подключения...');
  const start = Date.now();
  await sleep(1000);
  while (Date.now() - start < timeout) {
    const connected = await checkInternet();
    if (connected) return;
    const elapsedSec = Math.floor((Date.now() - start) / 1000);
    sendStatus(window, `Проверка подключения... ${elapsedSec} с`);
    await sleep(1000);
  }
  sendStatus(window, 'Нет подключения к интернету');
  log('Нет подключения к интернету за 60 секунд');
}

function formatBytes(bytes) {
  const units = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ', 'ПТ'];
  let i = 0;
  let num = bytes;
  while (num >= 1024 && i < units.length - 1) {
    num /= 1024;
    i++;
  }
  return `${num.toFixed(1)} ${units[i]}`;
}

let downloadReq = null;
let downloadCancelled = false;

function downloadUpdate(window, url) {
  return new Promise((resolve, reject) => {
    let downloaded = 0;
    let total = 0;
    let lastTime = Date.now();
    let lastDownloaded = 0;
    downloadCancelled = false;

    downloadReq = https.get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP Status ${res.statusCode}`));
        return;
      }
      total = parseInt(res.headers['content-length'] || '0', 10);
      const filePath = path.join(app.getPath('userData'), 'update.tmp');
      const fileStream = fs.createWriteStream(filePath);

      res.on('data', chunk => {
        if (downloadCancelled) {
          downloadReq.destroy();
          fileStream.close();
          try { fs.unlinkSync(filePath); } catch {}
          reject(new Error('Загрузка отменена пользователем'));
          return;
        }

        downloaded += chunk.length;

        const now = Date.now();
        let speed = 0;
        if (now > lastTime) {
          speed = (downloaded - lastDownloaded) / ((now - lastTime) / 1000);
          lastTime = now;
          lastDownloaded = downloaded;
        }
        sendProgress(window, downloaded, total, speed);

        sendStatus(window, `Скачано ${formatBytes(downloaded)} из ${formatBytes(total)} (${formatBytes(speed)}/с)`);
      });

      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close(() => {
          downloadReq = null;
          resolve(filePath);
        });
      });
      fileStream.on('error', err => reject(err));
    });

    downloadReq.on('error', err => reject(err));
  });
}

function cancelDownload() {
  if (!downloadCancelled) {
    downloadCancelled = true;
    if (downloadReq) {
      downloadReq.destroy();
      downloadReq = null;
    }
  }
}

function installUpdate(filePath, window) {
  sendStatus(window, 'Начинается установка обновления...');
  if (process.platform === 'darwin') {
    const installer = spawn('hdiutil', ['attach', filePath]);
    installer.stdout.on('data', data => {});
    installer.stderr.on('data', data => {});
    installer.on('close', code => {
      if (code === 0) {
        sendStatus(window, 'Обновление установлено. Пожалуйста, вручную перенесите приложение из образа.');
        log('DMG смонтирован, пользователь должен завершить установку вручную');
        app.quit();
      } else {
        sendStatus(window, 'Ошибка монтирования DMG');
        log('Ошибка монтирования DMG');
      }
    });
  } else if (process.platform === 'win32') {
    exec(`start "" "${filePath}"`, (error) => {
      if (error) {
        sendStatus(window, 'Ошибка запуска установщика');
        log(`Ошибка запуска установщика: ${error.message}`);
      } else {
        sendStatus(window, 'Установщик запущен');
        log('Установщик запущен');
        app.quit();
      }
    });
  } else {
    const extractPath = path.join(app.getPath('userData'), 'update_extracted');
    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath);
    }
    const unzip = spawn('unzip', ['-o', filePath, '-d', extractPath]);
    unzip.stdout.on('data', data => {});
    unzip.stderr.on('data', data => {});
    unzip.on('close', code => {
      if (code === 0) {
        sendStatus(window, 'Обновление распаковано. Пожалуйста, обновите приложение вручную.');
        log('ZIP распакован, пользователь должен обновить вручную');
        app.quit();
      } else {
        sendStatus(window, 'Ошибка распаковки обновления');
        log('Ошибка распаковки ZIP');
      }
    });
  }
}

async function checkForUpdates(window) {
  sendStatus(window, 'Проверка обновления...');
  let assetName;
  if (process.platform === 'darwin') {
    assetName = 'Ruscord.dmg';
  } else {
    assetName = 'Ruscord.zip';
  }
  const updateUrl = `https://github.com/dvytvs/Ruscord-linux-version/releases/latest/download/${assetName}`;

  try {
    const filePath = await downloadUpdate(window, updateUrl);
    sendStatus(window, 'Обновление загружено. Установка...');
    log('Обновление загружено успешно');
    installUpdate(filePath, window);
  } catch (err) {
    sendStatus(window, `Ошибка загрузки: ${err.message}`);
    log(`Ошибка загрузки: ${err.message}`);
  }
}

async function showSplash() {
  const splash = new BrowserWindow({
    width: 300,
    height: 400,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    backgroundColor: '#121212',
    icon: path.join(__dirname, '../Images/iconnobg.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'splash-preload.js'),
    },
  });

  splash.loadFile(path.join(__dirname, '../html/splash.html'));

  ipcMain.once('cancel-download', () => {
    cancelDownload();
  });

  await waitForInternet(splash);
  await checkForUpdates(splash);
  sendStatus(splash, 'Запуск...');

  return splash;
}

if (process.argv.includes('--check-update')) {
  app.whenReady().then(async () => {
    const win = new BrowserWindow({ show: false });
    await checkForUpdates(win);
    app.quit();
  });
}

module.exports = { showSplash };
