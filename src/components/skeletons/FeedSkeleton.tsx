import { ProjectCardSkeleton } from "./ProjectCardSkeleton"

interface FeedSkeletonProps {
  count?: number
}

export function FeedSkeleton({ count = 6 }: FeedSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  )
}
