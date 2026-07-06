import React, { useState } from 'react';
import WorldCupBracket from '../../components/WorldCupBracket';
import { Trophy, Save, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const EventList = ({ title, events, setEvents }) => (
  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold text-gray-900">{title}</h3>
      <button type="button" onClick={() => setEvents([...events, { id: Math.random().toString(), player: '', minute: '', type: 'goal' }])} className="text-xs bg-black text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-gray-800">
        <Plus className="w-3 h-3" /> Tambah
      </button>
    </div>
    {events.length === 0 ? (
      <p className="text-xs text-gray-400 italic">Belum ada kejadian manual.</p>
    ) : (
      <div className="space-y-3">
        {events.map((ev, idx) => (
          <div key={ev.id} className="flex gap-2 items-center">
            <input type="text" value={ev.player} onChange={e => {
              const newEvs = [...events]; newEvs[idx].player = e.target.value; setEvents(newEvs);
            }} placeholder="Nama Pemain" className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-black outline-none" required />
            
            <input type="number" value={ev.minute} onChange={e => {
              const newEvs = [...events]; newEvs[idx].minute = e.target.value; setEvents(newEvs);
            }} placeholder="Menit" className="w-20 px-3 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-black outline-none" />
            
            <select value={ev.type} onChange={e => {
              const newEvs = [...events]; newEvs[idx].type = e.target.value; setEvents(newEvs);
            }} className="px-2 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-black outline-none">
              <option value="goal">Gol Normal</option>
              <option value="penalty">Penalti (P)</option>
              <option value="red_card">Kartu Merah</option>
            </select>
            
            <button type="button" onClick={() => {
              const newEvs = [...events]; newEvs.splice(idx, 1); setEvents(newEvs);
            }} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default function WorldCupBracketPage() {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [homeEvents, setHomeEvents] = useState([]);
  const [awayEvents, setAwayEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const parseScorersToEvents = (scorersStr, redCardsStr, teamType) => {
    const events = [];
    if (scorersStr) {
      const list = scorersStr.split(',').map(s => s.trim()).filter(Boolean);
      list.forEach(item => {
        const isPenalty = item.includes('(P)');
        const cleanItem = item.replace('(P)', '').trim();
        const match = cleanItem.match(/(.+)\s+(\d+)'/);
        if (match) {
          events.push({ id: Math.random().toString(), player: match[1].trim(), minute: match[2], type: isPenalty ? 'penalty' : 'goal' });
        } else {
          events.push({ id: Math.random().toString(), player: cleanItem, minute: '', type: isPenalty ? 'penalty' : 'goal' });
        }
      });
    }
    if (redCardsStr) {
      try {
        const reds = JSON.parse(redCardsStr);
        reds.filter(r => r.team === teamType).forEach(r => {
          events.push({ id: Math.random().toString(), player: r.player, minute: r.minute, type: 'red_card' });
        });
      } catch(e) {}
    }
    return events;
  };

  const loadMatchData = async (match) => {
    setSelectedMatch(match);
    setMessage(null);
    if (!match) {
      setHomeEvents([]);
      setAwayEvents([]);
      return;
    }
    
    try {
      const { data } = await supabase.from('match_overrides').select('*').eq('match_id', match.id).single();
      if (data) {
        setHomeEvents(parseScorersToEvents(data.home_scorers_extra, data.red_cards, 'home'));
        setAwayEvents(parseScorersToEvents(data.away_scorers_extra, data.red_cards, 'away'));
      } else {
        setHomeEvents([]);
        setAwayEvents([]);
      }
    } catch (err) {
      setHomeEvents([]);
      setAwayEvents([]);
    }
  };

  const handleMatchClick = (match) => {
    loadMatchData(match);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedMatch) return;
    setLoading(true);
    setMessage(null);
    
    const toScorersString = (events) => {
      return events.filter(ev => ev.type !== 'red_card' && ev.player.trim() !== '')
                   .map(ev => `${ev.player.trim()}${ev.minute ? ` ${ev.minute}'` : ''}${ev.type === 'penalty' ? ' (P)' : ''}`)
                   .join(', ');
    };

    const toRedCardsJSON = () => {
      const reds = [];
      homeEvents.filter(ev => ev.type === 'red_card' && ev.player.trim() !== '').forEach(ev => reds.push({ player: ev.player.trim(), minute: ev.minute, team: 'home' }));
      awayEvents.filter(ev => ev.type === 'red_card' && ev.player.trim() !== '').forEach(ev => reds.push({ player: ev.player.trim(), minute: ev.minute, team: 'away' }));
      return reds.length > 0 ? JSON.stringify(reds) : null;
    };

    try {
      const { error } = await supabase.from('match_overrides').upsert({
        match_id: selectedMatch.id,
        home_scorers_extra: toScorersString(homeEvents),
        away_scorers_extra: toScorersString(awayEvents),
        red_cards: toRedCardsJSON()
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Data tambahan berhasil disimpan!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-none p-6 md:p-8 bg-white border-b border-gray-100/50">
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

      <div className="flex-1 overflow-auto bg-gray-50/30 p-6 md:p-8 space-y-8">
        <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm max-w-4xl">
          <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Save className="w-5 h-5 text-gray-500" /> Input Data Manual (Penalti & Kartu Merah)
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Klik kartu pertandingan di bawah untuk memilih laga. Lalu tambahkan kejadian (gol, penalti, kartu merah) secara mudah.
          </p>

          {!selectedMatch ? (
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center">
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Silakan pilih/klik pertandingan dari bagan di bawah</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Match Terpilih (ID: {selectedMatch.id})</span>
                  <h3 className="text-xl font-black text-gray-900 mt-1">{selectedMatch.home_team_name_en || 'TBD'} vs {selectedMatch.away_team_name_en || 'TBD'}</h3>
                </div>
                <button type="button" onClick={() => setSelectedMatch(null)} className="text-xs text-gray-500 hover:text-gray-900 underline">Batalkan</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EventList title={`Tim Home: ${selectedMatch.home_team_name_en || 'TBD'}`} events={homeEvents} setEvents={setHomeEvents} />
                <EventList title={`Tim Away: ${selectedMatch.away_team_name_en || 'TBD'}`} events={awayEvents} setEvents={setAwayEvents} />
              </div>
              
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button type="submit" disabled={loading} className="bg-black text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center gap-2">
                  {loading ? 'Menyimpan...' : 'Simpan Data Manual'}
                </button>
                
                {message && (
                  <div className={`text-sm font-medium flex items-center gap-1.5 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {message.text}
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200/60 bg-white overflow-hidden shadow-sm">
          <WorldCupBracket onMatchClick={handleMatchClick} />
        </div>
      </div>
    </div>
  );
}
