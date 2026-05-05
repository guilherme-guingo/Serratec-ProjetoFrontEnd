/**
 * ==============================================================
 * DEVCARE - LOGÍSTICA GLOBAL (main.js)
 * Este arquivo deve ser carregado em TODAS as páginas.
 * ==============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    window.alert = function(msg) { console.log('MOCKED ALERT:', msg); };
    window.confirm = function(msg) { console.log('MOCKED CONFIRM:', msg); return true; };
    // 1. Sempre que qualquer página carregar, sincroniza o ícone da navbar
    atualizarBadgeNavbar();

    // 2. Opcional: Log para desenvolvedor validar o estado de login no console
    console.log("Status de Login:", estaLogado() ? "Conectado" : "Desconectado");
});

/**
 * Recupera o valor do localStorage e injeta no HTML da Navbar.
 */
function atualizarBadgeNavbar() {
    const contadorBadge = document.getElementById('cart-count');

    // Recupera o dado salvo sob a chave 'devcare_cart_count'
    const totalSalvo = localStorage.getItem('devcare_cart_count');

    if (contadorBadge) {
        if (totalSalvo && parseInt(totalSalvo) > 0) {
            contadorBadge.innerText = totalSalvo;
            contadorBadge.style.display = 'inline-block';
        } else {
            contadorBadge.style.display = 'none';
        }
    }
}

/**
 * Função utilitária para salvar e atualizar o estado global do carrinho.
 */
function sincronizarCarrinho(quantidadeTotal) {
    localStorage.setItem('devcare_cart_count', quantidadeTotal);
    atualizarBadgeNavbar();
}

/**
 * ==============================================================
 * LÓGICA DE AUTENTICAÇÃO (MOCK)
 * ==============================================================
 */

/**
 * Verifica se o usuário está logado usando a sessão real de usuario.js.
 */
function estaLogado() {
    return localStorage.getItem('devcare_session') !== null;
}

/**
 * Função para simular o login/logout via console para testes:
 * Uso: simularLogin(true) ou simularLogin(false)
 */
function simularLogin(status) {
    localStorage.setItem('devcare_logado', status);
    console.log("Estado de login alterado para:", status);
    // Opcional: location.reload(); // Descomente para atualizar a página automaticamente ao testar
}

/**
 * Lógica Global para o Contador do Carrinho
 */
/**
 * Lógica Global para o Contador do Carrinho (UNIFICADA)
 */
function atualizarContadorGlobal() {
    const cartCountElement = document.getElementById('cart-count');
    if (!cartCountElement) return;

    // Busca os itens reais do carrinho
    const itens = JSON.parse(localStorage.getItem('devcare_items')) || [];

    const totalItens = itens.reduce((acumulador, item) => {
        return acumulador + (parseInt(item.quantidade) || 0);
    }, 0);

    // Sincroniza também a chave de contagem simples, se você a usar em outro lugar
    localStorage.setItem('devcare_cart_count', totalItens);

    cartCountElement.innerText = totalItens;
    cartCountElement.style.display = totalItens === 0 ? 'none' : 'block';

    // GARANTIA: Não há alert() aqui.
    console.log("Contador atualizado para:", totalItens);
}

/**
 * Inicialização
 */
document.addEventListener('DOMContentLoaded', () => {
    atualizarContadorGlobal();
});