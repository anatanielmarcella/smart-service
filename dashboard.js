// ===== VERIFICA LOGIN =====
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
if (!usuarioLogado) {
    window.location.href = 'index.html';
}

// ===== CONFIGURAÇÕES =====
const tipoUsuario = usuarioLogado?.tipo || 'cliente';

const atendentes = [
    { id: 1, nome: 'Carlos Oliveira', inicial: 'C' },
    { id: 2, nome: 'Ana Paula', inicial: 'A' },
    { id: 3, nome: 'João Santos', inicial: 'J' }
];

const horarios = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

const valoresRevisao = {
    premium: { 1: 2900, 2: 3100, 3: 2950, 4: 3200, 5: 2980, 6: 3050, 7: 3150, 8: 3200, 9: 2950, 10: 3100 },
    nacional: { 1: 870, 2: 950, 3: 860, 4: 1820, 5: 865, 6: 960, 7: 955, 8: 1810, 9: 855, 10: 960 }
};

const itensRevisao = {
    padrao: ['Anel de vedação', 'Bujão roscado', 'Filtro de óleo', 'Óleo de motor sintético'],
    especial: ['Anel de vedação', 'Bujão roscado', 'Filtro de óleo', 'Óleo de motor sintético', 'Velas de ignição']
};

const nomeServicos = {
    revisao: 'Revisão Periódica', diagnostico: 'Diagnóstico',
    alinhamento: 'Alinhamento e Balanceamento', 'troca-pecas': 'Troca de Peças',
    recall: 'Campanha / Recall', reparo: 'Reparo Repetitivo',
    lavagem: 'Lavagem Simples', adicionais: 'Serviços Adicionais', internos: 'Veículos Internos'
};

// ===== ESTADO =====
let dataAtual = new Date();
let calMes = new Date();
let agendamentos = JSON.parse(localStorage.getItem('agendamentos') || '[]');
let veiculosCliente = JSON.parse(localStorage.getItem('veiculos') || '[]')
    .filter(v => v.usuarioId === usuarioLogado.id);
let agendamentoContexto = null;
let bloqueios = JSON.parse(localStorage.getItem('bloqueios') || '[]');
let slotContexto = null;
let modoEdicao = false;
let agendamentoEmEdicao = null;

let passoAtual = 1;
let totalPassos = 5;
let veiculoSelecionado = null;
let servicoSelecionado = null;
let revisaoSelecionada = null;
let alinhamentoSelecionado = null;
let horarioSelecionado = null;
let atendenteSelecionado = null;

// ===== INICIALIZAÇÃO =====
atualizarDataHeader();
renderizarAgenda();

document.getElementById('header-nome').textContent = usuarioLogado?.nome || 'Usuário';
document.getElementById('header-role').textContent =
    usuarioLogado?.tipo === 'gerente' ? 'Gerente' :
        usuarioLogado?.tipo === 'funcionario' ? 'Funcionário' : 'Cliente';
document.getElementById('header-avatar').textContent =
    usuarioLogado?.nome?.charAt(0).toUpperCase() || 'U';

// ===== DATA =====
function atualizarDataHeader() {
    const opcoes = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    document.getElementById('data-atual').textContent =
        dataAtual.toLocaleDateString('pt-BR', opcoes);
}

function navegarDia(delta) {
    dataAtual.setDate(dataAtual.getDate() + delta);
    // Pula fins de semana
    while (dataAtual.getDay() === 0 || dataAtual.getDay() === 6) {
        dataAtual.setDate(dataAtual.getDate() + delta);
    }
    atualizarDataHeader();
    renderizarAgenda();
}

function irParaHoje() {
    dataAtual = new Date();
    if (dataAtual.getDay() === 0) dataAtual.setDate(dataAtual.getDate() + 1);
    if (dataAtual.getDay() === 6) dataAtual.setDate(dataAtual.getDate() + 2);
    atualizarDataHeader();
    renderizarAgenda();
}

// ===== CALENDÁRIO =====
function toggleCalendario() {
    const cal = document.getElementById('mini-calendario');
    if (cal.style.display === 'none') {
        calMes = new Date(dataAtual);
        renderizarCalendario();
        cal.style.display = 'block';
    } else {
        cal.style.display = 'none';
    }
}

