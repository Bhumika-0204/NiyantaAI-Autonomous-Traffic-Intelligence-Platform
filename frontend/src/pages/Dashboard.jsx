import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ArrowDownToLine, Zap, Globe, ShieldCheck } from 'lucide-react';
import { getWsUrl, getApiUrl } from '../config';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ cpu: '0.0', memory: '0.0', active: 0, bytesRate: '0.00', status: "CONNECTING..." });
  const [data, setData] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [glbStatus, setGlbStatus] = useState(null);
  const [threatStatus, setThreatStatus] = useState(null);

  useEffect(() => {
    // Fetch GLB Status
    fetch(getApiUrl('/api/v1/glb/status'))
      .then(res => res.json())
      .then(data => setGlbStatus(data))
      .catch(err => console.error("Failed to load GLB status:", err));

    // Fetch Threat Intel Status
    fetch(getApiUrl('/api/v1/threat-intel/status'))
      .then(res => res.json())
      .then(data => setThreatStatus(data))
      .catch(err => console.error("Failed to load Threat Intel status:", err));
  }, []);

  useEffect(() => {
    const wsUrl = getWsUrl('/ws/ui-client');
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => setErrorMsg('');
    ws.onerror = () => {
        setErrorMsg(`Warning: Failed to establish WebSocket to ${wsUrl}`);
        setMetrics(prev => ({ ...prev, status: "OFFLINE" }));
    };
    ws.onclose = () => setMetrics(prev => ({ ...prev, status: "OFFLINE" }));

    ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        const m = payload.metrics;
        const d = payload.decision;
        
        setErrorMsg('');
        setMetrics({
            cpu: (m.cpu_percent || 0).toFixed(1),
            memory: (m.memory_percent || 0).toFixed(1),
            active: Math.floor(m.incoming_rate || 0),
            bytesRate: ((m.bytes_recv_rate || 0) / 1024).toFixed(2), 
            status: d.action.toUpperCase()
        });
        
        setData(prev => {
            const newPoint = { 
                time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" }), 
                traffic: m.incoming_rate || 0
            };
            const newData = [...prev, newPoint];
            if (newData.length > 20) newData.shift(); 
            return newData;
        });
    };
    
    return () => ws.close();
  }, []);

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-sans">Live Network Tracking</h2>
          <p className="text-gray-400 mt-2">Real-time OS host interface traffic passing directly into the ML agents.</p>
        </div>
        <div className="flex gap-2 items-center px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-semibold shadow-[0_0_15px_rgba(52,211,153,0.1)]">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          System Live
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition duration-300">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 font-medium whitespace-nowrap">OS Network Rate</span>
            <div className="p-2 bg-blue-500/10 rounded-lg"><Activity className="text-blue-400" size={20} /></div>
          </div>
          <span className="text-4xl font-bold font-mono text-gray-100">{metrics.active}</span>
          <span className="text-sm text-blue-400 mt-2">packets / sec</span>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition duration-300">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 font-medium">Data Payload</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg"><ArrowDownToLine className="text-emerald-400" size={20} /></div>
          </div>
          <span className="text-4xl font-bold font-mono text-gray-100">{metrics.bytesRate}</span>
          <span className="text-sm text-emerald-400 mt-2">KB/sec (Device In)</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col justify-between hover:border-yellow-500/30 transition duration-300">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 font-medium">Host Bottleneck</span>
            <div className="p-2 bg-yellow-500/10 rounded-lg"><Zap className="text-yellow-400" size={20} /></div>
          </div>
          <span className="text-4xl font-bold font-mono text-gray-100">{metrics.cpu}% CPU</span>
          <span className="text-sm text-yellow-500/80 mt-2">RAM Load: {metrics.memory}%</span>
        </div>
        
        <div className={`bg-gray-900 border ${metrics.status === 'BLOCK' ? 'border-red-500/50 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : metrics.status === 'THROTTLE' ? 'border-orange-500/50 bg-orange-500/10' : 'border-gray-800'} rounded-xl p-6 flex flex-col justify-between transition duration-300`}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 font-medium">Policy Action</span>
          </div>
          <span className={`text-3xl font-bold font-mono tracking-wider ${metrics.status === 'BLOCK' ? 'text-red-400' : metrics.status === 'THROTTLE' ? 'text-orange-400' : 'text-emerald-400'}`}>{metrics.status}</span>
          <span className="text-sm text-gray-400 mt-2">Determined by ML Rules</span>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-[380px] mb-8">
        <h3 className="text-xl font-semibold mb-6 flex gap-2">Host Device Interface Density <span className="text-gray-500 font-normal">(streaming live)</span></h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="time" stroke="#6b7280" tick={{fill: '#6b7280'}} tickLine={false} axisLine={false} />
            <YAxis stroke="#6b7280" tick={{fill: '#6b7280'}} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} itemStyle={{ color: '#60a5fa' }} />
            <Line type="stepAfter" dataKey="traffic" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#60a5fa', stroke: '#1e3a8a', strokeWidth: 2 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Multi-Region GLB & Threat Intel Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GLB Router Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                <Globe className="text-indigo-400" size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-100">Global Load Balancer (GLB)</h3>
                <p className="text-xs text-gray-400">Multi-Region Latency & Anycast Router</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-semibold rounded-full">
              ANYCAST ACTIVE
            </span>
          </div>

          {glbStatus ? (
            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center p-3 bg-gray-950/60 rounded-lg border border-gray-800/80">
                <span className="text-sm text-gray-400">Optimal Ingress Region</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{glbStatus.optimal_region?.name} ({glbStatus.optimal_region?.region})</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-950/60 rounded-lg border border-gray-800/80">
                <span className="text-sm text-gray-400">Ingress Latency Score</span>
                <span className="text-sm font-mono text-indigo-300">{glbStatus.optimal_region?.latency_ms} ms (Health: {glbStatus.optimal_region?.health})</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
                {glbStatus.all_regions?.map((r, idx) => (
                  <div key={idx} className="bg-gray-800/40 p-2 rounded border border-gray-800">
                    <div className="text-gray-400 font-mono">{r.region}</div>
                    <div className="text-gray-200 font-bold">{r.latency_ms} ms</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 mt-4">Loading GLB Routing Telemetry...</div>
          )}
        </div>

        {/* Threat Intelligence Feed Status */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg">
                <ShieldCheck className="text-red-400" size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-100">Live Threat Intelligence Feeds</h3>
                <p className="text-xs text-gray-400">AbuseIPDB, AlienVault OTX & Tor Exits</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold rounded-full">
              SYNCED
            </span>
          </div>

          {threatStatus ? (
            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center p-3 bg-gray-950/60 rounded-lg border border-gray-800/80">
                <span className="text-sm text-gray-400">Threat Database Status</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{threatStatus.threat_database_status}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-950/60 rounded-lg border border-gray-800/80">
                <span className="text-sm text-gray-400">Active Intelligence Feeds</span>
                <span className="text-sm font-mono text-gray-300">{threatStatus.active_feeds?.length} Connected</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {threatStatus.active_feeds?.map((feed, i) => (
                  <span key={i} className="px-2.5 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700 font-mono">
                    {feed}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 mt-4">Syncing Threat Feeds...</div>
          )}
        </div>
      </div>
    </div>
  );
}

