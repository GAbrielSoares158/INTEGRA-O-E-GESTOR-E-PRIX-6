// fix-package.js
const fs = require('fs');

const packageContent = {
  "name": "egestor-prix6-bridge",
  "version": "1.0.0",
  "description": "Integração entre Balança Prix 6 e sistema e-Gestor",
  "main": "src/main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder --win",
    "dist": "electron-builder --win --publish=never"
  },
  "build": {
    "appId": "com.egestor.prix6.bridge",
    "productName": "Integrador e-Gestor - Prix 6",
    "directories": {
      "output": "dist"
    },
    "files": [
      "src/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    "win": {
      "target": "nsis",
      "icon": "icons/icon.ico"
    }
  },
  "dependencies": {
    "electron": "^27.0.0",
    "serialport": "^10.5.0",
    "axios": "^1.5.0",
    "electron-store": "^8.1.0"
  },
  "devDependencies": {
    "electron-builder": "^24.6.4"
  }
};

fs.writeFileSync('package.json', JSON.stringify(packageContent, null, 2));
console.log('✅ package.json corrigido com sucesso!');