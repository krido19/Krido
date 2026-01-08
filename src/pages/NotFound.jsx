import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import Scene from '../components/Scene';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black font-mono selection:bg-pink-500 selection:text-white">
            {/* Background */}
            <div className="fixed inset-0 z-0 opacity-50">
                <Scene theme="dark" />
            </div>

            <div className="relative z-10 text-center px-4">
                {/* Glitch Effect 404 */}
                <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-pink-500 animate-pulse relative inline-block mb-4">
                    404
                    <span className="absolute inset-0 text-cyan-500 opacity-30 animate-ping" aria-hidden="true">404</span>
                </h1>

                {/* Cyberpunk Status Box */}
                <div className="bg-black/80 backdrop-blur-md border border-red-500/50 p-8 rounded-xl max-w-lg mx-auto shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                    <div className="flex items-center justify-center mb-6 text-red-500 animate-bounce">
                        <AlertTriangle className="w-12 h-12" />
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-wider uppercase">
                        System Failure
                    </h2>

                    <p className="text-gray-400 mb-8 font-mono">
                        The page you are looking for has been lost in cyberspace or does not exist.
                        <br />
                        <span className="text-xs text-red-500/70 mt-2 block">ERROR_CODE: PAGE_NOT_FOUND</span>
                    </p>

                    <Link
                        to="/"
                        className="inline-flex items-center px-8 py-3 text-sm font-bold text-black bg-cyan-500 hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(34,211,238,0.5)] clip-path-polygon group"
                        style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                    >
                        <Home className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                        RETURN TO BASE
                    </Link>
                </div>
            </div>

            {/* Decorative Overlay Lines */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(18,16,19,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[100] bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
        </div>
    );
};

export default NotFound;