function navegarMesCalendario(delta) {
    calMes.setMonth(calMes.getMonth() + delta);
    renderizarCalendario();
}

// Alias para o botão anterior (evita conflito de nomes)
function navegarMesCal(delta) {
    navegarMesCalendario(delta);
}

// ===== INICIALIZAÇÃO =====
atualizarDataHeader();
renderizarAgenda();

// Preenche header com dados do usuário logado
document.getElementById('header-nome').textContent = usuarioLogado?.nome || 'Usuário';
document.getElementById('header-role').textContent =
    usuarioLogado?.tipo === 'gerente' ? 'Gerente' :
        usuarioLogado?.tipo === 'funcionario' ? 'Funcionário' : 'Cliente';
document.getElementById('header-avatar').textContent =
    usuarioLogado?.nome?.charAt(0).toUpperCase() || 'U';

function renderizarCalendario() {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    document.getElementById('cal-mes-ano').textContent =
        `${meses[calMes.getMonth()]} ${calMes.getFullYear()}`;

    const grid = document.getElementById('cal-grid');
    grid.innerHTML = '';

    const ano = calMes.getFullYear();
    const mes = calMes.getMonth();
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();

    // Ajusta para começar na segunda (0=dom,1=seg...)
    const offset = primeiroDia === 0 ? 6 : primeiroDia - 1;

    // Dias vazios antes do primeiro
    for (let i = 0; i < offset; i++) {
        const vazio = document.createElement('div');
        vazio.className = 'cal-dia vazio';
        grid.appendChild(vazio);
    }

    for (let d = 1; d <= totalDias; d++) {
        const diaSemana = new Date(ano, mes, d).getDay();
        if (diaSemana === 0 || diaSemana === 6) continue; // Pula fins de semana

        const div = document.createElement('div');
        div.className = 'cal-dia';
        div.textContent = d;

        const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const temAgendamento = agendamentos.some(a => a.data === dataStr);
        if (temAgendamento) div.classList.add('tem-agendamento');

        const hoje = new Date();
        if (d === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()) {
            div.classList.add('hoje');
        }

        if (d === dataAtual.getDate() && mes === dataAtual.getMonth() && ano === dataAtual.getFullYear()) {
            div.classList.add('selecionado');
        }

        div.onclick = () => {
            dataAtual = new Date(ano, mes, d);
            atualizarDataHeader();
            renderizarAgenda();
            document.getElementById('mini-calendario').style.display = 'none';
        };

        grid.appendChild(div);
    }
}

// ===== AGENDA =====
function renderizarAgenda() {
    const container = document.getElementById('colunas-atendentes');
    const dataStr = formatarData(dataAtual);

    container.innerHTML = atendentes.map(atendente => {
        const slots = horarios.map(hora => {
            const agendamento = agendamentos.find(a =>
                a.data === dataStr && a.horario === hora && a.atendenteId === atendente.id
            );

            if (agendamento) {
                const obsTexto = agendamento.observacao
                    ? `<div class="tooltip-obs">${agendamento.observacao}</div>`
                    : '';

                return `
        <div class="slot">
            <div class="card-agendamento ${agendamento.servico} ${agendamento.status === 'confirmado' ? 'confirmado' : ''}"
                data-id="${agendamento.id}"
                oncontextmenu="abrirContextMenu(event, '${agendamento.id}')"
                ondblclick="abrirEdicao('${agendamento.id}')">
                ${obsTexto}
                <span class="card-cliente">${agendamento.veiculo}</span>
                <span class="card-placa">${agendamento.placa}</span>
                <span class="card-servico">${nomeServicos[agendamento.servico]}</span>
            </div>
        </div>`;
            }

            const bloqueado = bloqueios.some(b =>
                b.data === dataStr && b.hora === hora && b.atendenteId === atendente.id
            );

            if (bloqueado) {
                return `
                    <div class="slot slot-bloqueado"
                        oncontextmenu="abrirContextMenuSlot(event, '${dataStr}', '${hora}', ${atendente.id})">
                        <i data-lucide="lock"></i>
                    </div>`;
            }

            return `<div class="slot" oncontextmenu="abrirContextMenuSlot(event, '${dataStr}', '${hora}', ${atendente.id})"></div>`;

        }).join('');

        return `
            <div class="col-atendente">
                <div class="col-header">
                    <div class="atendente-avatar">${atendente.inicial}</div>
                    <span>${atendente.nome}</span>
                </div>
                ${slots}
            </div>`;
    }).join('');

    lucide.createIcons();
}

