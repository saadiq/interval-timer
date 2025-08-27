'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Timer, Github } from 'lucide-react';
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
                <Github size={20} />
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}