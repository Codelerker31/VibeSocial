'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, PlusSquare, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function MobileTabBar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const tabs = [
    {
      name: 'Home',
      href: '/',
      icon: Home,
    },
    {
      name: 'Explore',
      href: '/explore',
      icon: Compass,
    },
    {
      name: 'Submit',
      href: '/submit',
      icon: PlusSquare,
    },
    {
      name: 'Profile',
      href: user ? `/users/${user.name || 'me'}` : '/login',
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 sm:hidden pb-safe">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
