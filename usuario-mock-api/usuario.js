const API_USERS = "https://69f9fd8fc509a40d3aa3b0ea.mockapi.io/projetoFront/usuarios";

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

document.addEventListener('DOMContentLoaded', () => {

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
                if (!response.ok) {
                     alert('E-mail ou senha incorretos! Tente novamente.');
                     if(btnSubmit) { btnSubmit.disabled = false; btnSubmit.innerText = "Entrar na minha conta"; }
                     return;
                }

                const usuarios = await response.json();
                
                if (!Array.isArray(usuarios) || usuarios.length === 0) {
                    alert('E-mail ou senha incorretos! Tente novamente.');
                    if(btnSubmit) { btnSubmit.disabled = false; btnSubmit.innerText = "Entrar na minha conta"; }
                    return;
                }

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

    if (window.location.pathname.includes('dashboard.html')) {
        
        let sessaoAtual = JSON.parse(localStorage.getItem('devcare_session'));

        if (!sessaoAtual) {
            //alert('Você precisa fazer login para acessar esta página.');
            window.location.href = 'auth.html';
        } else {
            sincronizarSessao(sessaoAtual.id).then((dadosAtualizados) => {
                if(dadosAtualizados) {
                    sessaoAtual = dadosAtualizados;
                    localStorage.setItem('devcare_session', JSON.stringify(sessaoAtual));
                }
                inicializarDashboard(sessaoAtual);
            });
        }
    }

    const formEndereco = document.getElementById('form-endereco');
    if (formEndereco) {
        const cepInput = document.getElementById('end-cep');
        const numeroInput = document.getElementById('end-numero');

        if (numeroInput) {
            numeroInput.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '');
            });
        }

        if (cepInput) {
            cepInput.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '');
            });

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
                        } else {
                            alert('CEP não encontrado.');
                        }
                    } catch (error) {
                        console.error('Erro ao buscar o CEP:', error);
                    }
                }
            });
        }

        formEndereco.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const cepDigitado = document.getElementById('end-cep').value;
            const ufDigitada = document.getElementById('end-uf').value;
            const numeroDigitado = document.getElementById('end-numero').value;
            
            if (typeof validarCEP === 'function' && !validarCEP(cepDigitado)) {
                alert('CEP inválido! Digite 8 números.');
                return;
            }
            if (typeof validarUF === 'function' && !validarUF(ufDigitada)) {
                alert('UF inválida! Digite a sigla do estado (Ex: SP, RJ).');
                return;
            }
            if (typeof validarNumero === 'function' && !validarNumero(numeroDigitado)) {
                alert('Número inválido! O campo não pode ficar vazio.');
                return;
            }

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
                const modalEl = document.getElementById('modalEndereco');
                const modalInst = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                if (modalInst) modalInst.hide();
                renderizarEnderecos();
            } else {
                alert("Erro ao salvar endereço no servidor.");
            }
        });
    }
});

async function sincronizarSessao(id) {
    try {
        const response = await fetch(`${API_USERS}/${id}`);
        if(response.ok) {
            return await response.json();
        }
    } catch(e) {
        console.error("Erro na sincronização:", e);
    }
    return null;
}

function inicializarDashboard(sessaoAtual) {
    const primeiroNome = sessaoAtual.nome ? sessaoAtual.nome.split(' ')[0] : 'Usuário'; 

    document.getElementById('user-display-name').textContent = `Olá, ${primeiroNome}!`;
    document.getElementById('user-display-email').textContent = sessaoAtual.email;

    document.getElementById('user-input-nome').value = sessaoAtual.nome || '';
    document.getElementById('user-input-email').value = sessaoAtual.email || '';
    const cpfInput = document.getElementById('user-input-cpf');
    const telInput = document.getElementById('user-input-telefone');
    
    cpfInput.value = sessaoAtual.cpf || '';
    telInput.value = sessaoAtual.telefone || '';

    if (cpfInput) {
        cpfInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, "");
            if (value.length > 11) value = value.slice(0, 11);
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            this.value = value;
        });
        if(cpfInput.value) cpfInput.dispatchEvent(new Event('input'));
    }

    if (telInput) {
        telInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, "");
            if (value.length > 11) value = value.slice(0, 11);
            value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
            value = value.replace(/(\d)(\d{4})$/, "$1-$2");
            this.value = value;
        });
        if(telInput.value) telInput.dispatchEvent(new Event('input'));
    }

    renderizarEnderecos();
    renderizarHistorico();

    const formAlterarSenha = document.getElementById('form-alterar-senha');
    if (formAlterarSenha) {
        formAlterarSenha.addEventListener('submit', async function(e) {
            e.preventDefault();
            const senhaAtual = document.getElementById('senha-atual').value;
            const novaSenha = document.getElementById('senha-nova').value;
            const novaSenhaConfirma = document.getElementById('senha-nova-confirma').value;

            let sessao = JSON.parse(localStorage.getItem('devcare_session'));
            if (!sessao) return;

            if (senhaAtual !== sessao.senha) {
                alert('A senha atual está incorreta.');
                return;
            }

            if (novaSenha !== novaSenhaConfirma) {
                alert('A nova senha e a confirmação não coincidem.');
                return;
            }

            if (novaSenha.length < 6) {
                alert('A nova senha deve ter no mínimo 6 caracteres.');
                return;
            }

            sessao.senha = novaSenha;
            const sucesso = await salvarAlteracoesAPI(sessao);
            if(sucesso){
                alert('Senha alterada com sucesso!');
                formAlterarSenha.reset();
            } else {
                alert('Erro ao atualizar a senha no servidor.');
            }
        });
    }
}

