const catalogo = document.getElementById("cata-produtos")
const btnFiltrar = document.getElementById("btn-filtro")
const btnApagar = document.getElementById("btn-apagar")
const btnVFiltros = document.getElementById("btn-aparece-filtros")
const containerTipo = document.getElementById("filtros-tipo")
const containerCategoria = document.getElementById("filtros-categoria")
const menuFiltros = document.getElementById("menu-filtros")

const url = "https://69f3d141bd2396bf531062ed.mockapi.io/produtos"


document.addEventListener("DOMContentLoaded", async function() {
    const produtos = await carregarProdutos(url);
    salvarProdutos('produtos', produtos)
    renderizarProdutos(produtos);
});

btnFiltrar.addEventListener('click', function(){
    const {tipos, categorias } = filtros();
    filtrarProdutos(tipos, categorias);
})

btnApagar.addEventListener('click', function(){
    containerTipo.reset();
    containerCategoria.reset();
})

btnVFiltros.addEventListener('click', function(){
    menuFiltros.classList.toggle('ativo')
})

function filtros(){
    const tiposSelecionados = containerTipo.querySelectorAll('input[type="checkbox"]:checked');
    const listaTipos = Array.from(tiposSelecionados).map(tp => tp.value);

    const categoriasSelecionadas = containerCategoria.querySelectorAll('input[type="checkbox"]:checked');
    const listaCategorias = Array.from(categoriasSelecionadas).map(ct => ct.value);

    return {
        tipos: listaTipos,
        categorias: listaCategorias
    };
} 

function filtrarProdutos(tipos, categorias){
    const produtos = getProdutos('produtos');
    console.log(produtos);
    const produtosFiltrados = produtos.filter(p => {

        const atendeCategoria = categorias.length === 0 || categorias.includes(p.categoria);
        const atendeTipo = tipos.length === 0 || tipos.includes(p.tipo);

        return atendeCategoria && atendeTipo;
        });
    console.log(produtosFiltrados);
    renderizarProdutos(produtosFiltrados);
}

function salvarProdutos(key, value){
    localStorage.setItem(key, JSON.stringify(value));
}

function getProdutos(key){
    const produtosSalvos = localStorage.getItem(key);
    if(produtosSalvos){
        const produtos = JSON.parse(produtosSalvos);
        return produtos;
    }else{
        console.log('Nenhum produto encontrado')
        return [];
    }
}

function renderizarProdutos(produtos) {
    const formatoMoeda = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });

    catalogo.innerHTML = '';   
    
    produtos.forEach(p => {

        const produtoString = JSON.stringify(p).replace(/'/g, "&apos;");

        const precoBR = formatoMoeda.format(p.preco);

        const divCard = document.createElement('div');
        divCard.classList.add("card-prod");
        
        divCard.innerHTML = `
            <div class="cont-img">
                <a href="../detalhes/detalhes.html?id=${p.id}"> 
                    <img src="${p.imagem}" alt="Ir para a página de detalhes do produto ${p.titulo}" class="img-prod">  
                </a>
            </div>
            <h3 class="title-prod">${p.titulo}</h3>
            <h4 class="preco-prod">${precoBR}</h4>
            <a href="../detalhes/detalhes.html?id=${p.id}" class="detalhes"> Ver detalhes </a>
            <button class="comprar" onclick='adicionarAoCarrinho(${produtoString})'> 
                Adicionar ao carrinho 
            </button>`;
            
        catalogo.appendChild(divCard);
    });
}

async function carregarProdutos(url){
    try{
        const response = await fetch(url)
        const produtos = await response.json();
        return produtos
        

        if (!response.ok){
            throw new Error("Erro ao carregar produtos!")
        }

    } catch(error){
        console.log(error)
    }
}

