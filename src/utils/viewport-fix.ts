/**
 * Fix para Safari iOS - Calcula viewport height correta
 *
 * Safari iOS calcula 100vh errado quando a barra de endereço está visível.
 * Este script atualiza uma CSS variable com o valor correto.
 */

export function initViewportFix() {
  // Função para atualizar a altura do viewport
  const updateViewportHeight = () => {
    // Pega a altura real da janela (sem a barra de endereço)
    const vh = window.innerHeight * 0.01;
    // Define a CSS variable --vh
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  // Atualiza na inicialização
  updateViewportHeight();

  // Atualiza quando a janela é redimensionada (ex: quando a barra de endereço aparece/desaparece)
  window.addEventListener('resize', updateViewportHeight);

  // iOS Safari também dispara 'orientationchange'
  window.addEventListener('orientationchange', () => {
    // Pequeno delay para garantir que o resize aconteceu
    setTimeout(updateViewportHeight, 100);
  });

  // Cleanup function
  return () => {
    window.removeEventListener('resize', updateViewportHeight);
    window.removeEventListener('orientationchange', updateViewportHeight);
  };
}
