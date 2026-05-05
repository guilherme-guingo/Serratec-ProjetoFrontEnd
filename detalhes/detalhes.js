const urlParametro = new URLSearchParams(window.location.search);
const produtoId = urlParametro.get('id');
const containerDetalhes = document.getElementById("container-detalhes");
const url = "https://69f3d141bd2396bf531062ed.mockapi.io/produtos";

// Inicializa a carga do produto
carregarProduto(produtoId);

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
        renderizarDetalhes(produto);
        
    } catch (erro) {
        console.log("Erro ao buscar o produto:", erro);
    }
}

function renderizarDetalhes(produto) {
    // Escapa aspas simples para evitar erros na passagem do objeto via HTML
    const produtoString = JSON.stringify(produto).replace(/'/g, "&apos;");

    containerDetalhes.innerHTML = `
        <img src="${produto.imagem}" alt="${produto.titulo}" class="img-produto">
        <div class="detalhes-produto">
            <h2>${produto.titulo}</h2>
            <p class="preco">${produto.preco}</p>
            <p>${produto.descricao}</p>
            <button class="comprar" onclick='adicionarDesteProduto(${produtoString})'>
                ADICIONAR AO CARRINHO
            </button>
        </div>`;
}

function adicionarDesteProduto(produtoCarregado) {
    // 1. Recupera o carrinho atual do localStorage (específico da Devcare)
    let carrinho = JSON.parse(localStorage.getItem('devcare_items')) || [];

    // 2. Verifica se o produto já existe no carrinho
    const index = carrinho.findIndex(item => item.id === produtoCarregado.id);

    if (index !== -1) {
        // Se existe, apenas aumenta a quantidade
        carrinho[index].quantidade = (parseInt(carrinho[index].quantidade) || 1) + 1;
    } else {
        // Se é novo, define quantidade 1 e adiciona à lista
        produtoCarregado.quantidade = 1;
        carrinho.push(produtoCarregado);
    }

    // 3. Salva a lista atualizada
    localStorage.setItem('devcare_items', JSON.stringify(carrinho));

    // 4. Atualiza o contador do header (se a função global existir)
    if (typeof atualizarContadorGlobal === 'function') {
        atualizarContadorGlobal();
    }

    // Alerta removido conforme solicitado.
    // O feedback agora é silencioso através do contador no topo da página.
    console.log("Produto adicionado ao devcare_items:", produtoCarregado.titulo);
}