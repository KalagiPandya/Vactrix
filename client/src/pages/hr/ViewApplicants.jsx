import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiClock, FiUsers, FiTool, FiAward, FiGitBranch, FiCheckCircle, FiXCircle, FiCheck, FiX, FiArrowLeft } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

import { API } from '../../config/api';

const STATUS_CONFIG = {
  pending:     { label:'Under Review', bg:'rgba(245,158,11,0.1)',   border:'rgba(245,158,11,0.3)',   text:'#fbbf24', icon:<FiClock /> },
  shortlisted: { label:'Shortlisted',  bg:'rgba(34,197,94,0.1)',    border:'rgba(34,197,94,0.3)',    text:'#86efac', icon:<FiCheckCircle /> },
  approved:    { label:'Approved',     bg:'rgba(139,92,246,0.1)',   border:'rgba(139,92,246,0.3)',   text:'#c4b5fd', icon:<FiAward /> },
  rejected:    { label:'Rejected',     bg:'rgba(239,68,68,0.1)',    border:'rgba(239,68,68,0.3)',    text:'#fca5a5', icon:<FiXCircle /> },
};

export default function ViewApplicants() {
  const [job, setJob]                 = useState(null);
  const [applicants, setApplicants]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [updatingId, setUpdatingId]   = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [sortBy, setSortBy]           = useState('score');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast]             = useState(null);
  const { jobId } = useParams();
  const { token } = useAuth();
  const navigate  = useNavigate();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [jobRes, appsRes] = await Promise.all([
        axios.get(`${API}/jobs/${jobId}`, { headers }),
        axios.get(`${API}/applications/${jobId}/applicants`, { headers }),
      ]);
      setJob(jobRes.data);
      setApplicants(appsRes.data);
      if (appsRes.data.length > 0 && !selectedApp) setSelectedApp(appsRes.data[0]);
    } catch {
      showToast('Failed to load applicants', 'error');
    } finally {
      setLoading(false);
    }
  }, [jobId, token, selectedApp]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await axios.put(`${API}/applications/${appId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
      if (selectedApp?._id === appId) setSelectedApp(prev => ({ ...prev, status: newStatus }));
      showToast(`Status updated to ${newStatus}`);
    } catch {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const processed = applicants
    .filter(a => filterStatus === 'all' || a.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'score') return b.finalScore - a.finalScore;
      if (sortBy === 'skills') return b.skillScore - a.skillScore;
      if (sortBy === 'exp') return b.expScore - a.expScore;
      if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  const avgScore = applicants.length ? Math.round(applicants.reduce((s, a) => s + (a.finalScore || 0), 0) / applicants.length) : 0;
  const topScore = applicants.length ? Math.max(...applicants.map(a => a.finalScore || 0)) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: 'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .applicant-row:hover { background: rgba(59,130,246,0.06) !important; }
        .applicant-row { transition: all 0.15s; cursor: pointer; }
        .status-btn:hover { opacity: 0.85; transform: scale(1.04); }
        .status-btn { transition: all 0.15s; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 1000, background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`, color: toast.type === 'success' ? '#86efac' : '#fca5a5', padding: '14px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', backdropFilter: 'blur(12px)', animation: 'slideIn 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {toast.type === 'success' ? <FiCheck /> : <FiX />} {toast.msg}
        </div>
      )}

      {/* Navbar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', cursor: 'pointer', background: 'linear-gradient(135deg, #fff, #90CAF9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} onClick={() => navigate('/hr/dashboard')}>Vactrix</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/hr/promotions')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
            <FiGitBranch /> Vacancy Chain
          </button>
          <button onClick={() => navigate('/hr/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
            <FiArrowLeft /> Dashboard
          </button>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '1700px', margin: '0 auto', padding: '36px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px', animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>{job?.department || 'Department'}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Min. {job?.minExperience || 0} years exp</span>
              </div>
              <h2 style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: '800' }}>{job?.title || 'Job Title'}</h2>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>{applicants.length} candidate{applicants.length !== 1 ? 's' : ''} applied · Ranked by scoring algorithm</p>
            </div>
            {/* Quick stats */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '12px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#60a5fa' }}>{applicants.length}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Applicants</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '12px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#86efac' }}>{topScore}%</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Top Score</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '12px 18px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#fbbf24' }}>{avgScore}%</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Avg Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter / Sort controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px', animation: 'fadeUp 0.4s ease 0.05s both' }}>
          {/* Status filter */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['all', 'pending', 'shortlisted', 'approved', 'rejected'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                style={{ padding: '6px 12px', borderRadius: '16px', border: `1px solid ${filterStatus === s ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`, background: filterStatus === s ? 'rgba(59,130,246,0.15)' : 'transparent', color: filterStatus === s ? '#60a5fa' : 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
                {s}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Sort by:</span>
            {[
              { key: 'score', label: 'Overall Score' },
              { key: 'skills', label: 'Skills' },
              { key: 'exp', label: 'Experience' },
              { key: 'date', label: 'Date' },
            ].map(item => (
              <button key={item.key} onClick={() => setSortBy(item.key)}
                style={{ padding: '6px 12px', borderRadius: '8px', border: `1px solid ${sortBy === item.key ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.06)'}`, background: sortBy === item.key ? 'rgba(255,255,255,0.08)' : 'transparent', color: sortBy === item.key ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Layout: List + Detail */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'rgba(255,255,255,0.3)' }}>Loading applicants...</div>
        ) : applicants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}><FiUsers /></div>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No applicants yet</div>
            <div style={{ fontSize: '14px' }}>Share this job with employees to start receiving applications</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            {/* Applicant List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {processed.map((app, i) => {
                const s = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                const isSelected = selectedApp?._id === app._id;
                return (
                  <div key={app._id} className="applicant-row" onClick={() => setSelectedApp(app)}
                    style={{ background: isSelected ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isSelected ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '14px', padding: '18px', animation: `fadeUp 0.3s ease ${i * 0.03}s both` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: i < 3 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)', color: i < 3 ? '#fbbf24' : 'rgba(255,255,255,0.4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800' }}>
                            {i + 1}
                          </span>
                          <span style={{ fontWeight: '800', fontSize: '15px' }}>{app.userId?.name || 'Unknown'}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                          {app.userId?.department} · {app.userId?.experience || 0} yrs exp
                        </div>
                      </div>
                      {/* Overall score badge */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: app.finalScore >= 70 ? '#86efac' : app.finalScore >= 50 ? '#fbbf24' : '#fca5a5' }}>
                          {app.finalScore}%
                        </div>
                        <span style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text, padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          {s.icon} {s.label}
                        </span>
                      </div>
                    </div>

                    {/* Mini score breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '8px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Skills (40%)</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#93c5fd' }}>{app.skillScore}%</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Exp (30%)</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#86efac' }}>{app.expScore}%</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Perf (20%)</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#fbbf24' }}>{Math.round(app.perfScore || 0)}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Applicant Detail */}
            {selectedApp && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '28px', position: 'sticky', top: '90px', height: 'fit-content', animation: 'fadeUp 0.3s ease both' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '800' }}>{selectedApp.userId?.name}</h3>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{selectedApp.userId?.email}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: '900', color: selectedApp.finalScore >= 70 ? '#86efac' : selectedApp.finalScore >= 50 ? '#fbbf24' : '#fca5a5', lineHeight: 1 }}>
                      {selectedApp.finalScore}%
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: '700', marginTop: '2px' }}>Final Score</div>
                  </div>
                </div>

                {/* Score Breakdown Detail */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Score Breakdown</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      { label: 'Skills Match', value: selectedApp.skillScore, color: '#3b82f6', icon: <FiTool /> },
                      { label: 'Experience', value: selectedApp.expScore, color: '#22c55e', icon: <FiClock /> },
                      { label: 'Performance', value: Math.round(selectedApp.perfScore || 0), color: '#f59e0b', icon: <FaStar /> },
                      { label: 'Certifications', value: selectedApp.certScore, color: '#a78bfa', icon: <FiAward /> },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}15`, borderRadius: '10px', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>{s.icon} {s.label}</span>
                          <span style={{ fontSize: '14px', fontWeight: '800', color: s.color }}>{s.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Candidate details */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Candidate Details</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>Department</span>
                      <span style={{ fontWeight: '600' }}>{selectedApp.userId?.department || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>Experience</span>
                      <span style={{ fontWeight: '600' }}>{selectedApp.userId?.experience || 0} years</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>Performance Rating</span>
                      <span style={{ fontWeight: '600', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <FaStar size={12} /> {selectedApp.userId?.performanceRating || 3}/5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {selectedApp.userId?.skills?.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Skills</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selectedApp.userId.skills.map(s => {
                        const isReq = job?.requiredSkills?.some(r => r.toLowerCase() === s.toLowerCase());
                        return (
                          <span key={s} style={{ background: isReq ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isReq ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`, color: isReq ? '#86efac' : 'rgba(255,255,255,0.6)', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {s} {isReq ? <FiCheck size={11} /> : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Vacancy impact link */}
                <button onClick={() => navigate(`/hr/impact/${selectedApp._id}`)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '10px', color: '#c4b5fd', cursor: 'pointer', fontSize: '13px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <FiGitBranch /> View DFS Vacancy Impact Report
                </button>

                {/* Decision Actions */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Application Decision</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <button className="status-btn" onClick={() => handleStatusChange(selectedApp._id, 'shortlisted')} disabled={updatingId === selectedApp._id}
                      style={{ padding: '10px 6px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.35)', borderRadius: '8px', color: '#86efac', cursor: 'pointer', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <FiCheckCircle /> Shortlist
                    </button>
                    <button className="status-btn" onClick={() => handleStatusChange(selectedApp._id, 'approved')} disabled={updatingId === selectedApp._id}
                      style={{ padding: '10px 6px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.35)', borderRadius: '8px', color: '#c4b5fd', cursor: 'pointer', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <FiAward /> Approve
                    </button>
                    <button className="status-btn" onClick={() => handleStatusChange(selectedApp._id, 'rejected')} disabled={updatingId === selectedApp._id}
                      style={{ padding: '10px 6px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '8px', color: '#fca5a5', cursor: 'pointer', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <FiXCircle /> Reject
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
