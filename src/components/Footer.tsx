import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-white/10 bg-black/75 py-8 text-white backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-gray-400 mb-2">
            AI作品收集平台 - 专为青少年AI教育设计
          </p>
          <p className="text-sm text-gray-500 flex items-center justify-center">
            用
            <Heart className="w-4 h-4 mx-1 text-red-500" />
            打造
          </p>
        </div>
      </div>
    </footer>
  );
};
