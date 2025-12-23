import { useRef, useState } from 'react';

interface UseSwipeToDeleteOptions {
  onDelete: () => void;
  threshold?: number;
}

export const useSwipeToDelete = ({
  onDelete,
  threshold = 100,
}: UseSwipeToDeleteOptions) => {
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    setIsSwiping(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentX.current = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;

    const deltaX = startX.current - currentX.current;
    const deltaY = Math.abs(currentY - startY.current);

    // Só considera swipe horizontal se movimento vertical for mínimo
    if (Math.abs(deltaX) > 10 && deltaY < 30) {
      setIsSwiping(true);

      // Só permite swipe para esquerda (deltaX positivo)
      if (deltaX > 0) {
        const distance = Math.min(deltaX, threshold + 50);
        setSwipeDistance(distance);
      } else {
        setSwipeDistance(0);
      }
    }
  };

  const handleTouchEnd = () => {
    if (swipeDistance > threshold) {
      // Confirmação visual antes de deletar
      onDelete();
    }

    // Reset
    setSwipeDistance(0);
    setIsSwiping(false);
    startX.current = 0;
    startY.current = 0;
    currentX.current = 0;
  };

  return {
    swipeDistance,
    isSwiping,
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};
