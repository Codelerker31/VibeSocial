'use client';

import { Github, Globe } from 'lucide-react';

interface ProjectLinksProps {
  projectId: string;
  demoUrl?: string | null;
  sourceUrl: string;
}

export function ProjectLinks({ projectId, demoUrl, sourceUrl }: ProjectLinksProps) {
  const trackClick = async (type: 'demo' | 'source') => {
    try {
      // Use sendBeacon if possible for reliability during navigation, but fetch is usually fine for new tab
      // Since target="_blank", fetch is fine.
      await fetch(`/api/projects/${projectId}/click-${type}`, { method: 'POST' });
    } catch (error) {
      console.error(`Failed to track ${type} click`, error);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      {demoUrl && (
        <a 
          href={demoUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={() => trackClick('demo')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
        >
          <Globe className="w-4 h-4" />
          Live Demo
        </a>
      )}
      <a 
        href={sourceUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={() => trackClick('source')}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
      >
        <Github className="w-4 h-4" />
        Source Code
      </a>
    </div>
  );
}
