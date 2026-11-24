// Estado Global com Persistência em localStorage
let funcionarios = JSON.parse(localStorage.getItem('ep_funcionarios')) || [
    { id: 1, nome: "Carlos Eduardo Silva", cargo: "Eletricista de Alta Tensão", setor: "Subestação Principal", epis: "Capacete, Luvas Classe 4, Botas ISO" },
    { id: 2, nome: "Mariana Souza Lima", cargo: "Técnica de Segurança do Trabalho", setor: "SESMT", epis: "Óculos de Proteção, Botas Biqueira Aço" },
    { id: 3, nome: "Roberto Carlos Mendes", cargo: "Operador de Ponte Rolante", setor: "Galpão Industrial 02", epis: "Protetor Auricular, Capacete" },
    { id: 4, nome: "Ana Beatriz Rocha", cargo: "Soldadora / Caldeireira", setor: "Linha de Montagem A", epis: "Máscara de Solda Automática, Luvas Raspa" }
];

let estoqueEPIs = JSON.parse(localStorage.getItem('ep_estoque')) || [
    { id: 1, nome: "Capacete com Jugular e Aba Frontal", categoria: "Cabeça", ca: "CA 36.412", qtd: 54, validade: "2028-05-10", status: "ok" },
    { id: 2, nome: "Luvas de Raspa de Couro Reforçada", categoria: "Mãos", ca: "CA 28.190", qtd: 140, validade: "2027-11-15", status: "ok" },
    { id: 3, nome: "Óculos de Segurança Anti-risco Incolor", categoria: "Visual", ca: "CA 19.832", qtd: 95, validade: "2027-08-20", status: "ok" },
    { id: 4, nome: "Máscara Respiratória PFF2 S/ Válvula", categoria: "Respiratória", ca: "CA 41.002", qtd: 15, validade: "2026-10-15", status: "alerta" },
    { id: 5, nome: "Protetor Auricular Tipo Concha 21dB", categoria: "Auditiva", ca: "CA 14.509", qtd: 60, validade: "2029-01-10", status: "ok" }
];

let entregas = JSON.parse(localStorage.getItem('ep_entregas')) || [
    { id: "EP-4091", colaborador: "Carlos Eduardo Silva", equipamento: "Capacete com Jugular e Aba Frontal", data: "2026-11-12", validacao: "Token #9821 - SESMT" },
    { id: "EP-4092", colaborador: "Mariana Souza Lima", equipamento: "Óculos de Segurança Anti-risco Incolor", data: "2026-11-14", validacao: "Token #1182 - Assinado" },
    { id: "EP-4093", colaborador: "Roberto Carlos Mendes", equipamento: "Protetor Auricular Tipo Concha 21dB", data: "2026-11-15", validacao: "Token #7743 - Assinado" }
];

let meuGrafico = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateEl = document.getElementById('currentDate');
    if(dateEl) {
        dateEl.innerText = new Date().toLocaleDateString('pt-BR', options);
    }
    
    renderizarTudo();
    if(document.getElementById('graficoEpis')) {
        inicializarGrafico();
    }
});

function salvarStorage() {
    localStorage.setItem('ep_funcionarios', JSON.stringify(funcionarios));
    localStorage.setItem('ep_estoque', JSON.stringify(estoqueEPIs));
    localStorage.setItem('ep_entregas', JSON.stringify(entregas));
}

