'use client';

import { useState } from 'react';
import { useAddComment } from '@/hooks/useProjectInteractions';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2 } from 'lucide-react';

interface CommentFormProps {
  projectId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CommentForm({ projectId, parentId, onSuccess, onCancel }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addComment } = useAddComment(projectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await addComment(content, parentId);
      setContent('');
      setIsPreview(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={cn(
              "px-3 py-1 text-sm font-medium rounded-md",
              !isPreview ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"
            )}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={cn(
              "px-3 py-1 text-sm font-medium rounded-md",
              isPreview ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"
            )}
          >
            Preview
          </button>
        </div>
        <span className={cn("text-xs", content.length > 5000 ? "text-red-500" : "text-gray-400")}>
          {content.length}/5000
        </span>
      </div>

      {isPreview ? (
        <div className="min-h-[100px] p-3 border rounded-md bg-gray-50 prose prose-sm max-w-none">
          {content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          ) : (
            <span className="text-gray-400 italic">Nothing to preview</span>
          )}
        </div>
      ) : (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment... (Markdown supported)"
          className="w-full min-h-[100px] p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-y"
          maxLength={5000}
          disabled={isSubmitting}
        />
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Post Comment
        </button>
      </div>
    </form>
  );
}
