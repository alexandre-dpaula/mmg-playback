/**
 * Utilitário para adicionar timeout em operações assíncronas
 * Especialmente crítico para Safari iOS que pode travar requisições
 */

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Adiciona timeout a uma Promise
 * Se a promise não resolver em X ms, rejeita com TimeoutError
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operação expirou'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new TimeoutError(errorMessage)), timeoutMs)
    ),
  ]);
}

/**
 * Executa múltiplas promises em paralelo com timeout individual
 * Útil para otimizar chamadas independentes ao Supabase
 */
export async function parallelWithTimeout<T>(
  promises: Array<{ promise: Promise<T>; timeout: number; fallback?: T }>,
): Promise<T[]> {
  return Promise.all(
    promises.map(({ promise, timeout, fallback }) =>
      withTimeout(promise, timeout).catch((error) => {
        console.error('Promise com timeout falhou:', error);
        if (fallback !== undefined) {
          return fallback;
        }
        throw error;
      })
    )
  );
}
