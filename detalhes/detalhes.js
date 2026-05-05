//URLSearchParams "pega" os parâmetros que se cria na url
const urlParametro = new URLSearchParams(window.location.search);
const produtoId = urlParametro.get('id');
const containerDetalhes = document.getElementById("container-detalhes");
const url = "https://69f3d141bd2396bf531062ed.mockapi.io/produtos";

document.addEventListener("DOMContentLoaded", async function() {
    const produto = await carregarProduto(url, produtoId);
    renderizarDetalhes(produto)
});

// função que recebe a url e a id do produto e faz um get na api, retornando apenas o produto especifico
async function carregarProduto(url, id) {
    if (!id) {
        console.log("ID do produto não fornecido");
        return;
    }
    try {
        const response = await fetch(`${url}/${id}`);
        if (!response.ok) {
            throw new Error('Produto não encontrado ou erro no servidor');
        }
        const produto = await response.json();

        renderizarDetalhes(produto);

        return produto;

        
    } catch (erro) {
        console.log("Erro ao buscar o produto:", erro);
    }
}

// recebe o produto específico e cria o html com os dados
function renderizarDetalhes(produto){
    
    const produtoString = JSON.stringify(produto).replace(/'/g, "&apos;");
    const formatoMoeda = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
    const precoBR = formatoMoeda.format(produto.preco)
    containerDetalhes.innerHTML = `<div class="capsula-img"><img src="${produto.imagem}" alt="${produto.titulo}" class="img-produto"> </div>
        <div class="detalhes-produto">
            <h2>${produto.titulo}</h2>
            <p class="preco">${precoBR}</p>
            <p>${produto.descricao}</p>
            <button class="comprar" onclick='adicionarAoCarrinho(${produtoString})'>
                ADICIONAR AO CARRINHO
            </button>
        </div>`;
}