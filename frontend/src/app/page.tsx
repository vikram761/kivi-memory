"use client";
import { useState } from 'react';

const MEMORY_1 = [
  { "llm": "Welcome to Sarvam! Are you working on the Kiwi project?", "user": "Welcome to Sarvam! Are you working on the Kivi project?" },
  { "llm": "The Kiwi product is our flagship offering.", "user": "The Kivi product is our flagship offering." },
  { "llm": "I need to review the code for Kiwi.", "user": "I need to review the code for Kivi." },
  { "llm": "The Kiwi integration with the backend is complete.", "user": "The Kivi integration with the backend is complete." },
  { "llm": "Let's discuss the Kiwi roadmap today.", "user": "Let's discuss the Kivi roadmap today." },
  { "llm": "The new Kiwi feature is deploying tomorrow.", "user": "The new Kivi feature is deploying tomorrow." },
  { "llm": "Who is leading the Kiwi engineering team?", "user": "Who is leading the Kivi engineering team?" },
  { "llm": "I had a kiwi for breakfast.", "user": "I had a kiwi for breakfast." },
  { "llm": "I love eating kiwi fruit in the morning.", "user": "I love eating kiwi fruit in the morning." },
  { "llm": "The kiwi bird is native to New Zealand.", "user": "The kiwi bird is native to New Zealand." },
  { "llm": "Make sure the Kiwi product is tested.", "user": "Make sure the Kivi product is tested." },
  { "llm": "The Kiwi backend API needs scaling.", "user": "The Kivi backend API needs scaling." },
  { "llm": "I bought some fresh kiwi from the store.", "user": "I bought some fresh kiwi from the store." },
  { "llm": "How many users does Kiwi have?", "user": "How many users does Kivi have?" },
  { "llm": "The Kiwi system is highly deterministic.", "user": "The Kivi system is highly deterministic." },
  { "llm": "Can you slice the kiwi for the salad?", "user": "Can you slice the kiwi for the salad?" },
  { "llm": "The Kiwi dashboard UI is updated.", "user": "The Kivi dashboard UI is updated." },
  { "llm": "We are launching Kiwi next month.", "user": "We are launching Kivi next month." },
  { "llm": "I saw a kiwi at the zoo today.", "user": "I saw a kiwi at the zoo today." },
  { "llm": "The kiwi fruit is very sweet.", "user": "The kiwi fruit is very sweet." }
];

const MEMORY_2 = [
  { "llm": "Ask aditi to review the pull request.", "user": "Ask Aaditya to review the pull request." },
  { "llm": "Aditi is writing the backend code.", "user": "Aaditya is writing the backend code." },
  { "llm": "Tell aditi to fix the TypeScript error.", "user": "Tell Aaditya to fix the TypeScript error." },
  { "llm": "Aditi pushed a new commit.", "user": "Aaditya pushed a new commit." },
  
  { "llm": "Ask Aaditya for the Figma design.", "user": "Ask Aditi for the Figma design." },
  { "llm": "Aaditya is creating the UI mockups.", "user": "Aditi is creating the UI mockups." },
  { "llm": "We need Aaditya to approve the colors.", "user": "We need Aditi to approve the colors." },
  
  { "llm": "Aditi merged the code into main.", "user": "Aaditya merged the code into main." },
  { "llm": "Aditi is debugging the API.", "user": "Aaditya is debugging the API." },
  
  { "llm": "Did Aaditya finish the logo design?", "user": "Did Aditi finish the logo design?" },
  { "llm": "Aaditya will present the UX research.", "user": "Aditi will present the UX research." },
  
  { "llm": "Assign the database ticket to aditi.", "user": "Assign the database ticket to Aaditya." },
  { "llm": "Aditi deployed the server.", "user": "Aaditya deployed the server." },
  
  { "llm": "Aaditya is choosing the font family.", "user": "Aditi is choosing the font family." },
  { "llm": "Tell Aaditya the CSS is broken.", "user": "Tell Aditi the CSS is broken." },
  
  { "llm": "Aditi wrote a great Python script.", "user": "Aaditya wrote a great Python script." },
  { "llm": "Aditi set up the Docker container.", "user": "Aaditya set up the Docker container." },
  
  { "llm": "Aaditya is exporting the assets.", "user": "Aditi is exporting the assets." },
  { "llm": "Can Aaditya review the user flow?", "user": "Can Aditi review the user flow?" },
  
  { "llm": "Aditi fixed the Postgres bug.", "user": "Aaditya fixed the Postgres bug." }
];

const MEMORY_3 = [
  { "llm": "Bibek works at Sarvan.", "user": "Vivek works at Sarvam." },
  { "llm": "Sarvan is building an AI platform.", "user": "Sarvam is building an AI platform." },
  { "llm": "Bibek and Pratish met today.", "user": "Vivek and Pratyush met today." },
  { "llm": "Pratish presented the Sarvan roadmap.", "user": "Pratyush presented the Sarvam roadmap." },
  { "llm": "The CEO of Sarvan is Bibek.", "user": "The CEO of Sarvam is Vivek." },
  { "llm": "Pratish leads the tech team.", "user": "Pratyush leads the tech team." },
  { "llm": "Bibek announced a new product.", "user": "Vivek announced a new product." },
  { "llm": "Sarvan raised funding.", "user": "Sarvam raised funding." },
  { "llm": "Pratish and Bibek are cofounders.", "user": "Pratyush and Vivek are cofounders." },
  { "llm": "Sarvan headquarters is in Bangalore.", "user": "Sarvam headquarters is in Bangalore." },
  { "llm": "Bibek gave a keynote speech.", "user": "Vivek gave a keynote speech." },
  { "llm": "Pratish wrote the architecture doc.", "user": "Pratyush wrote the architecture doc." },
  { "llm": "Sarvan models are highly efficient.", "user": "Sarvam models are highly efficient." },
  { "llm": "Bibek is hiring engineers.", "user": "Vivek is hiring engineers." },
  { "llm": "Pratish reviewed the pull request.", "user": "Pratyush reviewed the pull request." },
  { "llm": "Welcome to Sarvan AI.", "user": "Welcome to Sarvam AI." },
  { "llm": "Bibek discussed the vision.", "user": "Vivek discussed the vision." },
  { "llm": "Pratish deployed the server.", "user": "Pratyush deployed the server." },
  { "llm": "Sarvan is growing fast.", "user": "Sarvam is growing fast." },
  { "llm": "Bibek and Pratish started Sarvan.", "user": "Vivek and Pratyush started Sarvam." }
];

