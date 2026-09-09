import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiAlertTriangle, FiCalendar, FiClock, FiFileText, FiUser, FiZap, FiTarget, FiTool, FiBarChart2, FiAward, FiSend, FiArrowLeft, FiArrowRight, FiCheck, FiX } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

import { API } from '../../config/api';

export default function JobDetail() {
  const [job, setJob] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [scorePreview, setScorePreview] = useState(null);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const { jobId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/jobs/${jobId}`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${API}/users/profile`, { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(([jobRes, userRes]) => {
      setJob(jobRes.data);
      setUserProfile(userRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token, jobId]);

  const handleApply = async () => {
    setApplying(true);
    setError('');
    try {
      const res = await axios.post(`${API}/applications/${jobId}/apply`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplied(true);
      setScorePreview(res.data.scoreBreakdown || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080b14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif", flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Loading job details...
    </div>
  );

  if (!job) return (
    <div style={{ minHeight: '100vh', background: '#080b14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: "'DM Sans', sans-serif", flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '48px', color: '#f59e0b' }}><FiAlertTriangle /></div>
      <div style={{ fontSize: '20px', fontWeight: '600' }}>Job not found</div>
      <button onClick={() => navigate('/jobs')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
        <FiArrowLeft /> Back to Jobs
      </button>
    </div>
  );

  const userSkillSet = new Set((userProfile?.skills || []).map(s => s.toLowerCase()));
  const matchedSkills = job.requiredSkills?.filter(s => userSkillSet.has(s.toLowerCase())) || [];
  const matchPct = job.requiredSkills?.length ? Math.round((matchedSkills.length / job.requiredSkills.length) * 100) : 0;
  const deadlineDate = job.deadline ? new Date(job.deadline) : null;
  const daysLeft = deadlineDate ? Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: 'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.95);}to{opacity:1;transform:scale(1);} }
        .apply-btn:hover { opacity:0.9!important; transform:translateY(-2px); box-shadow:0 10px 30px rgba(59,130,246,0.4)!important; }
        .apply-btn { transition:all 0.2s; }
        .skill-tag { transition: all 0.15s; }
      `}</style>

      {/* Navbar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', cursor: 'pointer', background: 'linear-gradient(135deg, #fff, #90CAF9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} onClick={() => navigate('/dashboard')}>Vactrix</h1>
        <button onClick={() => navigate('/jobs')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
          <FiArrowLeft /> Back to Jobs
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '950px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Job Header Card */}
        <div style={{ background: 'linear-gradient(135deg, rgba(30,64,175,0.3), rgba(59,130,246,0.15))', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '20px', padding: '36px', marginBottom: '24px', animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>● OPEN</span>
                <span style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{job.department}</span>
                {daysLeft !== null && (
                  <span style={{ background: daysLeft < 3 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', border: `1px solid ${daysLeft < 3 ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`, color: daysLeft < 3 ? '#fca5a5' : '#fbbf24', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiCalendar /> {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                  </span>
                )}
              </div>
              <h2 style={{ margin: '0 0 12px', fontSize: '30px', fontWeight: '800', letterSpacing: '-0.5px' }}>{job.title}</h2>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}><FiClock /> {job.minExperience}+ years experience</span>
                {deadlineDate && <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}><FiCalendar /> Deadline: {deadlineDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
              </div>
            </div>
            {/* Skill match ring */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `conic-gradient(${matchPct >= 70 ? '#22c55e' : matchPct >= 40 ? '#f59e0b' : '#ef4444'} ${matchPct * 3.6}deg, rgba(255,255,255,0.07) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '62px', height: '62px', borderRadius: '50%', background: 'rgba(8,11,20,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: matchPct >= 70 ? '#86efac' : matchPct >= 40 ? '#fbbf24' : '#fca5a5' }}>{matchPct}%</div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '6px', fontWeight: '600' }}>Skill Match</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Description */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', animation: 'fadeUp 0.4s ease 0.08s both' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiFileText /> Job Description
            </h3>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', fontSize: '14px' }}>{job.description || 'No description provided.'}</p>
          </div>

          {/* Your Profile */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', animation: 'fadeUp 0.4s ease 0.12s both' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUser /> Your Profile
            </h3>
            {[
              { label: 'Experience', val: `${userProfile?.experience || 0} years`, ok: (userProfile?.experience || 0) >= (job.minExperience || 0) },
              { label: 'Performance', val: `${userProfile?.performanceRating || 0}/5`, ok: (userProfile?.performanceRating || 0) >= 3 },
              { label: 'Skills', val: `${userProfile?.skills?.length || 0} listed`, ok: (userProfile?.skills?.length || 0) > 0 },
              { label: 'Certifications', val: `${userProfile?.certifications?.length || 0} certs`, ok: true },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: item.ok ? '#86efac' : '#fca5a5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {item.ok ? <FiCheck size={13} /> : <FiX size={13} />} {item.val}
                </span>
              </div>
            ))}
            {(userProfile?.skills?.length === 0 || !userProfile?.experience) && (
              <button onClick={() => navigate('/profile')} style={{ width: '100%', marginTop: '14px', padding: '9px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '9px', color: '#fbbf24', cursor: 'pointer', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <FiZap /> Complete Profile to Improve Score
              </button>
            )}
          </div>
        </div>

        {/* Skill Match Visual */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', marginBottom: '24px', animation: 'fadeUp 0.4s ease 0.16s both' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiTarget /> Required Skills — Your Match
          </h3>
          {job.requiredSkills?.length > 0 ? (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                {job.requiredSkills.map((skill, i) => {
                  const has = userSkillSet.has(skill.toLowerCase());
                  return (
                    <span key={i} className="skill-tag" style={{ background: has ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)', border: `1px solid ${has ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.25)'}`, color: has ? '#86efac' : '#fca5a5', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {has ? <FiCheck size={12} /> : <FiX size={12} />} {skill}
                    </span>
                  );
                })}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', display: 'flex', gap: '16px' }}>
                <span style={{ color: '#86efac', display: 'flex', alignItems: 'center', gap: '4px' }}><FiCheck size={12} /> {matchedSkills.length} matched</span>
                <span style={{ color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '4px' }}><FiX size={12} /> {(job.requiredSkills?.length || 0) - matchedSkills.length} missing</span>
              </div>
            </>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>No specific skills required</div>
          )}
        </div>

        {/* Score Preview after applying */}
        {scorePreview && (
          <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '16px', padding: '24px', marginBottom: '24px', animation: 'scaleIn 0.3s ease both' }}>
            <h3 style={{ margin: '0 0 18px', color: '#c4b5fd', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiBarChart2 /> Your Score Breakdown
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { label: 'Skill Match', value: scorePreview.skillScore, color: '#3b82f6', icon: <FiTool /> },
                { label: 'Experience', value: scorePreview.expScore, color: '#22c55e', icon: <FiClock /> },
                { label: 'Performance', value: Math.round(scorePreview.perfScore || 0), color: '#f59e0b', icon: <FaStar /> },
                { label: 'Final Score', value: scorePreview.finalScore, color: '#a78bfa', icon: <FiTarget />, bold: true },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.04)', border: `1px solid ${s.color}20`, borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '20px', color: s.color, marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                  <div style={{ fontSize: s.bold ? '28px' : '24px', fontWeight: '800', color: s.color }}>{s.value}%</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontWeight: '600' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '14px 18px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiAlertTriangle /> {error}
          </div>
        )}

        {/* Apply Button */}
        {applied ? (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '16px', padding: '28px', textAlign: 'center', animation: 'scaleIn 0.3s ease both' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px', color: '#86efac', display: 'flex', justifyContent: 'center' }}><FiAward /></div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#86efac', marginBottom: '6px' }}>Application Submitted!</div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>HR will review your application shortly</div>
            <button onClick={() => navigate('/my-applications')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
              View My Applications <FiArrowRight />
            </button>
          </div>
        ) : (
          <button className="apply-btn" onClick={handleApply} disabled={applying}
            style={{ width: '100%', padding: '18px', background: applying ? 'rgba(255,255,255,0.07)' : 'linear-gradient(135deg, #1d4ed8, #3b82f6)', border: 'none', borderRadius: '14px', color: 'white', fontSize: '17px', fontWeight: '800', cursor: applying ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(59,130,246,0.25)', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {applying ? 'Submitting Application...' : <><FiSend /> Apply for This Position</>}
          </button>
        )}
      </div>
    </div>
  );
}
