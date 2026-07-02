import React from 'react';
import WorldCupBracket from '../../components/WorldCupBracket';
import { Trophy } from 'lucide-react';

export default function WorldCupBracketPage() {
  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header Panel */}
      <div className="flex-none p-6 md:p-8 bg-white border-b border-gray-100/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-500/20 shadow-inner">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 tracking-tight">World Cup Bracket</h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">Bagan Pertandingan World Cup 2026 secara live.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Panel */}
      <div className="flex-1 overflow-auto bg-gray-50/30 p-6 md:p-8">
        <div className="rounded-2xl border border-gray-200/60 bg-white overflow-hidden shadow-sm">
          {/* Komponen Bracket yang kita buat sebelumnya */}
          <WorldCupBracket />
        </div>
      </div>
    </div>
  );
}
