import React, { useState } from 'react';
import { Trophy, Calendar, Search, Filter, Sparkles, Award, ShieldCheck, History, Flame, ArrowRight } from 'lucide-react';

interface TitleHistoryRow {
  id: number;
  month: string;
  ppvRawSd: string;
  raw: {
    worldHw: string;
    mensIc: string;
    worldTag: string;
    womensWorld: string;
    womensIc: string;
  };
  sd: {
    undisputed: string;
    mensUs: string;
    wweTag: string;
    wweWomens: string;
    womensUs: string;
  };
  ppvNxt: string;
  nxt: {
    nxtChamp: string;
    mensNa: string;
    nxtTag: string;
    nxtWomens: string;
    womensNa: string;
  };
  joint: {
    womensTag: string;
  };
  isSeasonEnd?: boolean;
}

const TITLE_HISTORY_DATA: TitleHistoryRow[] = [
  {
    id: 1, month: 'May', ppvRawSd: 'Backlash',
    raw: { worldHw: 'Gunther', mensIc: 'Bron Breakker', worldTag: 'The War Raiders', womensWorld: 'Rhea Ripley', womensIc: 'Lyra Valkyria' },
    sd: { undisputed: 'Cody Rhodes', mensUs: 'Shinsuke', wweTag: 'DIY', wweWomens: 'Tiffany', womensUs: 'Chelsea' },
    ppvNxt: 'May Weekly Shows',
    nxt: { nxtChamp: 'Oba Femi', mensNa: 'Tony', nxtTag: 'Fraxiom', nxtWomens: 'Roxanne', womensNa: 'Fallon' },
    joint: { womensTag: 'Bianca & Jade' }
  },
  {
    id: 2, month: 'May', ppvRawSd: 'King & Queen of The Ring',
    raw: { worldHw: 'Gunther', mensIc: 'Bron Breakker', worldTag: 'The War Raiders', womensWorld: 'Rhea Ripley', womensIc: 'Lyra Valkyria' },
    sd: { undisputed: 'Cody Rhodes', mensUs: 'Shinsuke', wweTag: 'DIY', wweWomens: 'Tiffany', womensUs: 'Chelsea' },
    ppvNxt: 'May Weekly Shows (Cont.)',
    nxt: { nxtChamp: 'Oba Femi', mensNa: 'Tony', nxtTag: 'Fraxiom', nxtWomens: 'Roxanne', womensNa: 'Fallon' },
    joint: { womensTag: 'Bianca & Jade' }
  },
  {
    id: 3, month: 'June', ppvRawSd: 'Castle of the Clash',
    raw: { worldHw: 'Drew McIntyre', mensIc: 'Bron Breakker', worldTag: 'The War Raiders', womensWorld: 'Rhea Ripley', womensIc: 'Lyra Valkyria' },
    sd: { undisputed: 'Cody Rhodes', mensUs: 'Randy Orton', wweTag: 'DIY', wweWomens: 'Tiffany', womensUs: 'Chelsea' },
    ppvNxt: 'NXT Battleground',
    nxt: { nxtChamp: 'Oba Femi', mensNa: 'Tony', nxtTag: 'Fraxiom', nxtWomens: 'Roxanne', womensNa: 'Fallon' },
    joint: { womensTag: 'Bianca & Jade' }
  },
  {
    id: 4, month: 'July', ppvRawSd: 'Money in the Bank',
    raw: { worldHw: 'Drew McIntyre', mensIc: 'Bron Breakker', worldTag: 'The War Raiders', womensWorld: 'Rhea Ripley', womensIc: 'Lyra Valkyria' },
    sd: { undisputed: 'Cody Rhodes', mensUs: 'Randy Orton', wweTag: 'The Bloodline', wweWomens: 'Tiffany', womensUs: 'Chelsea' },
    ppvNxt: 'NXT Heatwave',
    nxt: { nxtChamp: 'Trick Williams', mensNa: 'Tony', nxtTag: 'The Family', nxtWomens: 'Giulia', womensNa: 'Fallon' },
    joint: { womensTag: 'Bianca & Jade' }
  },
  {
    id: 5, month: 'August', ppvRawSd: 'SummerSlam',
    raw: { worldHw: 'Drew McIntyre', mensIc: 'Bron Breakker', worldTag: 'The War Raiders', womensWorld: 'Rhea Ripley', womensIc: 'Asuka' },
    sd: { undisputed: 'Cody Rhodes', mensUs: 'Randy Orton', wweTag: 'The Bloodline', wweWomens: 'Tiffany', womensUs: 'Chelsea' },
    ppvNxt: 'NXT Great American Bash',
    nxt: { nxtChamp: 'Trick Williams', mensNa: 'Tony', nxtTag: 'The Family', nxtWomens: 'Giulia', womensNa: 'Fallon' },
    joint: { womensTag: 'Bianca & Jade' }
  },
  {
    id: 6, month: 'August', ppvRawSd: 'Bash in Berlin',
    raw: { worldHw: 'Drew McIntyre', mensIc: 'Bron Breakker', worldTag: 'The War Raiders', womensWorld: 'Rhea Ripley', womensIc: 'Asuka' },
    sd: { undisputed: 'Cody Rhodes', mensUs: 'Randy Orton', wweTag: 'The Bloodline', wweWomens: 'Tiffany', womensUs: 'Chelsea' },
    ppvNxt: 'NXT No Mercy',
    nxt: { nxtChamp: 'Trick Williams', mensNa: 'Tony', nxtTag: 'The Family', nxtWomens: 'Giulia', womensNa: 'Fallon' },
    joint: { womensTag: 'Bianca & Jade' }
  },
  {
    id: 7, month: 'September', ppvRawSd: 'Crown Jewel',
    raw: { worldHw: 'Drew McIntyre', mensIc: 'Bron Breakker', worldTag: 'The War Raiders', womensWorld: 'Rhea Ripley', womensIc: 'Asuka' },
    sd: { undisputed: 'Cody Rhodes', mensUs: 'Randy Orton', wweTag: 'The Bloodline', wweWomens: 'Tiffany', womensUs: 'Chelsea' },
    ppvNxt: 'NXT Super Showdown',
    nxt: { nxtChamp: 'Oba Femi', mensNa: 'Tony', nxtTag: 'The Family', nxtWomens: 'Giulia', womensNa: 'Fallon' },
    joint: { womensTag: 'Bianca & Jade' }
  },
  {
    id: 8, month: 'October', ppvRawSd: 'Bad Blood',
    raw: { worldHw: 'Drew McIntyre', mensIc: 'Bron Breakker', worldTag: 'The War Raiders', womensWorld: 'Rhea Ripley', womensIc: 'Asuka' },
    sd: { undisputed: 'Cody Rhodes', mensUs: 'Randy Orton', wweTag: 'The Bloodline', wweWomens: 'Tiffany', womensUs: 'Chelsea' },
    ppvNxt: 'NXT Halloween Havoc',
    nxt: { nxtChamp: 'Oba Femi', mensNa: 'Tony', nxtTag: 'The Family', nxtWomens: 'Giulia', womensNa: 'Fallon' },
    joint: { womensTag: 'Bianca & Jade' }
  },
  {
    id: 9, month: 'November', ppvRawSd: 'Survivor Series',
    raw: { worldHw: 'Drew McIntyre', mensIc: 'Bron Breakker', worldTag: 'The War Raiders', womensWorld: 'Rhea Ripley', womensIc: 'Asuka' },
    sd: { undisputed: 'Cody Rhodes', mensUs: 'Randy Orton', wweTag: 'The Bloodline', wweWomens: 'Tiffany', womensUs: 'Chelsea' },
    ppvNxt: 'November Weekly Shows',
    nxt: { nxtChamp: 'Oba Femi', mensNa: 'Tony', nxtTag: 'The Family', nxtWomens: 'Giulia', womensNa: 'Fallon' },
    joint: { womensTag: 'Bianca & Jade' }
  },
  {
    id: 10, month: 'December', ppvRawSd: "Saturday Night's Main Event",
    raw: { worldHw: 'Drew McIntyre', mensIc: 'Bron Breakker', worldTag: 'The War Raiders', womensWorld: 'Rhea Ripley', womensIc: 'Asuka' },
    sd: { undisputed: 'Cody Rhodes', mensUs: 'Randy Orton', wweTag: 'The Bloodline', wweWomens: 'Tiffany', womensUs: 'Naomi' },
    ppvNxt: 'NXT Deadline',
    nxt: { nxtChamp: 'Oba Femi', mensNa: 'Tony', nxtTag: 'The Family', nxtWomens: 'Giulia', womensNa: 'Fallon' },
    joint: { womensTag: 'Bianca & Jade' }
  },
  {
    id: 11, month: 'January', ppvRawSd: 'Day 1 / SD New Year',
    raw: { worldHw: 'CM Punk', mensIc: 'Bron Breakker', worldTag: 'The New Day', womensWorld: 'Rhea Ripley', womensIc: 'Asuka' },
    sd: { undisputed: 'LA Knight', mensUs: 'Carmelo Hayes', wweTag: 'Brothers of Dest.', wweWomens: 'Tiffany', womensUs: 'Naomi' },
    ppvNxt: "New Year's Evil",
    nxt: { nxtChamp: 'Oba Femi', mensNa: 'Axiom', nxtTag: 'Chase U', nxtWomens: 'Giulia', womensNa: 'Kelani' },
    joint: { womensTag: 'Bianca & Jade' }
  },
  {
    id: 12, month: 'January', ppvRawSd: 'Royal Rumble',
    raw: { worldHw: 'CM Punk', mensIc: 'Bron Breakker', worldTag: 'The New Day', womensWorld: 'Rhea Ripley', womensIc: 'Asuka' },
    sd: { undisputed: 'LA Knight', mensUs: 'Carmelo Hayes', wweTag: 'Brothers of Dest.', wweWomens: 'Tiffany', womensUs: 'Naomi' },
    ppvNxt: 'NXT Vengeance Day',
    nxt: { nxtChamp: 'Oba Femi', mensNa: 'Axiom', nxtTag: 'Chase U', nxtWomens: 'Giulia', womensNa: 'Kelani' },
    joint: { womensTag: 'Lisa & Becky' }
  },
  {
    id: 13, month: 'February', ppvRawSd: 'Elimination Chamber',
    raw: { worldHw: 'CM Punk', mensIc: 'Bron Breakker', worldTag: 'The New Day', womensWorld: 'Rhea Ripley', womensIc: 'Lyra Valkyria' },
    sd: { undisputed: 'LA Knight', mensUs: 'Carmelo Hayes', wweTag: 'Wyatt Sicks', wweWomens: 'Tiffany', womensUs: 'Naomi' },
    ppvNxt: 'NXT Roadblock',
    nxt: { nxtChamp: 'Oba Femi', mensNa: 'Charlie Dempsey', nxtTag: 'Dudley Boyz', nxtWomens: 'Giulia', womensNa: 'Kelani' },
    joint: { womensTag: 'Lisa & Becky' }
  },
  {
    id: 14, month: 'March', ppvRawSd: 'Roadblock / March Shows',
    raw: { worldHw: 'CM Punk', mensIc: 'Bron Breakker', worldTag: 'The New Day', womensWorld: 'Rhea Ripley', womensIc: 'Lyra Valkyria' },
    sd: { undisputed: 'LA Knight', mensUs: 'Carmelo Hayes', wweTag: 'Wyatt Sicks', wweWomens: 'Tiffany', womensUs: 'Naomi' },
    ppvNxt: 'NXT Stand & Deliver',
    nxt: { nxtChamp: 'Oba Femi', mensNa: 'Charlie Dempsey', nxtTag: 'Dudley Boyz', nxtWomens: 'Giulia', womensNa: 'Kelani' },
    joint: { womensTag: 'Lisa & Becky' }
  },
  {
    id: 15, month: 'April', ppvRawSd: 'WrestleMania (Season End)',
    raw: { worldHw: 'Gunther', mensIc: 'Bron Breakker', worldTag: 'The War Raiders', womensWorld: 'Rhea Ripley', womensIc: 'Asuka' },
    sd: { undisputed: 'Jacob Fatu', mensUs: 'Carmelo Hayes', wweTag: 'Wyatt Sicks', wweWomens: 'Jade', womensUs: 'Naomi' },
    ppvNxt: 'NXT Spring Breaking Day 1',
    nxt: { nxtChamp: 'Oba Femi', mensNa: 'Charlie Dempsey', nxtTag: 'Dudley Boyz', nxtWomens: 'Giulia', womensNa: 'Kelani' },
    joint: { womensTag: 'Kabuki Warriors' },
    isSeasonEnd: true
  }
];

