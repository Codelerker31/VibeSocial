import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
          DevSocial
        </h1>
        <p className="text-lg leading-8 text-gray-600 mb-10">
          A discovery platform for developers to showcase their code projects.
          <br />
          <span className="text-sm text-gray-500">(MVP Work in Progress - Week 3)</span>
        </p>
        
        <div className="flex items-center justify-center gap-x-6">
          <Link
            href="/submit"
            className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Submit a Project
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold leading-6 text-gray-900 flex items-center"
          >
            Log in <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
