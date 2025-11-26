import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SubmissionForm } from '@/components/project/SubmissionForm';
import { getTags } from '@/lib/tags';

export const metadata: Metadata = {
  title: 'Submit Project | DevSocial',
  description: 'Submit your project to DevSocial',
};

export default async function SubmitPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/submit');
  }

  const groupedTags = await getTags();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Submit Your Project</h1>
        <p className="text-gray-600 mt-2">
          Share your work with the community. Please ensure your project meets our guidelines.
        </p>
      </div>
      <SubmissionForm groupedTags={groupedTags} />
    </div>
  );
}
