// Seleciona todos os cards 
const cards = document.querySelectorAll('.card-depoimento');

// Seleciona todas as bolinhas 
const bolinhas = document.querySelectorAll('.indicador');

// Guarda qual card está ativo no momento
let cardAtual = 0;

// Função que troca o card visível a cada intervalo
function trocarCard() {
  cards[cardAtual].classList.remove('ativo');
  bolinhas[cardAtual].classList.remove('ativo');

  cardAtual = cardAtual + 1;

  // Se chegou no último card, volta para o primeiro
  if (cardAtual === 3) {
    cardAtual = 0;
  }

  cards[cardAtual].classList.add('ativo');
  bolinhas[cardAtual].classList.add('ativo');
}

// Troca o card a cada 3 segundos
setInterval(trocarCard, 3000);


/* ========================
   NEWSLETTER
   Valida e cadastra o email */

// Seleciona o botão e o input pelo id
const botao = document.querySelector('.sessao5 button');
const input = document.getElementById('email');

botao.addEventListener('click', function() {

  // Remove espaços em branco do início e fim
  const valor = input.value.trim();

  // Verifica se o campo está vazio
  if (valor === '') {
    alert('Digite seu e-mail!');
    return;
  }

 
  // Verifica se tem: texto + @ + texto + . + texto
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

  // Se o formato for inválido, avisa o usuário
  if (!emailValido) {
    alert('Digite um e-mail válido!');
    return;
  }

  // Se chegou aqui, o email é válido
  alert('Cadastro efetuado com sucesso!');

  // Limpa o campo após cadastro
  input.value = '';
});