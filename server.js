const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// O endpoint que vai receber o peso da balança
app.post('/api/pesagem', (req, res) => {
  const { peso, unidade } = req.body;

  if (peso === undefined || unidade === undefined) {
    return res.status(400).json({ error: "Dados 'peso' ou 'unidade' ausentes" });
  }

  // Aqui você processaria os dados
  console.log(`PESO RECEBIDO: ${peso} ${unidade}`);

  res.status(200).json({
    status: "sucesso",
    mensagem: "Pesagem recebida!",
    peso_recebido: peso
  });
});

// Endpoint adicional para listar produtos (simulado)
app.get('/api/produtos', (req, res) => {
  const { codigo } = req.query;
  
  // Simula resposta de produtos
  res.json([{
    id: 123,
    codigo: codigo,
    nome: `Produto ${codigo}`,
    preco: 29.99
  }]);
});

app.listen(port, () => {
  console.log(`API de teste rodando em http://localhost:${port}`);
  console.log(`Endpoint: POST http://localhost:${port}/api/pesagem`);
});