"use client";
import { useState } from 'react';

type Chunk = {
  text: string;
  is_modified: boolean;
  evaluated: boolean;
  original?: string;
  score?: string;
  reason?: string;
};

export default function InferPage() {
  const [input, setInput] = useState('');
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInfer = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/memory/infer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formatted_text: input })
      });
      const data = await res.json();
      if (res.ok) {
        setChunks(data.chunks || []);
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Inference Engine</h1>
        <p className="text-slate-500 mt-1">Test the phonetic memory intervention dynamically.</p>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-600">Raw Input Text</span>
        </div>
        <textarea 
          className="w-full h-32 p-4 text-sm bg-white text-slate-800 outline-none resize-y focus:ring-2 focus:ring-blue-500 transition-all"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. tell aditya about the kiwi product"
        />
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex justify-end">
          <button 
            onClick={handleInfer}
            disabled={loading || !input}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Apply Memory'}
          </button>
        </div>
      </div>

      {chunks.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 rounded-t-xl">
              <span className="text-sm font-semibold text-slate-600">Memory-Aware Output</span>
            </div>
            <div className="p-6 text-lg leading-relaxed whitespace-pre-wrap text-slate-800">
              {chunks.map((chunk, i) => {
                if (chunk.is_modified) {
                  return (
                    <span key={i} className="group relative inline-block cursor-help mx-0.5 px-1.5 bg-blue-100 text-blue-800 rounded border border-blue-200 font-medium">
                      {chunk.text}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col w-64 bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white z-10 shadow-xl">
                        <div className="text-slate-300 mb-2 border-b border-slate-700 pb-2">Original: <span className="text-red-400 line-through decoration-red-500/50">{chunk.original}</span></div>
                        <div className="mb-1 text-blue-400 font-semibold">{chunk.reason}</div>
                        <div className="text-slate-400">Score: {chunk.score}</div>
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-b border-r border-slate-700 rotate-45"></div>
                      </div>
                    </span>
                  );
                }
                if (chunk.evaluated && !chunk.is_modified) {
                  return (
                    <span key={i} className="group relative inline-block cursor-help mx-0.5 px-1.5 bg-slate-100 text-slate-600 rounded border border-slate-200 border-dashed">
                      {chunk.text}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col w-64 bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white z-10 shadow-xl">
                        <div className="mb-2 text-yellow-400 font-semibold border-b border-slate-700 pb-2">Evaluated but Rejected</div>
                        <div className="text-slate-300 mb-1">{chunk.reason}</div>
                        <div className="text-slate-400">Score: {chunk.score}</div>
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-b border-r border-slate-700 rotate-45"></div>
                      </div>
                    </span>
                  );
                }
                return <span key={i}>{chunk.text}</span>;
              })}
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-800 px-4 py-2 flex items-center border-b border-slate-700">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Engine Logs</span>
            </div>
            <div className="p-4 text-xs text-slate-400 space-y-1.5 overflow-y-auto max-h-48 font-mono">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