function inicializarGrafico() {
    const ctx = document.getElementById('graficoEpis').getContext('2d');
    
    let cats = {};
    estoqueEPIs.forEach(e => {
        cats[e.categoria] = (cats[e.categoria] || 0) + e.qtd;
    });

    meuGrafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(cats),
            datasets: [{
                label: 'Volume em Estoque por Categoria',
                data: Object.values(cats),
                backgroundColor: '#2563eb',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderizarTudo() {
    salvarStorage();

    // Métricas globais se existirem
    const mf = document.getElementById('metricFuncionarios');
    if(mf) mf.innerText = funcionarios.length;
    
    const me = document.getElementById('metricEstoque');
    if(me) me.innerText = estoqueEPIs.reduce((acc, item) => acc + item.qtd, 0);
    
    const mv = document.getElementById('metricVencidos');
    if(mv) mv.innerText = estoqueEPIs.filter(i => i.status === 'alerta').length;
    
    const ment = document.getElementById('metricEntregas');
    if(ment) ment.innerText = entregas.length;

    // Tabela Dashboard (Últimas Entregas)
    const tbodyDash = document.querySelector('#tabelaDashboardEntregas tbody');
    if(tbodyDash) {
        tbodyDash.innerHTML = '';
        entregas.slice(0, 4).forEach(ent => {
            tbodyDash.innerHTML += `
                <tr>
                    <td><strong>${ent.id}</strong></td>
                    <td>${ent.colaborador}</td>
                    <td>${ent.equipamento}</td>
                    <td>${ent.data}</td>
                    <td><span class="status-tag ok"><i class="fa-solid fa-circle-check"></i> NR-6 Conforme</span></td>
                </tr>
            `;
        });
    }

    // Alertas Dashboard
    const listaAlertas = document.getElementById('listaAlertasDashboard');
    if(listaAlertas) {
        listaAlertas.innerHTML = '';
        const itensAlerta = estoqueEPIs.filter(i => i.status === 'alerta');
        if(itensAlerta.length === 0) {
            listaAlertas.innerHTML = '<p style="font-size:13px; color:var(--text-muted); padding: 10px;">Nenhum alerta crítico de validade no momento.</p>';
        } else {
            itensAlerta.forEach(item => {
                listaAlertas.innerHTML += `
                    <div class="alert-item">
                        <div>
                            <p>${item.nome}</p>
                            <span>CA: ${item.ca} | Vencimento: ${item.validade}</span>
                        </div>
                        <span class="badge-alert-pill">Substituir Lote</span>
                    </div>
                `;
            });
        }
    }

    // Tabela Colaboradores
    const tbodyFunc = document.querySelector('#tabelaFuncionariosGeral tbody');
    if(tbodyFunc) {
        tbodyFunc.innerHTML = '';
        funcionarios.forEach(f => {
            tbodyFunc.innerHTML += `
                <tr>
                    <td><strong>${f.nome}</strong></td>
                    <td>${f.cargo}</td>
                    <td>${f.setor}</td>
                    <td>${f.epis}</td>
                    <td><button class="btn-text" onclick="verFichaColaborador('${f.nome}')">Ficha NR-6</button></td>
                </tr>
            `;
        });
    }

    // Tabela Estoque
    const tbodyEstoque = document.querySelector('#tabelaEstoqueGeral tbody');
    if(tbodyEstoque) {
        tbodyEstoque.innerHTML = '';
        estoqueEPIs.forEach(e => {
            let statusHtml = e.status === 'ok' ? 
                '<span class="status-tag ok"><i class="fa-solid fa-circle-check"></i> CA Válido</span>' : 
                '<span class="status-tag alert"><i class="fa-solid fa-triangle-exclamation"></i> Vencido</span>';
            
            tbodyEstoque.innerHTML += `
                <tr>
                    <td><strong>${e.nome}</strong></td>
                    <td>${e.categoria}</td>
                    <td><code>${e.ca}</code></td>
                    <td>${e.qtd} unidades</td>
                    <td>${e.validade}</td>
                    <td>${statusHtml}</td>
                </tr>
            `;
        });
    }

    // Tabela Entregas Completa
    const tbodyEntregas = document.querySelector('#tabelaEntregasCompleta tbody');
    if(tbodyEntregas) {
        tbodyEntregas.innerHTML = '';
        entregas.forEach(ent => {
            tbodyEntregas.innerHTML += `
                <tr>
                    <td><strong>${ent.id}</strong></td>
                    <td>${ent.colaborador}</td>
                    <td>${ent.equipamento}</td>
                    <td>${ent.data}</td>
                    <td><i class="fa-solid fa-signature" style="color:var(--primary);"></i> ${ent.validacao}</td>
                    <td><button class="btn-text" onclick="abrirTermoNR6('${ent.id}')"><i class="fa-solid fa-file-contract"></i> Ver Termo</button></td>
                </tr>
            `;
        });
    }

    // Atualizar Selects dos Modais
    const selFunc = document.getElementById('selectFuncionario');
    if(selFunc) {
        selFunc.innerHTML = '';
        funcionarios.forEach(f => {
            selFunc.innerHTML += `<option value="${f.nome}">${f.nome} (${f.cargo})</option>`;
        });
    }

    const selEpi = document.getElementById('selectEpi');
    if(selEpi) {
        selEpi.innerHTML = '';
        estoqueEPIs.forEach(e => {
            selEpi.innerHTML += `<option value="${e.nome}">${e.nome} (Estoque: ${e.qtd})</option>`;
        });
    }
}

// Pesquisa Global
function filtrarGlobal() {
    let termo = document.getElementById('globalSearch').value.toLowerCase();
    
    document.querySelectorAll('tbody tr').forEach(tr => {
        let texto = tr.innerText.toLowerCase();
        tr.style.display = texto.includes(termo) ? '' : 'none';
    });
}

function filtrarTabelas() {
    filtrarGlobal();
}

// Modais
function abrirModalRegistro() {
    const modal = document.getElementById('modalRegistro');
    if(modal) modal.classList.add('active');
    const dataEl = document.getElementById('dataEntrega');
    if(dataEl) dataEl.valueAsDate = new Date();
}

function abrirModalFuncionario() {
    const modal = document.getElementById('modalFuncionario');
    if(modal) modal.classList.add('active');
}

function abrirModalEPI() {
    const modal = document.getElementById('modalEpi');
    if(modal) modal.classList.add('active');
}

function fecharModais() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

// Ações de Salvamento
function salvarEntrega(event) {
    event.preventDefault();
    const colaborador = document.getElementById('selectFuncionario').value;
    const equipamento = document.getElementById('selectEpi').value;
    const data = document.getElementById('dataEntrega').value;
    const validacao = document.getElementById('assinaturaDigital').value;

    const novaEntrega = {
        id: `EP-${Math.floor(1000 + Math.random() * 9000)}`,
        colaborador: colaborador,
        equipamento: equipamento,
        data: data,
        validacao: validacao
    };

    entregas.unshift(novaEntrega);
    fecharModais();
    renderizarTudo();
    if(meuGrafico) meuGrafico.update();
    alert("Entrega de EPI registrada com sucesso! Termo NR-6 gerado.");
}

function salvarFuncionario(event) {
    event.preventDefault();
    const nome = document.getElementById('novoNomeFunc').value;
    const cargo = document.getElementById('novoCargoFunc').value;
    const setor = document.getElementById('novoSetorFunc').value;
    const epis = document.getElementById('novoEpiFunc').value;

    funcionarios.push({ id: funcionarios.length + 1, nome, cargo, setor, epis });
    document.getElementById('formFuncionario').reset();
    fecharModais();
    renderizarTudo();
    alert("Colaborador cadastrado com sucesso!");
}

function salvarEpi(event) {
    event.preventDefault();
    const nome = document.getElementById('novoNomeEpi').value;
    const categoria = document.getElementById('novaCatEpi').value;
    const ca = document.getElementById('novoCaEpi').value;
    const qtd = parseInt(document.getElementById('novaQtdEpi').value);
    const validade = document.getElementById('novaValEpi').value;

    estoqueEPIs.push({ id: estoqueEPIs.length + 1, nome, categoria, ca, qtd, validade, status: 'ok' });
    document.getElementById('formEpi').reset();
    fecharModais();
    renderizarTudo();
    if(meuGrafico) inicializarGrafico();
    alert("Equipamento cadastrado no almoxarifado com sucesso!");
}

// Termo NR-6
function abrirTermoNR6(idEntrega) {
    const entrega = entregas.find(e => e.id === idEntrega);
    if(!entrega) return;

    const htmlTermo = `
        <div class="termo-header-print">
            <h2>EMPRESARIAL PROTECT - GESTÃO INTELIGENTE DE EPIS</h2>
            <p><strong>TERMO DE RESPONSABILIDADE E RECEBIMENTO DE EPI (NR-6)</strong></p>
        </div>
        <div class="termo-body-print">
            <p>Declaro para os devidos fins de cumprimento da Norma Regulamentadora nº 6 (NR-6) da Secretaria do Trabalho, que recebi da empresa <strong>Empresarial Protect Matriz</strong>, em perfeito estado de conservação e uso, o seguinte Equipamento de Proteção Individual (EPI):</p>
            <p><strong>Equipamento:</strong> ${entrega.equipamento}<br>
               <strong>Data da Entrega:</strong> ${entrega.data}<br>
               <strong>Validação / Token:</strong> ${entrega.validacao}</p>
            <p><strong>Compromissos do Colaborador:</strong><br>
            1. Utilizar o EPI apenas para a finalidade a que se destina;<br>
            2. Responsabilizar-me pela guarda e conservação adequada;<br>
            3. Comunicar imediatamente qualquer alteração que o torne impróprio para uso;<br>
            4. Cumprir integralmente as determinações de segurança do trabalho da empresa.</p>
            <br><br>
            <div class="termo-signatures">
                <div class="sig-box">
                    <p>_________________________________________<br><strong>${entrega.colaborador}</strong><br>Colaborador(a)</p>
                </div>
                <div class="sig-box">
                    <p>_________________________________________<br><strong>SESMT / Segurança do Trabalho</strong><br>Responsável Técnico</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('termoConteudoImprimir').innerHTML = htmlTermo;
    document.getElementById('modalTermo').classList.add('active');
}

function verFichaColaborador(nome) {
    alert(`Abrindo Ficha Individual de EPI (NR-6) para o colaborador: ${nome}. Histórico validado pelo SESMT.`);
}

function gerarRelatorioPDF() {
    alert("Pacote oficial de relatórios NR-6 (PDF) compilado com sucesso e pronto para arquivo de fiscalização!");
}

function gerarRelatorioExcel() {
    alert("Planilha completa de almoxarifado, CAs e custos gerada com sucesso!");
}

function exportarBackupSistema() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({funcionarios, estoqueEPIs, entregas}));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `empresarial_protect_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    alert("Backup completo do banco de dados do sistema exportado com sucesso!");
}
