'use client';

import { useEffect } from 'react';
import { initTimeTracker } from '@/lib/time-tracker';

export function ProjectTracker({ projectId }: { projectId: string }) {
  useEffect(() => {
    const cleanup = initTimeTracker(projectId);
    return cleanup;
  }, [projectId]);

  return null;
}
