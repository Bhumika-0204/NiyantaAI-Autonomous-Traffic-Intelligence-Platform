import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, RefreshCw, Ban, Wifi, Download, Code, Bot, Bug, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { getApiUrl, API_BASE_URL } from '../config';

const API_BASE = getApiUrl();

export default function Security() {
  const [data, setData] = useState(null);
  const [wafStats, setWafStats] = useState({ total_blocked: 0, sqli_blocked: 0, xss_blocked: 0, cmd_blocked: 0 });
  const [botStats, setBotStats] = useState({ bot_requests: 0, human_requests: 0, bot_ratio_percent: 0 });
  const [cbStats, setCbStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/security-events`);
      const json = await res.json();
      setData(json);

      // Fetch WAF, Bot Fingerprint, and Circuit Breaker stats
      const [wafRes, botRes, cbRes] = await Promise.all([
        fetch(`${API_BASE_URL}/waf/stats`),
        fetch(`${API_BASE_URL}/bot/stats`),
        fetch(`${API_BASE_URL}/circuit-breaker/status`)
      ]);
      const wafJson = await wafRes.json();
      const botJson = await botRes.json();
      const cbJson = await cbRes.json();

      setWafStats(wafJson);
      setBotStats(botJson);
      setCbStats(cbJson);

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch security events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 3000); 
    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = () => {
    window.open(`${API_BASE_URL}/reports/export?format=csv`, '_blank');
  };

  const handleExportJSON = () => {
    window.open(`${API_BASE_URL}/reports/export?format=json`, '_blank');
  };

  const handleFlagFalsePositive = async (ip) => {
    try {
      const res = await fetch(`${API_BASE_URL}/feedback/false-positive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, reason: "Flagged by security analyst on UI" })
      });
      const resData = await res.json();
      setFeedbackSuccess(`IP ${ip} unblocked & AI feedback updated!`);
      fetchEvents();
      setTimeout(() => setFeedbackSuccess(''), 4000);
    } catch (e) {
      console.error("False positive feedback failed:", e);
    }
  };

  const blockedCount = data?.blocked_last_hour ?? 0;
  const integrity = data?.integrity_pct ?? 100;
  const events = data?.events ?? [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
            <div className="p-3 bg-red-500/10 rounded-xl">
               <ShieldAlert className="text-red-400" size={28} />
            </div>
            Security & Threat Intelligence
          </h2>
          <p className="text-gray-400 mt-1 pl-14">Real-time inspection of WAF violations, bot fingerprints, and DDoS blocking rules.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-3 py-2 rounded-lg transition text-xs font-semibold"
          >
            <Download size={14} />
            Export CSV
          </button>

          <button 
            onClick={handleExportJSON}
            className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-3 py-2 rounded-lg transition text-xs font-semibold"
          >
            <Code size={14} />
            Export JSON
          </button>

          <button 
            onClick={fetchEvents} 
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition text-xs font-semibold"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </header>

      {feedbackSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 size={18} />
          {feedbackSuccess}
        </div>
      )}

      {/* Metrics Row 1: Core System Security */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-red-500">Critical Alerts</h3>
             <AlertTriangle className="text-red-500" />
          </div>
          <p className="text-3xl font-bold text-white">{blockedCount}</p>
          <p className="text-gray-400 mt-2 text-sm">IPs blocked in the last hour</p>
        </div>

        <div className="bg-gray-900 border border-emerald-500/20 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-emerald-500">System Integrity</h3>
             <ShieldCheck className="text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-white">{integrity}%</p>
          <p className="text-gray-400 mt-2 text-sm">Clean packets routed gracefully</p>
        </div>

        <div className="bg-gray-900 border border-orange-500/20 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-orange-400">Active Blocklist</h3>
             <Ban className="text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-white">{data?.active_blocklist_size ?? 0}</p>
          <p className="text-gray-400 mt-2 text-sm">Permanently banned IPs</p>
        </div>

        <div className="bg-gray-900 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-semibold text-yellow-400">Active Throttles</h3>
             <Wifi className="text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-white">{data?.active_throttle_count ?? 0}</p>
          <p className="text-gray-400 mt-2 text-sm">IPs currently rate-limited</p>
        </div>
      </div>

      {/* Metrics Row 2: WAF Payload Inspector & Bot Fingerprinting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WAF Widget */}
        <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
              <Bug size={20} />
              WAF Payload Inspector Status
            </h3>
            <span className="text-xs bg-purple-500/20 text-purple-300 font-mono px-2 py-1 rounded">
              {wafStats.total_blocked} Total Blocked
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center pt-2">
            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
              <span className="text-xs text-gray-400">SQL Injection</span>
              <p className="text-xl font-bold text-rose-400 mt-1">{wafStats.sqli_blocked}</p>
            </div>
            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
              <span className="text-xs text-gray-400">XSS Payload</span>
              <p className="text-xl font-bold text-amber-400 mt-1">{wafStats.xss_blocked}</p>
            </div>
            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
              <span className="text-xs text-gray-400">Cmd Injection</span>
              <p className="text-xl font-bold text-purple-400 mt-1">{wafStats.cmd_blocked}</p>
            </div>
          </div>
        </div>

        {/* Bot Fingerprint Widget */}
        <div className="bg-gray-900 border border-cyan-500/30 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
              <Bot size={20} />
              Bot vs Human Fingerprinting
            </h3>
            <span className="text-xs bg-cyan-500/20 text-cyan-300 font-mono px-2 py-1 rounded">
              {botStats.bot_ratio_percent}% Bot Ratio
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center pt-2">
            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
              <span className="text-xs text-gray-400">Automated Bot Scripts</span>
              <p className="text-xl font-bold text-cyan-400 mt-1">{botStats.bot_requests}</p>
            </div>
            <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
              <span className="text-xs text-gray-400">Legitimate Human Browsers</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">{botStats.human_requests}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Downstream API Circuit Breakers Widget */}
      <div className="bg-gray-900 border border-amber-500/30 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
          <Zap size={20} />
          Downstream Microservice Circuit Breakers
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(cbStats).map(([ep, info]) => (
            <div key={ep} className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold font-mono text-gray-200">{ep}</p>
                <p className="text-xs text-gray-400 mt-1">Failures: {info.failure_count} / 5</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                info.state === 'CLOSED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {info.state}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Live Security Events Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
           <h3 className="text-xl font-bold text-white">Live Security Events Stream</h3>
           {lastRefresh && (
             <span className="text-xs text-gray-500">
               Last update: {lastRefresh.toLocaleTimeString()}
             </span>
           )}
        </div>

        {events.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ShieldCheck size={48} className="mx-auto mb-4 text-emerald-500/30" />
            <p className="text-lg font-semibold">All Clear</p>
            <p className="text-sm mt-1">No security events detected. System running clean.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-950 text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4 border-b border-gray-800">IP Address</th>
                <th className="px-6 py-4 border-b border-gray-800">Reason</th>
                <th className="px-6 py-4 border-b border-gray-800">Timestamp</th>
                <th className="px-6 py-4 border-b border-gray-800">Status</th>
                <th className="px-6 py-4 border-b border-gray-800">ML Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {events.map((evt, idx) => (
                <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50 transition duration-150">
                  <td className="px-6 py-4 font-mono">{evt.ip}</td>
                  <td className="px-6 py-4 text-gray-400">{evt.reason}</td>
                  <td className="px-6 py-4 text-gray-400">{evt.timestamp}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
                      evt.status === 'BLOCK' 
                        ? 'text-red-400 bg-red-400/10' 
                        : 'text-orange-400 bg-orange-400/10'
                    }`}>
                      {evt.status === 'BLOCK' ? 'BLOCKED' : 'THROTTLED'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleFlagFalsePositive(evt.ip)}
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-blue-400 border border-blue-500/30 rounded-lg transition"
                      title="Unblocks IP & tunes AI weights live"
                    >
                      Flag False Positive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
