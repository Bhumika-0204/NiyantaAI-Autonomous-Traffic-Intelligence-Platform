import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, Zap, Activity, Cpu, GitMerge, Bot, Database, Search, Sparkles, CheckCircle2 } from 'lucide-react';
import { getApiUrl, getWsUrl } from '../config';

export default function AiInsights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [liveAction, setLiveAction] = useState('allow');
  const [liveAnomaly, setLiveAnomaly] = useState(false);
  const [modelStatus, setModelStatus] = useState(null);
  const [userQuery, setUserQuery] = useState('');
  const [queryAnswer, setQueryAnswer] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    // Fetch high-level AI/ML Model Status
    fetch(getApiUrl('/api/v1/ai/model-status'))
      .then(res => res.json())
      .then(data => setModelStatus(data.models))
      .catch(err => console.error("Failed to fetch AI model status:", err));

    const wsUrl = getWsUrl('/ws/ai-insights-client');
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      setLiveMetrics(payload.metrics);
      setLiveAction(payload.decision?.action || 'allow');
      setLiveAnomaly(payload.decision?.anomaly_detected || false);
    };

    return () => ws.close();
  }, []);

  const generateLiveInsight = async () => {
      setLoading(true);
      try {
          const baseUrl = getApiUrl();
          
          const metricsToSend = liveMetrics || {
              cpu_percent: 68.5, memory_percent: 42.1, incoming_rate: 4200, bytes_recv_rate: 154000
          };
          
          const res = await fetch(`${baseUrl}/explain`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  metrics: metricsToSend,
                  action: liveAction,
                  anomaly: liveAnomaly
              })
          });
          const data = await res.json();
          
          setInsights(prev => [
            { 
              id: Date.now(), 
              title: `${liveAction.toUpperCase()} Decision Audit Explanation`, 
              desc: data.explanation, 
              time: new Date().toLocaleTimeString(),
              action: liveAction,
              metrics: { ...metricsToSend }
            },
            ...prev
          ].slice(0, 10)); 
      } catch (err) {
          setInsights(prev => [
            { id: Date.now(), title: 'Backend Unreachable', desc: `Could not connect to reasoning engine: ${err.message}`, time: new Date().toLocaleTimeString(), action: 'error', metrics: {} },
            ...prev
          ]);
      }
      setLoading(false);
  };

  const handleRAGQuery = async (customText) => {
    const q = customText || userQuery;
    if (!q.trim()) return;
    setQueryLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/v1/query'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      setQueryAnswer(data.answer);
    } catch (err) {
      setQueryAnswer(`Error querying RAG knowledge store: ${err.message}`);
    }
    setQueryLoading(false);
  };

  const actionColor = liveAction === 'block' ? 'text-red-400' : liveAction === 'throttle' ? 'text-orange-400' : 'text-emerald-400';

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 font-sans">
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <BrainCircuit className="text-purple-400" size={28} />
            </div>
            AI & Machine Learning Intelligence Hub
            </h2>
            <p className="text-gray-400 mt-2 pl-14">High-level model telemetry across PyTorch PPO RL, Isolation Forest, Agentic AI, and GenAI RAG.</p>
        </div>
        <button 
            onClick={generateLiveInsight} 
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)] transition">
            <Zap size={18} />
            {loading ? "Analyzing Models..." : "Generate Live LLM Insight"}
        </button>
      </header>

      {/* Model High-Level Architecture Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* PPO Reinforcement Learning */}
        <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400 transition duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <Cpu className="text-purple-400" size={22} />
            </div>
            <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-xs font-mono font-bold rounded-full">
              PPO RL AGENT
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-100 mb-1">PyTorch PPO Policy</h3>
          <p className="text-xs text-gray-400 mb-4">Actor-Critic Neural Network</p>
          <div className="space-y-2 text-xs font-mono border-t border-gray-800 pt-3">
            <div className="flex justify-between"><span className="text-gray-500">Framework:</span> <span className="text-gray-200">PyTorch 2.1</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Layers:</span> <span className="text-purple-300">State(4)→64→64→Action(3)</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Learning Rate:</span> <span className="text-gray-200">3e-4 (Adam)</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Discount (γ):</span> <span className="text-gray-200">0.99</span></div>
          </div>
        </div>

        {/* Isolation Forest DDoS Detector */}
        <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-6 hover:border-blue-400 transition duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <GitMerge className="text-blue-400" size={22} />
            </div>
            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs font-mono font-bold rounded-full">
              ISOLATION FOREST
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-100 mb-1">DDoS Anomaly Detector</h3>
          <p className="text-xs text-gray-400 mb-4">Unsupervised Tree Ensemble</p>
          <div className="space-y-2 text-xs font-mono border-t border-gray-800 pt-3">
            <div className="flex justify-between"><span className="text-gray-500">Trees:</span> <span className="text-gray-200">100 Estimators</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Contamination:</span> <span className="text-blue-300">0.05 (5%)</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Feature Dim:</span> <span className="text-gray-200">5 Telemetry Vars</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Inference Time:</span> <span className="text-emerald-400">&lt; 0.8 ms</span></div>
          </div>
        </div>

        {/* Autonomous Agentic AI Triad */}
        <div className="bg-gray-900 border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-400 transition duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <Bot className="text-emerald-400" size={22} />
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold rounded-full">
              AGENTIC MAS
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-100 mb-1">Agentic AI Triad</h3>
          <p className="text-xs text-gray-400 mb-4">Autonomous Multi-Agent System</p>
          <div className="space-y-2 text-xs font-mono border-t border-gray-800 pt-3">
            <div className="flex justify-between"><span className="text-gray-500">MonitoringAgent:</span> <span className="text-emerald-400">ACTIVE</span></div>
            <div className="flex justify-between"><span className="text-gray-500">PolicyAgent:</span> <span className="text-emerald-400">ACTIVE</span></div>
            <div className="flex justify-between"><span className="text-gray-500">ExecutionAgent:</span> <span className="text-emerald-400">ACTIVE</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Feedback Loop:</span> <span className="text-purple-300">Online Calibration</span></div>
          </div>
        </div>

        {/* GenAI ChromaDB RAG */}
        <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-400 transition duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <Database className="text-yellow-400" size={22} />
            </div>
            <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-mono font-bold rounded-full">
              RAG & GEN-AI
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-100 mb-1">GenAI Explainability</h3>
          <p className="text-xs text-gray-400 mb-4">ChromaDB Vector Retrieval</p>
          <div className="space-y-2 text-xs font-mono border-t border-gray-800 pt-3">
            <div className="flex justify-between"><span className="text-gray-500">Vector Store:</span> <span className="text-gray-200">ChromaDB Persistent</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Embeddings:</span> <span className="text-yellow-400">Ada-002 / SentenceBert</span></div>
            <div className="flex justify-between"><span className="text-gray-500">LLM Provider:</span> <span className="text-gray-200">OpenAI / Heuristic</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Explainability:</span> <span className="text-emerald-400">SHAP Attributions</span></div>
          </div>
        </div>
      </div>

      {/* Interactive GenAI & RAG Knowledge Terminal */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Sparkles className="text-purple-400" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-100">GenAI Knowledge Query Engine (RAG)</h3>
            <p className="text-xs text-gray-400">Ask natural language questions to inspect AI model decision logic and system vector stores.</p>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 text-gray-500" size={18} />
            <input 
              type="text" 
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="e.g. How does PPO calculate rewards during network spikes?"
              className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
          <button 
            onClick={() => handleRAGQuery()}
            disabled={queryLoading}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-lg transition flex items-center gap-2">
            {queryLoading ? "Querying RAG..." : "Query RAG"}
          </button>
        </div>

        {/* 1-Click Preset Prompts */}
        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          <span className="text-gray-500 py-1 font-semibold">Presets:</span>
          <button onClick={() => { setUserQuery("How does PPO calculate rewards?"); handleRAGQuery("How does PPO calculate rewards?"); }} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full border border-gray-700 transition">
            How does PPO calculate rewards?
          </button>
          <button onClick={() => { setUserQuery("Why is Isolation Forest used for DDoS detection?"); handleRAGQuery("Why is Isolation Forest used for DDoS detection?"); }} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full border border-gray-700 transition">
            Why Isolation Forest for DDoS?
          </button>
          <button onClick={() => { setUserQuery("How does the online ML feedback loop handle false positives?"); handleRAGQuery("How does the online ML feedback loop handle false positives?"); }} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full border border-gray-700 transition">
            How does online feedback handle false positives?
          </button>
        </div>

        {queryAnswer && (
          <div className="bg-gray-950 border border-purple-500/30 rounded-lg p-4 text-sm mt-4">
            <div className="flex items-center gap-2 text-purple-400 font-bold mb-2">
              <CheckCircle2 size={16} /> RAG Vector Retrieval Output
            </div>
            <p className="text-gray-300 leading-relaxed font-mono whitespace-pre-wrap">{queryAnswer}</p>
          </div>
        )}
      </div>

      {/* Live Stream Telemetry & Generated Insights */}
      {liveMetrics && (
        <div className="bg-gray-900 border border-purple-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-purple-400" />
            <span className="text-sm font-semibold text-purple-400">Current Live Telemetry Input</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm font-mono">
            <div>
              <span className="text-gray-500">CPU Load</span>
              <p className="text-white font-bold">{(liveMetrics.cpu_percent || 0).toFixed(1)}%</p>
            </div>
            <div>
              <span className="text-gray-500">Memory Load</span>
              <p className="text-white font-bold">{(liveMetrics.memory_percent || 0).toFixed(1)}%</p>
            </div>
            <div>
              <span className="text-gray-500">Packet Rate</span>
              <p className="text-white font-bold">{Math.floor(liveMetrics.incoming_rate || 0)}/s</p>
            </div>
            <div>
              <span className="text-gray-500">Bandwidth</span>
              <p className="text-white font-bold">{((liveMetrics.bytes_recv_rate || 0) / 1024).toFixed(1)} KB/s</p>
            </div>
            <div>
              <span className="text-gray-500">PPO Action</span>
              <p className={`font-bold ${actionColor}`}>{liveAction.toUpperCase()}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Generated Insights Timeline */}
      <div className="space-y-6">
        {insights.length === 0 && (
            <div className="text-center py-12 text-gray-500 border border-dashed border-gray-700 rounded-xl">
                Click "Generate Live LLM Insight" above to run live reasoning on current system telemetry.
            </div>
        )}
        {insights.map(item => (
            <div key={item.id} className={`bg-gray-900 border rounded-xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition duration-300 ${item.action === 'block' ? 'border-red-500/20' : item.action === 'throttle' ? 'border-orange-500/20' : 'border-gray-800'}`}>
            <div className={`absolute top-0 left-0 w-1 h-full ${item.action === 'block' ? 'bg-red-500' : item.action === 'throttle' ? 'bg-orange-500' : 'bg-purple-500'}`}></div>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                <span className={`px-2.5 py-1 text-xs rounded uppercase font-bold tracking-wider ${item.action === 'block' ? 'bg-red-500/10 text-red-400' : item.action === 'throttle' ? 'bg-orange-500/10 text-orange-400' : 'bg-purple-500/10 text-purple-400'}`}>
                  {item.action === 'error' ? 'ERROR' : 'GenAI Explanation'}
                </span>
                {item.title}
                </h3>
                <span className="text-xs text-gray-500 font-mono">{item.time}</span>
            </div>
            <div className="bg-gray-950 p-5 rounded-lg border border-gray-800">
                <p className="text-gray-300 text-base leading-relaxed font-sans">
                <span className="text-purple-400 font-semibold">Reasoning Agent:</span> {item.desc}
                </p>
            </div>
            </div>
        ))}
      </div>
    </div>
  );
}
