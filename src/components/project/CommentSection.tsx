'use client';

import { useProjectComments } from '@/hooks/useProjectInteractions';
import { CommentForm } from './CommentForm';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { MessageSquare, Trash2, Edit2 } from 'lucide-react';

interface CommentSectionProps {
  projectId: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  parentId: string | null;
  user: {
    id: string;
    username: string | null;
    displayName: string | null;
    profilePicture: string | null;
  };
}

export function CommentSection({ projectId }: CommentSectionProps) {
  const { comments, isLoading, isError } = useProjectComments(projectId);
  const { data: session } = useSession();

  if (isLoading) return <div className="py-8 text-center text-gray-500">Loading comments...</div>;
  if (isError) return <div className="py-8 text-center text-red-500">Failed to load comments</div>;

  // Group comments
  const rootComments = comments?.filter((c: Comment) => !c.parentId) || [];
  const replies = comments?.filter((c: Comment) => c.parentId) || [];

  const getReplies = (commentId: string) => {
    return replies.filter((r: Comment) => r.parentId === commentId).sort((a: Comment, b: Comment) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  };

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900">
        Comments ({comments?.length || 0})
      </h3>

      {session ? (
        <CommentForm projectId={projectId} />
      ) : (
        <div className="p-4 bg-gray-50 rounded-md text-center text-gray-600">
          Please <a href="/login" className="text-indigo-600 hover:underline">log in</a> to leave a comment.
        </div>
      )}

      <div className="space-y-6">
        {rootComments.map((comment: Comment) => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            replies={getReplies(comment.id)} 
            projectId={projectId}
          />
        ))}
        {rootComments.length === 0 && (
          <p className="text-center text-gray-500 py-8">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  );
}

function CommentItem({ 
  comment, 
  replies, 
  projectId,
}: { 
  comment: Comment; 
  replies: Comment[]; 
  projectId: string;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const { data: session } = useSession();
  
  const isOwner = session?.user?.id === comment.user.id;
  const isDeleted = !!comment.deletedAt;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await fetch(`/api/comments/${comment.id}`, { method: 'DELETE' });
      // Ideally trigger revalidation here, but for now we rely on SWR revalidation or page refresh
      // We can pass mutate down or use global mutate
      window.location.reload(); // Quick fix for MVP
    } catch (error) {
      console.error('Failed to delete comment', error);
    }
  };

  return (
    <div className="flex space-x-4">
      <div className="flex-shrink-0">
        {comment.user.profilePicture ? (
          <Image
            src={comment.user.profilePicture}
            alt={comment.user.displayName || 'User'}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
            {(comment.user.displayName?.[0] || comment.user.username?.[0] || '?').toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-grow">
        <div className="bg-white rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900">
                {comment.user.displayName || comment.user.username || 'Anonymous'}
              </span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            {isOwner && !isDeleted && (
              <div className="flex space-x-2">
                <button onClick={handleDelete} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {isDeleted ? (
            <p className="text-gray-500 italic text-sm py-2">This comment has been deleted.</p>
          ) : (
            <div className="prose prose-sm max-w-none text-gray-700 mb-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.content}</ReactMarkdown>
            </div>
          )}

          {!isDeleted && (
            <div className="flex items-center space-x-4 mt-2">
              {session && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="flex items-center text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Reply
                </button>
              )}
            </div>
          )}
        </div>

        {isReplying && (
          <div className="mt-4 ml-2">
            <CommentForm
              projectId={projectId}
              parentId={comment.id}
              onSuccess={() => setIsReplying(false)}
              onCancel={() => setIsReplying(false)}
            />
          </div>
        )}

        {replies.length > 0 && (
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-100">
            {replies.map((reply) => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                replies={[]} 
                projectId={projectId} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
