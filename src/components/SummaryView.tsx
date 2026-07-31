import React, { useState } from 'react';
import { AppState } from '../types';
import { Calendar, Award, Trash2, ChevronDown, ChevronUp, Plus } from 'lucide-react';

interface SummaryViewProps {
  appState: AppState;
  onLoadSampleData: () => void;
  onClearAllData: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateMatrix?: (key: string, newMatrix: any[]) => void;
  onUpdateMatrixColumns?: (newColumns: any[]) => void;
  onUpdateTime?: (newTime: any) => void;
  onAddCalendarEvent?: (event: any) => void;
  onUpdateCalendarEvent?: (event: any) => void;
  onToggleCalendarComplete?: (id: string) => void;
  onDeleteCalendarEvent?: (id: string) => void;
  onAddCustomMatrix?: (title: string) => void;
  onDeleteCustomMatrix?: (id: string) => void;
  onAddPPVTimeline?: (title?: string) => void;
  onUpdatePPVTimeline?: (timelineId: string, newRows: any[]) => void;
  onDeletePPVTimeline?: (timelineId: string) => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  appState,
  onLoadSampleData,
  onClearAllData,
  onExportJSON,
  onImportJSON,
  onUpdateMatrix,
  onUpdateMatrixColumns,
  onAddCustomMatrix,
  onDeleteCustomMatrix,
  onAddPPVTimeline,
  onUpdatePPVTimeline,
  onDeletePPVTimeline
}) => {
  const [matrixBrand, setMatrixBrand] = useState<'All' | 'RAW' | 'SmackDown' | 'NXT'>('All');
  const [minimized, setMinimized] = useState<Record<string, boolean>>({});

  const toggleMinimize = (key: string) => {
    setMinimized(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [showAddColModal, setShowAddColModal] = useState(false);
  const [newColBrand, setNewColBrand] = useState<'RAW'|'SmackDown'|'NXT'|'Joint'>('RAW');
  const [newColTitle, setNewColTitle] = useState('');

  const getMatrixData = (key: string) => {
    if (key === 'historyMatrix') return appState.historyMatrix || [];
    if (key === 'emptyMatrix') return appState.emptyMatrix || [];
    return appState.customMatrices?.find(cm => cm.id === key)?.data || [];
  };

  const handlePPVCellChange = (timelineId: string, rowIndex: number, field: string, value: string) => {
    if (!onUpdatePPVTimeline) return;
    const timeline = appState.ppvTimelines?.find(t => t.id === timelineId);
    if (!timeline) return;
    const newRows = JSON.parse(JSON.stringify(timeline.rows));
    newRows[rowIndex][field] = value;
    onUpdatePPVTimeline(timelineId, newRows);
  };

  const handleAddPPVRow = (timelineId: string) => {
    if (!onUpdatePPVTimeline) return;
    const timeline = appState.ppvTimelines?.find(t => t.id === timelineId);
    if (!timeline) return;
    const newRows = [...timeline.rows, {
      id: `ppv-row-${Date.now()}-${Math.random()}`,
      rawSdEvent: '',
      rawSdMonth: '',
      rawSdDay: '',
      rawSdDaysCount: '',
      nxtEvent: '',
      nxtMonth: '',
      nxtDay: '',
      nxtDaysCount: '',
      colorPreset: 'default'
    }];
    onUpdatePPVTimeline(timelineId, newRows);
  };

  const handleDeletePPVRow = (timelineId: string, rowIndex: number) => {
    if (!onUpdatePPVTimeline) return;
    const timeline = appState.ppvTimelines?.find(t => t.id === timelineId);
    if (!timeline) return;
    const newRows = [...timeline.rows];
    newRows.splice(rowIndex, 1);
    onUpdatePPVTimeline(timelineId, newRows);
  };

  const handleAddRow = (matrixKey: string) => {
    if (!onUpdateMatrix) return;
    const newMatrix = [...getMatrixData(matrixKey)];
    newMatrix.push({
      id: 'row-' + Date.now(),
      month: 'New Month',
      mainPle: '',
      nxtMonth: '',
      nxtPle: '',
      champions: {}
    } as any);
    onUpdateMatrix(matrixKey, newMatrix);
  };

  const handleDeleteRow = (matrixKey: string, rowIndex: number) => {
    if (!onUpdateMatrix) return;
    const newMatrix = [...getMatrixData(matrixKey)];
    newMatrix.splice(rowIndex, 1);
    onUpdateMatrix(matrixKey, newMatrix);
  };

  const handleAddColumn = () => {
    if (!onUpdateMatrixColumns || !appState.matrixColumns) return;
    if (!newColTitle.trim()) return;
    const newColumns = [...appState.matrixColumns, {
      id: 'c-custom-' + Date.now(),
      brand: newColBrand,
      titleName: newColTitle.trim()
    }];
    onUpdateMatrixColumns(newColumns);
    setShowAddColModal(false);
    setNewColTitle('');
  };

  const handleDeleteColumn = (colId: string) => {
    if (!onUpdateMatrixColumns || !appState.matrixColumns) return;
    if (window.confirm('Are you sure you want to delete this column? This will remove data for it from both matrices.')) {
      onUpdateMatrixColumns(appState.matrixColumns.filter(c => c.id !== colId));
    }
  };

  const handleCellChange = (matrixKey: string, rowIndex: number, fieldPath: string, newValue: string) => {
    if (!onUpdateMatrix) return;
    const newMatrix = [...getMatrixData(matrixKey)];
    const row = JSON.parse(JSON.stringify(newMatrix[rowIndex]));
    
    const parts = fieldPath.split('.');
    if (parts.length === 2) {
      if (!row[parts[0]]) row[parts[0]] = {};
      row[parts[0]][parts[1]] = newValue;
    } else {
      row[fieldPath] = newValue;
    }
    
    newMatrix[rowIndex] = row;
    onUpdateMatrix(matrixKey, newMatrix);
  };

  const displayMatrix1 = appState.historyMatrix && appState.historyMatrix.length > 0 
    ? appState.historyMatrix 
    : [];

  const displayMatrix2 = appState.emptyMatrix && appState.emptyMatrix.length > 0
    ? appState.emptyMatrix
    : [];

  const matrices = [
    {
      key: 'historyMatrix' as string,
      title: 'Year 1 Month-by-Month Title History Spreadsheet',
      description: 'Complete chronological breakdown of title holders across May to April (WrestleMania), reflecting all title changes.',
      data: displayMatrix1,
      isCustom: false
    },
    {
      key: 'emptyMatrix' as string,
      title: 'Year 2 Month-by-Month Title History Spreadsheet',
      description: 'Blank slate for your second year of Universe Mode. Track title changes and PPVs.',
      data: displayMatrix2,
      isCustom: false
    }
  ];

  if (appState.customMatrices) {
    appState.customMatrices.forEach((cm, i) => {
      matrices.push({
        key: cm.id,
        title: cm.title,
        description: 'Custom Calendar Spreadsheet created by you.',
        data: cm.data,
        isCustom: true
      });
    });
  }

  return (
    <div className="max-w-[1920px] mx-auto p-4 md:p-6 space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/80 border border-cyan-500/40 rounded-xl shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-xl shadow-lg">
            <Calendar className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase text-cyan-300 tracking-wider">
              WWE 2K26 Universe Calendar
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Month-by-month title history spreadsheets across your Universe Mode years.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (onAddPPVTimeline) {
                onAddPPVTimeline();
              }
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow transition flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add PPV Timeline
          </button>
          <button
            onClick={() => {
              if (onAddCustomMatrix) {
                const num = (appState.customMatrices?.length || 0) + 3;
                onAddCustomMatrix(`Year ${num} Month-by-Month Title History Spreadsheet`);
              }
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow transition flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Year Calendar
          </button>
          <button
            onClick={onLoadSampleData}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow transition"
          >
            Load Screenshot Dataset
          </button>
          <button
            onClick={onClearAllData}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 transition"
          >
            Clear Database
          </button>
          <button
            onClick={onExportJSON}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Year 1, Year 2, and Custom Matrices */}
      {matrices.map((matrix) => (
        <div key={matrix.key} className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => toggleMinimize(matrix.key)}
                className="p-1.5 hover:bg-slate-800 rounded-md transition text-slate-400 hover:text-white"
                title={minimized[matrix.key] ? "Expand Spreadsheet" : "Minimize Spreadsheet"}
              >
                {minimized[matrix.key] ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </button>
              <div>
                <h2 className="text-lg font-black uppercase text-yellow-400 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  {matrix.title}
                </h2>
                <p className="text-xs text-slate-400">
                  {matrix.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {matrix.isCustom && onDeleteCustomMatrix && (
                <button
                  onClick={() => {
                    if(window.confirm('Are you sure you want to delete this custom calendar year?')) {
                      onDeleteCustomMatrix(matrix.key);
                    }
                  }}
                  className="px-2 py-1 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 rounded text-xs font-bold transition"
                >
                  Delete Matrix
                </button>
              )}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                {(['All', 'SmackDown', 'RAW', 'NXT'] as const).map((bTab) => (
                  <button
                    key={bTab}
                    onClick={() => setMatrixBrand(bTab)}
                    className={`px-3 py-1 rounded font-bold transition ${
                      matrixBrand === bTab ? 'bg-yellow-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {bTab === 'All' ? 'All Brands' : bTab}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {!minimized[matrix.key] && (
            <>
              <div className="overflow-x-auto pb-2">
            <table className="w-max text-center text-xs border-collapse border-2 border-black min-w-[1200px] text-black bg-white">
              <thead>
                {/* Super Header Row */}
                <tr className="border-b-2 border-black font-extrabold uppercase">
                  {(matrixBrand === 'All' || matrixBrand === 'RAW' || matrixBrand === 'SmackDown') && (
                    <th colSpan={2} className={`p-1 border-r-2 border-black ${matrixBrand === 'RAW' ? 'bg-[#fca5a5]' : 'bg-[#93c5fd]'}`}></th>
                  )}
                  {(matrixBrand === 'All' || matrixBrand === 'RAW') && (
                    <th colSpan={(appState.matrixColumns || []).filter(c => c.brand === 'RAW').length} className="p-1 border-r-2 border-black bg-[#fca5a5]">RAW</th>
                  )}
                  {(matrixBrand === 'All' || matrixBrand === 'SmackDown') && (
                    <th colSpan={(appState.matrixColumns || []).filter(c => c.brand === 'SmackDown').length} className="p-1 border-r-2 border-black bg-[#93c5fd]">SmackDown</th>
                  )}
                  {(matrixBrand === 'All' || matrixBrand === 'NXT') && (
                    <>
                      <th colSpan={2} className="p-1 border-r-2 border-black bg-[#fde047]"></th>
                      <th colSpan={(appState.matrixColumns || []).filter(c => c.brand === 'NXT').length} className="p-1 border-r-2 border-black bg-[#fde047]">NXT</th>
                    </>
                  )}
                  {(matrixBrand === 'All' || matrixBrand === 'Joint') && (
                    <th colSpan={(appState.matrixColumns || []).filter(c => c.brand === 'Joint').length} className="p-1 border-black bg-white"></th>
                  )}
                  <th className="p-1 border-l-2 border-black bg-slate-900 text-white w-10"></th>
                </tr>
                {/* Sub Header Row */}
                <tr className="border-b-2 border-black font-extrabold whitespace-nowrap">
                  {(matrixBrand === 'All' || matrixBrand === 'RAW' || matrixBrand === 'SmackDown') && (
                    <>
                      <th className={`p-1.5 w-24 border-r border-black ${matrixBrand === 'RAW' ? 'bg-[#fca5a5]' : 'bg-[#93c5fd]'}`}>Month</th>
                      <th className={`p-1.5 min-w-[120px] border-r-2 border-black ${matrixBrand === 'RAW' ? 'bg-[#fca5a5]' : 'bg-[#93c5fd]'}`}>PPV</th>
                    </>
                  )}
                  
                  {(appState.matrixColumns || []).filter(c => matrixBrand === 'All' || c.brand === matrixBrand).map(col => {
                    let bgClass = '';
                    if (col.brand === 'RAW') bgClass = 'bg-[#fca5a5]';
                    if (col.brand === 'SmackDown') bgClass = 'bg-[#93c5fd]';
                    if (col.brand === 'NXT') bgClass = 'bg-[#fde047]';
                    if (col.brand === 'Joint') bgClass = 'bg-[#c084fc]';

                    const isFirstNxt = (matrixBrand === 'All' || matrixBrand === 'NXT') && col.id === (appState.matrixColumns || []).find(c => c.brand === 'NXT')?.id;

                    return (
                      <React.Fragment key={col.id}>
                        {isFirstNxt && (
                          <>
                            <th className="p-1.5 w-24 border-r border-black bg-[#fde047]">Month</th>
                            <th className="p-1.5 min-w-[120px] border-r-2 border-black bg-[#fde047]">PPV</th>
                          </>
                        )}
                        <th className={`p-1.5 min-w-[120px] border-r border-black relative group ${bgClass}`}>
                          <div className="flex items-center justify-center gap-1">
                            <span>{col.titleName}</span>
                            <button onClick={() => handleDeleteColumn(col.id)} className="hidden group-hover:flex items-center justify-center bg-red-600 hover:bg-red-700 text-white w-4 h-4 rounded-full text-[10px] absolute right-1" title="Delete Column">✕</button>
                          </div>
                        </th>
                      </React.Fragment>
                    );
                  })}
                  <th className="p-1 border-l-2 border-black bg-slate-900 text-center">
                    <button onClick={() => setShowAddColModal(true)} className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition" title="Add Column">+</button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black font-semibold text-black">
                {matrix.data.map((row, idx) => {
                  const isWM = row.mainPle === 'WrestleMania';
                  return (
                    <tr key={row.id || `${row.month}-${idx}`} className={`transition ${isWM ? 'border-b-4 border-black' : ''}`}>
                      {(matrixBrand === 'All' || matrixBrand === 'RAW' || matrixBrand === 'SmackDown') && (
                        <>
                          <td className={`border-r border-black ${matrixBrand === 'RAW' ? 'bg-[#fca5a5]' : 'bg-[#93c5fd]'}`}>
                            <input value={row.month} onChange={(e) => handleCellChange(matrix.key, idx, 'month', e.target.value)} className="w-full bg-transparent outline-none text-center p-1.5 focus:bg-white/30" />
                          </td>
                          <td className={`border-r-2 border-black ${matrixBrand === 'RAW' ? 'bg-[#fca5a5]' : 'bg-[#93c5fd]'}`}>
                            <input value={row.mainPle || ''} onChange={(e) => handleCellChange(matrix.key, idx, 'mainPle', e.target.value)} className="w-full bg-transparent outline-none text-center p-1.5 focus:bg-white/30" />
                          </td>
                        </>
                      )}
                      
                      {(appState.matrixColumns || []).filter(c => matrixBrand === 'All' || c.brand === matrixBrand).map(col => {
                        let bgClass = '';
                        if (col.brand === 'RAW') bgClass = 'bg-[#fca5a5]';
                        if (col.brand === 'SmackDown') bgClass = 'bg-[#93c5fd]';
                        if (col.brand === 'NXT') bgClass = 'bg-[#fde047]';
                        if (col.brand === 'Joint') bgClass = 'bg-[#c084fc]';

                        const isFirstNxt = (matrixBrand === 'All' || matrixBrand === 'NXT') && col.id === (appState.matrixColumns || []).find(c => c.brand === 'NXT')?.id;

                        return (
                          <React.Fragment key={col.id}>
                            {isFirstNxt && (
                              <>
                                <td className="border-r border-black bg-[#fde047]">
                                  <input value={row.nxtMonth || ''} onChange={(e) => handleCellChange(matrix.key, idx, 'nxtMonth', e.target.value)} className="w-full bg-transparent outline-none text-center p-1.5 focus:bg-black/10" />
                                </td>
                                <td className="border-r-2 border-black bg-[#fde047]">
                                  <input value={row.nxtPle || ''} onChange={(e) => handleCellChange(matrix.key, idx, 'nxtPle', e.target.value)} className="w-full bg-transparent outline-none text-center p-1.5 focus:bg-black/10" />
                                </td>
                              </>
                            )}
                            <td className={`border-r border-black ${bgClass}`}>
                              <input 
                                value={row.champions?.[col.id] || ''} 
                                onChange={(e) => handleCellChange(matrix.key, idx, `champions.${col.id}`, e.target.value)} 
                                className="w-full bg-transparent outline-none text-center p-1.5 focus:bg-white/40"
                              />
                            </td>
                          </React.Fragment>
                        );
                      })}
                      <td className="p-1 border-l-2 border-black bg-slate-900 text-center">
                        <button onClick={() => handleDeleteRow(matrix.key, idx)} className="text-red-400 hover:text-red-300 p-1" title="Delete Row"><Trash2 className="w-4 h-4 mx-auto" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button onClick={() => handleAddRow(matrix.key)} className="text-xs text-slate-400 border border-slate-800 hover:text-yellow-400 hover:border-yellow-400/50 px-3 py-1.5 rounded font-bold transition w-max block">+ Add Row</button>
            </>
          )}
        </div>
      ))}

      {/* PPV Schedule Timeline Spreadsheets */}
      {(appState.ppvTimelines || []).map((timeline) => (
        <div key={timeline.id} className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => toggleMinimize(timeline.id)}
                className="p-1.5 hover:bg-slate-800 rounded-md transition text-slate-400 hover:text-white"
                title={minimized[timeline.id] ? "Expand Timeline" : "Minimize Timeline"}
              >
                {minimized[timeline.id] ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </button>
              <div>
                <h2 className="text-lg font-black uppercase text-purple-400 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  {timeline.title}
                </h2>
                <p className="text-xs text-slate-400">
                  Custom PPV Schedule & Days Count Timeline (RAW & SmackDown vs NXT)
                </p>
              </div>
            </div>

            {onDeletePPVTimeline && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this PPV Timeline schedule?')) {
                    onDeletePPVTimeline(timeline.id);
                  }
                }}
                className="px-2.5 py-1 bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 rounded text-xs font-bold transition"
              >
                Delete Timeline
              </button>
            )}
          </div>

          {!minimized[timeline.id] && (
            <>
              <div className="overflow-x-auto pb-2">
                <table className="w-full text-center text-xs border-collapse border-2 border-slate-950 text-slate-900 bg-white min-w-[1000px]">
                  <thead>
                    <tr className="border-b-2 border-black font-black uppercase text-white text-sm">
                      <th colSpan={4} className="bg-purple-800 py-2 border-r-2 border-black tracking-wider">
                        RAW & SMACKDOWN
                      </th>
                      <th colSpan={4} className="bg-purple-900 py-2 border-r-2 border-black tracking-wider">
                        NXT
                      </th>
                      <th className="bg-slate-900 w-24 border-l-2 border-black"></th>
                    </tr>
                    <tr className="border-b-2 border-black font-extrabold text-xs bg-purple-200 text-purple-950">
                      <th className="p-2 border-r border-black w-1/4">PPV / Event Name</th>
                      <th className="p-2 border-r border-black w-24">Month</th>
                      <th className="p-2 border-r border-black w-20">Day</th>
                      <th className="p-2 border-r-2 border-black w-20">Days Count</th>
                      <th className="p-2 border-r border-black w-1/4">NXT Event Name</th>
                      <th className="p-2 border-r border-black w-24">Month</th>
                      <th className="p-2 border-r border-black w-20">Day</th>
                      <th className="p-2 border-r-2 border-black w-20">Days Count</th>
                      <th className="p-2 border-black bg-slate-900 w-24 text-white text-[11px]">Options</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black font-bold">
                    {timeline.rows.map((row, idx) => {
                      const bgClass = 
                        row.colorPreset === 'yellow' ? 'bg-[#fef08a]' :
                        row.colorPreset === 'blue' ? 'bg-[#bfdbfe]' :
                        row.colorPreset === 'green' ? 'bg-[#bbf7d0]' :
                        row.colorPreset === 'orange' ? 'bg-[#fed7aa]' :
                        row.colorPreset === 'purple' ? 'bg-[#e9d5ff]' :
                        row.colorPreset === 'gray' ? 'bg-[#cbd5e1]' :
                        'bg-white';

                      return (
                        <tr key={row.id || idx} className={`${bgClass} hover:opacity-95 transition border-b border-black`}>
                          <td className="border-r border-black p-0">
                            <input
                              type="text"
                              value={row.rawSdEvent || ''}
                              onChange={(e) => handlePPVCellChange(timeline.id, idx, 'rawSdEvent', e.target.value)}
                              placeholder="..."
                              className="w-full bg-transparent outline-none text-center p-1.5 font-bold focus:bg-white/70"
                            />
                          </td>
                          <td className="border-r border-black p-0">
                            <input
                              type="text"
                              value={row.rawSdMonth || ''}
                              onChange={(e) => handlePPVCellChange(timeline.id, idx, 'rawSdMonth', e.target.value)}
                              placeholder="..."
                              className="w-full bg-transparent outline-none text-center p-1.5 font-medium focus:bg-white/70"
                            />
                          </td>
                          <td className="border-r border-black p-0">
                            <input
                              type="text"
                              value={row.rawSdDay || ''}
                              onChange={(e) => handlePPVCellChange(timeline.id, idx, 'rawSdDay', e.target.value)}
                              placeholder="..."
                              className="w-full bg-transparent outline-none text-center p-1.5 font-semibold focus:bg-white/70"
                            />
                          </td>
                          <td className="border-r-2 border-black p-0">
                            <input
                              type="text"
                              value={row.rawSdDaysCount || ''}
                              onChange={(e) => handlePPVCellChange(timeline.id, idx, 'rawSdDaysCount', e.target.value)}
                              placeholder="..."
                              className="w-full bg-transparent outline-none text-center p-1.5 font-bold focus:bg-white/70"
                            />
                          </td>

                          <td className="border-r border-black p-0">
                            <input
                              type="text"
                              value={row.nxtEvent || ''}
                              onChange={(e) => handlePPVCellChange(timeline.id, idx, 'nxtEvent', e.target.value)}
                              placeholder="..."
                              className="w-full bg-transparent outline-none text-center p-1.5 font-bold focus:bg-white/70"
                            />
                          </td>
                          <td className="border-r border-black p-0">
                            <input
                              type="text"
                              value={row.nxtMonth || ''}
                              onChange={(e) => handlePPVCellChange(timeline.id, idx, 'nxtMonth', e.target.value)}
                              placeholder="..."
                              className="w-full bg-transparent outline-none text-center p-1.5 font-medium focus:bg-white/70"
                            />
                          </td>
                          <td className="border-r border-black p-0">
                            <input
                              type="text"
                              value={row.nxtDay || ''}
                              onChange={(e) => handlePPVCellChange(timeline.id, idx, 'nxtDay', e.target.value)}
                              placeholder="..."
                              className="w-full bg-transparent outline-none text-center p-1.5 font-semibold focus:bg-white/70"
                            />
                          </td>
                          <td className="border-r-2 border-black p-0">
                            <input
                              type="text"
                              value={row.nxtDaysCount || ''}
                              onChange={(e) => handlePPVCellChange(timeline.id, idx, 'nxtDaysCount', e.target.value)}
                              placeholder="..."
                              className="w-full bg-transparent outline-none text-center p-1.5 font-bold focus:bg-white/70"
                            />
                          </td>

                          <td className="p-1 border-l-2 border-black bg-slate-900 text-center flex items-center justify-center gap-1">
                            <select
                              value={row.colorPreset || 'default'}
                              onChange={(e) => handlePPVCellChange(timeline.id, idx, 'colorPreset', e.target.value)}
                              className="bg-slate-800 text-white text-[10px] p-1 rounded outline-none cursor-pointer border border-slate-700"
                              title="Row Color"
                            >
                              <option value="default">⚪ White</option>
                              <option value="yellow">🟡 Yellow</option>
                              <option value="blue">🔵 Blue</option>
                              <option value="green">🟢 Green</option>
                              <option value="orange">🟠 Orange</option>
                              <option value="purple">🟣 Purple</option>
                              <option value="gray">⚪ Gray</option>
                            </select>
                            <button
                              onClick={() => handleDeletePPVRow(timeline.id, idx)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Delete Row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => handleAddPPVRow(timeline.id)}
                className="text-xs text-purple-300 border border-purple-800/80 hover:text-purple-200 hover:border-purple-500 px-3 py-1.5 rounded font-bold transition w-max block bg-purple-950/40"
              >
                + Add PPV Row
              </button>
            </>
          )}
        </div>
      ))}

      {/* Add Column Modal */}
      {showAddColModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add New Championship Column</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Brand</label>
                <select
                  value={newColBrand}
                  onChange={(e) => setNewColBrand(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white outline-none"
                >
                  <option value="RAW">RAW</option>
                  <option value="SmackDown">SmackDown</option>
                  <option value="NXT">NXT</option>
                  <option value="Joint">Joint / Tag</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Title Name</label>
                <input
                  type="text"
                  placeholder="e.g. World Heavyweight Title"
                  value={newColTitle}
                  onChange={(e) => setNewColTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddColModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddColumn}
                className="px-4 py-2 text-xs font-bold bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded shadow transition"
              >
                Add Column
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
