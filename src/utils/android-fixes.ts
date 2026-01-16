/**
 * Fixes e otimizações específicas para Android Chrome
 */

/**
 * Detecta se está rodando em Android
 */
export const isAndroid = (): boolean => {
  return /Android/i.test(navigator.userAgent);
};

/**
 * Detecta se está rodando em Chrome Android
 */
export const isAndroidChrome = (): boolean => {
  return isAndroid() && /Chrome/i.test(navigator.userAgent);
};

/**
 * Fix para scroll suave em Android Chrome
 * Android Chrome tem problemas com overflow-scrolling e momentum
 */
export const initAndroidScrollFix = () => {
  if (!isAndroid()) return;

  // Fix 1: Adicionar scroll suave em containers principais
  const addSmoothScroll = () => {
    const scrollContainers = document.querySelectorAll('[data-scroll-container]');
    scrollContainers.forEach((container) => {
      const el = container as HTMLElement;
      el.style.webkitOverflowScrolling = 'touch';
      el.style.overflowScrolling = 'touch';
      // Android precisa de will-change para scroll suave
      el.style.willChange = 'scroll-position';
    });
  };

  // Fix 2: Resolver problema de scroll "stuck" em Android
  const fixStuckScroll = () => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Force repaint para resolver scroll stuck
          document.body.style.transform = 'translateZ(0)';
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  };

  // Fix 3: Melhorar momentum scrolling
  const improveMomentum = () => {
    const style = document.createElement('style');
    style.textContent = `
      /* Android Chrome scroll momentum fix */
      * {
        -webkit-overflow-scrolling: touch !important;
        scroll-behavior: smooth;
      }

      /* Fix para scroll em modais e overlays */
      .modal-scroll,
      [role="dialog"],
      .overflow-auto,
      .overflow-y-auto {
        overscroll-behavior: contain;
        -webkit-overflow-scrolling: touch;
      }

      /* Previne scroll chaining em Android */
      body {
        overscroll-behavior-y: none;
      }
    `;
    document.head.appendChild(style);
  };

  // Fix 4: Resolver problema de touch delay em Android
  const removeTouchDelay = () => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes';

    // Substituir meta viewport existente
    const existingMeta = document.querySelector('meta[name="viewport"]');
    if (existingMeta) {
      existingMeta.parentNode?.replaceChild(meta, existingMeta);
    } else {
      document.head.appendChild(meta);
    }
  };

  // Executar fixes
  addSmoothScroll();
  fixStuckScroll();
  improveMomentum();
  removeTouchDelay();

  console.log('[Android] Fixes de scroll aplicados');
};

/**
 * Fix para problema de altura de tela em Android Chrome
 * Similar ao iOS mas com tratamento diferente
 */
export const initAndroidViewportFix = () => {
  if (!isAndroid()) return;

  const setAndroidVH = () => {
    // Android Chrome: usar visualViewport quando disponível
    if (window.visualViewport) {
      const vh = window.visualViewport.height * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    } else {
      // Fallback para Android mais antigo
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
  };

  // Atualizar na inicialização
  setAndroidVH();

  // Atualizar quando a barra de endereço aparecer/desaparecer
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setAndroidVH);
  } else {
    window.addEventListener('resize', setAndroidVH);
  }

  // Atualizar na orientação
  window.addEventListener('orientationchange', () => {
    setTimeout(setAndroidVH, 100);
  });

  console.log('[Android] Viewport fix aplicado');
};

/**
 * Fix para pull-to-refresh indesejado em Android Chrome
 */
export const disableAndroidPullToRefresh = () => {
  if (!isAndroid()) return;

  let startY = 0;
  let currentY = 0;

  document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].pageY;
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    currentY = e.touches[0].pageY;

    // Previne pull-to-refresh apenas se estiver no topo da página
    if (window.scrollY === 0 && currentY > startY) {
      const target = e.target as HTMLElement;

      // Permite scroll em elementos específicos
      if (!target.closest('[data-allow-pull-refresh]')) {
        e.preventDefault();
      }
    }
  }, { passive: false });

  console.log('[Android] Pull-to-refresh controlado');
};

/**
 * Melhora performance de animações em Android
 */
export const optimizeAndroidAnimations = () => {
  if (!isAndroid()) return;

  const style = document.createElement('style');
  style.textContent = `
    /* Otimizações de performance para Android */
    @media screen and (max-width: 768px) {
      /* Force hardware acceleration */
      * {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-perspective: 1000;
        perspective: 1000;
      }

      /* Reduzir blur pesado em Android */
      .backdrop-blur-sm,
      .backdrop-blur-md,
      .backdrop-blur-lg {
        backdrop-filter: blur(4px) !important;
      }

      /* Simplificar shadows em Android para melhor performance */
      .shadow-lg,
      .shadow-xl,
      .shadow-2xl {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
      }
    }
  `;
  document.head.appendChild(style);

  console.log('[Android] Otimizações de animação aplicadas');
};

/**
 * Fix para keyboard overlay em Android
 * Ajusta viewport quando teclado virtual aparece
 */
export const fixAndroidKeyboard = () => {
  if (!isAndroid()) return;

  let initialHeight = window.innerHeight;

  const handleResize = () => {
    const currentHeight = window.innerHeight;
    const diff = initialHeight - currentHeight;

    // Se a diferença for > 150px, provavelmente o teclado está aberto
    if (diff > 150) {
      document.body.classList.add('keyboard-open');
      // Scroll para o elemento focado
      setTimeout(() => {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    } else {
      document.body.classList.remove('keyboard-open');
      initialHeight = currentHeight;
    }
  };

  window.addEventListener('resize', handleResize);

  // Adicionar CSS para quando keyboard está aberto
  const style = document.createElement('style');
  style.textContent = `
    .keyboard-open {
      /* Ajustes quando teclado está aberto */
      min-height: auto !important;
    }

    .keyboard-open #root {
      min-height: auto !important;
    }
  `;
  document.head.appendChild(style);

  console.log('[Android] Fix de keyboard aplicado');
};

/**
 * Inicializa todos os fixes Android
 */
export const initAndroidFixes = () => {
  if (!isAndroid()) {
    console.log('[Android] Não é Android, skipping fixes');
    return;
  }

  console.log('[Android] Inicializando fixes para Android Chrome');

  initAndroidScrollFix();
  initAndroidViewportFix();
  disableAndroidPullToRefresh();
  optimizeAndroidAnimations();
  fixAndroidKeyboard();

  console.log('[Android] Todos os fixes aplicados com sucesso');
};
