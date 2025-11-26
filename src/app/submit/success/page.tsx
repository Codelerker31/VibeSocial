import Link from 'next/link';
import { CheckCircle, ArrowRight, Plus } from 'lucide-react';

export default function SubmissionSuccessPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-green-100 p-4 rounded-full mb-6">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Project Submitted Successfully!</h1>
      
      <p className="text-lg text-gray-600 max-w-md mb-8">
        Your project is now under review. We'll notify you once it's approved (usually within 24 hours).
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/profile" 
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          View My Projects
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
        
        <Link 
          href="/submit" 
          className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Submit Another
        </Link>
      </div>
    </div>
  );
}
