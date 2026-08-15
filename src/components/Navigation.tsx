'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Timer } from 'lucide-react';

// lucide-react v1 dropped brand icons, so the GitHub mark lives here.
function GithubMark({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.78 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}
import { ThemeToggle } from './ThemeToggle';

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-card border-b border-border/50 shadow-sm" aria-label="Main navigation">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors py-2 px-2 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            aria-label="Interval Timer Home"
          >
            <Timer size={24} className="text-primary" />
            <span className="text-xl font-semibold">Interval Timer</span>
          </Link>
          
          {/* Navigation Links and Theme Toggle */}
          <div className="flex items-center space-x-1" role="navigation">
            <div className="hidden sm:flex items-center space-x-1">
              <Link 
                href="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
                  pathname === '/' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
                aria-current={pathname === '/' ? 'page' : undefined}
              >
                Today&apos;s Workout
              </Link>
              <Link 
                href="/workouts" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
                  pathname === '/workouts' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
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
                className={`px-2 py-2 rounded-md text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background touch-target ${
                  pathname === '/' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
                aria-current={pathname === '/' ? 'page' : undefined}
              >
                Today
              </Link>
              <Link 
                href="/workouts" 
                className={`px-2 py-2 rounded-md text-xs font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background touch-target ${
                  pathname === '/workouts' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
                aria-current={pathname === '/workouts' ? 'page' : undefined}
              >
                All
              </Link>
            </div>
            
            {/* GitHub Link and Theme Toggle */}
            <div className="flex items-center space-x-2 ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-border">
              <a
                href="https://github.com/saadiq/interval-timer"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md bg-secondary hover:bg-accent text-secondary-foreground hover:text-accent-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                aria-label="View source code on GitHub"
                title="View on GitHub"
              >
                <GithubMark size={20} />
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}