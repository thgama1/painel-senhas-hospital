/**
 * PAINEL DE CHAMADAS - HOSPITAL VIVER+
 * Desenvolvido por: Thiago Gama Marçal
 * ---------------------------------------------------------
 * CONFIGURAÇÕES GERAIS (Altere aqui para o GitHub)
 */
const CONFIG = {
    API_URL: 'api.php', // Ocultamos o caminho real do servidor se necessário
    CLIMA_URL: 'clima_moeda.php',
    INTERVALO_BUSCA: 2500, // 2.5 segundos
    INTERVALO_CLIMA: 1800000, // 30 minutos
    VELOCIDADE_VOZ: 0.9,
    LIMITE_HISTORICO: 5
};

document.addEventListener('DOMContentLoaded', () => {
    
    // VARIÁVEIS DE ESTADO
    const MENSAGENS_RODAPE = [
        "Seja Bem-Vindo ao Pronto Socorro do Hospital Viver+.",
        "Horário de Visita: 14h às 16h.",
        "Mantenha o silêncio."
    ];
    
    let ultimoIdProcessado = null;
    let estaProcessandoFila = false;
    const filaDeChamadas = [];
    
    // PERSISTÊNCIA: Tenta carregar o histórico salvo no navegador
    let historicoMemoria = JSON.parse(localStorage.getItem('historico_painel')) || [];

    // MAPEAMENTO DE ELEMENTOS
    const el = {
        senha: document.getElementById('senha-atual'),
        local: document.getElementById('consultorio-atual'),
        lista: document.getElementById('lista-anteriores'),
        container: document.getElementById('senha-principal-container'),
        data: document.getElementById('data'),
        hora: document.getElementById('hora'),
        ticker: document.getElementById('ticker-messages'),
        subFooter: document.getElementById('sub-footer')
    };

    /**
     * FORMATAÇÃO E UTILITÁRIOS
     */
    const formatarNome = (nome) => {
        if (!nome) return "";
        const partes = nome.trim().split(/\s+/);
        if (partes.length === 1) return partes[0];
        return `${partes[0]} ${partes[partes.length - 1]}`;
    };

    /**
     * SÍNTESE DE VOZ (Natural)
     */
    function anunciarVoz(dados) {
        let texto = dados.paciente 
            ? `Paciente, ${formatarNome(dados.paciente)}. Dirigir-se ao, ${dados.local}`
            : `Senha, ${dados.senha}. Dirigir-se ao, ${dados.local}`;

        const enunciado = new SpeechSynthesisUtterance(texto);
        enunciado.lang = 'pt-BR';
        enunciado.rate = CONFIG.VELOCIDADE_VOZ;

        enunciado.onend = () => { 
            estaProcessandoFila = false; 
            setTimeout(processarFila, 800); 
        };
        
        enunciado.onerror = () => { 
            estaProcessandoFila = false; 
            processarFila(); 
        };

        window.speechSynthesis.speak(enunciado);
    }

    /**
     * ATUALIZAÇÃO DA INTERFACE (Com Efeito Flash)
     */
    function atualizarInterface(principal, anteriores) {
        // Alerta Visual (Flash)
        if (el.container) {
            el.container.classList.remove('flash-active');
            void el.container.offsetWidth; 
            el.container.classList.add('flash-active');
        }

        // Senha Principal
        el.senha.textContent = principal.paciente ? formatarNome(principal.paciente) : principal.senha;
        el.local.textContent = principal.local;
        el.container.className = `senha-container tipo-${principal.tipo} ${principal.prioridade ? 'prioritaria' : ''}`;

        // Histórico de Chamadas
        if (el.lista) {
            const itensParaExibir = anteriores.slice(0, 3);
            el.lista.innerHTML = itensParaExibir.map(h => {
                const id = h.paciente ? formatarNome(h.paciente) : h.senha;
                return `<li><span class="senha-anterior">${id}</span><span class="consultorio-anterior">${h.local}</span></li>`;
            }).join('');
        }
    }

    function processarFila() {
        if (estaProcessandoFila || filaDeChamadas.length === 0) return;
        estaProcessandoFila = true;
        const dados = filaDeChamadas.shift();
        atualizarInterface(dados, historicoMemoria.slice(1));
        anunciarVoz(dados);
    }

    /**
     * BUSCA DE DADOS (API TASY)
     */
    async function buscarNovasChamadas() {
        try {
            const response = await fetch(`${CONFIG.API_URL}?nocache=${Date.now()}`);
            const data = await response.json();
            const chamadasVindas = data.ultimas_chamadas || [];

            if (chamadasVindas.length === 0) return;

            const maisRecente = chamadasVindas[0];

            if (maisRecente.id !== ultimoIdProcessado) {
                // Atualiza a memória local evitando duplicados
                chamadasVindas.slice().reverse().forEach(nova => {
                    if (!historicoMemoria.find(h => h.id === nova.id)) {
                        historicoMemoria.unshift(nova);
                    }
                });

                // Limita o histórico e salva no navegador (Persistência Meia-Noite)
                historicoMemoria = historicoMemoria.slice(0, CONFIG.LIMITE_HISTORICO);
                localStorage.setItem('historico_painel', JSON.stringify(historicoMemoria));

                if (ultimoIdProcessado !== null) {
                    filaDeChamadas.push(historicoMemoria[0]);
                    processarFila();
                } else {
                    atualizarInterface(historicoMemoria[0], historicoMemoria.slice(1));
                }
                ultimoIdProcessado = maisRecente.id;
            }
        } catch (err) { console.error("Erro na integração:", err); }
    }

    /**
     * COTAÇÕES E CLIMA
     */
    async function atualizarCotacoes() {
        try {
            const response = await fetch(`${CONFIG.CLIMA_URL}?nocache=${Date.now()}`);
            const data = await response.json();
            
            if (el.subFooter && data.dolar) {
                el.subFooter.innerHTML = `
                    <div class="ticker-moedas">
                        <span>🪙 Dólar: ${data.dolar}</span>
                        <span>💶 Euro: ${data.euro}</span>
                        <span>☁️ Volta Redonda: ${data.clima}</span>
                        <span>🪙 Dólar: ${data.dolar}</span>
                        <span>💶 Euro: ${data.euro}</span>
                        <span>☁️ Volta Redonda: ${data.clima}</span>
                    </div>
                `;
            }
        } catch (e) { console.log("Erro no clima."); }
    }

    /**
     * INICIALIZAÇÃO (BOOT)
     */
    function boot() {
        const tick = () => {
            const n = new Date();
            if (el.hora) el.hora.textContent = n.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            if (el.data) el.data.textContent = n.toLocaleDateString('pt-BR', { dateStyle: 'full' });
        };

        setInterval(tick, 1000); 
        tick();

        if (el.ticker) {
            el.ticker.innerHTML = MENSAGENS_RODAPE.map(m => `<span>${m}</span>`).join('');
        }

        atualizarCotacoes();
        setInterval(atualizarCotacoes, CONFIG.INTERVALO_CLIMA);

        buscarNovasChamadas();
        setInterval(buscarNovasChamadas, CONFIG.INTERVALO_BUSCA);
    }

    boot();
});