function fazerLogout() {
    if(confirm('Tem certeza que deseja sair da sua conta?')) {
        localStorage.removeItem('devcare_session');
        window.location.href = '../index.html';
    }
}

async function excluirConta() {
    if(confirm('Tem certeza que deseja EXCLUIR sua conta DE FORMA PERMANENTE? Esta ação não pode ser desfeita.')) {
        let sessaoAtual = JSON.parse(localStorage.getItem('devcare_session'));
        if (!sessaoAtual) return;

        try {
            const response = await fetch(`${API_USERS}/${sessaoAtual.id}`, {
                method: 'DELETE'
            });

            if(response.ok) {
                localStorage.removeItem('devcare_session');
                alert('Sua conta foi excluída com sucesso.');
                window.location.href = '../index.html';
            } else {
                throw new Error("Falha ao deletar a conta");
            }
        } catch(error) {
            console.error("Erro ao deletar conta:", error);
            alert("Erro ao excluir sua conta. Tente novamente.");
        }
    }
}

async function salvarAlteracoesAPI(sessaoAtual) {
    try {
        const response = await fetch(`${API_USERS}/${sessaoAtual.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessaoAtual)
        });

        if(response.ok) {
            const dadosAtualizados = await response.json();
            localStorage.setItem('devcare_session', JSON.stringify(dadosAtualizados));
            return true;
        }
    } catch(error) {
        console.error("Erro na API (PUT):", error);
    }
    return false;
}

async function salvarDadosPerfil() {
    let sessaoAtual = JSON.parse(localStorage.getItem('devcare_session'));
    if (!sessaoAtual) return;

    sessaoAtual.nome = document.getElementById('user-input-nome').value;
    sessaoAtual.cpf = document.getElementById('user-input-cpf').value;
    sessaoAtual.telefone = document.getElementById('user-input-telefone').value;

    const sucesso = await salvarAlteracoesAPI(sessaoAtual);
    
    if(sucesso) {
        alert('Dados atualizados com sucesso!');
        document.getElementById('user-display-name').textContent = `Olá, ${sessaoAtual.nome.split(' ')[0]}!`;
    } else {
        alert('Erro ao atualizar os dados no servidor.');
    }
}

function renderizarEnderecos() {
    let sessaoAtual = JSON.parse(localStorage.getItem('devcare_session'));
    if (!sessaoAtual) return;

    const lista = document.getElementById('lista-enderecos');
    if (!lista) return;

    const enderecos = sessaoAtual.enderecos || [];

    if (enderecos.length === 0) {
        lista.innerHTML = '<p class="text-muted text-center my-4">Nenhum endereço cadastrado.</p>';
        return;
    }

    lista.innerHTML = '';
    enderecos.forEach((end, i) => {
        const complHtml = end.complemento ? ` - ${end.complemento}` : '';
        lista.innerHTML += `
        <div class="card p-3 border-primary-green mb-3">
            <div class="d-flex justify-content-between">
                <div>
                    <h6 class="fw-bold mb-1"><i class="fas fa-home me-2 text-muted"></i>${end.titulo}</h6>
                    <p class="mb-0 text-muted small">${end.rua}, ${end.numero}${complHtml} - ${end.bairro}<br>${end.cidade}, ${end.uf} - ${end.cep}</p>
                </div>
                <div class="text-end">
                    <button class="btn btn-sm btn-outline-secondary mb-1" onclick="abrirModalEndereco(${i})"><i class="fas fa-edit"></i></button><br>
                    <button class="btn btn-sm btn-outline-danger" onclick="removerEndereco(${i})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>`;
    });
}

