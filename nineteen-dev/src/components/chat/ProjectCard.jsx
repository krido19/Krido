import React from 'react';
import { ExternalLink, Briefcase } from 'lucide-react';

export default function ProjectCard({ data }) {
  const projects = [
    { title: 'Interactive Portfolio', desc: 'A 3D interactive portfolio built with React Three Fiber.', tech: ['React', 'Three.js'] },
    { title: 'AI Chatbot', desc: 'A customer support bot using Gemini API with function calling.', tech: ['Next.js', 'Gemini API'] },
    { title: 'E-commerce App', desc: 'Fullstack store with Supabase and Stripe integration.', tech: ['SvelteKit', 'Supabase'] }
  ];

  return (
    <div className="w-[85%] mb-3 rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-primary">
        <Briefcase className="w-4 h-4" />
        <span className="text-sm font-semibold">Featured Projects</span>
      </div>
      <div className="p-3 space-y-3">
        {projects.map((proj, idx) => (
          <div key={idx} className="group border-b border-gray-100 last:border-0 pb-3 last:pb-0">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors flex items-center gap-1 cursor-pointer">
                {proj.title}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
            </div>
            <p className="text-xs text-gray-500 mb-2 leading-relaxed">{proj.desc}</p>
            <div className="flex gap-1.5 flex-wrap">
              {proj.tech.map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 bg-muted text-gray-600 rounded font-medium border border-gray-200">
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
