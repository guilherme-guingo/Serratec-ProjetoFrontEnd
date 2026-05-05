const API_USERS = "https://69f9fd8fc509a40d3aa3b0ea.mockapi.io/projetoFront/usuarios";

// --- FUNÇÕES DE INTERFACE ---

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

// --- INICIALIZAÇÃO E EVENTOS ---

document.addEventListener('DOMContentLoaded', () => {

    // Validação customizada de inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('invalid', function () {
            if (this.validity.valueMissing) {
                this.setCustomValidity('Por favor, preencha este campo.');
            } else if (this.validity.typeMismatch && this.type === 'email') {
                this.setCustomValidity('Por favor, insira um endereço de e-mail válido.');
            } else if (this.validity.tooShort) {
                this.setCustomValidity(`Este campo deve ter no mínimo ${this.getAttribute('minlength')} caracteres.`);
            } else {
                this.setCustomValidity('Valor inválido.');
            }
        });
        input.addEventListener('input', function () {
            this.setCustomValidity('');
        });
    });

    // Registro de Usuário
    const formRegister = document.getElementById('form-register');
    if (formRegister) {
        formRegister.addEventListener('submit', async function (e) {
            e.preventDefault(); 
            const btnSubmit = document.getElementById('btn-submit-register');
            if(btnSubmit) { btnSubmit.disabled = true; btnSubmit.innerText = "Carregando..."; }

            const nome = document.getElementById('regNome').value;
            const email = document.getElementById('regEmail').value;
            const senha = document.getElementById('regSenha').value;

            if (senha.length < 6) {
                alert('A senha deve ter no mínimo 6 caracteres.');
                if(btnSubmit) { btnSubmit.disabled = false; btnSubmit.innerText = "Finalizar Cadastro"; }
                return;
            }

            try {
                const checkResponse = await fetch(`${API_USERS}?email=${email}`);
                const checkUsers = await checkResponse.json();

                if (Array.isArray(checkUsers) && checkUsers.length > 0) {
                    alert('Oops! Este e-mail já está cadastrado.');
                    if(btnSubmit) { btnSubmit.disabled = false; btnSubmit.innerText = "Finalizar Cadastro"; }
                    return;
                }

                const novoUsuario = { nome, email, senha, enderecos: [], pedidos: [] };
                const response = await fetch(API_USERS, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novoUsuario)
                });

                if (response.ok) {
                    const usuarioCriado = await response.json();
                    localStorage.setItem('devcare_session', JSON.stringify(usuarioCriado));
                    alert('Cadastro realizado com sucesso! Bem-vindo(a) à DevCare.');
                    window.location.href = 'dashboard.html';
                } else {
                    throw new Error("Falha ao criar conta.");
                }
            } catch (error) {
                console.error("Erro no cadastro:", error);
                alert("Erro ao conectar ao servidor. Tente novamente mais tarde.");
                if(btnSubmit) { btnSubmit.disabled = false; btnSubmit.innerText = "Finalizar Cadastro"; }
            }
        });
    }

    // Login de Usuário
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async function (e) {
            e.preventDefault();
            const btnSubmit = document.getElementById('btn-submit-login');
            if(btnSubmit) { btnSubmit.disabled = true; btnSubmit.innerText = "Carregando..."; }

            const email = document.getElementById('loginEmail').value;
            const senha = document.getElementById('loginSenha').value;

            try {
                const response = await fetch(`${API_USERS}?email=${email}`);
                const usuarios = await response.json();
                
                const usuarioLogado = usuarios.find(user => user.email === email && user.senha === senha);

                if (usuarioLogado) {
                    localStorage.setItem('devcare_session', JSON.stringify(usuarioLogado));
                    window.location.href = 'dashboard.html';
                } else {
                    alert('E-mail ou senha incorretos! Tente novamente.');
                    if(btnSubmit) { btnSubmit.disabled = false; btnSubmit.innerText = "Entrar na minha conta"; }
                }
            } catch (error) {
                console.error("Erro no login:", error);
                alert("Erro ao conectar ao servidor. Tente novamente mais tarde.");
                if(btnSubmit) { btnSubmit.disabled = false; btnSubmit.innerText = "Entrar na minha conta"; }
            }
        });
    }

    // Controle do Dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        let sessaoAtual = JSON.parse(localStorage.getItem('devcare_session'));

        if (!sessaoAtual) {
            window.location.href = 'auth.html';
        } else {
            sincronizarSessao(sessaoAtual.id).then((dadosAtualizados) => {
                if(dadosAtualizados) {
                    // Mescla inteligente: mantém pedidos locais se forem mais recentes que os da API
                    const pedidosLocais = sessaoAtual.pedidos || [];
                    const pedidosServidor = dadosAtualizados.pedidos || [];
                    
                    sessaoAtual = {
                        ...dadosAtualizados,
                        pedidos: pedidosServidor.length >= pedidosLocais.length ? pedidosServidor : pedidosLocais
                    };
                    localStorage.setItem('devcare_session', JSON.stringify(sessaoAtual));
                }
                inicializarDashboard(sessaoAtual);
            });
        }
    }

    // Cadastro de Endereço (Lógica de CEP e Submit)
    const formEndereco = document.getElementById('form-endereco');
    if (formEndereco) {
        const cepInput = document.getElementById('end-cep');
        const numeroInput = document.getElementById('end-numero');

        if (cepInput) {
            cepInput.addEventListener('blur', async function() {
                let cep = this.value.replace(/\D/g, '');
                if (cep.length === 8) {
                    try {
                        let response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                        let data = await response.json();
                        if (!data.erro) {
                            document.getElementById('end-rua').value = data.logradouro || '';
                            document.getElementById('end-bairro').value = data.bairro || '';
                            document.getElementById('end-cidade').value = data.localidade || '';
                            document.getElementById('end-uf').value = data.uf || '';
                            document.getElementById('end-numero').focus();
                        }
                    } catch (e) { console.error(e); }
                }
            });
        }

        formEndereco.addEventListener('submit', async (e) => {
            e.preventDefault();
            let sessaoAtual = JSON.parse(localStorage.getItem('devcare_session'));
            if (!sessaoAtual) return;
            
            if (!sessaoAtual.enderecos) sessaoAtual.enderecos = [];
            
            const novoEnd = {
                titulo: document.getElementById('end-titulo').value,
                cep: document.getElementById('end-cep').value,
                rua: document.getElementById('end-rua').value,
                numero: document.getElementById('end-numero').value,
                complemento: document.getElementById('end-complemento').value,
                bairro: document.getElementById('end-bairro').value,
                cidade: document.getElementById('end-cidade').value,
                uf: document.getElementById('end-uf').value
            };

            const index = parseInt(document.getElementById('endereco-index').value);
            if (index === -1) {
                sessaoAtual.enderecos.push(novoEnd);
            } else {
                sessaoAtual.enderecos[index] = novoEnd;
            }

            const sucesso = await salvarAlteracoesAPI(sessaoAtual);
            if(sucesso) {
                bootstrap.Modal.getInstance(document.getElementById('modalEndereco')).hide();
                renderizarEnderecos();
            }
        });
    }
});

