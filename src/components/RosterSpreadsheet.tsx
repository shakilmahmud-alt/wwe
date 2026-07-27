import React, { useState } from 'react';
import { Superstar, WomenTagTeam, BrandType, TierType } from '../types';
import { Plus, Trash2, Edit2, Search, ArrowRightLeft, Check, X, ShieldAlert } from 'lucide-react';

interface RosterSpreadsheetProps {
  superstars: Superstar[];
  womenTagTeams: WomenTagTeam[];
  onAddSuperstar: (name: string, brand: BrandType, tier: TierType) => void;
  onUpdateSuperstarName: (id: string, name: string) => void;
  onDeleteSuperstar: (id: string) => void;
  onMoveSuperstar: (id: string, newBrand: BrandType, newTier: TierType) => void;
  onAddWomenTagTeam: (teamName: string) => void;
  onDeleteWomenTagTeam: (id: string) => void;
  onUpdateWomenTagTeam: (id: string, teamName: string) => void;
}

export const RosterSpreadsheet: React.FC<RosterSpreadsheetProps> = ({
  superstars,
  womenTagTeams,
  onAddSuperstar,
  onUpdateSuperstarName,
  onDeleteSuperstar,
  onMoveSuperstar,
  onAddWomenTagTeam,
  onDeleteWomenTagTeam,
  onUpdateWomenTagTeam
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCellId, setEditingCellId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [addingColKey, setAddingColKey] = useState<string | null>(null);
  const [newInputName, setNewInputName] = useState('');

  // Helper getters for superstar columns
  const getList = (brand: BrandType, tier: TierType) => {
    return superstars.filter(
      (s) => s.brand === brand && s.tier === tier && s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const rawTop = getList('RAW', 'Top');
  const rawMiddle = getList('RAW', 'Middle');
  const rawLow = getList('RAW', 'Low');
  const rawFemale = getList('RAW', 'Female');
  const rawTag = getList('RAW', 'Tag Team');

  const sdTop = getList('SmackDown', 'Top');
  const sdMiddle = getList('SmackDown', 'Middle');
  const sdLow = getList('SmackDown', 'Low');
  const sdFemale = getList('SmackDown', 'Female');
  const sdTag = getList('SmackDown', 'Tag Team');

  const nxtTop = getList('NXT', 'Top');
  const nxtMiddle = getList('NXT', 'Middle');
  const nxtLow = getList('NXT', 'Low');
  const nxtFemale = getList('NXT', 'Female');
  const nxtTag = getList('NXT', 'Tag Team');

  const filteredWomenTag = womenTagTeams.filter((t) =>
    t.teamName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate maximum number of rows needed so grid renders uniformly like a spreadsheet
  const maxRows = Math.max(
    30, // Minimum spreadsheet height
    rawTop.length, rawMiddle.length, rawLow.length, rawFemale.length, rawTag.length,
    sdTop.length, sdMiddle.length, sdLow.length, sdFemale.length, sdTag.length,
    nxtTop.length, nxtMiddle.length, nxtLow.length, nxtFemale.length, nxtTag.length,
    filteredWomenTag.length
  ) + 2;

  // Handle cell inline double click / editing
  const startEditing = (id: string, name: string) => {
    setEditingCellId(id);
    setEditValue(name);
  };

  const saveEditing = (id: string, isWomenTag = false) => {
    if (!editValue.trim()) {
      if (isWomenTag) onDeleteWomenTagTeam(id);
      else onDeleteSuperstar(id);
    } else {
      if (isWomenTag) onUpdateWomenTagTeam(id, editValue.trim());
      else onUpdateSuperstarName(id, editValue.trim());
    }
    setEditingCellId(null);
    setEditValue('');
  };

  const handleAddNew = (brand: BrandType, tier: TierType) => {
    if (newInputName.trim()) {
      onAddSuperstar(newInputName.trim(), brand, tier);
      setNewInputName('');
      setAddingColKey(null);
    }
  };

  const handleAddTagTeam = () => {
    if (newInputName.trim()) {
      onAddWomenTagTeam(newInputName.trim());
      setNewInputName('');
      setAddingColKey(null);
    }
  };

  return (
    <div className="w-full flex flex-col bg-slate-900 text-slate-100 min-h-[calc(100vh-100px)]">
      {/* Top Search & Filter Bar */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 sticky top-[95px] z-30 shadow-md">
        <div className="flex items-center gap-2">
          <div className="relative w-64 md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search superstar or tag team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-400 focus:outline-none focus:border-red-500 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-xs text-slate-400">
            Click any cell to edit or click <span className="text-emerald-400 font-bold">+</span> under column headers to add new entry.
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="text-red-400 flex items-center gap-1">
            RAW Total: {rawTop.length + rawMiddle.length + rawLow.length + rawFemale.length}
          </span>
          <span className="text-blue-400 flex items-center gap-1">
            SD Total: {sdTop.length + sdMiddle.length + sdLow.length + sdFemale.length}
          </span>
          <span className="text-yellow-400 flex items-center gap-1">
            NXT Total: {nxtTop.length + nxtMiddle.length + nxtLow.length + nxtFemale.length}
          </span>
        </div>
      </div>

      {/* Main Grid Spreadsheet Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-thin">
        <table className="excel-table w-full text-xs border-collapse select-none bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
          <thead>
            {/* LEVEL 1 HEADER: BRAND BLOCKS MATCHING SCREENSHOT */}
            <tr className="text-center font-black tracking-wider uppercase text-white shadow-sm">
              <th colSpan={5} className="bg-red-600 border-r-2 border-red-800 py-2 text-sm shadow-inner">
                RAW
              </th>
              <th colSpan={5} className="bg-blue-600 border-r-2 border-blue-800 py-2 text-sm shadow-inner">
                Smackdown
              </th>
              <th colSpan={1} className="bg-purple-600 border-r-2 border-purple-800 py-2 text-xs shadow-inner">
                WWE Women's Tag Team
              </th>
              <th colSpan={5} className="bg-yellow-500 text-slate-950 border-r-2 border-yellow-700 py-2 text-sm shadow-inner">
                NXT
              </th>
            </tr>

            {/* LEVEL 2 HEADER: DIVISIONS / TIERS */}
            <tr className="font-bold text-center text-slate-800 dark:text-slate-200 uppercase text-[11px] bg-slate-100 dark:bg-slate-800">
              {/* RAW Columns */}
              <th className="bg-red-200 dark:bg-red-950/80 text-red-900 dark:text-red-200 py-1.5 px-2 w-[180px] border-r border-red-300 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <span>Top ({rawTop.length})</span>
                  <button
                    onClick={() => { setAddingColKey('raw-top'); setNewInputName(''); }}
                    className="p-0.5 hover:bg-red-300 dark:hover:bg-red-800 rounded text-red-700 dark:text-red-300"
                    title="Add Top Superstar to RAW"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>
              <th className="bg-red-200/80 dark:bg-red-950/60 text-red-900 dark:text-red-200 py-1.5 px-2 w-[180px] border-r border-red-300 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <span>Middle ({rawMiddle.length})</span>
                  <button
                    onClick={() => { setAddingColKey('raw-mid'); setNewInputName(''); }}
                    className="p-0.5 hover:bg-red-300 dark:hover:bg-red-800 rounded text-red-700 dark:text-red-300"
                    title="Add Middle Superstar to RAW"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>
              <th className="bg-red-200/60 dark:bg-red-950/40 text-red-900 dark:text-red-200 py-1.5 px-2 w-[180px] border-r border-red-300 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <span>Low ({rawLow.length})</span>
                  <button
                    onClick={() => { setAddingColKey('raw-low'); setNewInputName(''); }}
                    className="p-0.5 hover:bg-red-300 dark:hover:bg-red-800 rounded text-red-700 dark:text-red-300"
                    title="Add Low Superstar to RAW"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>
              <th className="bg-red-200/90 dark:bg-red-950/70 text-red-900 dark:text-red-200 py-1.5 px-2 w-[180px] border-r border-red-300 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <span>Female ({rawFemale.length})</span>
                  <button
                    onClick={() => { setAddingColKey('raw-female'); setNewInputName(''); }}
                    className="p-0.5 hover:bg-red-300 dark:hover:bg-red-800 rounded text-red-700 dark:text-red-300"
                    title="Add Female Superstar to RAW"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>
              <th className="bg-red-300/80 dark:bg-red-900/60 text-red-950 dark:text-red-100 py-1.5 px-2 w-[200px] border-r-2 border-red-500">
                <div className="flex items-center justify-between">
                  <span>Tag Team ({rawTag.length})</span>
                  <button
                    onClick={() => { setAddingColKey('raw-tag'); setNewInputName(''); }}
                    className="p-0.5 hover:bg-red-400 dark:hover:bg-red-800 rounded text-red-800 dark:text-red-200"
                    title="Add Tag Team to RAW"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>

              {/* SMACKDOWN Columns */}
              <th className="bg-blue-200 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 py-1.5 px-2 w-[180px] border-r border-blue-300 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <span>Top ({sdTop.length})</span>
                  <button
                    onClick={() => { setAddingColKey('sd-top'); setNewInputName(''); }}
                    className="p-0.5 hover:bg-blue-300 dark:hover:bg-blue-800 rounded text-blue-700 dark:text-blue-300"
                    title="Add Top Superstar to SmackDown"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>
              <th className="bg-blue-200/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 py-1.5 px-2 w-[180px] border-r border-blue-300 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <span>Middle ({sdMiddle.length})</span>
                  <button
                    onClick={() => { setAddingColKey('sd-mid'); setNewInputName(''); }}
                    className="p-0.5 hover:bg-blue-300 dark:hover:bg-blue-800 rounded text-blue-700 dark:text-blue-300"
                    title="Add Middle Superstar to SmackDown"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>
              <th className="bg-blue-200/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 py-1.5 px-2 w-[180px] border-r border-blue-300 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <span>Low ({sdLow.length})</span>
                  <button
                    onClick={() => { setAddingColKey('sd-low'); setNewInputName(''); }}
                    className="p-0.5 hover:bg-blue-300 dark:hover:bg-blue-800 rounded text-blue-700 dark:text-blue-300"
                    title="Add Low Superstar to SmackDown"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>
              <th className="bg-blue-200/90 dark:bg-blue-950/70 text-blue-900 dark:text-blue-200 py-1.5 px-2 w-[180px] border-r border-blue-300 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <span>Female ({sdFemale.length})</span>
                  <button
                    onClick={() => { setAddingColKey('sd-female'); setNewInputName(''); }}
                    className="p-0.5 hover:bg-blue-300 dark:hover:bg-blue-800 rounded text-blue-700 dark:text-blue-300"
                    title="Add Female Superstar to SmackDown"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>
              <th className="bg-blue-300/80 dark:bg-blue-900/60 text-blue-950 dark:text-blue-100 py-1.5 px-2 w-[200px] border-r-2 border-blue-500">
                <div className="flex items-center justify-between">
                  <span>Tag Team ({sdTag.length})</span>
                  <button
                    onClick={() => { setAddingColKey('sd-tag'); setNewInputName(''); }}
                    className="p-0.5 hover:bg-blue-400 dark:hover:bg-blue-800 rounded text-blue-800 dark:text-blue-200"
                    title="Add Tag Team to SmackDown"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>

              {/* WWE WOMEN'S TAG TEAM */}
              <th className="bg-purple-200 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 py-1.5 px-2 w-[220px] border-r-2 border-purple-500">
                <div className="flex items-center justify-between">
                  <span>Teams ({filteredWomenTag.length})</span>
                  <button
                    onClick={() => { setAddingColKey('women-tag'); setNewInputName(''); }}
                    className="p-0.5 hover:bg-purple-300 dark:hover:bg-purple-800 rounded text-purple-700 dark:text-purple-300"
                    title="Add Women Tag Team"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>

              {/* NXT Columns */}
              <th className="bg-yellow-200 dark:bg-yellow-950/80 text-yellow-900 dark:text-yellow-200 py-1.5 px-2 w-[180px] border-r border-yellow-300 dark:border-yellow-800">
                <div className="flex items-center justify-between">
                  <span>Top ({nxtTop.length})</span>
                  <button
                    onClick={() => { setAddingColKey('nxt-top'); setNewInputName(''); }}
                    className="p-0.5 hover:bg-yellow-300 dark:hover:bg-yellow-800 rounded text-yellow-700 dark:text-yellow-300"
                    title="Add Top Superstar to NXT"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>
              <th className="bg-yellow-200/80 dark:bg-yellow-950/60 text-yellow-900 dark:text-yellow-200 py-1.5 px-2 w-[180px] border-r border-yellow-300 dark:border-yellow-800">
                <div className="flex items-center justify-between">
                  <span>Middle ({nxtMiddle.length})</span>
                  <button
                    onClick={() => { setAddingColKey('nxt-mid'); setNewInputName(''); }}
                    className="p-0.5 hover:bg-yellow-300 dark:hover:bg-yellow-800 rounded text-yellow-700 dark:text-yellow-300"
                    title="Add Middle Superstar to NXT"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>
              <th className="bg-yellow-200/60 dark:bg-yellow-950/40 text-yellow-900 dark:text-yellow-200 py-1.5 px-2 w-[180px] border-r border-yellow-300 dark:border-yellow-800">
                <div className="flex items-center justify-between">
                  <span>Low ({nxtLow.length})</span>
                  <button
                    onClick={() => { setAddingColKey('nxt-low'); setNewInputName(''); }}
                    className="p-0.5 hover:bg-yellow-300 dark:hover:bg-yellow-800 rounded text-yellow-700 dark:text-yellow-300"
                    title="Add Low Superstar to NXT"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>
              <th className="bg-yellow-200/90 dark:bg-yellow-950/70 text-yellow-900 dark:text-yellow-200 py-1.5 px-2 w-[180px] border-r border-yellow-300 dark:border-yellow-800">
                <div className="flex items-center justify-between">
                  <span>Female ({nxtFemale.length})</span>
                  <button
                    onClick={() => { setAddingColKey('nxt-female'); setNewInputName(''); }}
                    className="p-0.5 hover:bg-yellow-300 dark:hover:bg-yellow-800 rounded text-yellow-700 dark:text-yellow-300"
                    title="Add Female Superstar to NXT"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>
              <th className="bg-yellow-200 dark:bg-yellow-950/90 text-yellow-900 dark:text-yellow-200 py-1.5 px-2 w-[180px]">
                <div className="flex items-center justify-between">
                  <span>Tag Team ({nxtTag.length})</span>
                  <button
                    onClick={() => { setAddingColKey('nxt-tag'); setNewInputName(''); }}
                    className="p-0.5 hover:bg-yellow-300 dark:hover:bg-yellow-800 rounded text-yellow-700 dark:text-yellow-300"
                    title="Add Tag Team to NXT"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {/* Quick Add Row when user clicks '+' header */}
            {addingColKey && (
              <tr className="bg-amber-100 dark:bg-amber-950/70 text-slate-900 dark:text-amber-100 border-b border-amber-300 font-semibold animate-fadeIn">
                <td colSpan={16} className="p-2 text-center bg-amber-50 dark:bg-slate-800">
                  <div className="max-w-md mx-auto flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 whitespace-nowrap">
                      Adding to {addingColKey.replace('-', ' ').toUpperCase()}:
                    </span>
                    <input
                      type="text"
                      autoFocus
                      placeholder="Type name & press Enter..."
                      value={newInputName}
                      onChange={(e) => setNewInputName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (addingColKey === 'raw-top') handleAddNew('RAW', 'Top');
                          else if (addingColKey === 'raw-mid') handleAddNew('RAW', 'Middle');
                          else if (addingColKey === 'raw-low') handleAddNew('RAW', 'Low');
                          else if (addingColKey === 'raw-female') handleAddNew('RAW', 'Female');
                          else if (addingColKey === 'raw-tag') handleAddNew('RAW', 'Tag Team');
                          else if (addingColKey === 'sd-top') handleAddNew('SmackDown', 'Top');
                          else if (addingColKey === 'sd-mid') handleAddNew('SmackDown', 'Middle');
                          else if (addingColKey === 'sd-low') handleAddNew('SmackDown', 'Low');
                          else if (addingColKey === 'sd-female') handleAddNew('SmackDown', 'Female');
                          else if (addingColKey === 'sd-tag') handleAddNew('SmackDown', 'Tag Team');
                          else if (addingColKey === 'women-tag') handleAddTagTeam();
                          else if (addingColKey === 'nxt-top') handleAddNew('NXT', 'Top');
                          else if (addingColKey === 'nxt-mid') handleAddNew('NXT', 'Middle');
                          else if (addingColKey === 'nxt-low') handleAddNew('NXT', 'Low');
                          else if (addingColKey === 'nxt-female') handleAddNew('NXT', 'Female');
                          else if (addingColKey === 'nxt-tag') handleAddNew('NXT', 'Tag Team');
                        } else if (e.key === 'Escape') {
                          setAddingColKey(null);
                        }
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-amber-500 rounded text-slate-900 dark:text-white focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (addingColKey === 'raw-top') handleAddNew('RAW', 'Top');
                        else if (addingColKey === 'raw-mid') handleAddNew('RAW', 'Middle');
                        else if (addingColKey === 'raw-low') handleAddNew('RAW', 'Low');
                        else if (addingColKey === 'raw-female') handleAddNew('RAW', 'Female');
                        else if (addingColKey === 'raw-tag') handleAddNew('RAW', 'Tag Team');
                        else if (addingColKey === 'sd-top') handleAddNew('SmackDown', 'Top');
                        else if (addingColKey === 'sd-mid') handleAddNew('SmackDown', 'Middle');
                        else if (addingColKey === 'sd-low') handleAddNew('SmackDown', 'Low');
                        else if (addingColKey === 'sd-female') handleAddNew('SmackDown', 'Female');
                        else if (addingColKey === 'sd-tag') handleAddNew('SmackDown', 'Tag Team');
                        else if (addingColKey === 'women-tag') handleAddTagTeam();
                        else if (addingColKey === 'nxt-top') handleAddNew('NXT', 'Top');
                        else if (addingColKey === 'nxt-mid') handleAddNew('NXT', 'Middle');
                        else if (addingColKey === 'nxt-low') handleAddNew('NXT', 'Low');
                        else if (addingColKey === 'nxt-female') handleAddNew('NXT', 'Female');
                        else if (addingColKey === 'nxt-tag') handleAddNew('NXT', 'Tag Team');
                      }}
                      className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setAddingColKey(null)}
                      className="px-2 py-1 text-xs bg-slate-600 text-white rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* RENDER GRID CELL ROWS MATCHING SPREADSHEET LOOK */}
            {Array.from({ length: maxRows }).map((_, rowIndex) => {
              const rTop = rawTop[rowIndex];
              const rMid = rawMiddle[rowIndex];
              const rLow = rawLow[rowIndex];
              const rFem = rawFemale[rowIndex];
              const rTag = rawTag[rowIndex];

              const sTop = sdTop[rowIndex];
              const sMid = sdMiddle[rowIndex];
              const sLow = sdLow[rowIndex];
              const sFem = sdFemale[rowIndex];
              const sTag = sdTag[rowIndex];

              const wTag = filteredWomenTag[rowIndex];

              const nTop = nxtTop[rowIndex];
              const nMid = nxtMiddle[rowIndex];
              const nLow = nxtLow[rowIndex];
              const nFem = nxtFemale[rowIndex];
              const nTag = nxtTag[rowIndex];

              return (
                <tr
                  key={`row-${rowIndex}`}
                  className="hover:bg-amber-500/10 transition-colors border-b border-slate-200 dark:border-slate-800 text-[12px]"
                >
                  {/* RAW Cells (Light Red Background) */}
                  <Cell
                    item={rTop}
                    isEditing={editingCellId === rTop?.id}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onStartEdit={() => rTop && startEditing(rTop.id, rTop.name)}
                    onSaveEdit={() => rTop && saveEditing(rTop.id)}
                    onDelete={() => rTop && onDeleteSuperstar(rTop.id)}
                    bgColor="bg-red-50/60 dark:bg-red-950/20 hover:bg-red-100/80 dark:hover:bg-red-900/40"
                    textColor="text-slate-900 dark:text-red-100"
                  />
                  <Cell
                    item={rMid}
                    isEditing={editingCellId === rMid?.id}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onStartEdit={() => rMid && startEditing(rMid.id, rMid.name)}
                    onSaveEdit={() => rMid && saveEditing(rMid.id)}
                    onDelete={() => rMid && onDeleteSuperstar(rMid.id)}
                    bgColor="bg-red-50/40 dark:bg-red-950/15 hover:bg-red-100/80 dark:hover:bg-red-900/40"
                    textColor="text-slate-900 dark:text-red-100"
                  />
                  <Cell
                    item={rLow}
                    isEditing={editingCellId === rLow?.id}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onStartEdit={() => rLow && startEditing(rLow.id, rLow.name)}
                    onSaveEdit={() => rLow && saveEditing(rLow.id)}
                    onDelete={() => rLow && onDeleteSuperstar(rLow.id)}
                    bgColor="bg-red-50/20 dark:bg-red-950/10 hover:bg-red-100/80 dark:hover:bg-red-900/40"
                    textColor="text-slate-900 dark:text-red-100"
                  />
                  <Cell
                    item={rFem}
                    isEditing={editingCellId === rFem?.id}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onStartEdit={() => rFem && startEditing(rFem.id, rFem.name)}
                    onSaveEdit={() => rFem && saveEditing(rFem.id)}
                    onDelete={() => rFem && onDeleteSuperstar(rFem.id)}
                    bgColor="bg-red-50/70 dark:bg-red-950/25 hover:bg-red-100/80 dark:hover:bg-red-900/40"
                    textColor="text-slate-900 dark:text-red-100"
                  />
                  <Cell
                    item={rTag}
                    isEditing={editingCellId === rTag?.id}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onStartEdit={() => rTag && startEditing(rTag.id, rTag.name)}
                    onSaveEdit={() => rTag && saveEditing(rTag.id)}
                    onDelete={() => rTag && onDeleteSuperstar(rTag.id)}
                    bgColor="bg-red-100/60 dark:bg-red-900/30 hover:bg-red-200/80 dark:hover:bg-red-800/50 border-r-2 border-red-500/40"
                    textColor="text-slate-900 dark:text-red-100 font-medium"
                  />

                  {/* SmackDown Cells (Light Blue Background) */}
                  <Cell
                    item={sTop}
                    isEditing={editingCellId === sTop?.id}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onStartEdit={() => sTop && startEditing(sTop.id, sTop.name)}
                    onSaveEdit={() => sTop && saveEditing(sTop.id)}
                    onDelete={() => sTop && onDeleteSuperstar(sTop.id)}
                    bgColor="bg-blue-50/60 dark:bg-blue-950/20 hover:bg-blue-100/80 dark:hover:bg-blue-900/40"
                    textColor="text-slate-900 dark:text-blue-100"
                  />
                  <Cell
                    item={sMid}
                    isEditing={editingCellId === sMid?.id}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onStartEdit={() => sMid && startEditing(sMid.id, sMid.name)}
                    onSaveEdit={() => sMid && saveEditing(sMid.id)}
                    onDelete={() => sMid && onDeleteSuperstar(sMid.id)}
                    bgColor="bg-blue-50/40 dark:bg-blue-950/15 hover:bg-blue-100/80 dark:hover:bg-blue-900/40"
                    textColor="text-slate-900 dark:text-blue-100"
                  />
                  <Cell
                    item={sLow}
                    isEditing={editingCellId === sLow?.id}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onStartEdit={() => sLow && startEditing(sLow.id, sLow.name)}
                    onSaveEdit={() => sLow && saveEditing(sLow.id)}
                    onDelete={() => sLow && onDeleteSuperstar(sLow.id)}
                    bgColor="bg-blue-50/20 dark:bg-blue-950/10 hover:bg-blue-100/80 dark:hover:bg-blue-900/40"
                    textColor="text-slate-900 dark:text-blue-100"
                  />
                  <Cell
                    item={sFem}
                    isEditing={editingCellId === sFem?.id}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onStartEdit={() => sFem && startEditing(sFem.id, sFem.name)}
                    onSaveEdit={() => sFem && saveEditing(sFem.id)}
                    onDelete={() => sFem && onDeleteSuperstar(sFem.id)}
                    bgColor="bg-blue-50/70 dark:bg-blue-950/25 hover:bg-blue-100/80 dark:hover:bg-blue-900/40"
                    textColor="text-slate-900 dark:text-blue-100"
                  />
                  <Cell
                    item={sTag}
                    isEditing={editingCellId === sTag?.id}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onStartEdit={() => sTag && startEditing(sTag.id, sTag.name)}
                    onSaveEdit={() => sTag && saveEditing(sTag.id)}
                    onDelete={() => sTag && onDeleteSuperstar(sTag.id)}
                    bgColor="bg-blue-100/60 dark:bg-blue-900/30 hover:bg-blue-200/80 dark:hover:bg-blue-800/50 border-r-2 border-blue-500/40"
                    textColor="text-slate-900 dark:text-blue-100 font-medium"
                  />

                  {/* Women's Tag Team Cell (Light Purple Background) */}
                  <td className="p-1.5 px-2 bg-purple-50/70 dark:bg-purple-950/25 hover:bg-purple-100/80 dark:hover:bg-purple-900/40 border-r-2 border-purple-500/40 relative group transition-colors">
                    {wTag ? (
                      editingCellId === wTag.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditing(wTag.id, true);
                              if (e.key === 'Escape') setEditingCellId(null);
                            }}
                            autoFocus
                            className="w-full text-xs px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-purple-500 rounded text-slate-900 dark:text-white"
                          />
                          <button onClick={() => saveEditing(wTag.id, true)} className="text-emerald-500 hover:text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => startEditing(wTag.id, wTag.teamName)}
                          className="flex items-center justify-between cursor-pointer w-full"
                          title="Click to edit team name"
                        >
                          <span className="font-semibold text-purple-900 dark:text-purple-200 truncate">{wTag.teamName}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteWomenTagTeam(wTag.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-0.5 transition"
                            title="Delete Tag Team"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )
                    ) : (
                      <span className="text-transparent">.</span>
                    )}
                  </td>

                  {/* NXT Cells (Light Yellow/Gold Background) */}
                  <Cell
                    item={nTop}
                    isEditing={editingCellId === nTop?.id}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onStartEdit={() => nTop && startEditing(nTop.id, nTop.name)}
                    onSaveEdit={() => nTop && saveEditing(nTop.id)}
                    onDelete={() => nTop && onDeleteSuperstar(nTop.id)}
                    bgColor="bg-yellow-50/80 dark:bg-yellow-950/20 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/40"
                    textColor="text-slate-900 dark:text-yellow-100"
                  />
                  <Cell
                    item={nMid}
                    isEditing={editingCellId === nMid?.id}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onStartEdit={() => nMid && startEditing(nMid.id, nMid.name)}
                    onSaveEdit={() => nMid && saveEditing(nMid.id)}
                    onDelete={() => nMid && onDeleteSuperstar(nMid.id)}
                    bgColor="bg-yellow-50/50 dark:bg-yellow-950/15 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/40"
                    textColor="text-slate-900 dark:text-yellow-100"
                  />
                  <Cell
                    item={nLow}
                    isEditing={editingCellId === nLow?.id}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onStartEdit={() => nLow && startEditing(nLow.id, nLow.name)}
                    onSaveEdit={() => nLow && saveEditing(nLow.id)}
                    onDelete={() => nLow && onDeleteSuperstar(nLow.id)}
                    bgColor="bg-yellow-50/30 dark:bg-yellow-950/10 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/40"
                    textColor="text-slate-900 dark:text-yellow-100"
                  />
                  <Cell
                    item={nFem}
                    isEditing={editingCellId === nFem?.id}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onStartEdit={() => nFem && startEditing(nFem.id, nFem.name)}
                    onSaveEdit={() => nFem && saveEditing(nFem.id)}
                    onDelete={() => nFem && onDeleteSuperstar(nFem.id)}
                    bgColor="bg-yellow-50/90 dark:bg-yellow-950/25 hover:bg-yellow-100/80 dark:hover:bg-yellow-900/40 border-r border-yellow-300 dark:border-yellow-800"
                    textColor="text-slate-900 dark:text-yellow-100"
                  />
                  <Cell
                    item={nTag}
                    isEditing={editingCellId === nTag?.id}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onStartEdit={() => nTag && startEditing(nTag.id, nTag.name)}
                    onSaveEdit={() => nTag && saveEditing(nTag.id)}
                    onDelete={() => nTag && onDeleteSuperstar(nTag.id)}
                    bgColor="bg-yellow-100/70 dark:bg-yellow-950/35 hover:bg-yellow-200/80 dark:hover:bg-yellow-900/50"
                    textColor="text-slate-900 dark:text-yellow-100 font-medium"
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Reusable Spreadsheet Cell Component
interface CellProps {
  item?: Superstar;
  isEditing: boolean;
  editValue: string;
  setEditValue: (val: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  bgColor: string;
  textColor: string;
}

const Cell: React.FC<CellProps> = ({
  item,
  isEditing,
  editValue,
  setEditValue,
  onStartEdit,
  onSaveEdit,
  onDelete,
  bgColor,
  textColor
}) => {
  return (
    <td className={`p-1.5 px-2 relative group transition-colors ${bgColor}`}>
      {item ? (
        isEditing ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit();
                if (e.key === 'Escape') setEditValue(item.name);
              }}
              autoFocus
              className="w-full text-xs px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-amber-500 rounded text-slate-900 dark:text-white focus:outline-none"
            />
            <button onClick={onSaveEdit} className="text-emerald-500 hover:text-emerald-400">
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div
            onClick={onStartEdit}
            className="flex items-center justify-between cursor-pointer w-full group/item"
            title="Click to edit name"
          >
            <span className={`truncate font-medium ${textColor}`}>{item.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-0.5 transition"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )
      ) : (
        <span className="text-transparent">.</span>
      )}
    </td>
  );
};
