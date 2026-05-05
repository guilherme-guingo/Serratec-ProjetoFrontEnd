const urlParametro = new URLSearchParams(window.location.search);
const produtoId = urlParametro.get('id');
const containerDetalhes = document.getElementById("container-detalhes");
const url = "https://69f3d141bd2396bf531062ed.mockapi.io/produtos";

<<<<<<< HEAD
// Inicializa a carga do produto
carregarProduto(produtoId);
=======
>>>>>>> 502f54c62eeb5dfcd79bd444ff75fa8a733b5196

document.addEventListener("DOMContentLoaded", async function() {
    const produto = await carregarProduto(url, produtoId);
    renderizarDetalhes(produto)
});


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
            <button class="comprar" onclick='adicionarDesteProduto(${produtoString})'>
                ADICIONAR AO CARRINHO
            </button>
        </div>`;
}