function abrirModalEndereco(index = -1) {
    const modalEl = document.getElementById('modalEndereco');
    if (!modalEl) return;

    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    document.getElementById('endereco-index').value = index;
    
    if (index !== -1) {
        let sessaoAtual = JSON.parse(localStorage.getItem('devcare_session'));
        const end = sessaoAtual.enderecos[index];
        document.getElementById('modalEnderecoTitle').innerText = 'Editar Endereço';
        document.getElementById('end-titulo').value = end.titulo;
        document.getElementById('end-cep').value = end.cep;
        document.getElementById('end-rua').value = end.rua;
        document.getElementById('end-numero').value = end.numero;
        document.getElementById('end-complemento').value = end.complemento || '';
        document.getElementById('end-bairro').value = end.bairro;
        document.getElementById('end-cidade').value = end.cidade;
        document.getElementById('end-uf').value = end.uf;
    } else {
        document.getElementById('modalEnderecoTitle').innerText = 'Novo Endereço';
        document.getElementById('form-endereco').reset();
    }
    
    modal.show();
}

async function removerEndereco(index) {
    if (!confirm('Deseja realmente remover este endereço?')) return;
    
    let sessaoAtual = JSON.parse(localStorage.getItem('devcare_session'));
    if (!sessaoAtual || !sessaoAtual.enderecos) return;
    
    sessaoAtual.enderecos.splice(index, 1);
    
    const sucesso = await salvarAlteracoesAPI(sessaoAtual);
    if(sucesso) {
        renderizarEnderecos();
    } else {
        alert("Erro ao remover endereço do servidor.");
    }
}

function renderizarHistorico() {
    let sessaoAtual = JSON.parse(localStorage.getItem('devcare_session'));
    if (!sessaoAtual) return;

    const lista = document.getElementById('lista-historico');
    if (!lista) return;

    const pedidos = sessaoAtual.pedidos || [];

    if (pedidos.length === 0) {
        lista.innerHTML = '<p class="text-muted text-center my-4">Você ainda não realizou nenhuma compra.</p>';
        return;
    }

    lista.innerHTML = '';
    const pedidosReversos = [...pedidos].reverse();

    pedidosReversos.forEach((pedido, i) => {
        const numPedido = pedidos.length - i; 
        
        let totalDisplay = pedido.total;
        if (typeof pedido.total === 'number') {
            totalDisplay = pedido.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }

        let itensResumo = pedido.itens.map(item => `${item.quantidade}x ${item.nome}`).join(', ');
        if (itensResumo.length > 80) itensResumo = itensResumo.substring(0, 80) + '...';

        let itensDetalhadosHtml = pedido.itens.map(item => {
            const itemTotal = (parseFloat(item.preco) * parseInt(item.quantidade));
            const itemTotalDisplay = !isNaN(itemTotal) ? itemTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '';
            return `
            <div class="d-flex justify-content-between small border-bottom py-1 border-opacity-25">
                <span>${item.quantidade}x ${item.nome}</span>
                <span class="text-muted">${itemTotalDisplay}</span>
            </div>
            `;
        }).join('');

        lista.innerHTML += `
        <div class="card p-3 border-primary-green mb-3 history-card position-relative overflow-hidden">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                <div class="mb-2 mb-md-0">
                    <h6 class="fw-bold mb-1"><i class="fas fa-box-open me-2 text-muted"></i>Pedido #${numPedido} - <span class="badge bg-success">${pedido.status || 'Aprovado'}</span></h6>
                    <p class="mb-0 text-muted small"><i class="far fa-calendar-alt me-1"></i>${new Date(pedido.data).toLocaleDateString('pt-BR')} às ${new Date(pedido.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                    <p class="mb-0 text-muted small mt-1 history-card-summary"><strong>Itens:</strong> ${itensResumo}</p>
                </div>
                <div class="text-md-end mt-2 mt-md-0">
                    <h5 class="fw-bold text-devcare mb-0">${totalDisplay}</h5>
                </div>
            </div>
            
            <div class="history-card-details">
                <h6 class="small fw-bold text-uppercase text-muted mb-2">Detalhes da Compra</h6>
                ${itensDetalhadosHtml}
            </div>
        </div>`;
    });
}
