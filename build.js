const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Construindo aplicação...');

// Criar diretório de distribuição se não existir
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Instalar dependências
console.log('Instalando dependências...');
execSync('npm install', { stdio: 'inherit' });

// Construir aplicação
console.log('Empacotando aplicação...');
try {
    execSync('npx electron-builder --win', { stdio: 'inherit' });
    console.log('Build completo! O executável está na pasta dist/');
} catch (error) {
    console.error('Erro durante o build:', error.message);
    console.log('Tentando construir com permissões elevadas...');
    
    // Tentar com permissões elevadas no Windows
    if (process.platform === 'win32') {
        try {
            execSync('npm run dist:win', { stdio: 'inherit', shell: 'powershell.exe' });
            console.log('Build completo! O executável está na pasta dist/');
        } catch (error2) {
            console.error('Erro persistente durante o build:', error2.message);
        }
    }
}