function formatarData(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

// ===== CONTEXT MENU =====
function abrirContextMenu(e, id) {
    e.preventDefault();

    agendamentoContexto = id;
    slotContexto = null;

    const agendamento = agendamentos.find(a => a.id === id);

    // Cliente só pode mexer nos próprios agendamentos
    if (
        tipoUsuario === 'cliente' &&
        agendamento.usuarioId !== usuarioLogado.id
    ) {
        return;
    }

    document.getElementById('menu-agendamento').style.display = 'block';
    document.getElementById('menu-slot').style.display = 'none';
    document.getElementById('menu-bloqueado').style.display = 'none';

    const menu = document.getElementById('context-menu');

    menu.style.display = 'block';
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;

    lucide.createIcons();
}

function abrirContextMenuSlot(e, data, hora, atendenteId) {
    e.preventDefault();
    if (tipoUsuario !== 'gerente') return; // só gerente pode bloquear

    agendamentoContexto = null;
    slotContexto = { data, hora, atendenteId };

    const bloqueado = isHorarioBloqueado(data, hora, atendenteId);

    document.getElementById('menu-agendamento').style.display = 'none';
    document.getElementById('menu-slot').style.display = bloqueado ? 'none' : 'block';
    document.getElementById('menu-bloqueado').style.display = bloqueado ? 'block' : 'none';

    const menu = document.getElementById('context-menu');
    menu.style.display = 'block';
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
    lucide.createIcons();
}

function confirmarAgendamentoContexto() {
    const ag = agendamentos.find(a => a.id === agendamentoContexto);
    if (ag) {
        ag.status = 'confirmado';
        salvarAgendamentos();
        renderizarAgenda();
    }
    document.getElementById('context-menu').style.display = 'none';
}

function cancelarAgendamentoContexto() {
    agendamentos = agendamentos.filter(a => a.id !== agendamentoContexto);
    salvarAgendamentos();
    renderizarAgenda();
    document.getElementById('context-menu').style.display = 'none';
}

function abrirEdicao(id) {
    const ag = agendamentos.find(a => a.id === id);
    if (ag) mostrarToast(`Agendamento: ${ag.veiculo} — ${nomeServicos[ag.servico]} às ${ag.horario}`);
}

function salvarAgendamentos() {
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
}

// ===== MODAL =====
function abrirModal() {
    passoAtual = 1;
    veiculoSelecionado = null;
    servicoSelecionado = null;
    revisaoSelecionada = null;
    alinhamentoSelecionado = null;
    horarioSelecionado = null;
    atendenteSelecionado = null;

    veiculosCliente = JSON.parse(localStorage.getItem('veiculos') || '[]')
        .filter(v => v.usuarioId === usuarioLogado.id);

    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('modal-agendamento').style.display = 'flex';

    configurarPermissoes();
    renderizarVeiculos();
    irParaPasso(1);
    lucide.createIcons();
}

function fecharModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('modal-agendamento').style.display = 'none';
}

function configurarPermissoes() {
    document.querySelectorAll('.apenas-funcionario').forEach(el => {
        el.style.display = tipoUsuario === 'cliente' ? 'none' : 'flex';
    });
}