export const TitleHistoryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeBrandFilter, setActiveBrandFilter] = useState<'ALL' | 'RAW' | 'SD' | 'NXT'>('ALL');

  const highlightMatch = (text: string) => {
    if (!searchTerm.trim()) return text;
    const isMatch = text.toLowerCase().includes(searchTerm.toLowerCase());
    return isMatch ? (
      <span className="bg-yellow-400 text-black font-bold px-1 rounded shadow-sm animate-pulse inline-block">
        {text}
      </span>
    ) : (
      text
    );
  };

  const isRowMatch = (row: TitleHistoryRow) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    const allText = [
      row.month, row.ppvRawSd, row.ppvNxt,
      ...Object.values(row.raw),
      ...Object.values(row.sd),
      ...Object.values(row.nxt),
      ...Object.values(row.joint)
    ].join(' ').toLowerCase();
    return allText.includes(query);
  };

  const filteredData = TITLE_HISTORY_DATA.filter(isRowMatch);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg shadow-amber-500/20 text-slate-950 font-black">
              <History className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full uppercase tracking-wider">
                  WWE 2K25 Year 1 Archive
                </span>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Transcribed from Spreadsheet
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                Championship Title Timeline <span className="text-amber-400 font-normal text-lg">(May Year 1 ➔ April Year 2)</span>
              </h1>
              <p className="text-sm text-slate-300 mt-0.5">
                Complete month-by-month PLE championship history from your completed WWE 2K25 season. The bottom highlighted row represents your present WWE 2K26 reigning champions!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveBrandFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeBrandFilter === 'ALL'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Brands
            </button>
            <button
              onClick={() => setActiveBrandFilter('RAW')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeBrandFilter === 'RAW'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-400 hover:text-red-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> RAW
            </button>
            <button
              onClick={() => setActiveBrandFilter('SD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeBrandFilter === 'SD'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-blue-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> SmackDown
            </button>
            <button
              onClick={() => setActiveBrandFilter('NXT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeBrandFilter === 'NXT'
                  ? 'bg-yellow-500 text-slate-950 font-black shadow-md shadow-yellow-500/30'
                  : 'text-slate-400 hover:text-yellow-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span> NXT
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg backdrop-blur-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Highlight Superstar (e.g., Gunther, Giulia)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-slate-800 px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-950/60 px-3.5 py-2 rounded-lg border border-slate-800/80">
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Pro Tip:
          </span>
          <span>The green/gold highlighted row at the bottom is your active starting point for WWE 2K26!</span>
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden relative">
        <div className="overflow-x-auto max-h-[750px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-xs text-left border-collapse min-w-[1500px]">
            {/* Table Headers */}
            <thead className="sticky top-0 z-30 font-bold uppercase tracking-wider text-center shadow-lg">
              {/* Brand Tier Header */}
              <tr className="border-b border-slate-800 text-white">
                <th colSpan={2} className="py-2.5 px-3 bg-gradient-to-b from-blue-900 to-blue-950 text-blue-200 border-r border-blue-700/50">
                  🗓️ Timeline (RAW & SD)
                </th>
                {(activeBrandFilter === 'ALL' || activeBrandFilter === 'RAW') && (
                  <th colSpan={5} className="py-2.5 px-3 bg-gradient-to-b from-red-900/90 via-red-950 to-red-950 text-red-200 border-r border-red-700/50 font-black tracking-widest text-sm">
                    🔴 RAW CHAMPIONSHIPS
                  </th>
                )}
                {(activeBrandFilter === 'ALL' || activeBrandFilter === 'SD') && (
                  <th colSpan={5} className="py-2.5 px-3 bg-gradient-to-b from-blue-900/90 via-blue-950 to-blue-950 text-blue-200 border-r border-blue-700/50 font-black tracking-widest text-sm">
                    🔵 SMACKDOWN CHAMPIONSHIPS
                  </th>
                )}
                <th colSpan={2} className="py-2.5 px-3 bg-gradient-to-b from-yellow-800/90 via-yellow-900 to-yellow-950 text-yellow-200 border-r border-yellow-700/50">
                  🗓️ Timeline (NXT)
                </th>
                {(activeBrandFilter === 'ALL' || activeBrandFilter === 'NXT') && (
                  <th colSpan={5} className="py-2.5 px-3 bg-gradient-to-b from-amber-700/90 via-yellow-900 to-amber-950 text-amber-200 border-r border-amber-600/50 font-black tracking-widest text-sm">
                    🟡 NXT CHAMPIONSHIPS
                  </th>
                )}
                {activeBrandFilter === 'ALL' && (
                  <th className="py-2.5 px-3 bg-gradient-to-b from-purple-900/90 via-purple-950 to-purple-950 text-purple-200 font-black tracking-widest text-sm">
                    🟣 JOINT
                  </th>
                )}
              </tr>

              {/* Title Names Header */}
              <tr className="border-b-2 border-slate-700 text-[11px]">
                {/* Month & PPV */}
                <th className="py-2.5 px-2 bg-blue-950/90 text-blue-300 border-r border-slate-800 w-16">Month</th>
                <th className="py-2.5 px-3 bg-blue-950/90 text-blue-300 border-r border-slate-800 w-40">RAW/SD PLE Event</th>

                {/* RAW Titles */}
                {(activeBrandFilter === 'ALL' || activeBrandFilter === 'RAW') && (
                  <>
                    <th className="py-2.5 px-2 bg-red-950/80 text-red-300 border-r border-slate-800 w-32">World Heavyweight</th>
                    <th className="py-2.5 px-2 bg-red-950/80 text-red-300 border-r border-slate-800 w-28">Men's IC</th>
                    <th className="py-2.5 px-2 bg-red-950/80 text-red-300 border-r border-slate-800 w-32">World Tag Team</th>
                    <th className="py-2.5 px-2 bg-red-950/80 text-red-300 border-r border-slate-800 w-28">Women's World</th>
                    <th className="py-2.5 px-2 bg-red-950/80 text-red-300 border-r border-slate-800 w-28">Women's IC</th>
                  </>
                )}

                {/* SmackDown Titles */}
                {(activeBrandFilter === 'ALL' || activeBrandFilter === 'SD') && (
                  <>
                    <th className="py-2.5 px-2 bg-blue-950/80 text-blue-300 border-r border-slate-800 w-32">Undisputed WWE</th>
                    <th className="py-2.5 px-2 bg-blue-950/80 text-blue-300 border-r border-slate-800 w-28">Men's US</th>
                    <th className="py-2.5 px-2 bg-blue-950/80 text-blue-300 border-r border-slate-800 w-32">WWE Tag Team</th>
                    <th className="py-2.5 px-2 bg-blue-950/80 text-blue-300 border-r border-slate-800 w-28">WWE Women's</th>
                    <th className="py-2.5 px-2 bg-blue-950/80 text-blue-300 border-r border-slate-800 w-28">Women's US</th>
                  </>
                )}

                {/* NXT Timeline */}
                <th className="py-2.5 px-2 bg-yellow-950/80 text-yellow-300 border-r border-slate-800 w-16">Month</th>
                <th className="py-2.5 px-3 bg-yellow-950/80 text-yellow-300 border-r border-slate-800 w-40">NXT PLE Event</th>

                {/* NXT Titles */}
                {(activeBrandFilter === 'ALL' || activeBrandFilter === 'NXT') && (
                  <>
                    <th className="py-2.5 px-2 bg-yellow-950/70 text-yellow-300 border-r border-slate-800 w-28">NXT Champ</th>
                    <th className="py-2.5 px-2 bg-yellow-950/70 text-yellow-300 border-r border-slate-800 w-28">Men's NXT NA</th>
                    <th className="py-2.5 px-2 bg-yellow-950/70 text-yellow-300 border-r border-slate-800 w-32">NXT Tag Team</th>
                    <th className="py-2.5 px-2 bg-yellow-950/70 text-yellow-300 border-r border-slate-800 w-28">NXT Women's</th>
                    <th className="py-2.5 px-2 bg-yellow-950/70 text-yellow-300 border-r border-slate-800 w-28">Women's NXT NA</th>
                  </>
                )}

                {/* Joint Titles */}
                {activeBrandFilter === 'ALL' && (
                  <th className="py-2.5 px-2 bg-purple-950/80 text-purple-300 w-32">Women's Tag Team</th>
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/70 text-center font-medium">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-slate-400">
                    No timeline records matching your search query "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => {
                  const isEnd = row.isSeasonEnd;
                  const rowClass = isEnd
                    ? 'bg-gradient-to-r from-amber-950/60 via-yellow-950/70 to-amber-950/60 font-bold border-y-2 border-amber-500/80 shadow-inner'
                    : 'hover:bg-slate-900/80 transition-colors duration-150 bg-slate-950/40';

                  const cellBase = 'py-2.5 px-2 border-r border-slate-800/80 transition-colors';

                  return (
                    <tr key={row.id} className={rowClass}>
                      {/* Month & PPV RAW/SD */}
                      <td className={`${cellBase} bg-blue-950/30 text-blue-300 font-semibold`}>
                        {highlightMatch(row.month)}
                      </td>
                      <td className={`${cellBase} text-left pl-3 font-bold ${isEnd ? 'text-amber-300' : 'text-slate-200'}`}>
                        {highlightMatch(row.ppvRawSd)}
                      </td>

                      {/* RAW Titles */}
                      {(activeBrandFilter === 'ALL' || activeBrandFilter === 'RAW') && (
                        <>
                          <td className={`${cellBase} text-red-200 bg-red-950/10`}>{highlightMatch(row.raw.worldHw)}</td>
                          <td className={`${cellBase} text-red-200 bg-red-950/10`}>{highlightMatch(row.raw.mensIc)}</td>
                          <td className={`${cellBase} text-red-200 bg-red-950/10`}>{highlightMatch(row.raw.worldTag)}</td>
                          <td className={`${cellBase} text-red-200 bg-red-950/10`}>{highlightMatch(row.raw.womensWorld)}</td>
                          <td className={`${cellBase} text-red-200 bg-red-950/10`}>{highlightMatch(row.raw.womensIc)}</td>
                        </>
                      )}

                      {/* SmackDown Titles */}
                      {(activeBrandFilter === 'ALL' || activeBrandFilter === 'SD') && (
                        <>
                          <td className={`${cellBase} text-blue-200 bg-blue-950/10 ${row.sd.undisputed === 'LA Knight' && !isEnd ? 'bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-500/40' : ''}`}>
                            {highlightMatch(row.sd.undisputed)}
                          </td>
                          <td className={`${cellBase} text-blue-200 bg-blue-950/10`}>{highlightMatch(row.sd.mensUs)}</td>
                          <td className={`${cellBase} text-blue-200 bg-blue-950/10`}>{highlightMatch(row.sd.wweTag)}</td>
                          <td className={`${cellBase} text-blue-200 bg-blue-950/10`}>{highlightMatch(row.sd.wweWomens)}</td>
                          <td className={`${cellBase} text-blue-200 bg-blue-950/10`}>{highlightMatch(row.sd.womensUs)}</td>
                        </>
                      )}

                      {/* NXT Timeline */}
                      <td className={`${cellBase} bg-yellow-950/30 text-yellow-300 font-semibold`}>
                        {highlightMatch(row.month)}
                      </td>
                      <td className={`${cellBase} text-left pl-3 font-bold ${isEnd ? 'text-amber-300' : 'text-slate-200'}`}>
                        {highlightMatch(row.ppvNxt)}
                      </td>

                      {/* NXT Titles */}
                      {(activeBrandFilter === 'ALL' || activeBrandFilter === 'NXT') && (
                        <>
                          <td className={`${cellBase} text-yellow-200 bg-yellow-950/10`}>{highlightMatch(row.nxt.nxtChamp)}</td>
                          <td className={`${cellBase} text-yellow-200 bg-yellow-950/10`}>{highlightMatch(row.nxt.mensNa)}</td>
                          <td className={`${cellBase} text-yellow-200 bg-yellow-950/10`}>{highlightMatch(row.nxt.nxtTag)}</td>
                          <td className={`${cellBase} text-yellow-200 bg-yellow-950/10`}>{highlightMatch(row.nxt.nxtWomens)}</td>
                          <td className={`${cellBase} text-yellow-200 bg-yellow-950/10`}>{highlightMatch(row.nxt.womensNa)}</td>
                        </>
                      )}

                      {/* Joint Titles */}
                      {activeBrandFilter === 'ALL' && (
                        <td className={`py-2.5 px-2 text-purple-200 bg-purple-950/20 font-bold`}>
                          {highlightMatch(row.joint.womensTag)}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Summary Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-t border-slate-800 p-4 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping inline-block"></span>
            <span className="font-bold text-amber-400">WrestleMania & NXT Spring Breaking (April):</span>
            <span>Marks the conclusion of Year 1 (2K25) and establishes the starting reigning champions for Year 2 (2K26).</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="bg-slate-900 px-3 py-1 rounded-md border border-slate-800">Total PLEs Tracked: <strong>28 Events</strong></span>
            <span className="bg-slate-900 px-3 py-1 rounded-md border border-slate-800">Championship Belts: <strong>16 Titles</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
