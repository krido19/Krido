import React from 'react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-6">
        {/* Geometric loading indicator */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 bg-primary rounded-md animate-ping opacity-25" />
          <div className="absolute inset-2 bg-primary rounded-sm animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-black text-foreground tracking-tight">nineteen</span>
            <span className="text-2xl font-black text-primary tracking-tight">.dev</span>
          </div>
          <div className="bg-blue-50 text-blue-600 px-3 py-1 mt-1 rounded-full text-xs font-extrabold tracking-widest uppercase border border-blue-100 shadow-sm animate-pulse">
            4.4
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
