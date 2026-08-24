import React, { useState } from 'react';
import { Superstar, WomenTagTeam, BrandType, TierType, ChampionEntry, RivalryEntry, ShowPlan, MatchCardItem, UniverseTime } from '../types';
import { Plus, Trash2, Edit2, Flame, Zap, Tv, Crown, Swords, Calendar, UserPlus, Check, X, GripVertical, Upload, Image as ImageIcon } from 'lucide-react';
import { calculateDaysBetween, formatAcquiredDate, getDisplayAcquiredDate, UNIVERSE_MONTH_ORDER, UNIVERSE_WEEKS } from '../utils/universeTime';
import { uploadToImageKit } from '../lib/imagekit';

interface BrandDashboardProps {
  brand: BrandType;
  superstars: Superstar[];
  champions: ChampionEntry[];
  rivalries: RivalryEntry[];
  showPlans: ShowPlan[];
  womenTagTeams?: WomenTagTeam[];
  onAddSuperstar: (name: string, brand: BrandType, tier: TierType) => void;
  onUpdateSuperstarName: (id: string, name: string) => void;
  onDeleteSuperstar: (id: string) => void;
  onMoveSuperstar: (id: string, newBrand: BrandType, newTier: TierType) => void;
  onSaveShowPlan: (plan: ShowPlan) => void;
  onDeleteShowPlan: (id: string) => void;
  onAddChampion?: (entry: ChampionEntry) => void;
  onUpdateChampion?: (entry: ChampionEntry) => void;
  onDeleteChampion?: (id: string) => void;
  onReorderChampions?: (reorderedChampions: ChampionEntry[]) => void;
  universeTime: UniverseTime;
  onUpdateTime: (time: UniverseTime) => void;
}

// Helper to normalize image paths (handles public/, backslashes, missing leading slashes, URL encoding)
const formatImageUrl = (url: string | undefined, fallbackName?: string): string => {
  if (url && url.trim()) {
    let cleaned = url.trim().replace(/\\/g, '/');
    if (cleaned.toLowerCase().startsWith('public/')) {
      cleaned = cleaned.substring(7);
    }
    if (!cleaned.startsWith('/') && !cleaned.startsWith('http://') && !cleaned.startsWith('https://') && !cleaned.startsWith('data:')) {
      cleaned = '/' + cleaned;
    }
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://') && !cleaned.startsWith('data:')) {
      cleaned = cleaned.split('/').map(part => encodeURIComponent(part)).join('/');
      if (!cleaned.startsWith('/')) cleaned = '/' + cleaned;
    }
    return cleaned;
  }
  if (fallbackName && fallbackName.trim()) {
    const encoded = encodeURIComponent(fallbackName.trim());
    return `/${encoded}.png`;
  }
  return '';
};

