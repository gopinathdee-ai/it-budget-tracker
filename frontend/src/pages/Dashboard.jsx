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
    <div style={{ padding: '20px' }}>
      <h1>IT Budget Dashboard</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {data && <div style={{ backgroundColor: '#e8f5e9', padding: '20px' }}><h2>Connected!</h2><pre>{JSON.stringify(data, null, 2)}</pre></div>}
    </div>
  );
}
