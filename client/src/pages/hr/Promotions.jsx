import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiGitBranch, FiUsers, FiLayers, FiAlertTriangle, FiTarget, FiBriefcase, FiAward, FiZap, FiArrowLeft, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

import { API } from '../../config/api';

const RISK_CONFIG = {
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.35)',   label: 'High Cascade Risk' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', label: 'Medium Cascade Risk' },
  low:    { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.35)',  label: 'Low Cascade Risk' },
};

function ChainStepCard({ step, index, total }) {
  const isFirst = index === 0;
  const isLast  = index === total - 1;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative' }}>
      {/* Step circle */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: isFirst ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : isLast ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)',
          border: `1px solid ${isFirst ? '#3b82f6' : isLast ? '#22c55e' : 'rgba(255,255,255,0.15)'}`,
          color: isFirst ? 'white' : isLast ? '#86efac' : 'rgba(255,255,255,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: '800',
        }}>
          {index + 1}
        </div>
        {!isLast && <div style={{ width: '2px', height: '36px', background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />}
      </div>

      {/* Step content */}
      <div style={{
        flex: 1, background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${isFirst ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '12px', padding: '14px 16px', marginBottom: isLast ? 0 : '8px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'white' }}>{step.promotedPerson}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginLeft: '6px' }}>promoted to</span>
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Level {step.fromLevel} <FiArrowRight size={10} /> {step.toLevel}</span>
        </div>
        <div style={{ fontSize: '13px', color: '#60a5fa', fontWeight: '700', marginBottom: '4px' }}>{step.toPosition}</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
          Vacates: <span style={{ color: '#fbbf24' }}>{step.positionVacated}</span> ({step.department})
        </div>
      </div>
    </div>
  );
}

export default function Promotions() {
  const [apps, setApps]             = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [chainResult, setChainResult] = useState(null);
  const [loadingApps, setLoadingApps] = useState(true);
  const [runningDfs, setRunningDfs]   = useState(false);
  const [executing, setExecuting]     = useState(false);
  const [execResult, setExecResult]   = useState(null);
  const [error, setError]             = useState('');
  const { token } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    axios.get(`${API}/applications`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const eligible = res.data.filter(a => a.status === 'pending' || a.status === 'shortlisted');
        setApps(eligible);
        if (eligible.length > 0) setSelectedApp(eligible[0]._id);
        setLoadingApps(false);
      }).catch(() => setLoadingApps(false));
  }, [token]);

  const handleSimulate = async (appId) => {
    const id = appId || selectedApp;
    if (!id) return;
    setRunningDfs(true);
    setError('');
    setChainResult(null);
    setExecResult(null);
    try {
      const res = await axios.get(`${API}/promotions/simulate/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChainResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'DFS Simulation failed');
    } finally {
      setRunningDfs(false);
    }
  };

  const handleExecute = async () => {
    if (!selectedApp) return;
    setExecuting(true);
    setError('');
    try {
      const res = await axios.post(`${API}/promotions/execute/${selectedApp}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExecResult(res.data);
      setApps(prev => prev.filter(a => a._id !== selectedApp));
      if (apps.length > 1) setSelectedApp(apps.find(a => a._id !== selectedApp)?._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Promotion execution failed');
    } finally {
      setExecuting(false);
    }
  };

  const risk = chainResult ? RISK_CONFIG[chainResult.cascadeRisk] || RISK_CONFIG.low : null;

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: 'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
        .app-item:hover { background: rgba(59,130,246,0.06)!important; border-color: rgba(59,130,246,0.3)!important; }
        .app-item { transition: all 0.15s; }
        .action-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .action-btn { transition: all 0.18s; }
      `}</style>

      {/* Navbar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', cursor: 'pointer', background: 'linear-gradient(135deg, #fff, #90CAF9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} onClick={() => navigate('/hr/dashboard')}>Vactrix</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/hr/org-chart')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
            <FiBriefcase /> View Org Graph
          </button>
          <button onClick={() => navigate('/hr/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
            <FiArrowLeft /> Dashboard
          </button>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '36px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px', animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '1px' }}>DFS ENGINE</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>O(N + E) Graph Traversal</span>
          </div>
          <h2 style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiGitBranch /> Promotion Cascade Engine
          </h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            Simulate the ripple effects of promoting an employee through your org hierarchy before executing
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '14px 18px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiAlertTriangle /> {error}
          </div>
        )}

        {/* Execution Success Banner */}
        {execResult && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '14px', padding: '20px 24px', marginBottom: '24px', animation: 'fadeUp 0.3s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <FiCheckCircle size={20} color="#86efac" />
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#86efac' }}>Promotion Executed & Recorded to Audit Log</div>
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.5' }}>
              Candidate status updated to <strong style={{ color: '#86efac' }}>Approved</strong>. Org graph updated. Vacancy chain of {execResult.chainLength} steps logged.
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px' }}>
          {/* LEFT: Candidate list */}
          <div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiUsers /> Pending Candidates ({apps.length})
                </span>
              </div>

              {loadingApps ? (
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>Loading candidates...</div>
              ) : apps.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>
                  No pending applications to simulate
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '520px', overflowY: 'auto' }}>
                  {apps.map(app => {
                    const isSelected = selectedApp === app._id;
                    return (
                      <div key={app._id} className="app-item"
                        onClick={() => { setSelectedApp(app._id); handleSimulate(app._id); }}
                        style={{
                          background: isSelected ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isSelected ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.06)'}`,
                          borderRadius: '12px', padding: '14px', cursor: 'pointer',
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <div style={{ fontWeight: '800', fontSize: '14px', color: isSelected ? '#93c5fd' : 'white' }}>
                            {app.userId?.name || 'Unknown Candidate'}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: app.finalScore >= 70 ? '#86efac' : '#fbbf24' }}>
                            {app.finalScore}%
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                          Applied for: <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>{app.jobId?.title}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{app.jobId?.department}</span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>•</span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'capitalize' }}>{app.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: DFS Simulation Output */}
          <div>
            {!chainResult && !runningDfs && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '60px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '44px', marginBottom: '14px', display: 'flex', justifyContent: 'center' }}><FiGitBranch color="#8b5cf6" /></div>
                <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Select a candidate to run DFS simulation</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', maxWidth: '380px', margin: '0 auto 24px', lineHeight: '1.5' }}>
                  The engine will traverse your org graph and predict every promotion cascade and resulting vacancy
                </div>
                {selectedApp && (
                  <button className="action-btn" onClick={() => handleSimulate()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', border: 'none', color: 'white', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '800' }}>
                    <FiZap /> Run DFS Simulation
                  </button>
                )}
              </div>
            )}

            {runningDfs && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '60px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}><FiGitBranch color="#8b5cf6" /></div>
                <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Running Depth-First Search...</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>Traversing adjacency list · Checking visited set · O(N+E)</div>
              </div>
            )}

            {chainResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', animation: 'fadeUp 0.35s ease both' }}>
                {/* Metric Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
                  {[
                    { label: 'Cascade Depth', value: `${chainResult.chainLength} steps`, color: '#3b82f6', icon: <FiLayers /> },
                    { label: 'Net Vacancies', value: `+${chainResult.netVacanciesCreated}`, color: '#f59e0b', icon: <FiAlertTriangle /> },
                    { label: 'Time Complexity', value: 'O(N+E)', color: '#8b5cf6', icon: <FiZap /> },
                    { label: 'Cascade Risk', value: chainResult.cascadeRisk?.toUpperCase(), color: risk.color, icon: <FiTarget /> },
                  ].map((m, i) => (
                    <div key={i} style={{ background: `${m.color}0f`, border: `1px solid ${m.color}25`, borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', color: m.color, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{m.icon}</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: m.color }}>{m.value}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Risk Banner */}
                <div style={{ background: risk.bg, border: `1px solid ${risk.border}`, borderRadius: '12px', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px', color: risk.color }}><FiAlertTriangle /></span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: risk.color }}>{risk.label}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{chainResult.explanation}</div>
                    </div>
                  </div>
                </div>

                {/* Vacancy Chain Steps */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiGitBranch /> Predicted Chain of Events ({chainResult.chain?.length || 0} steps)
                  </div>
                  <div>
                    {chainResult.chain?.map((step, i) => (
                      <ChainStepCard key={i} step={step} index={i} total={chainResult.chain.length} />
                    ))}
                  </div>
                </div>

                {/* Impacted Departments */}
                {chainResult.departmentsImpacted?.length > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>Impacted Teams:</span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {chainResult.departmentsImpacted.map(d => (
                        <span key={d} style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>{d}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Execute Button */}
                <button className="action-btn" onClick={handleExecute} disabled={executing}
                  style={{ width: '100%', padding: '16px', background: executing ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#15803d,#22c55e)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: '800', cursor: executing ? 'not-allowed' : 'pointer', boxShadow: executing ? 'none' : '0 4px 20px rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FiAward /> {executing ? 'Executing Promotion...' : 'Execute Promotion & Update Org Graph'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
