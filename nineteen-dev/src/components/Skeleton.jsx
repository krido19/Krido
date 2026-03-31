import React from 'react';

export const SkeletonCard = () => (
    <div className="bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden animate-pulse">
        <div className="w-full h-64 bg-gray-300 dark:bg-gray-800"></div>
        <div className="p-6">
            <div className="h-6 bg-gray-300 dark:bg-gray-800 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-800 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-800 rounded w-5/6 mb-4"></div>
            <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-300 dark:bg-gray-800 rounded"></div>
                <div className="h-6 w-16 bg-gray-300 dark:bg-gray-800 rounded"></div>
            </div>
        </div>
    </div>
);

export const SkeletonActivity = () => (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-pulse">
        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-800 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/50 dark:bg-gray-900/50 p-6 border border-gray-200 dark:border-gray-800 rounded-xl">
            <div className="flex justify-between mb-4">
                <div className="h-5 bg-gray-300 dark:bg-gray-800 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-800 rounded w-1/4"></div>
            </div>
            <div className="h-4 bg-gray-300 dark:bg-gray-800 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-800 rounded w-4/5 mb-4"></div>
            <div className="w-full h-32 bg-gray-300 dark:bg-gray-800 rounded"></div>
        </div>
    </div>
);

export const SkeletonServiceCard = () => (
    <div className="bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden animate-pulse">
        <div className="p-6">
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-lg bg-gray-300 dark:bg-gray-800"></div>
                <div className="w-16 h-6 rounded bg-gray-300 dark:bg-gray-800"></div>
            </div>
            <div className="h-6 bg-gray-300 dark:bg-gray-800 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-800 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-800 rounded w-5/6 mb-6"></div>
            <div className="flex flex-wrap gap-2 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-6 w-20 bg-gray-300 dark:bg-gray-800 rounded-full"></div>
                ))}
            </div>
            <div className="h-10 w-full bg-gray-300 dark:bg-gray-800 rounded-lg"></div>
        </div>
    </div>
);

export const SkeletonAppCard = () => (
    <div className="bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden animate-pulse">
        <div className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                        <div className="h-6 w-24 bg-gray-300 dark:bg-gray-800 rounded"></div>
                        <div className="h-6 w-16 bg-gray-300 dark:bg-gray-800 rounded-full"></div>
                    </div>
                    <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-800 rounded"></div>
                </div>
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-800 rounded shadow-sm"></div>
            </div>
            <div className="h-4 w-full bg-gray-300 dark:bg-gray-800 rounded mb-2"></div>
            <div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-800 rounded mb-4"></div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-800 rounded"></div>
                <div className="h-4 w-20 bg-gray-300 dark:bg-gray-800 rounded"></div>
            </div>
        </div>
    </div>
);
