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
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-foreground">nineteen</span>
          <span className="text-lg font-bold text-primary">.dev</span>
        </div>
      </div>
    </div>
  );
};

export default Loading;
