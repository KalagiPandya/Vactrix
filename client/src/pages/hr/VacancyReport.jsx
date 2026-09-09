import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiLayers, FiAlertTriangle, FiTarget, FiZap, FiGitBranch, FiArrowLeft, FiArrowRight, FiAward } from 'react-icons/fi';

import { API } from '../../config/api';

const RISK_META = {
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.35)',   label: 'High Cascade Risk' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', label: 'Medium Cascade Risk' },
  low:    { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.35)',  label: 'Low Cascade Risk' },
};

export default function VacancyReport() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const { appId }             = useParams();
  const { token }             = useAuth();
  const navigate              = useNavigate();

  useEffect(() => {
    axios.get(`${API}/promotions/simulate/${appId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { setError(err.response?.data?.message || 'Failed to generate vacancy chain report'); setLoading(false); });
  }, [appId, token]);

  const risk = data ? RISK_META[data.cascadeRisk] || RISK_META.low : null;

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: 'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        .step-card { animation: fadeUp 0.35s ease both; }
      `}</style>

      {/* Navbar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', cursor: 'pointer', background: 'linear-gradient(135deg, #fff, #90CAF9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} onClick={() => navigate('/hr/dashboard')}>Vactrix</h1>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
          <FiArrowLeft /> Back
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '36px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px', animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '1px' }}>DFS REPORT</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>O(N + E) Traversal</span>
          </div>
          <h2 style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiGitBranch /> Vacancy Impact Report
          </h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
            Depth-first traversal of org chart to predict cascade vacancies caused by this promotion
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}><FiGitBranch color="#8b5cf6" /></div>
            <div>Traversing org graph...</div>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '16px 20px', color: '#fca5a5', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiAlertTriangle /> {error}
          </div>
        )}

        {data && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* KPI grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
              {[
                { label: 'Chain Depth', value: `${data.chainLength} steps`, color: '#3b82f6', icon: <FiLayers /> },
                { label: 'Vacancies Created', value: `+${data.netVacanciesCreated}`, color: '#f59e0b', icon: <FiAlertTriangle /> },
                { label: 'Time Complexity', value: 'O(N+E)', color: '#8b5cf6', icon: <FiZap /> },
                { label: 'Cascade Risk', value: data.cascadeRisk?.toUpperCase(), color: risk.color, icon: <FiTarget /> },
              ].map((k, i) => (
                <div key={i} style={{ background: `${k.color}0f`, border: `1px solid ${k.color}25`, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', color: k.color, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{k.icon}</div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: k.color }}>{k.value}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase', marginTop: '2px' }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Risk banner */}
            <div style={{ background: risk.bg, border: `1px solid ${risk.border}`, borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px', color: risk.color }}><FiAlertTriangle /></span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: risk.color }}>{risk.label}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{data.explanation}</div>
              </div>
            </div>

            {/* Step by step chain */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiGitBranch /> Step-by-Step Chain of Events
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {data.chain?.map((step, i) => {
                  const isFirst = i === 0;
                  const isLast  = i === data.chain.length - 1;
                  return (
                    <div key={i} className="step-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', animationDelay: `${i * 0.06}s` }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: isFirst ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : isLast ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${isFirst ? '#3b82f6' : isLast ? '#22c55e' : 'rgba(255,255,255,0.12)'}`,
                          color: isFirst ? 'white' : isLast ? '#86efac' : 'rgba(255,255,255,0.6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800',
                        }}>
                          {i + 1}
                        </div>
                        {!isLast && <div style={{ width: '2px', height: '40px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />}
                      </div>
                      <div style={{
                        flex: 1, background: 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isFirst ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        borderRadius: '12px', padding: '16px', marginBottom: isLast ? 0 : '10px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '800', color: 'white' }}>{step.promotedPerson}</span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>L{step.fromLevel} <FiArrowRight size={10} /> L{step.toLevel}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#60a5fa', fontWeight: '700', marginBottom: '4px' }}>Promoted to: {step.toPosition}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                          Vacates: <span style={{ color: '#fbbf24', fontWeight: '600' }}>{step.positionVacated}</span> ({step.department})
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Impacted departments */}
            {data.departmentsImpacted?.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase' }}>Affected Teams:</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {data.departmentsImpacted.map(d => (
                    <span key={d} style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>{d}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Promotion action */}
            <button onClick={() => navigate('/hr/promotions')}
              style={{ padding: '16px', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '15px', fontWeight: '800', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FiAward /> Go to Promotions Panel to Execute
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
