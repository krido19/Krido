import React from 'react';
import { ExternalLink, Briefcase } from 'lucide-react';

export default function ProjectCard({ data }) {
  // Mock data for demonstration. In a real app, this might fetch from an API or use passed data.
  const projects = [
    { title: 'Interactive Portfolio', desc: 'A 3D interactive portfolio built with React Three Fiber.', tech: ['React', 'Three.js'] },
    { title: 'AI Chatbot', desc: 'A customer support bot using Gemini API with function calling.', tech: ['Next.js', 'Gemini API'] },
    { title: 'E-commerce App', desc: 'Fullstack store with Supabase and Stripe integration.', tech: ['SvelteKit', 'Supabase'] }
  ];

  return (
    <div className="w-[85%] mb-4 rounded-2xl bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800/30 flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
        <Briefcase className="w-4 h-4" />
        <span className="text-sm font-semibold">Featured Projects</span>
      </div>
      <div className="p-4 space-y-4">
        {projects.map((proj, idx) => (
          <div key={idx} className="group border-b border-gray-200 dark:border-gray-700/50 last:border-0 pb-3 last:pb-0">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm group-hover:text-indigo-500 transition-colors flex items-center gap-1 cursor-pointer">
                {proj.title}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
              {proj.desc}
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {proj.tech.map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 rounded-md font-medium">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
