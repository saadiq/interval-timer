'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Interval Timer
        </Link>
        
        <div className="flex space-x-4">
          <Link 
            href="/" 
            className={`hover:text-gray-300 transition-colors ${
              pathname === '/' ? 'text-white font-medium' : 'text-gray-300'
            }`}
          >
            Today's Workout
          </Link>
          <Link 
            href="/workouts" 
            className={`hover:text-gray-300 transition-colors ${
              pathname === '/workouts' ? 'text-white font-medium' : 'text-gray-300'
            }`}
          >
            All Workouts
          </Link>
        </div>
      </div>
    </nav>
  );
} 