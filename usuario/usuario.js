// ==========================================
// CONTROLE DE INTERFACE (Telas e Abas)
// ==========================================

function toggleAuth(type) {
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const btnLogin = document.getElementById('btn-login');
    const btnRegister = document.getElementById('btn-register');

    if (type === 'login') {
        formLogin.classList.replace('d-none', 'd-block');
        formRegister.classList.replace('d-block', 'd-none');
        btnLogin.classList.add('active');
        btnRegister.classList.remove('active');
    } else {
        formRegister.classList.replace('d-none', 'd-block');
        formLogin.classList.replace('d-block', 'd-none');
        btnRegister.classList.add('active');
        btnLogin.classList.remove('active');
    }
}

function showPanel(panelId, element) {
    document.querySelectorAll('.dashboard-panel').forEach(panel => {
        panel.classList.replace('d-block', 'd-none');
    });

    document.getElementById('panel-' + panelId).classList.replace('d-none', 'd-block');

    document.querySelectorAll('#dashboard-menu .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    element.classList.add('active');
}

// ==========================================
// LÓGICA DE BANCO DE DADOS (LocalStorage)
// ==========================================

// Quando a página carregar, executa os scripts
document.addEventListener('DOMContentLoaded', () => {

    // 1. SISTEMA DE CADASTRO
    const formRegister = document.getElementById('form-register');
    if (formRegister) {
        formRegister.addEventListener('submit', function (e) {
            e.preventDefault(); // Evita recarregar a página

            const nome = document.getElementById('regNome').value;
            const email = document.getElementById('regEmail').value;
            const senha = document.getElementById('regSenha').value;

            // Busca os usuários que já existem ou cria um array vazio
            let usuarios = JSON.parse(localStorage.getItem('devcare_db_users')) || [];

            // Verifica se o e-mail já existe
            if (usuarios.some(user => user.email === email)) {
                alert('Oops! Este e-mail já está cadastrado.');
                return;
            }

            // Cria o novo usuário e salva no "Banco"
            const novoUsuario = { nome, email, senha };
            usuarios.push(novoUsuario);
            localStorage.setItem('devcare_db_users', JSON.stringify(usuarios));

            // Já faz o login automaticamente após cadastrar
            localStorage.setItem('devcare_session', JSON.stringify(novoUsuario));
            
            alert('Cadastro realizado com sucesso! Bem-vindo(a) à DevCare.');
            window.location.href = 'dashboard.html';
        });
    }

    // 2. SISTEMA DE LOGIN
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const senha = document.getElementById('loginSenha').value;

            // Busca a lista de usuários no banco
            let usuarios = JSON.parse(localStorage.getItem('devcare_db_users')) || [];

            // Tenta achar um usuário com o mesmo e-mail e senha
            const usuarioLogado = usuarios.find(user => user.email === email && user.senha === senha);

            if (usuarioLogado) {
                // Cria a sessão e manda pro painel
                localStorage.setItem('devcare_session', JSON.stringify(usuarioLogado));
                window.location.href = 'dashboard.html';
            } else {
                alert('E-mail ou senha incorretos! Tente novamente.');
            }
        });
    }

    // 3. PROTEÇÃO E DADOS DO PAINEL (Dashboard)
    // Verifica se estamos na página dashboard.html
    if (window.location.pathname.includes('dashboard.html')) {
        
        // Busca quem está logado
        const sessaoAtual = JSON.parse(localStorage.getItem('devcare_session'));

        // Se não tiver ninguém logado, expulsa para o Login
        if (!sessaoAtual) {
            alert('Você precisa fazer login para acessar esta página.');
            window.location.href = 'auth.html';
        } else {
            // Se estiver logado, injeta os dados na tela
            // Pega só o primeiro nome
            const primeiroNome = sessaoAtual.nome.split(' ')[0]; 

            document.getElementById('user-display-name').textContent = `Olá, ${primeiroNome}!`;
            document.getElementById('user-display-email').textContent = sessaoAtual.email;

            document.getElementById('user-input-nome').value = sessaoAtual.nome;
            document.getElementById('user-input-email').value = sessaoAtual.email;
        }
    }
});

// 4. SISTEMA DE LOGOUT
function fazerLogout() {
    // Confirma se o usuário quer mesmo sair
    if(confirm('Tem certeza que deseja sair da sua conta?')) {
        // Apaga a sessão e volta pra Home
        localStorage.removeItem('devcare_session');
        window.location.href = '../index.html';
    }
}