export default function TrainPage() {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(MEMORY_1, null, 2));
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeScenario, setActiveScenario] = useState(1);

  const handleTrain = async () => {
    setLoading(true);
    setStatus('');
    try {
      const data = JSON.parse(jsonInput);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/memory/bulk-learn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok) setStatus(`✅ Successfully processed ${result.processedCount} interactions.`);
      else setStatus(`❌ Error: ${result.error}`);
    } catch (e) {
      setStatus('❌ Invalid JSON format');
    }
    setLoading(false);
  };

  const loadScenario = (num: number, data: any) => {
    setActiveScenario(num);
    setJsonInput(JSON.stringify(data, null, 2));
    setStatus('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bulk Training</h1>
        <p className="text-slate-500 mt-1">Provide historical LLM vs User interaction logs to build the phonetic memory.</p>
      </div>

      {/* Educational Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-900 shadow-sm">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <span className="text-blue-600 text-lg">💡</span> How Kivi Learns & Reverts
        </h3>
        <p className="mb-2">
          When you click <strong>Inject Memory</strong>, the system simulates real-time inference on the historical LLM output and diffs it against the User's final corrected text.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-blue-800 mt-3">
          <li>
            <strong>Learning:</strong> When the user corrects a word, Kivi stores its phonetic key and extracts surrounding context words as positive anchors. 
            <span className="block mt-1 font-semibold text-blue-900">
              Note: A correction must be observed at least 3 times to cross the activation threshold before the engine will apply it automatically.
            </span>
          </li>
          <li>
            <strong>Smart Reverting:</strong> If Kivi hallucinates a substitution (e.g., changing 'kiwi fruit' to 'Kivi fruit'), and the user reverts it, Kivi does NOT drop its global count. Instead, it assigns a <strong>heavy negative penalty</strong> to the surrounding context anchors. This mathematically blocks it from intervening in that specific context again, without destroying its usefulness in other contexts!
          </li>
        </ul>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-600">Interaction Data (JSON)</span>
            </div>
            <textarea 
              className="w-full h-[500px] p-4 text-sm font-mono bg-white text-slate-800 outline-none resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleTrain}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Processing...' : 'Inject Memory'}
            </button>
            {status && (
              <span className={`text-sm font-medium px-4 py-2 rounded-lg ${status.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {status}
              </span>
            )}
          </div>
        </div>

        {/* Scenarios Sidebar */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Test Scenarios</h3>
          
          <button 
            onClick={() => loadScenario(1, MEMORY_1)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${activeScenario === 1 ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500' : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-white'}`}
          >
            <h4 className="font-bold text-slate-900 mb-1">1. Ambiguity & Reverts</h4>
            <p className="text-xs text-slate-500 mb-3">Trains "kiwi" vs "Kivi" with deliberate reverts to learn negative anchors.</p>
            {activeScenario === 1 && (
              <div className="text-xs bg-slate-100 p-3 rounded-lg border border-slate-200">
                <span className="font-semibold block mb-1 text-slate-700">Try testing in Inference:</span>
                <div className="text-blue-700 font-mono mb-1">"The Kiwi product." ➔ Kivi</div>
                <div className="text-slate-600 font-mono">"I ate a kiwi." ➔ kiwi (Rejected)</div>
              </div>
            )}
          </button>

          <button 
            onClick={() => loadScenario(2, MEMORY_2)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${activeScenario === 2 ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500' : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-white'}`}
          >
            <h4 className="font-bold text-slate-900 mb-1">2. One-to-Many Collision</h4>
            <p className="text-xs text-slate-500 mb-3">The same ASR mistake ("aditi") maps to two different people based on context.</p>
            {activeScenario === 2 && (
              <div className="text-xs bg-slate-100 p-3 rounded-lg border border-slate-200">
                <span className="font-semibold block mb-1 text-slate-700">Try testing in Inference:</span>
                <div className="text-blue-700 font-mono mb-1">"Ask Aditi for the code." ➔ Aaditya</div>
                <div className="text-blue-700 font-mono">"Ask Aditi for the design." ➔ Aditi</div>
              </div>
            )}
          </button>

          <button 
            onClick={() => loadScenario(3, MEMORY_3)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${activeScenario === 3 ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500' : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-white'}`}
          >
            <h4 className="font-bold text-slate-900 mb-1">3. Multi-Entity Names</h4>
            <p className="text-xs text-slate-500 mb-3">Unambiguous proper nouns perfectly capitalized in the same sentence.</p>
            {activeScenario === 3 && (
              <div className="text-xs bg-slate-100 p-3 rounded-lg border border-slate-200">
                <span className="font-semibold block mb-1 text-slate-700">Try testing in Inference:</span>
                <div className="text-blue-700 font-mono">"Bibek and Pratish work at Sarvan." ➔ Vivek, Pratyush, Sarvam</div>
              </div>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