export const BrandDashboard: React.FC<BrandDashboardProps> = ({
  brand,
  superstars,
  champions,
  rivalries,
  showPlans,
  womenTagTeams = [],
  onAddSuperstar,
  onUpdateSuperstarName,
  onDeleteSuperstar,
  onMoveSuperstar,
  onSaveShowPlan,
  onDeleteShowPlan,
  onAddChampion,
  onUpdateChampion,
  onDeleteChampion,
  onReorderChampions,
  universeTime,
  onUpdateTime
}) => {
  const brandSuperstars = superstars.filter((s) => s.brand === brand);
  const brandChampions = champions.filter((c) => c.brand === brand || c.brand === 'Joint');
  const brandRivalries = rivalries.filter((r) => r.brand === brand || r.brand === 'Joint');

  // Input states
  const [newSuperstarName, setNewSuperstarName] = useState('');
  const [selectedTier, setSelectedTier] = useState<TierType>('Top');

  // Helper to resolve tier wrestlers including women tag teams (sorted alphabetically)
  const getTierWrestlers = (tier: TierType) => {
    let list: Superstar[] = [];
    if (tier === 'Women Tag Team') {
      const fromSuperstars = brandSuperstars.filter((s) => s.tier === 'Women Tag Team');
      const existingNames = new Set(fromSuperstars.map((s) => s.name.toLowerCase()));

      const fromWomenTag = (womenTagTeams || [])
        .filter((wt) => {
          if (wt.brand === brand) return true;
          if (wt.brand === 'Women Tag' || !wt.brand) {
            if (brand === 'RAW' && (wt.teamName.toLowerCase().includes('kabuki') || wt.teamName.toLowerCase().includes('rhiyo'))) return true;
            if (brand === 'SmackDown' && (wt.teamName.toLowerCase().includes('charlotte') || wt.teamName.toLowerCase().includes('secret service'))) return true;
            if (brand === 'NXT' && wt.teamName.toLowerCase().includes('fatal influence')) return true;
          }
          return false;
        })
        .map((wt) => ({
          id: wt.id,
          name: wt.teamName,
          brand: brand,
          tier: 'Women Tag Team' as TierType
        }))
        .filter((wt) => !existingNames.has(wt.name.toLowerCase()));

      list = [...fromSuperstars, ...fromWomenTag];
    } else {
      list = brandSuperstars.filter((s) => s.tier === tier);
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }));
  };

  // Drag and drop reordering for active champions
  const [draggedChampId, setDraggedChampId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedChampId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = draggedChampId || e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      setDraggedChampId(null);
      return;
    }

    const currentBrandChamps = champions.filter((c) => c.brand === brand || c.brand === 'Joint');
    const sourceIndex = currentBrandChamps.findIndex((c) => c.id === sourceId);
    const targetIndex = currentBrandChamps.findIndex((c) => c.id === targetId);

    if (sourceIndex < 0 || targetIndex < 0) {
      setDraggedChampId(null);
      return;
    }

    const reorderedBrandChamps = [...currentBrandChamps];
    const [movedItem] = reorderedBrandChamps.splice(sourceIndex, 1);
    reorderedBrandChamps.splice(targetIndex, 0, movedItem);

    // Merge reordered brand champions back into overall champions array
    let brandIdx = 0;
    const newAllChampions = champions.map((c) => {
      if (c.brand === brand || c.brand === 'Joint') {
        return reorderedBrandChamps[brandIdx++];
      }
      return c;
    });

    if (onReorderChampions) {
      onReorderChampions(newAllChampions);
    }
    setDraggedChampId(null);
  };

  // Champion creation & editing states
  const [isCreatingChampion, setIsCreatingChampion] = useState(false);
  const [editingChampId, setEditingChampId] = useState<string | null>(null);
  const [champTitleName, setChampTitleName] = useState('');
  const [champCurrentWinner, setChampCurrentWinner] = useState('');
  const [champPrevWinner, setChampPrevWinner] = useState('');
  const [champAcquiredDate, setChampAcquiredDate] = useState('');
  const [champDaysHeld, setChampDaysHeld] = useState<number>(0);
  const [champDefenses, setChampDefenses] = useState<number>(0);
  const [champBeltImage, setChampBeltImage] = useState('');
  const [champWrestlerImage, setChampWrestlerImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});

  // File upload handler (Instant local preview + fast ImageKit.io upload)
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant 0.001s preview
    const tempUrl = URL.createObjectURL(file);
    setChampWrestlerImage(tempUrl);
    setIsUploading(true);
    setUploadMessage('⚡ Uploading to ImageKit.io...');

    try {
      const url = await uploadToImageKit(file);
      if (url) {
        setChampWrestlerImage(url);
        setUploadMessage('✅ Saved to ImageKit CDN!');
      }
    } catch (err: any) {
      console.error('ImageKit upload error:', err);
      setUploadMessage('❌ Upload error');
    } finally {
      setIsUploading(false);
    }
  };

  // Direct quick upload for champion card (Instant 0.001s update + fast ImageKit.io cloud upload)
  const handleQuickUploadForChampion = async (c: ChampionEntry, file: File) => {
    // Reset any failed image state for this champion card immediately
    setImgErrorMap((prev) => ({ ...prev, [c.id]: false }));

    // Instant local preview update on card
    const tempUrl = URL.createObjectURL(file);
    if (onUpdateChampion) {
      onUpdateChampion({
        ...c,
        wrestlerImage: tempUrl
      });
    }

    try {
      const url = await uploadToImageKit(file);
      if (url && onUpdateChampion) {
        setImgErrorMap((prev) => ({ ...prev, [c.id]: false }));
        onUpdateChampion({
          ...c,
          wrestlerImage: url
        });
      }
    } catch (err) {
      console.error('Direct champion ImageKit upload error:', err);
    }
  };

  const handleStartEditChampion = (c: ChampionEntry) => {
    setEditingChampId(c.id);
    setChampTitleName(c.titleName);
    setChampCurrentWinner(c.currentChampion);
    setChampPrevWinner(c.previousChampion || '');
    setChampAcquiredDate(c.acquiredDate || '');
    setChampDaysHeld(c.daysHeld || 0);
    setChampDefenses(c.defenses || 0);
    setChampBeltImage(c.beltImage || '');
    setChampWrestlerImage(c.wrestlerImage || '');
    setIsCreatingChampion(true);
  };

  const handleSaveChampionSubmit = () => {
    if (!champTitleName.trim() || !champCurrentWinner.trim()) return;

    const entry: ChampionEntry = {
      id: editingChampId || `ch-${Date.now()}`,
      titleName: champTitleName.trim(),
      brand: brand === 'Women Tag' || brand === 'Free Agent' ? 'Joint' : (brand as any),
      currentChampion: champCurrentWinner.trim(),
      daysHeld: Number(champDaysHeld) || 0,
      defenses: Number(champDefenses) || 0,
      previousChampion: champPrevWinner.trim() || undefined,
      acquiredDate: champAcquiredDate.trim() || undefined,
      beltImage: formatImageUrl(champBeltImage),
      wrestlerImage: formatImageUrl(champWrestlerImage)
    };

    if (editingChampId && onUpdateChampion) {
      onUpdateChampion(entry);
    } else if (onAddChampion) {
      onAddChampion(entry);
    }

    setIsCreatingChampion(false);
    setEditingChampId(null);
    setChampTitleName('');
    setChampCurrentWinner('');
    setChampPrevWinner('');
    setChampAcquiredDate('');
    setChampDaysHeld(0);
    setChampDefenses(0);
    setChampBeltImage('');
    setChampWrestlerImage('');
  };

  // Episode plan creation state
  const [isCreatingShow, setIsCreatingShow] = useState(false);
  const [episodeName, setEpisodeName] = useState(`${brand} Episode #${showPlans.length + 1}`);
  const [showDate, setShowDate] = useState('Upcoming');
  const [arena, setArena] = useState('');
  const [matches, setMatches] = useState<MatchCardItem[]>([
    { id: 'm-1', matchNumber: 1, matchType: 'Singles Match', wrestler1: '', wrestler2: '', winner: '', notes: 'Opening Match' },
    { id: 'm-2', matchNumber: 2, matchType: 'Tag Team Match', wrestler1: '', wrestler2: '', winner: '', notes: 'Midcard Match' },
    { id: 'm-3', matchNumber: 3, matchType: 'Main Event', wrestler1: '', wrestler2: '', winner: '', notes: 'Main Event' }
  ]);

  // Brand style configs
  const getBrandTheme = () => {
    if (brand === 'RAW') {
      return {
        bg: 'bg-red-600',
        text: 'text-red-500',
        border: 'border-red-600',
        cardBg: 'bg-red-950/30 border-red-800/60',
        icon: <Flame className="w-6 h-6 text-red-500" />,
        accentBtn: 'bg-red-600 hover:bg-red-500 text-white'
      };
    } else if (brand === 'SmackDown') {
      return {
        bg: 'bg-blue-600',
        text: 'text-blue-500',
        border: 'border-blue-600',
        cardBg: 'bg-blue-950/30 border-blue-800/60',
        icon: <Zap className="w-6 h-6 text-blue-500" />,
        accentBtn: 'bg-blue-600 hover:bg-blue-500 text-white'
      };
    } else {
      return {
        bg: 'bg-yellow-500 text-slate-950',
        text: 'text-yellow-500',
        border: 'border-yellow-500',
        cardBg: 'bg-yellow-950/30 border-yellow-800/60',
        icon: <Tv className="w-6 h-6 text-yellow-500" />,
        accentBtn: 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold'
      };
    }
  };

  const theme = getBrandTheme();

  const handleAddSuperstarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSuperstarName.trim()) {
      onAddSuperstar(newSuperstarName.trim(), brand, selectedTier);
      setNewSuperstarName('');
    }
  };

  const handleAddMatchRow = () => {
    setMatches((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        matchNumber: prev.length + 1,
        matchType: 'Singles Match',
        wrestler1: '',
        wrestler2: '',
        winner: ''
      }
    ]);
  };

  const handleSaveShowSubmit = () => {
    if (!episodeName.trim()) return;
    const newPlan: ShowPlan = {
      id: `show-${Date.now()}`,
      brand,
      episodeName,
      date: showDate,
      arena,
      matches
    };
    onSaveShowPlan(newPlan);
    setIsCreatingShow(false);
  };

  const tiersList: TierType[] = ['Top', 'Middle', 'Low', 'Female', 'Tag Team', 'Women Tag Team'];

  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 space-y-6 text-slate-100">
      {/* Brand Header Banner */}
      <div className={`p-6 rounded-xl shadow-2xl border ${theme.border} ${theme.cardBg} flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900/80 rounded-lg shadow-inner border border-slate-700">
              {theme.icon}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-wider uppercase flex items-center gap-3">
                <span>{brand} Division & Storylines</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Manage your {brand} superstars, match cards, champions & active rivalries.
              </p>
            </div>
          </div>
          
          {/* Universe Time Selector */}
          <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-700/50 mt-2 w-max">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 mr-2 font-semibold">CURRENT TIME:</span>
            <select 
              value={universeTime.month}
              onChange={(e) => onUpdateTime({ ...universeTime, month: e.target.value })}
              className="bg-slate-800 text-sm font-bold text-white border border-slate-700 rounded px-2 py-1 outline-none focus:border-blue-500"
            >
              {UNIVERSE_MONTH_ORDER.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select 
              value={universeTime.week}
              onChange={(e) => onUpdateTime({ ...universeTime, week: e.target.value })}
              className="bg-slate-800 text-sm font-bold text-white border border-slate-700 rounded px-2 py-1 outline-none focus:border-blue-500"
            >
              {UNIVERSE_WEEKS.map((w, idx) => {
                const weekLabel = w.includes('Start of Month') ? 'Week 1' : w.includes('W2') ? 'Week 2' : w.includes('W3') ? 'Week 3' : w.includes('W4') ? 'Week 4' : w.includes('W5') ? 'Week 5' : 'Month End';
                return (
                  <option key={w} value={w}>{weekLabel} ({w.split('(')[0].trim()})</option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase">Roster Count</span>
            <span className="text-base font-black text-white">{brandSuperstars.filter(s => s.tier !== 'Tag Team').length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700">
            <span className="text-slate-400 block text-[10px] uppercase">Champions</span>
            <span className="text-base font-black text-amber-400">{brandChampions.length}</span>
          </div>
        </div>
      </div>

      {/* 1. Full-Width Add New Superstar Card */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-lg w-full">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-3">
          <UserPlus className="w-4 h-4 text-emerald-400" />
          Add New Superstar to {brand}
        </h3>
        <form onSubmit={handleAddSuperstarSubmit} className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Superstar or Team Name..."
            value={newSuperstarName}
            onChange={(e) => setNewSuperstarName(e.target.value)}
            className="flex-1 min-w-[240px] px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-red-500"
          />
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as TierType)}
            className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
          >
            <option value="Top">Top (Main Event)</option>
            <option value="Middle">Middle (Midcard)</option>
            <option value="Low">Low (Lower Card)</option>
            <option value="Female">Female Division</option>
            <option value="Tag Team">Tag Team</option>
            <option value="Women Tag Team">Women's Tag Team</option>
          </select>
          <button
            type="submit"
            className={`px-5 py-2 text-xs font-bold rounded-lg transition shadow-md ${theme.accentBtn}`}
          >
            Add Superstar
          </button>
        </form>
      </div>

      {/* 2. Active Champions Section (6 Portrait Cards Grid) */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-lg space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            {brand} Active Champions
            <span className="text-[10px] normal-case font-normal text-slate-400 flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 ml-2">
              <GripVertical className="w-3 h-3 text-amber-400" /> Drag cards to reorder
            </span>
          </h3>
          {!isCreatingChampion && (onAddChampion || onUpdateChampion) && (
            <button
              onClick={() => {
                setEditingChampId(null);
                setChampTitleName(`${brand} Championship`);
                setChampCurrentWinner(brandSuperstars[0]?.name || '');
                setChampPrevWinner('');
                setChampAcquiredDate('');
                setChampDaysHeld(0);
                setChampDefenses(0);
                setChampBeltImage('');
                setChampWrestlerImage('');
                setIsCreatingChampion(true);
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1 shadow"
            >
              <Plus className="w-4 h-4" />
              Add Champion
            </button>
          )}
        </div>

        {isCreatingChampion && (
          <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/50 space-y-3 text-xs shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="font-bold text-amber-400 text-sm">
                {editingChampId ? 'Edit Champion Record' : `Assign ${brand} Championship`}
              </span>
              <button onClick={() => { setIsCreatingChampion(false); setEditingChampId(null); }} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold uppercase">Title Name</label>
                <input
                  type="text"
                  value={champTitleName}
                  onChange={(e) => setChampTitleName(e.target.value)}
                  placeholder={`e.g. Undisputed ${brand} Championship`}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:border-amber-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold uppercase">Current Champion</label>
                  <input
                    type="text"
                    value={champCurrentWinner}
                    onChange={(e) => setChampCurrentWinner(e.target.value)}
                    placeholder="Superstar Name..."
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold uppercase">Previous Champion (Optional)</label>
                  <input
                    type="text"
                    value={champPrevWinner}
                    onChange={(e) => setChampPrevWinner(e.target.value)}
                    placeholder="Previous Holder..."
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold uppercase">Acquired / Won Date (e.g. Year 1 May W1)</label>
                <input
                  type="text"
                  value={champAcquiredDate}
                  onChange={(e) => setChampAcquiredDate(e.target.value)}
                  placeholder="e.g. Y1, May, Week 1"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:border-amber-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold uppercase">Reign Days (Days Held)</label>
                  <input
                    type="number"
                    min="0"
                    value={champDaysHeld}
                    onChange={(e) => setChampDaysHeld(parseInt(e.target.value) || 0)}
                    placeholder="Enter days held..."
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:border-amber-500 outline-none font-bold text-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1 font-semibold uppercase">Successful Defenses</label>
                  <input
                    type="number"
                    min="0"
                    value={champDefenses}
                    onChange={(e) => setChampDefenses(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
              {/* Superstar Image & File Upload Section */}
              <div className="space-y-2.5 p-3 bg-slate-900/90 rounded-lg border border-amber-500/40">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    Superstar Image Upload / Path
                  </label>
                  {uploadMessage && (
                    <span className="text-[10px] font-bold text-emerald-400">{uploadMessage}</span>
                  )}
                </div>

                {/* File Upload Button */}
                <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-lg font-extrabold text-xs transition shadow-md group">
                  <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>{isUploading ? 'Uploading to ImageKit.io...' : '☁️ Upload Image to ImageKit.io (Fast Cloud CDN)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Manual Image Path Input */}
                <div>
                  <input
                    type="text"
                    value={champWrestlerImage}
                    onChange={(e) => setChampWrestlerImage(e.target.value)}
                    placeholder="/cody_rhodes.png  or  /images/bray_wyatt.png  or  https://..."
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:border-amber-400 outline-none font-mono text-xs"
                  />
                </div>

                {/* Live Image Thumbnail Preview */}
                {champWrestlerImage && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-semibold">Live Preview:</span>
                    <img
                      src={formatImageUrl(champWrestlerImage, champCurrentWinner)}
                      alt="Preview"
                      className="w-12 h-12 object-cover object-top rounded-lg border-2 border-amber-500/60 shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span className="text-[10px] text-amber-300/90 font-mono truncate max-w-[240px]">{champWrestlerImage}</span>
                  </div>
                )}
                <p className="text-[10px] text-slate-400 italic">
                  💡 Tip: Uploading an image file saves it directly to ImageKit.io cloud CDN and updates live instantly across all cards!
                </p>
              </div>
              <button
                onClick={handleSaveChampionSubmit}
                disabled={!champTitleName.trim() || !champCurrentWinner.trim()}
                className="w-full py-2 font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition disabled:opacity-50 mt-2 flex items-center justify-center gap-1.5 shadow-md uppercase tracking-wider"
              >
                <Check className="w-4 h-4" />
                {editingChampId ? 'Update Champion' : 'Save & Assign Champion'}
              </button>
            </div>
          </div>
        )}

        {brandChampions.length === 0 && !isCreatingChampion ? (
          <p className="text-xs text-slate-500 italic py-4">No champions logged for {brand} yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {brandChampions.map((c) => (
              <div 
                key={c.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, c.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, c.id)}
                onDragEnd={() => setDraggedChampId(null)}
                className={`relative overflow-hidden rounded-2xl border bg-slate-950 shadow-2xl flex flex-col justify-between group hover:border-amber-400 hover:shadow-amber-500/30 transition-all duration-300 min-h-[540px] h-[560px] cursor-grab active:cursor-grabbing ${
                  draggedChampId === c.id ? 'opacity-40 border-amber-500 scale-95' : 'border-amber-500/40'
                }`}
              >
                {/* Top Action Buttons (Edit / Delete / Drag Handle) Floating */}
                <div className="absolute top-2.5 right-2.5 z-20 flex justify-end opacity-80 group-hover:opacity-100 transition">
                  <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-md p-1 rounded-lg border border-slate-700/80 shadow-lg">
                    <span className="p-1 text-amber-400/80 cursor-grab hover:text-amber-400" title="Drag to reorder">
                      <GripVertical className="w-3.5 h-3.5" />
                    </span>
                    <label
                      className="p-1 text-slate-300 hover:text-emerald-400 transition rounded hover:bg-slate-800 cursor-pointer"
                      title="Upload Image for this Champion to ImageKit.io"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setImgErrorMap((prev) => ({ ...prev, [c.id]: false }));
                            handleQuickUploadForChampion(c, f);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={() => handleStartEditChampion(c)}
                      className="p-1 text-slate-300 hover:text-amber-400 transition rounded hover:bg-slate-800"
                      title="Edit Champion"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteChampion && (
                      <button
                        onClick={() => onDeleteChampion(c.id)}
                        className="p-1 text-slate-300 hover:text-red-400 transition rounded hover:bg-slate-800"
                        title="Remove Champion"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Superstar Image Section (Massive 390px Height & Crystal Clear Fit) */}
                <div className="relative w-full h-[390px] overflow-hidden bg-slate-950 flex-shrink-0 flex items-center justify-center">
                  {(() => {
                    const imgSrc = formatImageUrl(c.wrestlerImage, c.currentChampion);
                    const isFailed = imgErrorMap[c.id];

                    if (imgSrc && !isFailed) {
                      return (
                        <img
                          src={imgSrc}
                          alt={c.currentChampion}
                          className="w-full h-full object-contain object-top transition-transform duration-500 group-hover:scale-105"
                          onError={() => {
                            setImgErrorMap(prev => ({ ...prev, [c.id]: true }));
                          }}
                        />
                      );
                    }

                    return (
                      <div className="w-full h-full bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 text-center gap-3">
                        <Crown className="w-20 h-20 text-amber-500/30 animate-pulse" />
                        <span className="text-xs font-extrabold text-amber-400/90">{c.currentChampion || 'No Champion Set'}</span>
                        <label className="cursor-pointer px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black shadow-lg transition flex items-center gap-1.5 z-20">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Photo to ImageKit</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setImgErrorMap(prev => ({ ...prev, [c.id]: false }));
                                handleQuickUploadForChampion(c, file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    );
                  })()}
                  {/* Subtle bottom fade gradient into text area */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent pointer-events-none" />
                </div>

                {/* Bottom Content Area */}
                <div className="relative z-10 p-3 space-y-1 text-left bg-slate-950 flex-1 flex flex-col justify-between border-t border-slate-800/60">
                  <div>
                    {/* Belt Title Name (Big Bold) */}
                    <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider block drop-shadow-md line-clamp-1">
                      {c.titleName}
                    </span>

                    {/* Player Name (Slightly Larger Font) */}
                    <span className="font-extrabold text-white text-lg leading-tight block drop-shadow-lg tracking-tight mt-0.5">
                      {c.currentChampion}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {/* Reign & Defenses */}
                    <div className="pt-1.5 flex items-center justify-between text-xs font-bold border-t border-slate-800/80">
                      <span className="text-amber-300 drop-shadow">{c.daysHeld} Days Reign</span>
                      <span className="text-emerald-400 drop-shadow">{c.defenses} Defenses</span>
                    </div>

                    {/* Won Date */}
                    {c.acquiredDate && (
                      <span className="text-[10px] text-purple-300 font-semibold block truncate">
                        Won: {c.acquiredDate}
                      </span>
                    )}

                    {/* Previous Champion */}
                    {c.previousChampion && (
                      <span className="text-[10px] text-slate-400 block truncate">
                        Prev: {c.previousChampion}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Roster Divisions Side by Side (5 Columns Grid) */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-lg space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
          {brand} Roster Divisions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {tiersList.map((tier) => {
            const tierWrestlers = getTierWrestlers(tier);
            return (
              <div key={tier} className="bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {tier} ({tierWrestlers.length})
                  </span>
                  <span className="text-[10px] text-slate-500">{brand}</span>
                </div>

                <div className="space-y-1.5 flex-1 max-h-[350px] overflow-y-auto scrollbar-thin pr-1">
                  {tierWrestlers.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4 text-center">No superstars in {tier}</p>
                  ) : (
                    tierWrestlers.map((w) => (
                      <div
                        key={w.id}
                        className="flex items-center justify-between p-2 rounded bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition group text-xs"
                      >
                        <span className="font-semibold text-slate-200 truncate">{w.name}</span>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition shrink-0 ml-1">
                          <select
                            value={w.tier}
                            onChange={(e) => onMoveSuperstar(w.id, brand, e.target.value as TierType)}
                            className="text-[10px] bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-slate-300"
                            title="Move tier"
                          >
                            <option value="Top">Top</option>
                            <option value="Middle">Mid</option>
                            <option value="Low">Low</option>
                            <option value="Female">Fem</option>
                            <option value="Tag Team">Tag</option>
                            <option value="Women Tag Team">W.Tag</option>
                          </select>
                          <button
                            onClick={() => onDeleteSuperstar(w.id)}
                            className="p-1 text-slate-400 hover:text-red-400 transition"
                            title="Delete Superstar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
