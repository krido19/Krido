import React from 'react';
import { Mail, ExternalLink } from 'lucide-react';

export default function ContactCard() {
  return (
    <div className="w-[85%] mb-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800/30 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
        <Mail className="w-4 h-4" />
        <span className="text-sm font-semibold">Contact Information</span>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <a href="mailto:hello@example.com" className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Mail className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Email Me</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-500">hello@example.com</p>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>

        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-300">
            <Github className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">GitHub</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">@username</p>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>

        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Linkedin className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">LinkedIn</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-indigo-500">Connect with me</p>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      </div>
    </div>
  );
}
