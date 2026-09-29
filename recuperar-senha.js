
// Função para mostrar mensagem de erro
function enviarRecuperacao() {
    const email = document.getElementById('email');

    // Limpa erros anteriores
    const erroAnterior = document.querySelector('.erro-msg');
    if (erroAnterior) erroAnterior.remove();
    email.closest('.input-wrapper').style.borderColor = '#dfe3eb';

    // Valida e-mail
    if (email.value.trim() === '') {
        mostrarErro(email, 'O e-mail é obrigatório.');
        return;
    } else if (!email.value.includes('@') || !email.value.includes('.')) {
        mostrarErro(email, 'Digite um e-mail válido.');
        return;
    }

    // Mostra tela de confirmação
    document.getElementById('email-enviado').textContent = email.value;
    document.getElementById('tela-recuperar').style.display = 'none';
    document.getElementById('tela-confirmacao').style.display = 'flex';
    lucide.createIcons();
}