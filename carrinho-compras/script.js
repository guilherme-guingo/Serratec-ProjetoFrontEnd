/**
 * ==============================================================
 * CONFIGURAÇÃO GLOBAL
 * ==============================================================
 */
const API_PEDIDOS = 'https://69f7a74bdd0c226688eddc23.mockapi.io/orders';

/**
 * RENDERIZAÇÃO: Carrega os itens do localStorage para a div#lista-produtos
 */
function carregarCarrinho() {
    const listaProdutos = document.getElementById('lista-produtos');
    if (!listaProdutos) return;

    // Recupera os itens salvos no localStorage
    const itensSalvos = JSON.parse(localStorage.getItem('devcare_items')) || [];

    if (itensSalvos.length === 0) {
        listaProdutos.innerHTML = '<p class="text-center my-5">Seu carrinho está vazio.</p>';
        atualizarResumo();
        return;
    }

    listaProdutos.innerHTML = ''; 

    itensSalvos.forEach(produto => {
        const precoNumerico = parseFloat(produto.preco);
        
        listaProdutos.innerHTML += `
            <div class="product-item" data-id="${produto.id}">
                <img src="${produto.imagem}" class="product-img" alt="${produto.titulo}">
                <div class="product-info">
                    <h2 class="product-name">${produto.titulo}</h2>
                    <p class="product-meta">${produto.tipo || 'Cabelos'}</p>
                    <p class="product-price" data-price="${precoNumerico}">
                        R$ ${precoNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <div class="qty-control">
                        <button onclick="mudarQuantidade('${produto.id}', -1)">-</button>
                        <input type="text" value="${produto.quantidade || 1}" id="qty-${produto.id}" readonly>
                        <button onclick="mudarQuantidade('${produto.id}', 1)">+</button>
                    </div>
                </div>
                <span class="material-symbols-rounded delete-btn" onclick="removerItem('${produto.id}')">
                    delete
                </span>
            </div>
        `;
    });

    atualizarResumo();
}

/**
 * LÓGICA FINANCEIRA: Atualiza subtotal, total e estado do botão
 */
function atualizarResumo() {
    const subtotalElement = document.getElementById('subtotal-valor');
    const totalElement = document.getElementById('total-valor');
    const btnFinalizar = document.querySelector('.btn-finalize');
    const itens = document.querySelectorAll('.product-item');
    
    let totalGeral = 0;
    let totalItens = 0; 

    itens.forEach(item => {
        const precoUnitario = parseFloat(item.querySelector('.product-price').getAttribute('data-price'));
        const quantidade = parseInt(item.querySelector('.qty-control input').value);

        if (!isNaN(precoUnitario)) totalGeral += (precoUnitario * quantidade);
        if (!isNaN(quantidade)) totalItens += quantidade;
    });

    const formatado = totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    if (subtotalElement) subtotalElement.innerText = formatado;
    if (totalElement) totalElement.innerText = formatado;

    // Gerencia o estado do botão de finalizar
    if (btnFinalizar) {
        if (totalItens === 0) {
            btnFinalizar.disabled = true;
            btnFinalizar.innerText = "Carrinho Vazio";
            btnFinalizar.classList.add('opacity-50');
        } else {
            btnFinalizar.disabled = false;
            btnFinalizar.innerText = "Finalizar compra";
            btnFinalizar.classList.remove('opacity-50');
        }
    }

    // Sincroniza o contador da navbar (cart-count)
    const cartCount = document.getElementById('cart-count');
    if (cartCount) cartCount.innerText = totalItens;
}

/**
 * AÇÃO PRINCIPAL: Finaliza a compra ou exige login via Modal
 */
