'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Timer } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-gradient-primary shadow-lg border-b border-border/40" aria-label="Main navigation">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-primary-foreground hover:text-primary-foreground/90 transition-colors py-2 px-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-transparent" 
            aria-label="Interval Timer Home"
          >
            <Timer size={24} className="text-primary-foreground" />
            <span className="text-xl font-bold">Interval Timer</span>
          </Link>
          
          {/* Navigation Links and Theme Toggle */}
          <div className="flex items-center space-x-1" role="navigation">
            <div className="hidden sm:flex items-center space-x-1">
              <Link 
                href="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-transparent ${
                  pathname === '/' 
                    ? 'bg-primary-foreground/20 text-primary-foreground' 
                    : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10'
                }`}
                aria-current={pathname === '/' ? 'page' : undefined}
              >
                Today&apos;s Workout
              </Link>
              <Link 
                href="/workouts" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-transparent ${
                  pathname === '/workouts' 
                    ? 'bg-primary-foreground/20 text-primary-foreground' 
                    : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10'
                }`}
                aria-current={pathname === '/workouts' ? 'page' : undefined}
              >
                All Workouts
              </Link>
            </div>

            {/* Mobile Navigation */}
            <div className="flex sm:hidden items-center space-x-1">
              <Link 
                href="/" 
                className={`px-2 py-2 rounded-md text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-transparent touch-target ${
                  pathname === '/' 
                    ? 'bg-primary-foreground/20 text-primary-foreground' 
                    : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10'
                }`}
                aria-current={pathname === '/' ? 'page' : undefined}
              >
                Today
              </Link>
              <Link 
                href="/workouts" 
                className={`px-2 py-2 rounded-md text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-transparent touch-target ${
                  pathname === '/workouts' 
                    ? 'bg-primary-foreground/20 text-primary-foreground' 
                    : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10'
                }`}
                aria-current={pathname === '/workouts' ? 'page' : undefined}
              >
                All
              </Link>
            </div>
            
            {/* Theme Toggle */}
            <div className="ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-primary-foreground/20">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 