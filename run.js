// run.js - Execute SEM Electron
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Servir arquivos estáticos
app.use(express.static('src/renderer'));
app.use(express.json());

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/renderer/index.html'));
});

// API para pesagem (simulada)
app.post('/api/pesagem', (req, res) => {
    const { peso, unidade } = req.body;
    console.log(`Peso recebido: ${peso} ${unidade}`);
    res.json({ status: 'success', peso_recebido: peso });
});

app.listen(port, () => {
    console.log(`Aplicação rodando em http://localhost:${port}`);
    console.log('Modo web ativado (sem Electron)');
});