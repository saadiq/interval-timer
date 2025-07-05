'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-gray-800 text-white p-4" aria-label="Main navigation">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold py-3 px-2 min-h-[44px] flex items-center" aria-label="Interval Timer Home">
          Interval Timer
        </Link>
        
        <div className="flex space-x-4" role="navigation">
          <Link 
            href="/" 
            className={`hover:text-gray-300 transition-colors py-3 px-2 min-h-[44px] flex items-center ${
              pathname === '/' ? 'text-white font-medium' : 'text-gray-300'
            }`}
            aria-current={pathname === '/' ? 'page' : undefined}
          >
            Today&apos;s Workout
          </Link>
          <Link 
            href="/workouts" 
            className={`hover:text-gray-300 transition-colors py-3 px-2 min-h-[44px] flex items-center ${
              pathname === '/workouts' ? 'text-white font-medium' : 'text-gray-300'
            }`}
            aria-current={pathname === '/workouts' ? 'page' : undefined}
          >
            All Workouts
          </Link>
        </div>
      </div>
    </nav>
  );
} 