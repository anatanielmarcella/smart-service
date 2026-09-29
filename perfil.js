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

// ===== DADOS DO PERFIL =====
let perfilOriginal = {};
let modoEdicao = false;

// Carrega dados salvos
function carregarPerfil() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (!usuarioLogado) {
        window.location.href = 'index.html';
        return;
    }

    const nome = usuarioLogado.nome;
    const email = usuarioLogado.email;
    const telefone = usuarioLogado.telefone;
    const tipo = usuarioLogado.tipo;
    const foto = usuarioLogado.foto || null;

    document.getElementById('campo-nome').value = nome;
    document.getElementById('campo-email').value = email;
    document.getElementById('campo-telefone').value = telefone;
    const tipoTexto = tipo === 'gerente' ? 'Gerente' :
        tipo === 'funcionario' ? 'Funcionário' : 'Cliente';
    document.getElementById('campo-tipo').value = tipoTexto;
    document.getElementById('perfil-tipo-display').textContent = tipoTexto;
    document.getElementById('perfil-nome-display').textContent = nome;
    document.getElementById('header-nome').textContent = nome;
    document.getElementById('perfil-inicial').textContent = nome.charAt(0).toUpperCase();
    document.getElementById('header-avatar').textContent = nome.charAt(0).toUpperCase();

    if (foto) {
        document.getElementById('perfil-img').src = foto;
        document.getElementById('perfil-img').style.display = 'block';
        document.getElementById('perfil-inicial').style.display = 'none';
    }

    perfilOriginal = { nome, email, telefone, tipo, foto };
}

carregarPerfil();

// ===== EDIÇÃO =====
function toggleEdicao() {
    modoEdicao = !modoEdicao;

    const campos = ['campo-nome', 'campo-email', 'campo-telefone'];
    campos.forEach(id => {
        document.getElementById(id).disabled = !modoEdicao;
    });

    document.getElementById('perfil-acoes').style.display = modoEdicao ? 'flex' : 'none';

    const btn = document.getElementById('btn-editar');
    btn.innerHTML = modoEdicao
        ? '<i data-lucide="x"></i> Cancelar'
        : '<i data-lucide="pencil"></i> Editar';

    lucide.createIcons();
}

function cancelarEdicao() {
    document.getElementById('campo-nome').value = perfilOriginal.nome;
    document.getElementById('campo-email').value = perfilOriginal.email;
    document.getElementById('campo-telefone').value = perfilOriginal.telefone;

    modoEdicao = false;
    const campos = ['campo-nome', 'campo-email', 'campo-telefone'];
    campos.forEach(id => document.getElementById(id).disabled = true);

    document.getElementById('perfil-acoes').style.display = 'none';
    document.getElementById('btn-editar').innerHTML = '<i data-lucide="pencil"></i> Editar';
    lucide.createIcons();
}

function salvarPerfil() {
    const nome = document.getElementById('campo-nome').value.trim();
    const email = document.getElementById('campo-email').value.trim();
    const telefone = document.getElementById('campo-telefone').value.trim();

    if (!nome || !email || !telefone) {
        mostrarToast('Preencha todos os campos.');
        return;
    }

    // Atualiza usuário logado
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    usuarioLogado.nome = nome;
    usuarioLogado.email = email;
    usuarioLogado.telefone = telefone;

    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));

    // Atualiza lista de usuários
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    const index = usuarios.findIndex(u => u.id === usuarioLogado.id);

    if (index !== -1) {
        usuarios[index].nome = nome;
        usuarios[index].email = email;
        usuarios[index].telefone = telefone;

        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }

    document.getElementById('perfil-nome-display').textContent = nome;
    document.getElementById('header-nome').textContent = nome;
    document.getElementById('perfil-inicial').textContent = nome.charAt(0).toUpperCase();
    document.getElementById('header-avatar').textContent = nome.charAt(0).toUpperCase();

    perfilOriginal = { ...perfilOriginal, nome, email, telefone };
    modoEdicao = false;

    document.getElementById('perfil-acoes').style.display = 'none';
    ['campo-nome', 'campo-email', 'campo-telefone'].forEach(id => {
        document.getElementById(id).disabled = true;
    });
    document.getElementById('btn-editar').innerHTML = '<i data-lucide="pencil"></i> Editar';
    lucide.createIcons();

    mostrarToast('Perfil atualizado com sucesso!');
}

// ===== FOTO =====
function alterarFoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result;

        document.getElementById('perfil-img').src = base64;
        document.getElementById('perfil-img').style.display = 'block';
        document.getElementById('perfil-inicial').style.display = 'none';

        const dados = JSON.parse(localStorage.getItem('perfil') || '{}');
        dados.foto = base64;
        localStorage.setItem('perfil', JSON.stringify(dados));

        mostrarToast('Foto atualizada!');
    };
    reader.readAsDataURL(file);
}

// ===== SENHA =====
function toggleSenha(inputId, btn) {
    const input = document.getElementById(inputId);
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.innerHTML = isPassword
        ? '<i data-lucide="eye-off"></i>'
        : '<i data-lucide="eye"></i>';
    lucide.createIcons();
}

function alterarSenha() {
    const atual = document.getElementById('senha-atual').value;
    const nova = document.getElementById('senha-nova').value;
    const confirmar = document.getElementById('senha-confirmar').value;

    if (!atual || !nova || !confirmar) {
        mostrarToast('Preencha todos os campos de senha.');
        return;
    }

    if (nova.length < 6) {
        mostrarToast('A nova senha deve ter pelo menos 6 caracteres.');
        return;
    }

    if (nova !== confirmar) {
        mostrarToast('As senhas não coincidem.');
        return;
    }

    // Busca o usuário logado
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    // Verifica se a senha atual está correta
    if (atual !== usuarioLogado.senha) {
        mostrarToast('Senha atual incorreta.');
        return;
    }

    // Busca todos os usuários
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    // Encontra o usuário na lista
    const index = usuarios.findIndex(u => u.id === usuarioLogado.id);

    if (index === -1) {
        mostrarToast('Usuário não encontrado.');
        return;
    }

    // Atualiza a senha
    usuarios[index].senha = nova;
    usuarioLogado.senha = nova;

    // Salva novamente
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));

    // Limpa os campos
    document.getElementById('senha-atual').value = '';
    document.getElementById('senha-nova').value = '';
    document.getElementById('senha-confirmar').value = '';

    mostrarToast('Senha alterada com sucesso!');
}

// ===== TOAST =====
function mostrarToast(mensagem) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = mensagem;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('toast-visible'), 10);
    setTimeout(() => {
        toast.classList.remove('toast-visible');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== SIDEBAR =====
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('recolhida');
}

