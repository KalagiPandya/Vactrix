import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiClock, FiCheckCircle, FiAward, FiXCircle, FiInbox, FiBriefcase, FiCalendar, FiTool, FiTarget, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

import { API } from '../../config/api';

const STATUS = {
  pending:     { bg:'rgba(245,158,11,0.1)',   border:'rgba(245,158,11,0.3)',   text:'#fbbf24', label:'Under Review', icon:<FiClock /> },
  shortlisted: { bg:'rgba(34,197,94,0.1)',    border:'rgba(34,197,94,0.3)',    text:'#86efac', label:'Shortlisted',   icon:<FiCheckCircle /> },
  approved:    { bg:'rgba(139,92,246,0.1)',   border:'rgba(139,92,246,0.3)',   text:'#c4b5fd', label:'Approved',      icon:<FiAward /> },
  rejected:    { bg:'rgba(239,68,68,0.1)',    border:'rgba(239,68,68,0.3)',    text:'#fca5a5', label:'Rejected',      icon:<FiXCircle /> },
};

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/applications/mine`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setApps(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);
  const counts = { all: apps.length, pending: 0, shortlisted: 0, approved: 0, rejected: 0 };
  apps.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: 'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        .card { animation: fadeUp 0.4s ease both; }
        .filter-btn:hover { border-color:rgba(255,255,255,0.3)!important; color:white!important; }
        .filter-btn { transition: all 0.15s; }
        .score-bar { transition: width 0.8s ease; }
      `}</style>

      {/* Navbar */}
      <div style={{ background:'rgba(255,255,255,0.02)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:50 }}>
        <h1 style={{ margin:0, fontSize:'20px', fontWeight:'800', cursor:'pointer', background:'linear-gradient(135deg, #fff, #90CAF9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }} onClick={() => navigate('/dashboard')}>Vactrix</h1>
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={() => navigate('/jobs')} style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.25)', color:'#60a5fa', padding:'8px 16px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'600' }}>
            <FiBriefcase /> Browse Jobs
          </button>
          <button onClick={() => navigate('/dashboard')} style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)', padding:'8px 16px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'600' }}>
            <FiArrowLeft /> Dashboard
          </button>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '1050px', margin:'0 auto', padding:'40px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom:'32px', animation:'fadeUp 0.4s ease both' }}>
          <h2 style={{ margin:'0 0 6px', fontSize:'30px', fontWeight:'800', display:'flex', alignItems:'center', gap:'10px' }}>
            <FiAward /> My Applications
          </h2>
          <p style={{ margin:0, color:'rgba(255,255,255,0.4)', fontSize:'15px' }}>{apps.length} total application{apps.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'28px', flexWrap:'wrap', animation:'fadeUp 0.4s ease 0.06s both' }}>
          {[
            { key:'all', label:'All', color:'rgba(255,255,255,0.7)' },
            { key:'pending', label:'Under Review', color:'#fbbf24' },
            { key:'shortlisted', label:'Shortlisted', color:'#86efac' },
            { key:'approved', label:'Approved', color:'#c4b5fd' },
            { key:'rejected', label:'Rejected', color:'#fca5a5' },
          ].map(f => (
            <button key={f.key} className="filter-btn" onClick={() => setFilter(f.key)}
              style={{ padding:'7px 14px', borderRadius:'20px', border:`1px solid ${filter === f.key ? f.color + '60' : 'rgba(255,255,255,0.1)'}`, background: filter === f.key ? f.color + '15' : 'transparent', color: filter === f.key ? f.color : 'rgba(255,255,255,0.45)', cursor:'pointer', fontSize:'12px', fontWeight:'700', display:'flex', alignItems:'center', gap:'5px' }}>
              {f.label} <span style={{ background:'rgba(255,255,255,0.1)', padding:'1px 6px', borderRadius:'10px', fontSize:'10px' }}>{counts[f.key]}</span>
            </button>
          ))}
        </div>

        {/* Applications */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'80px', color:'rgba(255,255,255,0.3)' }}>Loading applications...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px', background:'rgba(255,255,255,0.02)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px', display:'flex', justifyContent:'center' }}><FiInbox /></div>
            <div style={{ fontSize:'18px', fontWeight:'600', marginBottom:'8px' }}>{filter === 'all' ? 'No applications yet' : `No ${filter} applications`}</div>
            {filter === 'all' && (
              <button onClick={() => navigate('/jobs')} style={{ display:'inline-flex', alignItems:'center', gap:'6px', marginTop:'16px', background:'linear-gradient(135deg, #1d4ed8, #3b82f6)', border:'none', color:'white', padding:'12px 24px', borderRadius:'10px', cursor:'pointer', fontSize:'14px', fontWeight:'700' }}>
                Browse Open Jobs <FiArrowRight />
              </button>
            )}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {filtered.map((app, i) => {
              const s = STATUS[app.status] || STATUS.pending;
              return (
                <div key={app._id} className="card" style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${s.border}`, borderRadius:'16px', padding:'24px', animationDelay:`${i * 0.04}s` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px', gap:'12px' }}>
                    <div>
                      <h3 style={{ margin:'0 0 5px', fontSize:'18px', fontWeight:'800' }}>{app.jobId?.title || 'Unknown Job'}</h3>
                      <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                        <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', display:'flex', alignItems:'center', gap:'4px' }}><FiBriefcase size={13} /> {app.jobId?.department || '—'}</span>
                        <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.35)', display:'flex', alignItems:'center', gap:'4px' }}><FiCalendar size={13} /> Applied {new Date(app.createdAt).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' })}</span>
                      </div>
                    </div>
                    <span style={{ background:s.bg, border:`1px solid ${s.border}`, color:s.text, padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'800', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'6px' }}>
                      {s.icon} {s.label}
                    </span>
                  </div>

                  {/* Score Breakdown */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' }}>
                    {[
                      { label:'Skill Score', value:app.skillScore, color:'#3b82f6', icon:<FiTool /> },
                      { label:'Exp Score', value:app.expScore, color:'#22c55e', icon:<FiClock /> },
                      { label:'Performance', value:Math.round(app.perfScore || 0), color:'#f59e0b', icon:<FaStar /> },
                      { label:'Final Score', value:app.finalScore, color:'#a78bfa', icon:<FiTarget />, bold:true },
                    ].map((sc, j) => (
                      <div key={j} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${sc.color}15`, borderRadius:'12px', padding:'14px', textAlign:'center' }}>
                        <div style={{ fontSize:'16px', color:sc.color, marginBottom:'4px', display:'flex', justifyContent:'center' }}>{sc.icon}</div>
                        <div style={{ fontSize: sc.bold ? '22px' : '18px', fontWeight:'800', color:sc.color }}>{sc.value}%</div>
                        <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', marginTop:'3px', fontWeight:'600', textTransform:'uppercase' }}>{sc.label}</div>
                        {/* Progress bar */}
                        <div style={{ marginTop:'8px', height:'3px', background:'rgba(255,255,255,0.07)', borderRadius:'2px', overflow:'hidden' }}>
                          <div className="score-bar" style={{ height:'100%', width:`${sc.value}%`, background:sc.color, borderRadius:'2px' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status message */}
                  <div style={{ padding:'10px 14px', background:s.bg, borderRadius:'9px', fontSize:'13px', color:s.text, fontWeight:'600', display:'flex', alignItems:'center', gap:'8px' }}>
                    {s.icon}
                    {app.status === 'pending' && 'Your application is being reviewed by the HR team'}
                    {app.status === 'shortlisted' && 'Congratulations! You have been shortlisted for this position'}
                    {app.status === 'approved' && 'You have been approved for this position!'}
                    {app.status === 'rejected' && 'Unfortunately, your application was not selected at this time'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
