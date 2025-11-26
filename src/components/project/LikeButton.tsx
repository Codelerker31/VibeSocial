'use client';

import { Heart } from 'lucide-react';
import { useProjectLike } from '@/hooks/useProjectInteractions';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  projectId: string;
  initialLikeCount: number;
  initialLiked: boolean;
}

export function LikeButton({ projectId, initialLikeCount, initialLiked }: LikeButtonProps) {
  const { liked, likeCount, toggleLike, isLoading } = useProjectLike(projectId, initialLikeCount, initialLiked);

  return (
    <button
      onClick={toggleLike}
      disabled={isLoading}
      title={liked ? 'Unlike this project' : 'Like this project'}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm font-medium",
        liked 
          ? "text-red-600 bg-red-50 hover:bg-red-100" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <Heart className={cn("h-5 w-5", liked && "fill-current")} />
      <span>{likeCount}</span>
    </button>
  );
}
