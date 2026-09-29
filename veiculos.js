
// ===== VERIFICA LOGIN =====
const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
if (!usuarioLogado) window.location.href = 'index.html';

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

// ===== CONFIGURAÇÕES =====
const modelosPremium = [
    'Amarok', 'Tiguan', 'Taos', 'Jetta',
    'Passat', 'Golf', 'Arteon', 'Touareg'
];

let veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
let veiculoParaExcluir = null;
let modoEdicao = null;

// ===== INICIALIZAÇÃO =====
renderizarVeiculos();

// Detecta mudança no modelo para mostrar categoria
document.getElementById('v-modelo').addEventListener('change', () => {
    const modelo = document.getElementById('v-modelo').value;
    const preview = document.getElementById('categoria-preview');
    const texto = document.getElementById('categoria-texto');

    if (!modelo) {
        preview.style.display = 'none';
        return;
    }

    const isPremium = modelosPremium.includes(modelo);
    preview.style.display = 'flex';
    preview.className = `categoria-preview ${isPremium ? 'premium' : 'nacional'}`;
    texto.textContent = isPremium
        ? '⭐ Veículo Premium — valores de revisão e alinhamento diferenciados'
        : '✅ Veículo Nacional — valores padrão de revisão e alinhamento';

    lucide.createIcons();
});

function renderizarVeiculos() {
    const lista = document.getElementById('veiculos-lista');

    const meusVeiculos = veiculos.filter(
        v => v.usuarioId === usuarioLogado.id
    );

    if (meusVeiculos.length === 0) {
        lista.innerHTML = `
            <div class="veiculos-vazio">
                <i data-lucide="car"></i>
                <h3>Nenhum veículo cadastrado</h3>
                <p>Adicione seu primeiro veículo para começar a agendar serviços.</p>
            </div>
        `;

        lucide.createIcons();
        return;
    }

    lista.innerHTML = meusVeiculos.map((v, i) => {
        const indexOriginal = veiculos.findIndex(
            veiculo =>
                veiculo.placa === v.placa &&
                veiculo.usuarioId === usuarioLogado.id
        );

        return `
            <div class="veiculo-card">
                <div class="veiculo-card-icone ${v.categoria}">
                    <i data-lucide="car"></i>
                </div>

                <div class="veiculo-card-info">
                    <div class="veiculo-card-header">
                        <h3>${v.modelo}</h3>

                        <span class="badge-categoria ${v.categoria}">
                            ${v.categoria === 'premium'
                ? 'Premium'
                : 'Nacional'}
                        </span>
                    </div>

                    <div class="veiculo-card-detalhes">
                        <span>
                            <i data-lucide="credit-card"></i>
                            ${v.placa}
                        </span>

                        <span>
                            <i data-lucide="hash"></i>
                            ${v.chassi}
                        </span>
                    </div>
                </div>

                <div class="veiculo-card-acoes">
                    <button
                        class="btn-editar"
                        onclick="editarVeiculo(${indexOriginal})"
                        title="Editar">

                        <i data-lucide="pencil"></i>
                    </button>

                    <button
                        class="btn-remover"
                        onclick="abrirModalExcluir(${indexOriginal})"
                        title="Remover">

                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons();
}

// ===== MODAL CADASTRO =====
function abrirModalVeiculo() {
    modoEdicao = null;
    document.getElementById('modal-titulo').textContent = 'Adicionar Veículo';
    document.getElementById('v-placa').value = '';
    document.getElementById('v-chassi').value = '';
    document.getElementById('v-modelo').value = '';
    document.getElementById('categoria-preview').style.display = 'none';
    limparErros();

    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('modal-veiculo').style.display = 'flex';
    lucide.createIcons();
}

function fecharModalVeiculo() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('modal-veiculo').style.display = 'none';
}

// ===== EDITAR =====
function editarVeiculo(index) {
    modoEdicao = index;

    const v = veiculos[index];

    document.getElementById('modal-titulo').textContent = 'Editar Veículo';
    document.getElementById('v-placa').value = v.placa;
    document.getElementById('v-chassi').value = v.chassi;
    document.getElementById('v-modelo').value = v.modelo;

    document.getElementById('v-modelo').dispatchEvent(new Event('change'));

    limparErros();
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('modal-veiculo').style.display = 'flex';

    lucide.createIcons();
}

// ===== SALVAR =====
function salvarVeiculo() {
    const placa = document.getElementById('v-placa').value.trim().toUpperCase();
    const chassi = document.getElementById('v-chassi').value.trim().toUpperCase();
    const modelo = document.getElementById('v-modelo').value;

    limparErros();
    let valido = true;

    if (!placa) {
        document.getElementById('erro-placa').style.display = 'block';
        valido = false;
    }
    if (!chassi) {
        document.getElementById('erro-chassi').style.display = 'block';
        valido = false;
    }
    if (!modelo) {
        document.getElementById('erro-modelo').style.display = 'block';
        valido = false;
    }

    if (!valido) return;

    // Verifica placa duplicada (exceto no modo edição do mesmo veículo)
    const placaDuplicada = veiculos.some((v, i) =>
        v.placa === placa &&
        v.usuarioId === usuarioLogado.id &&
        i !== modoEdicao
    );
    
    if (placaDuplicada) {
        document.getElementById('erro-placa').textContent = 'Esta placa já está cadastrada.';
        document.getElementById('erro-placa').style.display = 'block';
        return;
    }

    const categoria = modelosPremium.includes(modelo) ? 'premium' : 'nacional';

    const novoVeiculo = {
        placa,
        chassi,
        modelo,
        categoria,
        usuarioId: usuarioLogado.id
    };

    if (modoEdicao !== null) {
        veiculos[modoEdicao] = novoVeiculo;
    } else {
        veiculos.push(novoVeiculo);
    }

    localStorage.setItem('veiculos', JSON.stringify(veiculos));
    fecharModalVeiculo();
    renderizarVeiculos();
}

// ===== EXCLUIR =====
function abrirModalExcluir(index) {
    veiculoParaExcluir = index;

    const v = veiculos[index];

    document.getElementById('veiculo-excluir-preview').innerHTML = `
        <div class="veiculo-excluir-info">
            <strong>${v.modelo}</strong>
            <span>${v.placa} • ${v.chassi}</span>
        </div>
    `;

    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('modal-excluir').style.display = 'flex';

    lucide.createIcons();
}

function fecharModalExcluir() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('modal-excluir').style.display = 'none';

    veiculoParaExcluir = null;
}

function confirmarExclusao() {
    if (veiculoParaExcluir === null) return;

    veiculos.splice(veiculoParaExcluir, 1);

    localStorage.setItem('veiculos', JSON.stringify(veiculos));

    fecharModalExcluir();
    renderizarVeiculos();
}

// ===== UTILITÁRIOS =====
function limparErros() {
    document.getElementById('erro-placa').style.display = 'none';
    document.getElementById('erro-placa').textContent = 'Placa obrigatória.';
    document.getElementById('erro-chassi').style.display = 'none';
    document.getElementById('erro-modelo').style.display = 'none';
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('recolhida');
}

