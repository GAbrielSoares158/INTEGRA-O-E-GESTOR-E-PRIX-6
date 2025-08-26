const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

class WebhookServer {
  constructor(port = 3000, securityToken = '') {
    this.app = express();
    this.port = port;
    this.securityToken = securityToken;
    this.server = null;
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(bodyParser.json({ verify: this.verifySignature.bind(this) }));
  }

  // Verificar assinatura do webhook (security token)
  verifySignature(req, res, buf) {
    if (!this.securityToken) return; // Skip verification if no token
    
    const signature = req.headers['x-egestor-signature'];
    if (!signature) {
      throw new Error('Assinatura não encontrada');
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.securityToken)
      .update(buf)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new Error('Assinatura inválida');
    }
  }

  setupRoutes() {
    // Rota principal para webhooks do e-Gestor
    this.app.post('/webhooks', (req, res) => {
      try {
        const event = req.body;
        console.log('Webhook recebido do e-Gestor:', event);

        // Processar diferentes tipos de eventos
        this.processWebhookEvent(event);

        res.status(200).json({ 
          status: 'success', 
          message: 'Webhook recebido com sucesso' 
        });
      } catch (error) {
        console.error('Erro ao processar webhook:', error);
        res.status(400).json({ error: error.message });
      }
    });

    // Rota para recebimento de pesagens
    this.app.post('/api/pesagem', (req, res) => {
      try {
        const { peso, unidade } = req.body;
        console.log(`Pesagem recebida: ${peso} ${unidade}`);

        // Aqui você pode processar a pesagem (salvar em BD, etc.)
        res.status(200).json({
          status: "sucesso",
          mensagem: "Pesagem recebida!",
          peso_recebido: peso
        });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok', service: 'webhook-server' });
    });
  }

  processWebhookEvent(event) {
    const { type, data, entity } = event;

    console.log(`Evento recebido: ${type}`, data);

    switch (type) {
      case 'product.created':
      case 'product.updated':
        this.handleProductEvent(data);
        break;

      case 'sale.created':
      case 'sale.updated':
        this.handleSaleEvent(data);
        break;

      case 'nfc_e.created':
        this.handleNfceEvent(data);
        break;

      case 'contact.created':
      case 'contact.updated':
        this.handleContactEvent(data);
        break;

      default:
        console.log('Tipo de evento não tratado:', type);
    }
  }

  handleProductEvent(productData) {
    console.log('📦 Produto criado/atualizado:', productData);
    // Aqui você pode sincronizar com sua base de dados
  }

  handleSaleEvent(saleData) {
    console.log('💰 Venda realizada:', saleData);
    // Aqui você pode processar a venda
  }

  handleNfceEvent(nfceData) {
    console.log('🧾 NFC-e emitida:', nfceData);
    // Aqui você pode processar a NFC-e
  }

  handleContactEvent(contactData) {
    console.log('👤 Contato criado/atualizado:', contactData);
    // Aqui você pode processar contatos
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      console.log(`🚀 Servidor de webhooks rodando na porta ${this.port}`);
      console.log(`📝 Endpoint: http://localhost:${this.port}/webhooks`);
      console.log(`⚖️  Pesagens: http://localhost:${this.port}/api/pesagem`);
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('🛑 Servidor de webhooks parado');
    }
  }
}

module.exports = WebhookServer;