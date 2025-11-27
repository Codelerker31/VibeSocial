'use client';

import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Tag {
  id: string;
  name: string;
  slug: string;
  category: string;
}

interface MobileFilterButtonProps {
  groupedTags: Record<string, Tag[]>;
}

export function MobileFilterButton({ groupedTags }: MobileFilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      setTimeout(() => setSelectedTags(tagsParam.split(',')), 0);
    } else {
      setTimeout(() => setSelectedTags([]), 0);
    }
  }, [searchParams]);

  const toggleTag = (slug: string) => {
    const newTags = selectedTags.includes(slug)
      ? selectedTags.filter(t => t !== slug)
      : [...selectedTags, slug];
    setSelectedTags(newTags);
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','));
    } else {
      params.delete('tags');
    }
    params.delete('page');
    router.push(`/?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setSelectedTags([]);
  };

  const activeCount = selectedTags.length;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <Button 
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg flex items-center justify-center p-0"
        >
          <Filter className="h-6 w-6" />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md h-[80vh] sm:h-[600px] sm:rounded-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {Object.entries(groupedTags).map(([category, tags]) => (
                <div key={category} className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3 capitalize">
                    {category.toLowerCase().replace('_', ' ')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.slug)}
                        className={cn(
                          "px-3 py-1 rounded-full text-sm border transition-colors",
                          selectedTags.includes(tag.slug)
                            ? "bg-indigo-100 border-indigo-200 text-indigo-700"
                            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                        )}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t flex gap-3">
              <Button variant="outline" className="flex-1" onClick={clearFilters}>
                Clear All
              </Button>
              <Button className="flex-1" onClick={applyFilters}>
                Show Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
