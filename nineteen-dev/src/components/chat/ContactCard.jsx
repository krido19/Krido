import React from 'react';
import { Mail, ExternalLink } from 'lucide-react';

const Github = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" />
  </svg>
);

const Linkedin = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

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