// ===== VEÍCULOS =====
function renderizarVeiculos() {
    const lista = document.getElementById('veiculo-lista');

    if (veiculosCliente.length === 0) {
        lista.innerHTML = `
            <div class="veiculo-vazio">
                <i data-lucide="car"></i>
                <p>Você não tem veículos cadastrados.</p>
                <a href="veiculos.html">Cadastrar veículo</a>
            </div>`;
        return;
    }

    lista.innerHTML = veiculosCliente.map((v, i) => `
        <div class="veiculo-item" id="veiculo-${i}" onclick="selecionarVeiculo(${i})">
            <div class="veiculo-icone"><i data-lucide="car"></i></div>
            <div class="veiculo-dados">
                <span class="veiculo-modelo">${v.modelo}</span>
                <span class="veiculo-placa">${v.placa}</span>
            </div>
        </div>
    `).join('');
}

function selecionarVeiculo(index) {
    document.querySelectorAll('.veiculo-item').forEach(el => el.classList.remove('selecionado'));
    veiculoSelecionado = veiculosCliente[index];
    document.getElementById(`veiculo-${index}`).classList.add('selecionado');
}

// ===== SERVIÇO =====
function selecionarServico(tipo) {
    servicoSelecionado = tipo;
    document.querySelectorAll('.servico-card').forEach(el => el.classList.remove('selecionado'));
    event.currentTarget.classList.add('selecionado');
    avancarPasso();
}

// ===== REVISÃO =====
function renderizarRevisoes() {
    const lista = document.getElementById('revisao-lista');
    const categoria = veiculoSelecionado?.categoria || 'nacional';
    const valores = valoresRevisao[categoria];

    lista.innerHTML = Array.from({ length: 10 }, (_, i) => {
        const num = i + 1;
        return `
            <div class="revisao-item" onclick="selecionarRevisao(${num})">
                <div class="revisao-num">${num}ª</div>
                <div class="revisao-info">
                    <span class="revisao-titulo">${num}ª Revisão</span>
                    <span class="revisao-sub">${num * 10}.000 km ou ${num} ano${num > 1 ? 's' : ''}</span>
                </div>
                <span class="revisao-valor">R$ ${valores[num].toLocaleString('pt-BR')},00</span>
            </div>`;
    }).join('');
}

