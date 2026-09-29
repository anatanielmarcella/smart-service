// ===== TOGGLE SENHA LOGIN =====
function togglePassword() {
    const input = document.getElementById('password');
    const icon = document.getElementById('eye-icon');

    if (input.type === 'password') {
        input.type = 'text';
        icon.setAttribute('data-lucide', 'eye-off');
    } else {
        input.type = 'password';
        icon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
}

// ===== VALIDAÇÃO LOGIN =====
function validarLogin() {
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    let valido = true;

    limparErro(email);
    limparErro(password);

    if (email.value.trim() === '') {
        mostrarErro(email, 'O e-mail é obrigatório.');
        valido = false;
    } else if (!email.value.includes('@') || !email.value.includes('.')) {
        mostrarErro(email, 'Digite um e-mail válido.');
        valido = false;
    }

    if (password.value.trim() === '') {
        mostrarErro(password, 'A senha é obrigatória.');
        valido = false;
    } else if (password.value.length < 6) {
        mostrarErro(password, 'A senha deve ter pelo menos 6 caracteres.');
        valido = false;
    }

    if (!valido) return false;

    // ===== VERIFICA CREDENCIAIS =====
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u =>
        u.email === email.value.trim() && u.senha === password.value
    );

    if (!usuario) {
        mostrarErro(email, 'E-mail ou senha incorretos.');
        return false;
    }

    // Salva usuário logado
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    window.location.href = 'dashboard.html';
    return false;
}

// ===== ERROS =====
function mostrarErro(input, mensagem) {
    input.closest('.input-wrapper').style.borderColor = '#e53e3e';
    const erro = document.createElement('span');
    erro.className = 'erro-msg';
    erro.textContent = mensagem;
    input.closest('.input-wrapper').insertAdjacentElement('afterend', erro);
}

function limparErro(input) {
    input.closest('.input-wrapper').style.borderColor = '#dfe3eb';
    const erroAnterior = input.closest('.input-group').querySelector('.erro-msg');
    if (erroAnterior) erroAnterior.remove();
}

// ===== SALVAR DADOS CADASTRO =====
function salvarDadosCadastro() {
    const nome = document.getElementById('nome')?.value;
    const cpf = document.getElementById('cpf')?.value;
    const rg = document.getElementById('rg')?.value;
    const nascimento = document.getElementById('nascimento')?.value;
    const telefone = document.getElementById('telefone')?.value;
    const cep = document.getElementById('cep')?.value;
    const numero = document.getElementById('numero')?.value;
    const email = document.getElementById('email')?.value;
    const senha = document.getElementById('password')?.value;

    // Salva dados temporários para confirmação
    const dados = { nome, cpf, rg, nascimento, telefone, cep, numero, email, senha };
    localStorage.setItem('dadosCadastro', JSON.stringify(dados));
    window.location.href = 'confirmacao.html';
}

// ===== VALIDAÇÃO CADASTRO =====
function validarCadastro() {
    let valido = true;

    const campos = [
        { id: 'nome', msg: 'O nome é obrigatório.' },
        { id: 'rg', msg: 'O RG é obrigatório.' },
        { id: 'nascimento', msg: 'A data de nascimento é obrigatória.' },
        { id: 'numero', msg: 'O número é obrigatório.' },
    ];

    document.querySelectorAll('.erro-msg').forEach(e => e.remove());
    document.querySelectorAll('.input-wrapper').forEach(w => {
        w.style.borderColor = '#dfe3eb';
    });

    campos.forEach(campo => {
        const input = document.getElementById(campo.id);
        if (!input) return;
        if (input.value.trim() === '') {
            mostrarErro(input, campo.msg);
            valido = false;
        }
    });

    const cpf = document.getElementById('cpf');
    if (cpf.value.trim() === '') {
        mostrarErro(cpf, 'O CPF é obrigatório.');
        valido = false;
    } else if (cpf.value.replace(/\D/g, '').length !== 11) {
        mostrarErro(cpf, 'Digite um CPF válido com 11 dígitos.');
        valido = false;
    }

    const telefone = document.getElementById('telefone');
    if (telefone.value.trim() === '') {
        mostrarErro(telefone, 'O telefone é obrigatório.');
        valido = false;
    } else if (telefone.value.replace(/\D/g, '').length < 10) {
        mostrarErro(telefone, 'Digite um telefone válido.');
        valido = false;
    }

    const cep = document.getElementById('cep');
    if (cep.value.trim() === '') {
        mostrarErro(cep, 'O CEP é obrigatório.');
        valido = false;
    } else if (cep.value.replace(/\D/g, '').length !== 8) {
        mostrarErro(cep, 'Digite um CEP válido com 8 dígitos.');
        valido = false;
    }

    const email = document.getElementById('email');
    if (email.value.trim() === '') {
        mostrarErro(email, 'O e-mail é obrigatório.');
        valido = false;
    } else if (!email.value.includes('@') || !email.value.includes('.')) {
        mostrarErro(email, 'Digite um e-mail válido.');
        valido = false;
    }

    const senha = document.getElementById('password');
    if (senha.value.trim() === '') {
        mostrarErro(senha, 'A senha é obrigatória.');
        valido = false;
    } else if (senha.value.length < 6) {
        mostrarErro(senha, 'A senha deve ter pelo menos 6 caracteres.');
        valido = false;
    }

    return valido;
}