import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiBriefcase, FiPlus, FiX, FiClock, FiCalendar, FiFileText, FiCheck, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';

import { API } from '../../config/api';

const POPULAR_SKILLS = [
  'React', 'Node.js', 'MongoDB', 'Python', 'TypeScript', 'Docker',
  'AWS', 'Git', 'GraphQL', 'Express', 'SQL', 'Redis',
  'Figma', 'UI/UX', 'Kubernetes', 'Product Strategy', 'Agile', 'Data Analysis'
];

export default function PostJob() {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [deadline, setDeadline] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addSkill = (s) => {
    const skill = (s || skillInput).trim();
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput('');
    }
  };

  const removeSkill = (s) => setSkills(skills.filter(x => x !== s));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) return setError('Job title is required');
    if (!department.trim()) return setError('Department is required');
    if (minExperience === '' || Number(minExperience) < 0) return setError('Please specify minimum experience');

    setLoading(true);
    try {
      await axios.post(`${API}/jobs`, {
        title: title.trim(),
        department: department.trim(),
        description: description.trim(),
        minExperience: Number(minExperience),
        deadline: deadline || null,
        requiredSkills: skills,
      }, { headers: { Authorization: `Bearer ${token}` } });

      showToast('Job posted successfully! Redirecting...', 'success');
      setTimeout(() => navigate('/hr/dashboard'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: 'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .field-input { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; font-size: 14px; color: white; outline: none; transition: all 0.2s; font-family: inherit; }
        .field-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
        .field-input::placeholder { color: rgba(255,255,255,0.25); }
        .submit-btn:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(59,130,246,0.4) !important; }
        .submit-btn { transition: all 0.2s; }
        .skill-chip:hover { border-color: rgba(59,130,246,0.5); }
        .skill-chip { transition: all 0.15s; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 1000, background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`, color: toast.type === 'success' ? '#86efac' : '#fca5a5', padding: '14px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', backdropFilter: 'blur(12px)', animation: 'slideIn 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {toast.type === 'success' ? <FiCheck /> : <FiAlertTriangle />} {toast.msg}
        </div>
      )}

      {/* Navbar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', cursor: 'pointer', background: 'linear-gradient(135deg, #ffffff, #90CAF9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} onClick={() => navigate('/hr/dashboard')}>Vactrix</h1>
        <button onClick={() => navigate('/hr/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
          <FiArrowLeft /> Dashboard
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', animation: 'fadeUp 0.4s ease both' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiBriefcase /> Post a New Position
          </h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Create an internal job listing and start receiving candidate applications</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '14px 18px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiAlertTriangle /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Title + Dept */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', animation: 'fadeUp 0.4s ease 0.05s both' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Job Title *</label>
              <input className="field-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Senior Backend Engineer" required />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Department *</label>
              <input className="field-input" value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Engineering" required />
            </div>
          </div>

          {/* Description */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px', animation: 'fadeUp 0.4s ease 0.1s both' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              <FiFileText /> Job Description
            </label>
            <textarea className="field-input" rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the role, responsibilities, and key expectations..." style={{ resize: 'vertical' }} />
          </div>

          {/* Experience + Deadline */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', animation: 'fadeUp 0.4s ease 0.15s both' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                <FiClock /> Min. Experience (Years) *
              </label>
              <input className="field-input" type="number" min="0" max="30" value={minExperience} onChange={e => setMinExperience(e.target.value)} placeholder="e.g. 3" required />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                <FiCalendar /> Application Deadline
              </label>
              <input className="field-input" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
          </div>

          {/* Required Skills */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px', animation: 'fadeUp 0.4s ease 0.2s both' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Required Skills (HashSet matching)</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input className="field-input" style={{ flex: 1 }} value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                placeholder="Type skill and press Enter or Add" />
              <button type="button" onClick={() => addSkill()} style={{ padding: '12px 18px', background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '10px', color: '#60a5fa', cursor: 'pointer', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap' }}>+ Add</button>
            </div>

            {/* Added skills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '32px', marginBottom: '14px' }}>
              {skills.length === 0 && <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>No skills added yet</span>}
              {skills.map(s => (
                <span key={s} onClick={() => removeSkill(s)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                  title="Click to remove">
                  {s} <FiX size={12} />
                </span>
              ))}
            </div>

            {/* Quick-add popular skills */}
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', fontWeight: '600' }}>Quick add:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {POPULAR_SKILLS.filter(s => !skills.includes(s)).slice(0, 10).map(s => (
                  <span key={s} className="skill-chip" onClick={() => addSkill(s)}
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '4px 9px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
                    + {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="submit-btn" disabled={loading}
            style={{ width: '100%', padding: '16px', background: loading ? 'rgba(255,255,255,0.07)' : 'linear-gradient(135deg, #1d4ed8, #3b82f6)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '16px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(59,130,246,0.3)', letterSpacing: '0.3px', animation: 'fadeUp 0.4s ease 0.25s both', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <FiPlus /> {loading ? 'Posting Position...' : 'Post Position'}
          </button>
        </form>
      </div>
    </div>
  );
}
