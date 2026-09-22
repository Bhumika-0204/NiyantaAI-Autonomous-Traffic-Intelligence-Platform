import React, { useState } from 'react';
import { PlayCircle, RefreshCw, Sliders, ShieldCheck, Zap, Server, Activity } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function AttackReplay() {
  const [sensitivity, setSensitivity] = useState(0.7);
  const [codelTarget, setCodelTarget] = useState(5.0);
  const [tokenRate, setTokenRate] = useState(5000);
  const [reqCount, setReqCount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleRunReplay = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/replay-attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ppo_sensitivity: parseFloat(sensitivity),
          codel_delay_target_ms: parseFloat(codelTarget),
          token_bucket_rate: parseInt(tokenRate),
          simulated_requests: parseInt(reqCount)
        })
      });
      const data = await res.json();
      setResults(data.replay_results);
    } catch (e) {
      console.error("Replay simulation failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <PlayCircle className="text-blue-400" size={32} />
            Attack Replay Studio
          </h1>
          <p className="text-gray-400 mt-1">
            Perform "What-If" policy simulations by replaying attack telemetry against custom AI & Network parameters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Panel */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sliders size={20} className="text-emerald-400" />
            Simulation Parameters
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 flex justify-between">
                <span>PPO Sensitivity Ratio</span>
                <span className="text-blue-400 font-mono">{sensitivity}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={sensitivity}
                onChange={(e) => setSensitivity(e.target.value)}
                className="w-full mt-2 accent-blue-500 bg-gray-800 rounded-lg cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">Higher sensitivity increases aggressive threat blocking.</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 flex justify-between">
                <span>CoDel Target Delay (ms)</span>
                <span className="text-emerald-400 font-mono">{codelTarget} ms</span>
              </label>
              <input
                type="range"
                min="1.0"
                max="20.0"
                step="0.5"
                value={codelTarget}
                onChange={(e) => setCodelTarget(e.target.value)}
                className="w-full mt-2 accent-emerald-500 bg-gray-800 rounded-lg cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">Lower target triggers early packet drop to stop bufferbloat.</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 flex justify-between">
                <span>Token Bucket Refill Rate</span>
                <span className="text-purple-400 font-mono">{tokenRate} req/s</span>
              </label>
              <input
                type="range"
                min="1000"
                max="20000"
                step="1000"
                value={tokenRate}
                onChange={(e) => setTokenRate(e.target.value)}
                className="w-full mt-2 accent-purple-500 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 flex justify-between">
                <span>Test Request Batch</span>
                <span className="text-amber-400 font-mono">{reqCount} reqs</span>
              </label>
              <input
                type="range"
                min="50"
                max="500"
                step="50"
                value={reqCount}
                onChange={(e) => setReqCount(e.target.value)}
                className="w-full mt-2 accent-amber-500 bg-gray-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={handleRunReplay}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-semibold rounded-lg shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : <PlayCircle size={20} />}
            {loading ? "Simulating Policy Replay..." : "Run What-If Replay"}
          </button>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {results ? (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
                  <span className="text-xs text-gray-400">Simulated Allowed</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{results.simulated_allowed}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
                  <span className="text-xs text-gray-400">Throttled</span>
                  <p className="text-2xl font-bold text-amber-400 mt-1">{results.simulated_throttled}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
                  <span className="text-xs text-gray-400">Blocked</span>
                  <p className="text-2xl font-bold text-rose-500 mt-1">{results.simulated_blocked}</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
                  <span className="text-xs text-gray-400">Est. Latency</span>
                  <p className="text-2xl font-bold text-blue-400 mt-1">{results.estimated_avg_latency_ms} ms</p>
                </div>
              </div>

              {/* Graphical Comparison Bar */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                <h3 className="text-md font-semibold text-white flex items-center gap-2">
                  <Activity size={18} className="text-blue-400" />
                  Traffic Routing Breakdown Ratio
                </h3>
                
                <div className="h-6 w-full bg-gray-800 rounded-full overflow-hidden flex">
                  <div 
                    style={{ width: `${(results.simulated_allowed / results.total_requests) * 100}%` }} 
                    className="bg-emerald-500 h-full transition-all duration-500" 
                    title="Allowed"
                  />
                  <div 
                    style={{ width: `${(results.simulated_throttled / results.total_requests) * 100}%` }} 
                    className="bg-amber-500 h-full transition-all duration-500" 
                    title="Throttled"
                  />
                  <div 
                    style={{ width: `${(results.simulated_blocked / results.total_requests) * 100}%` }} 
                    className="bg-rose-500 h-full transition-all duration-500" 
                    title="Blocked"
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-400 pt-2 border-t border-gray-800">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Allowed ({results.simulated_allowed})</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Throttled ({results.simulated_throttled})</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Blocked ({results.simulated_blocked})</span>
                </div>
              </div>

              {/* Efficiency Insight */}
              <div className="bg-gray-900 border border-blue-900/50 p-6 rounded-xl flex items-start gap-4">
                <ShieldCheck className="text-blue-400 mt-1 flex-shrink-0" size={24} />
                <div>
                  <h4 className="text-white font-semibold">Simulation Summary</h4>
                  <p className="text-sm text-gray-300 mt-1">
                    With a PPO Sensitivity of <span className="text-blue-400 font-semibold">{sensitivity}</span> and CoDel Target of <span className="text-emerald-400 font-semibold">{codelTarget}ms</span>, host CPU stress is estimated to decrease by <span className="text-emerald-400 font-semibold">{results.estimated_cpu_reduction_percent}%</span> while maintaining sub-15ms response latency.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center space-y-4">
              <Server className="mx-auto text-gray-600" size={48} />
              <h3 className="text-lg font-semibold text-gray-300">No Simulation Executed Yet</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Adjust the PPO risk sensitivity, CoDel target delay, and token refill rate sliders on the left, then click <strong>Run What-If Replay</strong> to analyze policy performance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
