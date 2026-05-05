// Carrossel
const cards = document.querySelectorAll('.card-depoimento');
const bolinhas = document.querySelectorAll('.indicador');

let cardAtual = 0;

function trocarCard() {
  // Remove ativo do atual
  cards[cardAtual].classList.remove('ativo');
  bolinhas[cardAtual].classList.remove('ativo');

  // Avança e volta ao zero quando chega no último
  cardAtual = (cardAtual + 1) % cards.length;

  // Ativa o próximo
  cards[cardAtual].classList.add('ativo');
  bolinhas[cardAtual].classList.add('ativo');
}

// Troca a cada 3 segundos
setInterval(trocarCard, 3000);


// Newsletter
const botao = document.querySelector('.sessao5 button');
const input = document.getElementById('email');

botao.addEventListener('click', function(event) {
  event.preventDefault();

  const valor = input.value.trim();

  // Verifica se está vazio
  if (valor === '') {
    alert('Digite seu e-mail!');
    return;
  }

  // Valida o formato do e-mail
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

  if (!emailValido) {
    alert('Digite um e-mail válido!');
    return;
  }

  alert('Cadastro efetuado com sucesso!');
  input.value = '';
});