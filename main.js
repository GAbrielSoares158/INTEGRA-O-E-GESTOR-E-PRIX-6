const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { SerialPort } = require('serialport');
const axios = require('axios');
const Store = require('electron-store');

// Configuração do store
const store = new Store();

// Configuração da balança
let balancaConfig = store.get('balancaConfig') || {
  porta: 'COM1',
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none'
};

// Configuração do e-Gestor
let egestorConfig = store.get('egestorConfig') || {
  urlBase: '',
  chaveAcesso: ''
};

let mainWindow;
let port;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../assets/icon.ico') || undefined
  });

  mainWindow.loadFile('src/index.html');
  //mainWindow.webContents.openDevTools(); // Descomente para debug
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (port && port.isOpen) {
      port.close();
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('get-balanca-config', () => {
  return balancaConfig;
});

ipcMain.handle('save-balanca-config', (event, config) => {
  balancaConfig = config;
  store.set('balancaConfig', config);
  return true;
});

ipcMain.handle('get-egestor-config', () => {
  return egestorConfig;
});

ipcMain.handle('save-egestor-config', (event, config) => {
  egestorConfig = config;
  store.set('egestorConfig', config);
  return true;
});

ipcMain.handle('connect-balanca', async () => {
  try {
    if (port && port.isOpen) {
      await port.close();
    }

    port = new SerialPort({
      path: balancaConfig.porta,
      baudRate: balancaConfig.baudRate,
      dataBits: balancaConfig.dataBits,
      stopBits: balancaConfig.stopBits,
      parity: balancaConfig.parity
    });

    return { success: true, message: 'Balança conectada com sucesso!' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('disconnect-balanca', async () => {
  try {
    if (port && port.isOpen) {
      await port.close();
    }
    return { success: true, message: 'Balança desconectada!' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('send-peso', async (event, peso) => {
  try {
    if (!egestorConfig.urlBase || !egestorConfig.chaveAcesso) {
      throw new Error('Configuração do e-Gestor não definida');
    }

    const response = await axios.post(egestorConfig.urlBase, {
      chaveAcesso: egestorConfig.chaveAcesso,
      peso: peso,
      timestamp: new Date().toISOString()
    });

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Eventos da porta serial
if (port) {
  port.on('data', (data) => {
    try {
      const peso = data.toString().trim();
      if (mainWindow) {
        mainWindow.webContents.send('peso-recebido', peso);
      }
    } catch (error) {
      console.error('Erro ao processar dados da balança:', error);
    }
  });

  port.on('error', (error) => {
    console.error('Erro na porta serial:', error);
    if (mainWindow) {
      mainWindow.webContents.send('balanca-error', error.message);
    }
  });
}