// --- FUNÇÕES DE APOIO E API ---

async function sincronizarSessao(id) {
    try {
        const response = await fetch(`${API_USERS}/${id}`);
        if(response.ok) return await response.json();
    } catch(e) { console.error("Erro na sincronização:", e); }
    return null;
}

async function salvarAlteracoesAPI(sessaoAtual) {
    try {
        const response = await fetch(`${API_USERS}/${sessaoAtual.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessaoAtual)
        });
        if(response.ok) {
            const dados = await response.json();
            localStorage.setItem('devcare_session', JSON.stringify(dados));
            return true;
        }
    } catch(e) { console.error(e); }
    return false;
}

function inicializarDashboard(sessaoAtual) {
    const primeiroNome = sessaoAtual.nome ? sessaoAtual.nome.split(' ')[0] : 'Usuário'; 
    document.getElementById('user-display-name').textContent = `Olá, ${primeiroNome}!`;
    document.getElementById('user-display-email').textContent = sessaoAtual.email;

    document.getElementById('user-input-nome').value = sessaoAtual.nome || '';
    document.getElementById('user-input-email').value = sessaoAtual.email || '';
    document.getElementById('user-input-cpf').value = sessaoAtual.cpf || '';
    document.getElementById('user-input-telefone').value = sessaoAtual.telefone || '';

    renderizarEnderecos();
    renderizarHistorico();
}

// --- RENDERIZAÇÃO DE COMPONENTES ---

function renderizarEnderecos() {
    let sessaoAtual = JSON.parse(localStorage.getItem('devcare_session'));
    const lista = document.getElementById('lista-enderecos');
    if (!lista || !sessaoAtual) return;

    const enderecos = sessaoAtual.enderecos || [];
    if (enderecos.length === 0) {
        lista.innerHTML = '<p class="text-muted text-center my-4">Nenhum endereço cadastrado.</p>';
        return;
    }

    lista.innerHTML = enderecos.map((end, i) => `
        <div class="card p-3 border-primary-green mb-3">
            <div class="d-flex justify-content-between">
                <div>
                    <h6 class="fw-bold mb-1"><i class="fas fa-home me-2 text-muted"></i>${end.titulo}</h6>
                    <p class="mb-0 text-muted small">${end.rua}, ${end.numero}${end.complemento ? ' - ' + end.complemento : ''}<br>${end.cidade}/${end.uf}</p>
                </div>
                <div class="text-end">
                    <button class="btn btn-sm btn-outline-secondary" onclick="abrirModalEndereco(${i})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="removerEndereco(${i})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderizarHistorico() {
    let sessaoAtual = JSON.parse(localStorage.getItem('devcare_session'));
    const lista = document.getElementById('lista-historico');
    if (!lista || !sessaoAtual) return;

    const pedidos = sessaoAtual.pedidos || [];

    if (pedidos.length === 0) {
        lista.innerHTML = '<p class="text-muted text-center my-4">Você ainda não realizou nenhuma compra.</p>';
        return;
    }

    lista.innerHTML = [...pedidos].reverse().map((pedido, i) => {
        const itensHtml = pedido.itens.map(item => `
            <div class="d-flex justify-content-between small border-bottom py-1">
                <span>${item.quantidade}x ${item.nome}</span>
                <span class="text-muted">${(item.preco * item.quantidade).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
            </div>
        `).join('');

        return `
        <div class="card p-3 mb-3 border-0 shadow-sm" style="border-left: 5px solid #28a745 !important;">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="fw-bold mb-0">Pedido #${pedidos.length - i}</h6>
                    <small class="text-muted">${pedido.data}</small>
                </div>
                <div class="text-end">
                    <h5 class="fw-bold text-success mb-0">${pedido.total}</h5>
                </div>
            </div>
            <div class="mt-3 bg-light p-2 rounded">
                ${itensHtml}
            </div>
        </div>`;
    }).join('');
}

// Funções auxiliares
function fazerLogout() {
    if(confirm('Deseja sair?')) {
        localStorage.removeItem('devcare_session');
        window.location.replace('../index.html');
    }
}

// Função para atualizar Nome, CPF e Telefone
async function salvarDadosPerfil() {
    let sessaoAtual = JSON.parse(localStorage.getItem('devcare_session'));
    if (!sessaoAtual) return;

    const novoNome = document.getElementById('user-input-nome').value;
    const novoCpf = document.getElementById('user-input-cpf').value;
    const novoTelefone = document.getElementById('user-input-telefone').value;

    if (!novoNome) {
        alert("O nome completo é obrigatório.");
        return;
    }

    sessaoAtual.nome = novoNome;
    sessaoAtual.cpf = novoCpf;
    sessaoAtual.telefone = novoTelefone;

    const btn = document.querySelector('button[onclick="salvarDadosPerfil()"]');
    const textoOriginal = btn.innerText;
    btn.innerText = "Salvando...";
    btn.disabled = true;

    const sucesso = await salvarAlteracoesAPI(sessaoAtual);

    if (sucesso) {
        const primeiroNome = novoNome.split(' ')[0];
        document.getElementById('user-display-name').textContent = `Olá, ${primeiroNome}!`;
        alert("Seus dados foram atualizados com sucesso!");
    } else {
        alert("Erro ao salvar os dados no servidor. Tente novamente.");
    }

    btn.innerText = textoOriginal;
    btn.disabled = false;
}

// Função para Excluir a Conta 
async function excluirConta() {
    if (!confirm("Tem certeza ABSOLUTA que deseja excluir sua conta? Esta ação apagará todos os seus dados e não pode ser desfeita.")) {
        return;
    }

    let sessaoAtual = JSON.parse(localStorage.getItem('devcare_session'));
    if (!sessaoAtual) return;

    try {
        const response = await fetch(`${API_USERS}/${sessaoAtual.id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert("Sua conta foi excluída com sucesso. Sentiremos sua falta!");
            localStorage.removeItem('devcare_session');
            window.location.replace('../index.html');
        } else {
            alert("Erro ao excluir conta. Tente novamente.");
        }
    } catch (error) {
        console.error("Erro ao excluir conta:", error);
        alert("Erro de conexão ao tentar excluir a conta.");
    }
}

function abrirModalEndereco(index = -1) {
    const form = document.getElementById('form-endereco');
    const inputIndex = document.getElementById('endereco-index');
    const tituloModal = document.getElementById('modalEnderecoTitle');
    
    inputIndex.value = index;

    if (index === -1) {
        form.reset(); 
        tituloModal.innerText = 'Novo Endereço';
    } else {
        let sessaoAtual = JSON.parse(localStorage.getItem('devcare_session'));
        let end = sessaoAtual.enderecos[index];
        
        document.getElementById('end-titulo').value = end.titulo;
        document.getElementById('end-cep').value = end.cep;
        document.getElementById('end-rua').value = end.rua;
        document.getElementById('end-numero').value = end.numero;
        document.getElementById('end-complemento').value = end.complemento || '';
        document.getElementById('end-bairro').value = end.bairro;
        document.getElementById('end-cidade').value = end.cidade;
        document.getElementById('end-uf').value = end.uf;
        
        tituloModal.innerText = 'Editar Endereço';
    }

    const modalElement = document.getElementById('modalEndereco');
    let modalEndereco = bootstrap.Modal.getInstance(modalElement);
    if (!modalEndereco) {
        modalEndereco = new bootstrap.Modal(modalElement);
    }
    modalEndereco.show();
}
async function removerEndereco(index) {
    let sessaoAtual = JSON.parse(localStorage.getItem('devcare_session'));
    sessaoAtual.enderecos.splice(index, 1);
    if(await salvarAlteracoesAPI(sessaoAtual)) renderizarEnderecos();
}

document.addEventListener('DOMContentLoaded', () => {
    const formAlterarSenha = document.getElementById('form-alterar-senha');
    
    if (formAlterarSenha) {
        formAlterarSenha.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            let sessaoAtual = JSON.parse(localStorage.getItem('devcare_session'));
            if (!sessaoAtual) return;

            const senhaAtual = document.getElementById('senha-atual').value;
            const senhaNova = document.getElementById('senha-nova').value;
            const senhaNovaConfirma = document.getElementById('senha-nova-confirma').value;

            if (senhaAtual !== sessaoAtual.senha) {
                alert("A senha atual informada está incorreta.");
                return;
            }

            if (senhaNova !== senhaNovaConfirma) {
                alert("As novas senhas digitadas não coincidem.");
                return;
            }

            sessaoAtual.senha = senhaNova;
            
            const btn = this.querySelector('button[type="submit"]');
            const textoOriginal = btn.innerText;
            btn.innerText = "Atualizando...";
            btn.disabled = true;

            const sucesso = await salvarAlteracoesAPI(sessaoAtual);

            if (sucesso) {
                alert("Sua senha foi atualizada com sucesso!");
                this.reset();
            } else {
                alert("Erro de comunicação com a API. A senha não foi salva.");
            }

            btn.innerText = textoOriginal;
            btn.disabled = false;
        });
    }
});