async function finalizarCompra() {
    // 1. Verificação de Login: Se não houver função de login ou não estiver logado
    // Nota: 'estaLogado' deve ser uma função global no seu main.js
    if (typeof estaLogado === "function" && !estaLogado()) {
        const modalLogin = new bootstrap.Modal(document.getElementById('modalLoginObrigatorio'));
        modalLogin.show();
        return; 
    }

    const itensCarrinho = document.querySelectorAll('.product-item');
    if (itensCarrinho.length === 0) return;

    const botao = document.querySelector('.btn-finalize');
    botao.disabled = true;
    botao.innerText = "Processando...";

    const pedido = {
        data: new Date().toLocaleString('pt-BR'),
        itens: Array.from(itensCarrinho).map(item => ({
            id: item.dataset.id,
            nome: item.querySelector('.product-name').innerText,
            quantidade: item.querySelector('.qty-control input').value,
            preco: item.querySelector('.product-price').dataset.price
        })),
        total: document.getElementById('total-valor').innerText,
        status: "Pago"
    };

    try {
        const response = await fetch(API_PEDIDOS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedido)
        });

        if (response.ok) {
            // Limpa o localStorage após sucesso na API
            localStorage.removeItem('devcare_items'); 
            
            // Exibe o modal de sucesso
            const modalSucesso = new bootstrap.Modal(document.getElementById('modalSucesso'));
            modalSucesso.show();

            const listaProdutos = document.getElementById('lista-produtos');
            if (listaProdutos) {
                listaProdutos.innerHTML = '<p class="text-center my-5">Seu carrinho está vazio.</p>';
            }
            atualizarResumo(); 
        } else {
            throw new Error('Falha ao processar pedido');
        }
    } catch (error) {
        console.error("Erro na finalização:", error);
        alert("Houve um erro ao processar sua compra.");
        botao.disabled = false;
        botao.innerText = "Finalizar compra";
    }
}

/**
 * INTERAÇÕES DE ITEM
 */
function mudarQuantidade(id, delta) {
    const input = document.getElementById(`qty-${id}`);
    if (input) {
        let valorAtual = parseInt(input.value);
        if (valorAtual + delta >= 1) {
            input.value = valorAtual + delta;
            
            // Atualiza também no localStorage para persistência
            let itensSalvos = JSON.parse(localStorage.getItem('devcare_items')) || [];
            itensSalvos = itensSalvos.map(p => {
                if(p.id == id) p.quantidade = input.value;
                return p;
            });
            localStorage.setItem('devcare_items', JSON.stringify(itensSalvos));
            
            atualizarResumo(); 
        }
    }
}

function removerItem(id) {
    const item = document.querySelector(`.product-item[data-id="${id}"]`);
    if (item) item.remove();

    // Sincroniza remoção no localStorage
    let itensSalvos = JSON.parse(localStorage.getItem('devcare_items')) || [];
    itensSalvos = itensSalvos.filter(produto => produto.id != id);

    if (itensSalvos.length > 0) {
        localStorage.setItem('devcare_items', JSON.stringify(itensSalvos));
    } else {
        localStorage.removeItem('devcare_items');
        const listaProdutos = document.getElementById('lista-produtos');
        if (listaProdutos) {
            listaProdutos.innerHTML = '<p class="text-center my-5">Seu carrinho está vazio.</p>';
        }
    }

    atualizarResumo();
}

function adicionarAoCarrinho(produto) {
    // 1. Busca o que já existe ou cria um array vazio
    let itens = JSON.parse(localStorage.getItem('devcare_items')) || [];

    // 2. Verifica se o item já está no carrinho para apenas somar a quantidade
    const index = itens.findIndex(item => item.id === produto.id);
    
    if (index !== -1) {
        itens[index].quantidade = (itens[index].quantidade || 1) + 1;
    } else {
        // Garante que o item comece com quantidade 1
        produto.quantidade = 1;
        itens.push(produto);
    }

    // 3. Salva de volta no LocalStorage
    localStorage.setItem('devcare_items', JSON.stringify(itens));
}

/**
 * INICIALIZAÇÃO
 */
document.addEventListener('DOMContentLoaded', () => {
    carregarCarrinho();
    
    const btnFinalizar = document.querySelector('.btn-finalize');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', finalizarCompra);
    }
});