const urlParametro = new URLSearchParams(window.location.search);
const produtoId = urlParametro.get('id');
const containerDetalhes = document.getElementById("container-detalhes")
const url = "https://69f3d141bd2396bf531062ed.mockapi.io/produtos"

carregarProduto(produtoId)

async function carregarProduto(id) {
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
        renderizarDetalhes(produto)
        
    } catch (erro) {
        console.log("Erro ao buscar o produto:", erro);
    }
}

function renderizarDetalhes(produto){

    const produtoString = JSON.stringify(produto).replace(/'/g, "&apos;");

    containerDetalhes.innerHTML = `<img src="${produto.imagem}" alt="${produto.titulo}" class="img-produto">
        <div class="detalhes-produto">
            <h2>${produto.titulo}</h2>
            <p class="preco">${produto.preco}</p>
            <p>${produto.descricao}</p>
            <button class="comprar" onclick='adicionarAoCarrinho(${produtoString})'>ADICIONAR AO CARRINHO</button>
        </div>`
}