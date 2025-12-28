import { Skeleton } from "@/components/ui/skeleton";

export const EventCardSkeleton = () => {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#181818] to-[#101010] p-4 sm:p-5 flex items-center gap-4">
      {/* Icon placeholder */}
      <Skeleton className="h-12 w-12 rounded-2xl flex-shrink-0" />

      {/* Content placeholder */}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Menu button placeholder */}
      <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
    </div>
  );
};

export const EventCardSkeletonList = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
};
