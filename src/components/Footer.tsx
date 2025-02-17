import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-4 bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-600 flex items-center justify-center gap-1">
          Made with{' '}
          <Heart 
            className="w-4 h-4 text-red-500 animate-pulse" 
            fill="currentColor"
          />{' '}
          by{' '}
          <span className="text-[#013c80] font-medium">Mitul Patel</span>
        </p>
        <p className="text-center text-xs text-gray-500 mt-1">
          © {new Date().getFullYear()} Link Market. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer; 