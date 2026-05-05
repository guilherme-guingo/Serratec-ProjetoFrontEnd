const form = document.getElementById("form-produtos")
const nome = document.getElementById("nome-produto")
const img = document.getElementById("img-produto")
const valor = document.getElementById("valor-produto")
const descricao = document.getElementById("desc-produto")
const tipo = document.getElementById("tipo-produto")
const categoria = document.getElementById("categoria-produto")
const enviar = document.getElementById("envio")
const id = document.getElementById("id-produto")

const url = "https://69f3d141bd2396bf531062ed.mockapi.io/produtos"

enviar.addEventListener('click', async function (e){
    const dadosAtualizados = {};
    e.preventDefault();
    dadosAtualizados.id = id.value;
    if(img.value.trim() !== ''){
        dadosAtualizados.imagem = img.value;
    }
    if(nome.value.trim() !== ''){
        dadosAtualizados.titulo = nome.value;
    }
    if(categoria.value.trim() !== ''){
        dadosAtualizados.categoria = categoria.value;
    }
    if(tipo.value.trim() !== ''){
        dadosAtualizados.tipo = tipo.value;
    }
    atualizarProduto(url, dadosAtualizados)
})

async function atualizarProduto(url, dados){
    try{ 
        const response = await fetch(`${url}/${dados.id}`, 
    {   method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dados)});
    }catch(error){
        console.log(error)
    }
};