import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link href="https://github.com" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">GitHub</span>
              <Github className="h-6 w-6" />
            </Link>
            <Link href="https://twitter.com" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-6 w-6" />
            </Link>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-500">
              &copy; {new Date().getFullYear()} DevSocial. All rights reserved.
            </p>
          </div>
          <div className="mt-8 flex justify-center space-x-6 md:order-3 md:mt-0">
            <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900">
              About
            </Link>
            <Link href="/faq" className="text-sm text-gray-500 hover:text-gray-900">
              FAQ
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
