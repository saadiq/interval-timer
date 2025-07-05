// src/components/KeyboardShortcuts.tsx
import React, { useState, useEffect } from 'react';
import { Keyboard, X, Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

export const KeyboardShortcuts: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { 
      keys: ['Space', 'K'], 
      action: 'Play/Pause workout',
      icon: Play,
      description: 'Start or pause the current workout timer'
    },
    { 
      keys: ['←', 'J'], 
      action: 'Previous section',
      icon: SkipBack,
      description: 'Jump to the beginning of the previous exercise'
    },
    { 
      keys: ['→', 'L'], 
      action: 'Next section',
      icon: SkipForward,
      description: 'Skip to the next exercise'
    },
    { 
      keys: ['R'], 
      action: 'Reset workout',
      icon: RotateCcw,
      description: 'Reset the workout to the beginning'
    },
  ];

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary hover:bg-primary/90 text-primary-foreground p-3 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background z-40 touch-target keyboard-shortcuts-button"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts"
        style={{ touchAction: 'manipulation' }}
      >
        <Keyboard size={20} />
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-card border border-border rounded-xl p-6 max-w-lg w-full shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="shortcuts-title"
            aria-modal="true"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 id="shortcuts-title" className="text-2xl font-bold text-card-foreground flex items-center space-x-2">
                  <Keyboard size={24} className="text-primary" />
                  <span>Keyboard Shortcuts</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Use these shortcuts to control your workout
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-card-foreground p-2 rounded-md hover:bg-accent transition-colors"
                aria-label="Close keyboard shortcuts"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              {shortcuts.map((shortcut, index) => {
                const IconComponent = shortcut.icon;
                return (
                  <div key={index} className="group p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-md bg-primary/10 text-primary">
                          <IconComponent size={16} />
                        </div>
                        <div>
                          <div className="font-medium text-card-foreground">{shortcut.action}</div>
                          <div className="text-xs text-muted-foreground">{shortcut.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            {keyIndex > 0 && (
                              <span className="text-muted-foreground text-xs mx-1">or</span>
                            )}
                            <kbd className="px-3 py-1.5 bg-secondary border border-border rounded-md text-sm font-mono font-medium text-secondary-foreground shadow-sm">
                              {key}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Press <kbd className="px-2 py-1 bg-secondary border border-border rounded text-xs font-mono">Esc</kbd> to close this dialog
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};