document.addEventListener('DOMContentLoaded', async function() {
    // Configuração das abas
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Ativar botão
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Mostrar conteúdo
            tabContents.forEach(content => content.classList.add('hidden'));
            document.getElementById(`${tabName}-tab`).classList.remove('hidden');
        });
    });
    
    // Carregar configuração salva
    let config = await window.electronAPI.getConfig();
    if (config) {
        if (config.balanca) {
            document.getElementById('porta-serial').value = config.balanca.port || '';
            document.getElementById('baud-rate').value = config.balanca.baudRate || 9600;
        }
        
        if (config.egestor) {
            document.getElementById('egestor-url').value = config.egestor.baseURL || '';
            document.getElementById('api-key').value = config.egestor.apiKey || '';
            document.getElementById('client-id').value = config.egestor.clientId || '';
        }
    }
    
    // Atualizar lista de portas seriais
    document.getElementById('refresh-ports').addEventListener('click', atualizarPortasSeriais);
    
    // Testar balança
    document.getElementById('test-balanca').addEventListener('click', async () => {
        const config = getConfigFromForm();
        const statusElement = document.getElementById('balanca-status');
        
        try {
            showStatus(statusElement, 'Testando conexão com a balança...', 'loading');
            
            const result = await window.electronAPI.testBalanca(config);
            
            if (result.success) {
                showStatus(statusElement, `Conexão bem-sucedida! Peso: ${result.peso.peso} ${result.peso.unidade}`, 'success');
                updateConnectionStatus(true);
            } else {
                showStatus(statusElement, `Erro: ${result.error}`, 'error');
                updateConnectionStatus(false);
            }
        } catch (error) {
            showStatus(statusElement, `Erro: ${error.message}`, 'error');
            updateConnectionStatus(false);
        }
    });
    
    // Testar e-Gestor
    document.getElementById('test-egestor').addEventListener('click', async () => {
        const config = getConfigFromForm();
        const statusElement = document.getElementById('egestor-status');
        
        try {
            showStatus(statusElement, 'Testando conexão com e-Gestor...', 'loading');
            
            const result = await window.electronAPI.testEGestor(config.egestor);
            
            if (result.success) {
                showStatus(statusElement, 'Conexão com e-Gestor estabelecida com sucesso!', 'success');
            } else {
                showStatus(statusElement, `Erro: ${result.error}`, 'error');
            }
        } catch (error) {
            showStatus(statusElement, `Erro: ${error.message}`, 'error');
        }
    });
    
    // Salvar configuração
    document.getElementById('save-config').addEventListener('click', async () => {
        const config = getConfigFromForm();
        const statusElement = document.getElementById('save-status');
        
        try {
            showStatus(statusElement, 'Salvando configuração...', 'loading');
            
            await window.electronAPI.saveConfig(config);
            
            showStatus(statusElement, 'Configuração salva com sucesso!', 'success');
            
            // Esconder a mensagem após 3 segundos
            setTimeout(() => {
                hideStatus(statusElement);
            }, 3000);
        } catch (error) {
            showStatus(statusElement, `Erro ao salvar: ${error.message}`, 'error');
        }
    });
    
    // Operação - Ler peso
    document.getElementById('ler-peso').addEventListener('click', async () => {
        const config = getConfigFromForm();
        
        try {
            const result = await window.electronAPI.testBalanca(config);
            
            if (result.success) {
                document.getElementById('peso-valor').textContent = result.peso.peso.toFixed(2);
                document.getElementById('peso-unidade').textContent = result.peso.unidade;
                addToLog(`Peso lido: ${result.peso.peso} ${result.peso.unidade}`, 'success');
                updateConnectionStatus(true);
            } else {
                addToLog(`Erro ao ler peso: ${result.error}`, 'error');
                updateConnectionStatus(false);
            }
        } catch (error) {
            addToLog(`Erro: ${error.message}`, 'error');
            updateConnectionStatus(false);
        }
    });
    
    // Operação - Sincronizar
    document.getElementById('sincronizar').addEventListener('click', async () => {
        const codigoProduto = document.getElementById('codigo-produto').value;
        if (!codigoProduto) {
            alert('Por favor, informe o código do produto');
            return;
        }
        
        const config = getConfigFromForm();
        
        try {
            addToLog(`Iniciando sincronização para o produto ${codigoProduto}...`, 'info');
            
            const result = await window.electronAPI.sincronizarPeso(config, codigoProduto);
            
            if (result.success) {
                addToLog(`Peso sincronizado: ${result.peso.peso} ${result.peso.unidade} para o produto ${codigoProduto}`, 'success');
                alert('Peso sincronizado com sucesso!');
            } else {
                addToLog(`Erro na sincronização: ${result.error}`, 'error');
                alert(`Erro na sincronização: ${result.error}`);
            }
        } catch (error) {
            addToLog(`Erro: ${error.message}`, 'error');
            alert(`Erro: ${error.message}`);
        }
    });
    
    // Função para obter configuração do formulário
    function getConfigFromForm() {
        return {
            balanca: {
                port: document.getElementById('porta-serial').value,
                baudRate: parseInt(document.getElementById('baud-rate').value)
            },
            egestor: {
                baseURL: document.getElementById('egestor-url').value,
                apiKey: document.getElementById('api-key').value,
                clientId: document.getElementById('client-id').value
            }
        };
    }
    
    // Função para adicionar ao log
    function addToLog(message, type = 'info') {
        const log = document.getElementById('operation-log');
        const timestamp = new Date().toLocaleTimeString();
        const typeClass = type === 'error' ? 'log-error' : (type === 'success' ? 'log-success' : '');
        
        log.innerHTML += `<div><span class="log-time">[${timestamp}]</span> <span class="${typeClass}">${message}</span></div>`;
        log.scrollTop = log.scrollHeight;
    }
    
    // Função para mostrar status
    function showStatus(element, message, type) {
        element.textContent = message;
        element.className = 'status-message';
        element.classList.add(type);
        element.style.display = 'block';
    }
    
    // Função para esconder status
    function hideStatus(element) {
        element.style.display = 'none';
    }
    
    // Função para atualizar status de conexão
    function updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connection-status');
        if (connected) {
            statusElement.textContent = 'Conectado';
            statusElement.classList.add('connected');
        } else {
            statusElement.textContent = 'Desconectado';
            statusElement.classList.remove('connected');
        }
    }
    
    // Função para atualizar portas seriais (simulada)
    async function atualizarPortasSeriais() {
        const portaSelect = document.getElementById('porta-serial');
        const currentValue = portaSelect.value;
        
        // Limpar select
        portaSelect.innerHTML = '<option value="">Selecione a porta...</option>';
        
        try {
            // Em uma implementação real, você usaria serialport.list()
            // Esta é uma simulação para demonstração
            const portasSimuladas = [
                'COM1', 'COM2', 'COM3', 'COM4', 
                '/dev/ttyUSB0', '/dev/ttyUSB1', '/dev/ttyACM0'
            ];
            
            portasSimuladas.forEach(porta => {
                const option = document.createElement('option');
                option.value = porta;
                option.textContent = porta;
                portaSelect.appendChild(option);
            });
            
            // Restaurar valor selecionado se ainda existir
            if (currentValue && portasSimuladas.includes(currentValue)) {
                portaSelect.value = currentValue;
            }
            
            addToLog('Lista de portas seriais atualizada', 'success');
        } catch (error) {
            addToLog(`Erro ao atualizar portas: ${error.message}`, 'error');
        }
    }
    
    // Inicializar
    await atualizarPortasSeriais();
    updateStatusBar();
    
    // Atualizar barra de status periodicamente
    setInterval(updateStatusBar, 1000);
    
    function updateStatusBar() {
        const now = new Date();
        document.getElementById('last-update').textContent = 
            `Última atualização: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    }
});