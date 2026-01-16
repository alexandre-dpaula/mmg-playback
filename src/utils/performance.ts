/**
 * Utilitários de Performance e Limpeza de Cache
 */

/**
 * Limpa dados antigos do localStorage (>30 dias)
 */
export const clearOldLocalStorage = () => {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    let cleaned = 0;

    keys.forEach((key) => {
      try {
        const item = localStorage.getItem(key);
        if (!item) return;

        const parsed = JSON.parse(item);

        // Verifica se tem timestamp e se está expirado
        if (parsed.timestamp && now - parsed.timestamp > thirtyDays) {
          localStorage.removeItem(key);
          cleaned++;
          console.log(`[Performance] Removido item antigo: ${key}`);
        }
      } catch (e) {
        // Ignorar erros de parse - pode ser string simples
      }
    });

    if (cleaned > 0) {
      console.log(`[Performance] ${cleaned} itens antigos removidos do localStorage`);
    }
  } catch (error) {
    console.error('[Performance] Erro ao limpar localStorage:', error);
  }
};

/**
 * Verifica o tamanho usado do localStorage
 */
export const getLocalStorageSize = (): number => {
  try {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  } catch (error) {
    console.error('[Performance] Erro ao calcular tamanho do localStorage:', error);
    return 0;
  }
};

/**
 * Formata bytes para formato legível
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Log de informações de performance do localStorage
 */
export const logStorageInfo = () => {
  const size = getLocalStorageSize();
  const formatted = formatBytes(size);
  const itemCount = Object.keys(localStorage).length;

  console.log('[Performance] localStorage Info:', {
    items: itemCount,
    size: formatted,
    sizeBytes: size,
  });

  return { items: itemCount, size: formatted, sizeBytes: size };
};

/**
 * Debounce function para otimizar eventos frequentes
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function para limitar taxa de execução
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Monitora performance de renderização de componente
 */
export const measureComponentRender = (
  componentName: string,
  callback: () => void
) => {
  const start = performance.now();
  callback();
  const end = performance.now();
  const duration = end - start;

  if (duration > 16) {
    // 16ms = 60fps threshold
    console.warn(
      `[Performance] ${componentName} renderizou em ${duration.toFixed(2)}ms (>16ms)`
    );
  }

  return duration;
};

/**
 * Limpa service workers antigos (se existirem)
 */
export const clearServiceWorkers = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('[Performance] Service Worker removido');
    }
  }
};

/**
 * Limpa cache do navegador (Cache API)
 */
export const clearBrowserCache = async () => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
    console.log(`[Performance] ${cacheNames.length} caches removidos`);
  }
};

/**
 * Executa limpeza completa de performance
 */
export const performFullCleanup = async () => {
  console.log('[Performance] Iniciando limpeza completa...');

  // Limpar localStorage antigo
  clearOldLocalStorage();

  // Limpar service workers
  await clearServiceWorkers();

  // Limpar cache do navegador
  await clearBrowserCache();

  // Log info final
  logStorageInfo();

  console.log('[Performance] Limpeza completa finalizada!');
};

/**
 * Inicializa utilitários de performance
 * Deve ser chamado no início da aplicação
 */
export const initPerformanceUtils = () => {
  // Log info inicial
  console.log('[Performance] Sistema de performance inicializado');
  logStorageInfo();

  // Limpar dados antigos na inicialização
  clearOldLocalStorage();

  // Executar limpeza completa a cada 7 dias
  const lastCleanup = localStorage.getItem('lastPerformanceCleanup');
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  if (!lastCleanup || now - parseInt(lastCleanup) > sevenDays) {
    performFullCleanup();
    localStorage.setItem('lastPerformanceCleanup', now.toString());
  }
};
