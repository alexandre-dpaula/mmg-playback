import React from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
}

export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  isPulling,
  isRefreshing,
  pullDistance,
}) => {
  const opacity = Math.min(pullDistance / 80, 1);
  const rotation = pullDistance * 2;

  return (
    <div
      className="fixed top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-50 transition-all"
      style={{
        height: `${pullDistance}px`,
        opacity,
      }}
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-full p-2">
        <RefreshCw
          className={`w-5 h-5 text-white transition-transform ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          style={{
            transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
          }}
        />
      </div>
    </div>
  );
};
