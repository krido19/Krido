import React from 'react';

const Loading = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-cyan-400 font-mono">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 border-4 border-t-cyan-500 border-r-pink-500 border-b-purple-500 border-l-yellow-500 rounded-full animate-spin"></div>
                <p className="animate-pulse">INITIALIZING SYSTEM...</p>
            </div>
        </div>
    );
};

export default Loading;
