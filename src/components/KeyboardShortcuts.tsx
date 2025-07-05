// src/components/KeyboardShortcuts.tsx
import React, { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

export const KeyboardShortcuts: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { keys: ['Space', 'K'], action: 'Play/Pause workout' },
    { keys: ['←', 'J'], action: 'Previous section' },
    { keys: ['→', 'L'], action: 'Next section' },
    { keys: ['R'], action: 'Reset workout' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-10"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts"
      >
        <Keyboard size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="shortcuts-title"
            aria-modal="true"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 id="shortcuts-title" className="text-xl font-bold">Keyboard Shortcuts</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Close keyboard shortcuts"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{shortcut.action}</span>
                  <div className="flex space-x-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <React.Fragment key={keyIndex}>
                        {keyIndex > 0 && <span className="text-gray-400">or</span>}
                        <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">
                          {key}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};