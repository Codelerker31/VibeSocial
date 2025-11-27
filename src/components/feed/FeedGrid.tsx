'use client';

import useSWRInfinite from 'swr/infinite';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProjectCard } from './ProjectCard';
import { FeedSkeleton } from '@/components/skeletons/FeedSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { Search } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface FeedGridProps {
  endpoint?: string;
}

export function FeedGrid({ endpoint = '/api/feed' }: FeedGridProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const searchParams = useSearchParams();

  const getKey = (pageIndex: number, previousPageData: { hasMore: boolean } | null) => {
    if (previousPageData && !previousPageData.hasMore) return null;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', (pageIndex + 1).toString());
    params.set('limit', '20');
    
    const separator = endpoint.includes('?') ? '&' : '?';
    return `${endpoint}${separator}${params.toString()}`;
  };

  const { data, size, setSize, isLoading } = useSWRInfinite(getKey, fetcher);

  const projects = data ? data.flatMap(page => page.projects) : [];
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.projects?.length === 0;
  const isReachingEnd = isEmpty || (data && !data[data.length - 1]?.hasMore);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsIntersecting(entry.isIntersecting);
        }
      },
      { rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isIntersecting && !isReachingEnd && !isLoadingMore) {
      setSize(size + 1);
    }
  }, [isIntersecting, isReachingEnd, isLoadingMore, setSize, size]);

  if (isLoading && !data) {
    return <FeedSkeleton />;
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={Search}
        title="No projects found"
        description="Try adjusting your filters or be the first to submit a project!"
        actionLabel="Submit Project"
        actionLink="/submit"
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {projects.map((project: any) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      
      {/* Loading indicator for infinite scroll */}
      <div ref={loadMoreRef} className="py-4 flex justify-center min-h-[50px]">
        {isLoadingMore && <FeedSkeleton count={3} />}
      </div>
    </div>
  );
}
