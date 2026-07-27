import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { Calendar, Plus, Trash2, CheckCircle2, Clock, MapPin, Tv, Flame, Zap } from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  onToggleComplete: (id: string) => void;
  onDeleteEvent: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onAddEvent,
  onToggleComplete,
  onDeleteEvent
}) => {
  const [month, setMonth] = useState('January');
  const [eventName, setEventName] = useState('');
  const [brand, setBrand] = useState<'RAW' | 'SmackDown' | 'NXT' | 'Joint'>('Joint');
  const [type, setType] = useState<'PLE' | 'Weekly Show' | 'Special Event'>('PLE');
  const [dateStr, setDateStr] = useState('');
  const [location, setLocation] = useState('');
  const [mainEvent, setMainEvent] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) return;

    const newEv: CalendarEvent = {
      id: `cal-${Date.now()}`,
      month,
      eventName: eventName.trim(),
      brand,
      type,
      date: dateStr || 'TBD',
      location,
      mainEvent,
      isCompleted: false
    };

    onAddEvent(newEv);
    setEventName('');
    setDateStr('');
    setLocation('');
    setMainEvent('');
  };

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                >
                  {monthsList.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Brand</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value as any)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                >
                  <option value="Joint">Joint (All Brands)</option>
                  <option value="RAW">RAW</option>
                  <option value="SmackDown">SmackDown</option>
                  <option value="NXT">NXT</option>
                </select>
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
                <label className="block text-slate-400 mb-1">Date</label>
                <input
                  type="text"
                  placeholder="e.g. Apr 5, 2026"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {events.map((ev) => (
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
                    {ev.location || 'WWE Arena'} • <span className="font-semibold text-slate-300">{ev.date}</span>
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
        </div>
      </div>
    </div>
  );
};
