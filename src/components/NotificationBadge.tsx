import React from "react";

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  className = "",
}) => {
  if (count === 0) return null;

  const displayCount = count > 99 ? "99+" : count.toString();

  return (
    <span
      className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg ${className}`}
    >
      {displayCount}
    </span>
  );
};
