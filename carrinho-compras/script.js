/**
 * ==============================================================
 * CONFIGURAÇÃO GLOBAL DA API
 * ==============================================================
 */
const API_URL = 'https://69f3d141bd2396bf531062ed.mockapi.io/produtos'; 
const API_PEDIDOS = 'https://69f7a74bdd0c226688eddc23.mockapi.io/orders';

/**
 * ==============================================================
 * RENDERIZAÇÃO: carregarCarrinhoDoMockApi
 * Objetivo: Buscar produtos e carregar o HTML dinamicamente.
 * ==============================================================
 */
async function carregarCarrinhoDoMockApi() {
    const listaProdutos = document.getElementById('lista-produtos');
    if (!listaProdutos) return;

    try {
        const response = await fetch(API_URL);
        const dados = await response.json();
        
        const produtos = dados.products ? dados.products : dados;

        listaProdutos.innerHTML = ''; 

        produtos.forEach(produto => {
            const precoNumerico = parseFloat(produto.preco);
            
            listaProdutos.innerHTML += `
                <div class="product-item" data-id="${produto.id}">
                    <img src="${produto.imagem}" class="product-img" alt="${produto.imagem}">
                    
                    <div class="product-info">
                        <h2 class="product-name">${produto.titulo}</h2>
                        <p class="product-meta">${produto.tipo}</p>
                        
                        <p class="product-price" data-price="${precoNumerico}">
                            R$ ${precoNumerico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        
                        <div class="qty-control">
                            <button onclick="mudarQuantidade('${produto.id}', -1)">-</button>
                            <input type="text" value="1" id="qty-${produto.id}" readonly>
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

    } catch (error) {
        console.error("Erro ao carregar dados da API:", error);
    }
}

/**
 * ==============================================================
 * LOGÍSTICA DE VALORES: atualizarResumo
 * ==============================================================
 */
function atualizarResumo() {
    const subtotalElement = document.getElementById('subtotal-valor');
    const totalElement = document.getElementById('total-valor');
    
    const itens = document.querySelectorAll('.product-item');
    let totalGeral = 0;

    itens.forEach(item => {
        const precoUnitario = parseFloat(item.querySelector('.product-price').getAttribute('data-price'));
        const quantidade = parseInt(item.querySelector('.qty-control input').value);

        if (!isNaN(precoUnitario)) {
            totalGeral += (precoUnitario * quantidade);
        }
    });

    const formatado = totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    if (subtotalElement) subtotalElement.innerText = formatado;
    if (totalElement) totalElement.innerText = formatado;
}

/**
 * ==============================================================
 * INTERAÇÕES DO USUÁRIO
 * ==============================================================
 */
function mudarQuantidade(id, delta) {
    const input = document.getElementById(`qty-${id}`);
    if (input) {
        let valorAtual = parseInt(input.value);
        if (valorAtual + delta >= 1) {
            input.value = valorAtual + delta;
            atualizarResumo(); 
        }
    }
}

function removerItem(id) {
    const item = document.querySelector(`.product-item[data-id="${id}"]`);
    if (item) {
        item.remove();
        atualizarResumo();
    }
}

/**
 * ==============================================================
 * PERSISTÊNCIA: finalizarCompra
 * Objetivo: Coletar os dados da tela e enviar (POST) para o MockAPI.
 * ==============================================================
 */
async function finalizarCompra() {
    const itensCarrinho = document.querySelectorAll('.product-item');
    
    if (itensCarrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }

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
            // MUDANÇA AQUI: Em vez do alert, disparamos o Modal do Bootstrap
            const modalSucesso = new bootstrap.Modal(document.getElementById('modalSucesso'));
            modalSucesso.show();
            
            // O recarregamento (location.reload) agora deve ficar no botão "Voltar" do HTML
        } else {
            throw new Error(`Erro na API: ${response.status}`);
        }
    } catch (error) {
        console.error("Erro na finalização:", error);
        alert("Houve um erro ao processar sua compra.");
        
        botao.disabled = false;
        botao.innerText = "Finalizar compra";
    }
}

/**
 * ==============================================================
 * INICIALIZAÇÃO DOS EVENTOS
 * ==============================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    carregarCarrinhoDoMockApi();
    
    const btnFinalizar = document.querySelector('.btn-finalize');
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', finalizarCompra);
    }
});