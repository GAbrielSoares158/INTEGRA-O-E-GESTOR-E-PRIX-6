// start.js
const { spawn } = require('child_process');
const electron = require('electron');

const electronProcess = spawn(electron, ['.'], { 
    stdio: 'inherit',
    windowsHide: false
});

electronProcess.on('close', () => {
    process.exit(0);
});