import useSWR from 'swr';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProjectLike(projectId: string, initialLikeCount: number, initialLiked: boolean) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  const toggleLike = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (isLoading) return;

    const previousLiked = liked;
    const previousCount = likeCount;

    // Optimistic update
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/like`, {
        method: 'POST',
      });
      
      if (!res.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch (error) {
      // Rollback
      setLiked(previousLiked);
      setLikeCount(previousCount);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { liked, likeCount, toggleLike, isLoading };
}

export function useProjectSave(projectId: string, initialSaveCount: number, initialSaved: boolean) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [saved, setSaved] = useState(initialSaved);
  const [saveCount, setSaveCount] = useState(initialSaveCount);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSave = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    if (isLoading) return;

    const previousSaved = saved;
    const previousCount = saveCount;

    // Optimistic update
    setSaved(!saved);
    setSaveCount(saved ? saveCount - 1 : saveCount + 1);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/save`, {
        method: 'POST',
      });
      
      if (!res.ok) {
        throw new Error('Failed to toggle save');
      }

      const data = await res.json();
      setSaved(data.saved);
      setSaveCount(data.saveCount);
    } catch (error) {
      // Rollback
      setSaved(previousSaved);
      setSaveCount(previousCount);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { saved, saveCount, toggleSave, isLoading };
}

export function useProjectComments(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR(`/api/projects/${projectId}/comments`, fetcher);

  return {
    comments: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useAddComment(projectId: string) {
  const { mutate } = useProjectComments(projectId);
  const { data: session } = useSession();

  const addComment = async (content: string, parentId?: string) => {
    if (!session) throw new Error('Unauthorized');

    const res = await fetch(`/api/projects/${projectId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, parentId }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to post comment');
    }

    await mutate(); // Revalidate
  };

  return { addComment };
}
