import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Activity, Zap, Info, BarChart3, Binary } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/analyze';

function App() {
  const [sig1Str, setSig1Str] = useState('1.2, 2.3, 3.4, 4.5, 5.0, 4.2, 3.1, 2.0');
  const [sig2Str, setSig2Str] = useState('1.0, 2.5, 3.2, 4.8, 5.1, 4.0, 2.9, 1.8');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parseSignals = (str) => {
    return str.split(/[\s,]+/).filter(x => x.trim() !== '').map(Number).filter(n => !isNaN(n));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    
    const signal1 = parseSignals(sig1Str);
    const signal2 = parseSignals(sig2Str);

    if (signal1.length === 0 || signal2.length === 0) {
      setError('Please enter valid numeric values for both signals.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(API_URL, { signal1, signal2 });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  // Initial analysis on load
  useEffect(() => {
    handleAnalyze();
  }, []);

  const chartData = result ? result.signal1.map((val, idx) => ({
    name: idx,
    signal1: val,
    signal2: result.signal2[idx]
  })) : [];

  return (
    <div className="app-container">
      <header>
        <h1>Signal Similarity Analyzer</h1>
        <p className="subtitle">Real-time correlation analysis and visualization engine</p>
      </header>

      <div className="dashboard-grid">
        {/* Input Card */}
        <div className="card input-section">
          <h2><Zap size={20} className="text-primary" /> Configuration</h2>
          
          <div className="input-group">
            <label>Signal 1 Values (Space or Comma Separated)</label>
            <textarea 
              value={sig1Str}
              onChange={(e) => setSig1Str(e.target.value)}
              placeholder="e.g. 1, 2, 3, 4"
            />
          </div>

          <div className="input-group">
            <label>Signal 2 Values (Space or Comma Separated)</label>
            <textarea 
              value={sig2Str}
              onChange={(e) => setSig2Str(e.target.value)}
              placeholder="e.g. 1.2, 2.1, 3.0, 4.1"
            />
          </div>

          <button 
            className="btn-analyze" 
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? <div className="loader"></div> : <Activity size={18} />}
            {loading ? 'Analyzing...' : 'Analyze Signals'}
          </button>

          {error && <p style={{ color: 'var(--danger)', marginTop: '1rem', fontSize: '0.875rem' }}>{error}</p>}
          
          <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <p><Info size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> 
            Correlation coefficient {'>'} 0.7 indicates high similarity.</p>
          </div>
        </div>

        {/* Results Card */}
        <div className="card results-section">
          <h2><BarChart3 size={20} /> Analysis Results</h2>
          
          {result && (
            <>
              <div className="metrics-row">
                <div className="metric-card">
                  <div className="metric-label">Correlation Coefficient</div>
                  <div className="metric-value" style={{ color: 'var(--primary)' }}>
                    {result.correlation}
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Decision Status</div>
                  <div className={`similarity-badge ${result.similarity === 'SIMILAR' ? 'similar' : 'not-similar'}`}>
                    {result.similarity}
                  </div>
                </div>
              </div>

              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="var(--text-muted)" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="var(--text-muted)" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="signal1" 
                      stroke="#818cf8" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#818cf8', strokeWidth: 2 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      animationDuration={1000}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="signal2" 
                      stroke="#c084fc" 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ r: 4, fill: '#c084fc', strokeWidth: 2 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={{ padding: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Binary size={14} /> Adjusted Samples: {result.adjustedLength}
              </div>
            </>
          )}

          {!result && !loading && !error && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Enter signals and click analyze to see results
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
