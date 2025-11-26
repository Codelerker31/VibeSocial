'use client';

import { Bookmark } from 'lucide-react';
import { useProjectSave } from '@/hooks/useProjectInteractions';
import { cn } from '@/lib/utils';

interface SaveButtonProps {
  projectId: string;
  initialSaveCount: number;
  initialSaved: boolean;
}

export function SaveButton({ projectId, initialSaveCount, initialSaved }: SaveButtonProps) {
  const { saved, saveCount, toggleSave, isLoading } = useProjectSave(projectId, initialSaveCount, initialSaved);

  return (
    <button
      onClick={toggleSave}
      disabled={isLoading}
      title={saved ? 'Unsave project' : 'Save for later'}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm font-medium",
        saved 
          ? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
      <span>{saveCount}</span>
    </button>
  );
}
