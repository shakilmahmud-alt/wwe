import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { Calendar, Plus, Trash2, CheckCircle2, Clock, MapPin, Tv, Flame, Zap } from 'lucide-react';
import { UNIVERSE_MONTH_ORDER, UNIVERSE_WEEKS } from '../utils/universeTime';

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  onToggleComplete: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onPopulateDefaultSchedule?: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onAddEvent,
  onToggleComplete,
  onDeleteEvent,
  onPopulateDefaultSchedule
}) => {
  const [filterBrand, setFilterBrand] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [month, setMonth] = useState('January');
  const [eventName, setEventName] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['RAW', 'SmackDown', 'NXT']);
  const [type, setType] = useState<'PLE' | 'Weekly Show' | 'Special Event'>('PLE');
  const [dateStr, setDateStr] = useState(UNIVERSE_WEEKS[1]);
  const [location, setLocation] = useState('');
  const [mainEvent, setMainEvent] = useState('');

  const handleBrandToggle = (option: string) => {
    setSelectedBrands((prev) => {
      if (prev.includes(option)) {
        return prev.filter((b) => b !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) return;

    let brandStr = 'Joint (All Brands)';
    if (selectedBrands.length === 3 || selectedBrands.length === 0) {
      brandStr = 'Joint (All Brands)';
    } else {
      const order = ['RAW', 'SmackDown', 'NXT'];
      brandStr = [...selectedBrands].sort((a, b) => order.indexOf(a) - order.indexOf(b)).join(', ');
    }

    const newEv: CalendarEvent = {
      id: `cal-${Date.now()}`,
      month,
      eventName: eventName.trim(),
      brand: brandStr,
      type,
      date: dateStr || 'TBD',
      location,
      mainEvent,
      isCompleted: false
    };

    onAddEvent(newEv);
    setEventName('');
    setDateStr(UNIVERSE_WEEKS[1]);
    setLocation('');
    setMainEvent('');
  };

  const monthsList = UNIVERSE_MONTH_ORDER;

  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/40 rounded-xl shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 border border-purple-500/40 rounded-xl shadow-lg">
            <Calendar className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase text-purple-300 tracking-wider">
              WWE 2K26 Season Calendar & PLE Schedule
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Plan Premium Live Events (PLEs), Weekly RAW/SmackDown/NXT shows, WrestleMania season, and main events.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onPopulateDefaultSchedule && (
            <button
              onClick={onPopulateDefaultSchedule}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl transition shadow-lg shadow-purple-900/40 flex items-center gap-2 uppercase tracking-wide text-xs"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              Populate 2K26 PLE Schedule
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
            <Plus className="w-4 h-4 text-purple-400" />
            Add Event / PLE to Calendar
          </h3>

          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Event Name</label>
              <input
                type="text"
                placeholder="e.g. WrestleMania 42, SummerSlam..."
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-purple-500"
              >
                {monthsList.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5 font-semibold flex items-center justify-between">
                <span>Select Brand(s)</span>
                <button
                  type="button"
                  onClick={() => setSelectedBrands(selectedBrands.length === 3 ? [] : ['RAW', 'SmackDown', 'NXT'])}
                  className="text-[10px] text-purple-400 hover:underline font-normal"
                >
                  {selectedBrands.length === 3 ? 'Uncheck All' : 'Select All (Joint)'}
                </button>
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-950 border border-slate-700 rounded">
                {(['RAW', 'SmackDown', 'NXT'] as const).map((bOption) => {
                  const isChecked = selectedBrands.includes(bOption);
                  const colorClass = bOption === 'RAW' ? 'text-red-300 border-red-700 bg-red-950/40' :
                                   bOption === 'SmackDown' ? 'text-blue-300 border-blue-700 bg-blue-950/40' :
                                   'text-yellow-300 border-yellow-700 bg-yellow-950/40';
                  return (
                    <label
                      key={bOption}
                      onClick={(e) => {
                        e.preventDefault();
                        handleBrandToggle(bOption);
                      }}
                      className={`cursor-pointer px-2 py-1.5 rounded border text-center font-bold text-xs transition flex items-center justify-center gap-1.5 select-none ${
                        isChecked ? `${colorClass} shadow-md shadow-black/40` : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="w-3.5 h-3.5 rounded border-slate-700 text-purple-600 focus:ring-0 cursor-pointer accent-purple-500"
                      />
                      <span>{bOption}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Event Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                >
                  <option value="PLE">PLE (Pay-Per-View)</option>
                  <option value="Weekly Show">Weekly Episode</option>
                  <option value="Special Event">Special Draft / Event</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Week / PLE Day</label>
                <select
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white font-medium focus:outline-none focus:border-purple-500"
                >
                  {UNIVERSE_WEEKS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Main Event Match</label>
              <input
                type="text"
                placeholder="e.g. Cody Rhodes vs CM Punk for World Title"
                value={mainEvent}
                onChange={(e) => setMainEvent(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Arena Location</label>
              <input
                type="text"
                placeholder="e.g. Madison Square Garden"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-lg transition shadow-lg mt-2 uppercase tracking-wide"
            >
              Add to Schedule
            </button>
          </form>
        </div>

        {/* Schedule Cards Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold text-slate-400">Filter By:</span>
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
              >
                <option value="All">All Brands</option>
                <option value="Joint">Joint / Co-Branded</option>
                <option value="RAW">RAW</option>
                <option value="SmackDown">SmackDown</option>
                <option value="NXT">NXT</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
              >
                <option value="All">All Types</option>
                <option value="PLE">PLE (Pay-Per-View)</option>
                <option value="Weekly Show">Weekly Show</option>
                <option value="Special Event">Special Event</option>
              </select>
            </div>
            {(() => {
              const filteredEvents = events.filter((e) => {
                const evBrand = e.brand || '';
                const brandMatch =
                  filterBrand === 'All' ||
                  (filterBrand === 'Joint' && (evBrand.includes('Joint') || evBrand === 'RAW, SmackDown, NXT' || evBrand.includes(','))) ||
                  evBrand.includes(filterBrand) ||
                  evBrand.includes('Joint');
                const typeMatch = filterType === 'All' || e.type === filterType;
                return brandMatch && typeMatch;
              });
              return (
                <span className="text-xs text-purple-400 font-bold">
                  Showing {filteredEvents.length} of {events.length} Events
                </span>
              );
            })()}
          </div>

          {(() => {
            const filteredEvents = events.filter((e) => {
              const evBrand = e.brand || '';
              const brandMatch =
                filterBrand === 'All' ||
                (filterBrand === 'Joint' && (evBrand.includes('Joint') || evBrand === 'RAW, SmackDown, NXT' || evBrand.includes(','))) ||
                evBrand.includes(filterBrand) ||
                evBrand.includes('Joint');
              const typeMatch = filterType === 'All' || e.type === filterType;
              return brandMatch && typeMatch;
            }).sort((a, b) => {
              const mDiff = UNIVERSE_MONTH_ORDER.indexOf(a.month) - UNIVERSE_MONTH_ORDER.indexOf(b.month);
              if (mDiff !== 0) return mDiff;
              return a.eventName.localeCompare(b.eventName);
            });

            if (events.length === 0) {
              return (
                <div className="p-12 rounded-2xl bg-slate-900/60 border-2 border-dashed border-purple-500/30 text-center space-y-4 flex flex-col items-center justify-center">
                  <div className="p-4 bg-purple-500/10 rounded-full text-purple-400">
                    <Calendar className="w-12 h-12 opacity-80" />
                  </div>
                  <div className="max-w-md">
                    <h3 className="text-lg font-extrabold text-white">No Season Events Scheduled Yet</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Your calendar is currently empty. You can manually add weekly episodes and PLEs using the form on the left, or instantly populate the official WWE 2K26 Pay-Per-View schedule!
                    </p>
                  </div>
                  {onPopulateDefaultSchedule && (
                    <button
                      onClick={onPopulateDefaultSchedule}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl transition shadow-lg shadow-purple-900/30 flex items-center gap-2 uppercase tracking-wide text-xs"
                    >
                      <Zap className="w-4 h-4 text-amber-300" />
                      Populate Official 2K26 PLE Schedule
                    </button>
                  )}
                </div>
              );
            }

            if (filteredEvents.length === 0) {
              return (
                <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500 italic">
                  No events match your selected filters. Try changing brand or type filter above.
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-4 rounded-xl border transition shadow-lg relative flex flex-col justify-between ${
                      ev.isCompleted
                        ? 'bg-slate-950/70 border-slate-800 opacity-75'
                        : 'bg-slate-900 border-purple-500/30 hover:border-purple-500/70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ev.brand === 'RAW' ? 'bg-red-950 text-red-300 border border-red-800' :
                          ev.brand === 'SmackDown' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                          ev.brand === 'NXT' ? 'bg-yellow-950 text-yellow-300 border border-yellow-800' :
                          'bg-purple-950 text-purple-300 border border-purple-800'
                        }`}>
                          {ev.brand} • {ev.type}
                        </span>

                        <button
                          onClick={() => onToggleComplete(ev.id)}
                          className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 transition ${
                            ev.isCompleted
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {ev.isCompleted ? 'Completed' : 'Mark Done'}
                        </button>
                      </div>

                      <h3 className="font-extrabold text-white text-base leading-tight mb-1">{ev.eventName}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {ev.location || 'WWE Arena'} • <span className="font-semibold text-slate-300">{ev.month} • {ev.date}</span>
                      </p>

                      {ev.mainEvent && (
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 text-xs">
                          <span className="text-[10px] text-amber-400 font-bold uppercase block">Main Event:</span>
                          <span className="text-slate-200 font-medium">{ev.mainEvent}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-semibold">{ev.month}</span>
                      <button
                        onClick={() => onDeleteEvent(ev.id)}
                        className="text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
