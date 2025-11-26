'use client';

import { TagCategory } from '@prisma/client';
import { createTag, deleteTag } from './actions';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';

type Tag = {
  id: string;
  name: string;
  category: TagCategory;
  slug: string;
};

type GroupedTags = Record<TagCategory, Tag[]>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {pending ? 'Adding...' : 'Add Tag'}
    </button>
  );
}

export function TagManager({ initialTags }: { initialTags: GroupedTags }) {
  const [message, setMessage] = useState<string | null>(null);

  async function handleCreate(formData: FormData) {
    const result = await createTag(formData);
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage('Tag created successfully');
      (document.getElementById('create-tag-form') as HTMLFormElement).reset();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure?')) return;
    const result = await deleteTag(id);
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage('Tag deleted successfully');
    }
  }

  return (
    <div className="space-y-8">
      {message && (
        <div className="p-4 bg-gray-100 border rounded">
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Add New Tag</h2>
        <form id="create-tag-form" action={handleCreate} className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              type="text"
              required
              className="border rounded px-3 py-2 w-64"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              className="border rounded px-3 py-2 w-48"
            >
              {Object.values(TagCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <SubmitButton />
        </form>
      </div>

      <div className="space-y-6">
        {Object.entries(initialTags).map(([category, tags]) => (
          <div key={category} className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">{category}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tags.map((tag) => (
                <div key={tag.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                  <span className="font-medium">{tag.name}</span>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
