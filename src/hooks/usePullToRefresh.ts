import { useEffect, useRef, useState } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPullDistance?: number;
  enabled?: boolean;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  enabled = true,
}: UsePullToRefreshOptions) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Desabilitar completamente no Safari iOS para evitar conflitos com scroll
    const isSafariIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) &&
                       /Safari/.test(navigator.userAgent) &&
                       !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);

    if (!enabled || isSafariIOS) return;

    const container = containerRef.current;
    if (!container) return;

    let isAtTop = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Verifica se está no topo do scroll
      const scrollElement = container;
      isAtTop = scrollElement.scrollTop === 0;

      if (isAtTop && !isRefreshing) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isAtTop || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      // Só permite pull para baixo (distância positiva) e com distância mínima
      if (distance > 5) {
        // Previne o scroll padrão apenas quando está puxando para baixo
        // Verifica se pode prevenir (Safari iOS pode bloquear preventDefault)
        if (e.cancelable) {
          e.preventDefault();
        }

        // Aplica resistência: quanto mais puxa, mais difícil fica
        const resistance = 0.5;
        const limitedDistance = Math.min(distance * resistance, maxPullDistance);

        setPullDistance(limitedDistance);
        setIsPulling(limitedDistance > threshold);
      }
    };

    const handleTouchEnd = async (e: TouchEvent) => {
      const currentPullDistance = pullDistance;

      // Reseta imediatamente o estado visual
      setPullDistance(0);
      setIsPulling(false);
      startY.current = 0;
      isAtTop = false;

      // Previne bounce do Safari apenas se não está fazendo refresh
      if (currentPullDistance > 5 && currentPullDistance < threshold) {
        // Se estava puxando mas não atingiu o threshold, permite scroll normal
        return;
      }

      // Executa refresh se passou do threshold
      if (currentPullDistance > threshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Erro ao atualizar:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, isRefreshing, pullDistance, threshold, maxPullDistance, onRefresh]);

  return {
    containerRef,
    isPulling,
    isRefreshing,
    pullDistance,
  };
};
