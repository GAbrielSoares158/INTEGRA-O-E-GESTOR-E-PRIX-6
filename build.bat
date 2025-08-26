@echo off
cd /d "C:\Users\Gabriel Soares DP\egestor-prix6-bridge"
echo.
echo 🛠️  INICIANDO BUILD DO APLICATIVO...
echo.

REM Verificar se package.json existe
if not exist package.json (
    echo ❌ ERRO: package.json não encontrado!
    pause
    exit
)

REM Adicionar script build se não existir
findstr "\"build\"" package.json >nul
if errorlevel 1 (
    echo 📝 Adicionando script build ao package.json...
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.scripts = pkg.scripts || {};
    pkg.scripts.build = 'electron-builder --win';
    pkg.scripts.dist = 'electron-builder --win --publish=never';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    console.log('✅ Scripts adicionados!');
    "
)

REM Instalar electron-builder se necessário
if not exist node_modules\electron-builder (
    echo 📦 Instalando electron-builder...
    npm install electron-builder --save-dev
)

REM Executar build
echo 🚀 Executando build...
npx electron-builder --win

echo.
echo ✅ BUILD CONCLUÍDO!
echo 📦 O executável está na pasta: dist\
echo.
pause