function selecionarRevisao(num) {
    revisaoSelecionada = num;
    const categoria = veiculoSelecionado?.categoria || 'nacional';
    const valor = valoresRevisao[categoria][num];
    const itens = (num === 4 || num === 8) ? itensRevisao.especial : itensRevisao.padrao;

    document.querySelectorAll('.revisao-item').forEach(el => el.classList.remove('selecionado'));
    event.currentTarget.classList.add('selecionado');

    document.getElementById('lista-itens').innerHTML = itens.map(item => `<li>${item}</li>`).join('');
    document.getElementById('valor-revisao').textContent = `Valor estimado: R$ ${valor.toLocaleString('pt-BR')},00`;
    document.getElementById('itens-revisao').style.display = 'block';

    setTimeout(() => {
        document.getElementById('itens-revisao').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// ===== ALINHAMENTO =====
function renderizarAlinhamento() {
    const categoria = veiculoSelecionado?.categoria || 'nacional';
    const valores = categoria === 'premium'
        ? { ali: 130, bal: 120, ambos: 250 }
        : { ali: 100, bal: 90, ambos: 190 };

    document.getElementById('alin-opcoes').innerHTML = `
        <div class="alin-card" onclick="selecionarAlinhamento('Alinhamento', ${valores.ali})">
            <span class="alin-nome">Só Alinhamento</span>
            <span class="alin-valor">R$ ${valores.ali},00</span>
        </div>
        <div class="alin-card" onclick="selecionarAlinhamento('Balanceamento', ${valores.bal})">
            <span class="alin-nome">Só Balanceamento</span>
            <span class="alin-valor">R$ ${valores.bal},00</span>
        </div>
        <div class="alin-card" onclick="selecionarAlinhamento('Alinhamento + Balanceamento', ${valores.ambos})">
            <span class="alin-nome">Alinhamento + Balanceamento</span>
            <span class="alin-valor">R$ ${valores.ambos},00</span>
        </div>`;
}

function selecionarAlinhamento(tipo, valor) {
    alinhamentoSelecionado = { tipo, valor };
    document.querySelectorAll('.alin-card').forEach(el => el.classList.remove('selecionado'));
    event.currentTarget.classList.add('selecionado');
}

// ===== HORÁRIO E ATENDENTE =====
function renderizarPasso4() {
    // Define data mínima como hoje
    const inputData = document.getElementById('data-agendamento');
    inputData.min = formatarData(new Date());
    inputData.value = formatarData(dataAtual);

    // Bloqueia fins de semana no input de data
    inputData.addEventListener('input', () => {
        const d = new Date(inputData.value + 'T00:00:00');
        if (d.getDay() === 0 || d.getDay() === 6) {
            alert('Selecione apenas dias úteis (segunda a sexta).');
            inputData.value = '';
        }
    });

    // Renderiza atendentes
    document.getElementById('atendente-grid').innerHTML = atendentes.map(a => `
        <div class="atendente-btn" onclick="selecionarAtendente(${a.id}, '${a.nome}')">
            <div class="atendente-avatar-btn">${a.inicial}</div>
            <span>${a.nome}</span>
        </div>
    `).join('');

    // Marca horários ocupados
    atualizarHorariosDisponiveis();
}

function atualizarHorariosDisponiveis() {
    const dataStr = document.getElementById('data-agendamento').value;
    if (!dataStr) return;

    document.querySelectorAll('.horario-btn').forEach(btn => {
        const hora = btn.textContent;

        const ocupado = agendamentos.some(a =>
            a.data === dataStr && a.horario === hora &&
            a.atendenteId === atendenteSelecionado?.id
        );

        const bloqueado = bloqueios.some(b =>
            b.data === dataStr && b.hora === hora &&
            b.atendenteId === atendenteSelecionado?.id
        );

        btn.classList.toggle('ocupado', ocupado || bloqueado);

        if ((ocupado || bloqueado) && btn.classList.contains('selecionado')) {
            btn.classList.remove('selecionado');
            horarioSelecionado = null;
        }
    });
}

function selecionarHorario(hora) {
    const btn = event.currentTarget;
    if (btn.classList.contains('ocupado')) return;
    document.querySelectorAll('.horario-btn').forEach(b => b.classList.remove('selecionado'));
    btn.classList.add('selecionado');
    horarioSelecionado = hora;
}

function selecionarAtendente(id, nome) {
    atendenteSelecionado = { id, nome };
    document.querySelectorAll('.atendente-btn').forEach(b => b.classList.remove('selecionado'));
    event.currentTarget.classList.add('selecionado');
    atualizarHorariosDisponiveis();
}

// ===== PASSOS =====
function irParaPasso(num) {
    for (let i = 1; i <= totalPassos; i++) {
        const passo = document.getElementById(`passo-${i}`);
        const step = document.getElementById(`step-${i}`);
        if (passo) passo.style.display = 'none';
        if (step) step.classList.remove('active', 'completo');
    }

    document.getElementById(`passo-${num}`).style.display = 'block';

    for (let i = 1; i < num; i++) {
        document.getElementById(`step-${i}`)?.classList.add('completo');
    }
    document.getElementById(`step-${num}`)?.classList.add('active');

    document.getElementById('btn-voltar').style.display = num > 1 ? 'flex' : 'none';

    const btnConfirmar = document.getElementById('btn-confirmar');
    const btnAvancar = document.getElementById('btn-avancar');

    if (num === totalPassos) {
        btnConfirmar.style.display = 'flex';
        btnAvancar.style.display = 'none';
    } else {
        btnConfirmar.style.display = 'none';
        btnAvancar.style.display = 'flex';
    }

    if (num === 3) configurarPasso3();
    if (num === 4) renderizarPasso4();
    if (num === totalPassos) montarResumo();

    passoAtual = num;
    lucide.createIcons();
}

function configurarPasso3() {
    document.getElementById('detalhe-revisao').style.display = 'none';
    document.getElementById('detalhe-alinhamento').style.display = 'none';
    document.getElementById('itens-revisao').style.display = 'none';

    const obs = document.getElementById('observacao');
    obs.value = '';

    if (servicoSelecionado === 'revisao') {
        document.getElementById('passo3-titulo').textContent = 'Selecione a revisão';
        document.getElementById('passo3-desc').textContent = 'Escolha a revisão conforme os km ou tempo do seu veículo.';
        document.getElementById('detalhe-revisao').style.display = 'block';
        document.getElementById('grupo-observacao').style.display = 'none';
        renderizarRevisoes();
    } else if (servicoSelecionado === 'diagnostico') {
        document.getElementById('passo3-titulo').textContent = 'Descreva o problema';
        document.getElementById('passo3-desc').textContent = 'Relate o que seu veículo está apresentando.';
        document.getElementById('grupo-observacao').style.display = 'block';
        obs.value = 'CLIENTE RELATA: ';
        obs.focus();
        obs.setSelectionRange(obs.value.length, obs.value.length);
    } else if (servicoSelecionado === 'lavagem') {
        document.getElementById('passo3-titulo').textContent = 'Lavagem Simples';
        document.getElementById('passo3-desc').textContent = 'Valor: R$ 45,00.';
        document.getElementById('grupo-observacao').style.display = 'block';
        obs.value = 'LAVAGEM SIMPLES';
    } else if (servicoSelecionado === 'alinhamento') {
        document.getElementById('passo3-titulo').textContent = 'Alinhamento e Balanceamento';
        document.getElementById('passo3-desc').textContent = 'Selecione o serviço desejado.';
        document.getElementById('detalhe-alinhamento').style.display = 'block';
        document.getElementById('grupo-observacao').style.display = 'none';
        renderizarAlinhamento();
    } else {
        document.getElementById('passo3-titulo').textContent = 'Observação';
        document.getElementById('passo3-desc').textContent = 'Adicione alguma informação adicional se necessário.';
        document.getElementById('grupo-observacao').style.display = 'block';
    }
}

function montarResumo() {
    let nomeServico = nomeServicos[servicoSelecionado];
    if (servicoSelecionado === 'revisao' && revisaoSelecionada) nomeServico += ` — ${revisaoSelecionada}ª Revisão`;
    if (servicoSelecionado === 'alinhamento' && alinhamentoSelecionado) nomeServico += ` — ${alinhamentoSelecionado.tipo}`;

    let valor = 'A combinar no dia do atendimento';
    if (servicoSelecionado === 'revisao' && revisaoSelecionada) {
        valor = `R$ ${valoresRevisao[veiculoSelecionado.categoria][revisaoSelecionada].toLocaleString('pt-BR')},00 (estimado)`;
    } else if (servicoSelecionado === 'lavagem') {
        valor = 'R$ 45,00';
    } else if (servicoSelecionado === 'recall') {
        valor = 'Gratuito';
    } else if (servicoSelecionado === 'alinhamento' && alinhamentoSelecionado) {
        valor = `R$ ${alinhamentoSelecionado.valor},00`;
    }

    const dataInput = document.getElementById('data-agendamento').value;
    const dataFormatada = dataInput ? new Date(dataInput + 'T00:00:00').toLocaleDateString('pt-BR') : '';

    document.getElementById('res-veiculo').textContent = `${veiculoSelecionado.modelo} — ${veiculoSelecionado.placa}`;
    document.getElementById('res-servico').textContent = nomeServico;
    document.getElementById('res-valor').textContent = valor;
    document.getElementById('res-data').textContent = dataFormatada;
    document.getElementById('res-horario').textContent = horarioSelecionado || '';
    document.getElementById('res-atendente').textContent = atendenteSelecionado?.nome || '';

    const obs = document.getElementById('observacao').value;
    if (obs.trim()) {
        document.getElementById('res-obs-grupo').style.display = 'flex';
        document.getElementById('res-obs').textContent = obs;
    } else {
        document.getElementById('res-obs-grupo').style.display = 'none';
    }
}

function avancarPasso() {
    if (passoAtual === 1 && !veiculoSelecionado) {
        mostrarToast("Selecione um veículo para continuar."); return;
    }
    if (passoAtual === 2 && !servicoSelecionado) {
        mostrarToast("Selecione um serviço para continuar."); return;
    }
    if (passoAtual === 3) {
        if (servicoSelecionado === 'revisao' && !revisaoSelecionada) {
            mostrarToast("Selecione qual revisão deseja realizar."); return;
        }
        if (servicoSelecionado === 'alinhamento' && !alinhamentoSelecionado) {
            mostrarToast("Selecione o tipo de alinhamento."); return;
        }
    }
    if (passoAtual === 4) {
        const dataInput = document.getElementById('data-agendamento').value;
        if (!dataInput) { mostrarToast("Selecione uma data."); return; }
        if (!horarioSelecionado) { mostrarToast("Selecione um horário."); return; }
        if (!atendenteSelecionado) { mostrarToast("Selecione um atendente."); return; }
    }
    if (passoAtual < totalPassos) irParaPasso(passoAtual + 1);
}

function voltarPasso() {
    if (passoAtual > 1) irParaPasso(passoAtual - 1);
}

function confirmarAgendamento() {
    const dataInput = document.getElementById('data-agendamento').value;
    let nomeServico = nomeServicos[servicoSelecionado];
    if (servicoSelecionado === 'revisao' && revisaoSelecionada) nomeServico += ` — ${revisaoSelecionada}ª Revisão`;

    const novoAgendamento = {
        id: Date.now().toString(),
        usuarioId: usuarioLogado.id,
        usuarioNome: usuarioLogado.nome,

        veiculo: `${veiculoSelecionado.modelo}`,
        placa: veiculoSelecionado.placa,

        servico: servicoSelecionado,    
        nomeServico,

        data: dataInput,
        horario: horarioSelecionado,

        atendenteId: atendenteSelecionado.id,
        atendente: atendenteSelecionado.nome,

        observacao: document.getElementById('observacao').value,

        status: 'pendente'
    };

    agendamentos.push(novoAgendamento);
    salvarAgendamentos();

    // Navega para o dia agendado
    dataAtual = new Date(dataInput + 'T00:00:00');
    atualizarDataHeader();
    renderizarAgenda();

    // Preenche header
    document.getElementById('header-nome').textContent = usuarioLogado?.nome || 'Usuário';
    document.getElementById('header-role').textContent =
        usuarioLogado?.tipo === 'gerente' ? 'Gerente' :
            usuarioLogado?.tipo === 'funcionario' ? 'Funcionário' : 'Cliente';

    const avatar = document.getElementById('header-avatar');

    if (usuarioLogado.foto) {
        avatar.innerHTML = `
        <img src="${usuarioLogado.foto}" alt="Foto do usuário">
    `;
    } else {
        avatar.textContent =
            usuarioLogado.nome.charAt(0).toUpperCase();
    }

    fecharModal();
    mostrarToast("Agendamento realizado com sucesso!", "success");
}

// ===== SIDEBAR =====
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('recolhida');
}

// ===== BLOQUEIOS =====
function salvarBloqueios() {
    localStorage.setItem('bloqueios', JSON.stringify(bloqueios));
}

function isHorarioBloqueado(data, hora, atendenteId) {
    return bloqueios.some(b =>
        b.data === data && b.hora === hora && b.atendenteId === atendenteId
    );
}

function bloquearHorario() {
    if (!slotContexto) return;
    bloqueios.push(slotContexto);
    salvarBloqueios();
    renderizarAgenda();
    document.getElementById('context-menu').style.display = 'none';
}

function desbloquearHorario() {
    if (!slotContexto) return;
    bloqueios = bloqueios.filter(b =>
        !(b.data === slotContexto.data &&
            b.hora === slotContexto.hora &&
            b.atendenteId === slotContexto.atendenteId)
    );
    salvarBloqueios();
    renderizarAgenda();
    document.getElementById('context-menu').style.display = 'none';
}

function mostrarToast(mensagem) {
    const toast = document.getElementById("toast");
    const texto = document.getElementById("toast-message");

    texto.textContent = mensagem;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function logout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
}

// Fecha o menu ao clicar fora dele
document.addEventListener('click', (e) => {
    const menu = document.getElementById('context-menu');

    if (menu.style.display === 'block' && !menu.contains(e.target)) {
        menu.style.display = 'none';
    }
});

