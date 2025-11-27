'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TagCategory } from '@prisma/client';

interface Tag {
  id: string;
  name: string;
  slug: string;
  category: TagCategory;
}

interface FilterSidebarProps {
  groupedTags: Record<string, Tag[]>; // Using string key to be safe
  className?: string;
}

export function FilterSidebar({ groupedTags, className }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(Object.keys(groupedTags));

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
    
    updateFilters(newTags);
  };

  const updateFilters = (tags: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tags.length > 0) {
      params.set('tags', tags.join(','));
    } else {
      params.delete('tags');
    }
    // Reset page when filtering
    params.delete('page');
    router.push(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    updateFilters([]);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className={cn("w-64 flex-shrink-0 hidden lg:block", className)}>
      <div className="sticky top-24 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Filters</h3>
          {selectedTags.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs">
              Clear All
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {Object.entries(groupedTags).map(([category, tags]) => (
            <div key={category} className="border-b pb-4 last:border-0">
              <button 
                onClick={() => toggleCategory(category)}
                className="flex items-center justify-between w-full py-2 text-sm font-medium text-gray-900 hover:text-indigo-600"
              >
                <span className="capitalize">{category.toLowerCase().replace('_', ' ')}</span>
                {expandedCategories.includes(category) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              
              {expandedCategories.includes(category) && (
                <div className="mt-2 space-y-2">
                  {tags.map(tag => (
                    <div key={tag.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`tag-${tag.id}`}
                        checked={selectedTags.includes(tag.slug)}
                        onChange={() => toggleTag(tag.slug)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label 
                        htmlFor={`tag-${tag.id}`}
                        className="ml-2 text-sm text-gray-600 cursor-pointer select-none"
                      >
                        {tag.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
