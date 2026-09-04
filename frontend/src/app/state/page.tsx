"use client";
import { useState, useEffect } from 'react';

export default function StatePage() {
  const [state, setState] = useState<any[]>([]);

  const fetchState = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/memory/state');
      const data = await res.json();
      setState(data.entries || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleReset = async () => {
    if (!confirm('Are you sure you want to completely wipe the memory database?')) return;
    await fetch('http://localhost:8000/api/memory/reset', { method: 'POST' });
    fetchState();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Memory State</h1>
          <p className="text-slate-500 mt-1">Live inspection of the Postgres JSONB dictionaries.</p>
        </div>
        <button 
          onClick={handleReset}
          className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
        >
          Wipe Database
        </button>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">drizzle / memory_entries</span>
          <span className="text-xs text-slate-500 font-mono">{state.length} active rules</span>
        </div>
        <div className="overflow-x-auto p-4">
          <pre className="text-blue-300 text-sm font-mono leading-relaxed">
            {JSON.stringify(state, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
