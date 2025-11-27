'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Bookmark } from 'lucide-react';
import { Project, Tag } from '@prisma/client';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProjectCardProps {
  project: Project & { 
    tags: { tag: Tag }[]; 
    user: { displayName: string | null; profilePicture: string | null };
    hasLiked?: boolean;
    hasSaved?: boolean;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [liked, setLiked] = useState(project.hasLiked || false);
  const [saved, setSaved] = useState(project.hasSaved || false);
  const [likeCount, setLikeCount] = useState(project.likeCount);
  const [saveCount, setSaveCount] = useState(project.saveCount);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const viewTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          // Start timer
          viewTimer.current = setTimeout(() => {
            // Send view event
            fetch('/api/interactions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ projectId: project.id, type: 'VIEW' })
            }).catch(console.error);
          }, 1000); // 1 second threshold
        } else {
          // Clear timer if scrolled away
          if (viewTimer.current) {
            clearTimeout(viewTimer.current);
            viewTimer.current = null;
          }
        }
      },
      { threshold: 0.5 } // 50% visible
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
      if (viewTimer.current) clearTimeout(viewTimer.current);
    };
  }, [project.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);

    try {
      // Call API to toggle like
      // Assuming an endpoint exists or will exist. 
      // For now just optimistic update.
      // await fetch(`/api/projects/${project.id}/like`, { method: 'POST' });
    } catch (error) {
      console.error(error);
      // Revert
      setLiked(!newLiked);
      setLikeCount(prev => !newLiked ? prev + 1 : prev - 1);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newSaved = !saved;
    setSaved(newSaved);
    setSaveCount(prev => newSaved ? prev + 1 : prev - 1);

    try {
      // Call API to toggle save
      // await fetch(`/api/projects/${project.id}/save`, { method: 'POST' });
    } catch (error) {
      console.error(error);
      setSaved(!newSaved);
      setSaveCount(prev => !newSaved ? prev + 1 : prev - 1);
    }
  };

  const displayTags = project.tags.slice(0, 3);
  const remainingTags = project.tags.length - 3;

  return (
    <Link href={`/projects/${project.slug}`} className="block group">
      <div ref={cardRef} className="bg-card border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
        {/* Cover Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {project.coverImage ? (
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No Image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 h-10">
              {project.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {displayTags.map(({ tag }) => (
              <Badge key={tag.id} variant="secondary" className="text-xs font-normal">
                {tag.name}
              </Badge>
            ))}
            {remainingTags > 0 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{remainingTags}
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Avatar className="h-6 w-6">
                <AvatarImage src={project.user.profilePicture || undefined} />
                <AvatarFallback>{project.user.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[100px]">{project.user.displayName || 'Anonymous'}</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-8 px-2 gap-1 hover:text-red-500", liked && "text-red-500")}
                onClick={handleLike}
              >
                <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                <span className="text-xs">{likeCount}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-8 px-2 gap-1 hover:text-blue-500", saved && "text-blue-500")}
                onClick={handleSave}
              >
                <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
                <span className="text-xs">{saveCount}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
