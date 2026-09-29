
// Recupera os dados do cadastro do localStorage e exibe na tela de confirmação
const dados = JSON.parse(localStorage.getItem('dadosCadastro'));

if (dados) {
    document.getElementById('conf-nome-cpf').textContent =
        `${dados.nome} • CPF: ${dados.cpf} • RG: ${dados.rg}`;
    document.getElementById('conf-contato').textContent =
        `${dados.telefone} • ${dados.email}`;
    document.getElementById('conf-endereco').textContent =
        `CEP: ${dados.cep} • Nº ${dados.numero}`;
}

function confirmarCadastro() {
    const termos = document.getElementById('termos-check');
    if (!termos.checked) {
        mostrarToast('Você precisa aceitar os Termos de Uso para continuar.');
        return;
    }

    const dados = JSON.parse(localStorage.getItem('dadosCadastro') || '{}');

    // Salva usuário na lista de usuários
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

    // Verifica se email já existe
    const emailExiste = usuarios.some(u => u.email === dados.email);
    if (emailExiste) {
        mostrarToast('Este e-mail já está cadastrado.');
        return;
    }

    const novoUsuario = {
        id: Date.now().toString(),
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha,
        telefone: dados.telefone,
        cpf: dados.cpf,
        tipo: 'cliente' // padrão ao se cadastrar
    };

    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // Mostra tela de sucesso
    document.getElementById('tela-confirmacao').style.display = 'none';
    document.getElementById('tela-sucesso').style.display = 'flex';
    lucide.createIcons();
    localStorage.removeItem('dadosCadastro');
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