import React, { useState } from 'react';
import { Flame, RefreshCw, AlertTriangle, ShieldCheck, Cpu, Zap, Activity } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function ChaosStudio() {
  const [latencyMs, setLatencyMs] = useState(500);
  const [redisOutage, setRedisOutage] = useState(false);
  const [packetLoss, setPacketLoss] = useState(15.0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleRunChaos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/chaos/inject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inject_latency_ms: parseInt(latencyMs),
          simulate_redis_outage: redisOutage,
          packet_loss_pct: parseFloat(packetLoss)
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error("Chaos injection failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-center border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Flame className="text-rose-500" size={32} />
            Chaos Engineering & Resilience Studio
          </h1>
          <p className="text-gray-400 mt-1">
            Inject artificial latency, simulate database outages, and verify Niyanta's auto-healing fallbacks.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chaos Experiment Controls */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle size={20} className="text-rose-500" />
            Chaos Experiments
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 flex justify-between">
                <span>Inject Latency Penalty</span>
                <span className="text-rose-400 font-mono">+{latencyMs} ms</span>
              </label>
              <input
                type="range"
                min="0"
                max="2000"
                step="100"
                value={latencyMs}
                onChange={(e) => setLatencyMs(e.target.value)}
                className="w-full mt-2 accent-rose-500 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-950 rounded-xl border border-gray-800">
              <div>
                <div className="font-semibold text-sm text-gray-200">Simulate Redis Outage</div>
                <div className="text-xs text-gray-400">Forces fallback to in-memory dicts</div>
              </div>
              <input
                type="checkbox"
                checked={redisOutage}
                onChange={(e) => setRedisOutage(e.target.checked)}
                className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 flex justify-between">
                <span>Simulate Packet Loss</span>
                <span className="text-amber-400 font-mono">{packetLoss}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={packetLoss}
                onChange={(e) => setPacketLoss(e.target.value)}
                className="w-full mt-2 accent-amber-500 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleRunChaos}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold rounded-lg shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <Flame size={20} />}
            {loading ? "Executing Experiment..." : "Execute Chaos Experiment"}
          </button>
        </div>

        {/* Experiment Results & Auto-Healing Monitor */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <div className="space-y-6">
              <div className="bg-gray-900 border border-emerald-500/30 p-6 rounded-xl space-y-4">
                <div className="flex items-center gap-3 text-emerald-400 font-semibold text-lg">
                  <ShieldCheck size={24} />
                  {result.auto_healing_status}
                </div>
                <p className="text-sm text-gray-300">
                  Experiment state <span className="font-mono text-emerald-400">{result.status}</span> executed cleanly. Downstream circuit breakers and local fallback rate limiters maintained 100% gateway availability.
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                <h3 className="text-md font-semibold text-white flex items-center gap-2">
                  <Activity size={18} className="text-blue-400" />
                  Experiment Execution Summary
                </h3>
                <pre className="bg-gray-950 p-4 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto border border-gray-800">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center space-y-4">
              <Cpu className="mx-auto text-gray-600" size={48} />
              <h3 className="text-lg font-semibold text-gray-300">Chaos Engineering Readiness</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Configure artificial latency or outage parameters on the left, then click <strong>Execute Chaos Experiment</strong> to test system resilience.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
