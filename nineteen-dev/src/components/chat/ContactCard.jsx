import React from 'react';
import { Mail, Github, Linkedin, ExternalLink } from 'lucide-react';

export default function ContactCard() {
  return (
    <div className="w-[85%] mb-3 rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-secondary">
        <Mail className="w-4 h-4" />
        <span className="text-sm font-semibold">Contact Information</span>
      </div>
      <div className="p-3 flex flex-col gap-1">
        <a href="mailto:hello@nineteen.dev" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors group">
          <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-primary border border-blue-100">
            <Mail className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">Email</p>
            <p className="text-sm font-medium text-foreground group-hover:text-primary truncate">hello@nineteen.dev</p>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </a>

        <a href="https://github.com/kridodev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors group">
          <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-gray-700 border border-gray-200">
            <Github className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">GitHub</p>
            <p className="text-sm font-medium text-foreground group-hover:text-foreground truncate">@kridodev</p>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </a>

        <a href="https://linkedin.com/in/kridodev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors group">
          <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-primary border border-blue-100">
            <Linkedin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">LinkedIn</p>
            <p className="text-sm font-medium text-foreground group-hover:text-primary truncate">Connect with me</p>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </a>
      </div>
    </div>
  );
}
