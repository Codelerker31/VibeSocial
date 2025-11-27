import { getTags } from '@/lib/tags';
import { TagManager } from './tag-manager';

export const dynamic = 'force-dynamic';

export default async function TagsAdminPage() {
  const tags = await getTags();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Tag Management</h1>
      <TagManager initialTags={tags} />
    </div>
  );
}
