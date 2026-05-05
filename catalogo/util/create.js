const form = document.getElementById("form-produtos")
const nome = document.getElementById("nome-produto")
const img = document.getElementById("img-produto")
const valor = document.getElementById("valor-produto")
const descricao = document.getElementById("desc-produto")
const tipo = document.getElementById("tipo-produto")
const categoria = document.getElementById("categoria-produto")
const enviar = document.getElementById("envio")


const url = "https://69f3d141bd2396bf531062ed.mockapi.io/produtos"


enviar.addEventListener('click', function(e){
    e.preventDefault();

    let produto = {
    titulo: nome.value,
    imagem: img.value,
    preco: parseFloat(valor.value),
    descricao: descricao.value,
    tipo: tipo.value,
    categoria: categoria.value
    };
    form.reset();
    criarProdutos(url, produto);
});


async function criarProdutos(url, produto){
    try{
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(produto)
        });
        if(!response.ok){
            throw new Error("Falha ao enviar os dados para api.");
        }
        console.log("Produtos criado com sucesso");
    }
    catch(error){
        console.log(error)
    }
}