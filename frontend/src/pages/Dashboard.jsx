import React, { useState, useEffect } from 'react';
import axios from 'axios';
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    axios.get('http://localhost:3000/api/health')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);
  return (
    <div style={{ padding: '20px' }} className="text-white">
      <h1 className="text-3xl font-bold mb-4">IT Budget Dashboard</h1>
      {loading && <p className="text-slate-400">Loading...</p>}
      {error && <p className="text-red-400">Error: {error}</p>}
      {data && <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg"><h2 className="text-xl font-bold text-emerald-400 mb-3">Connected!</h2><pre className="text-slate-300 overflow-auto">{JSON.stringify(data, null, 2)}</pre></div>}
    </div>
  );
}
