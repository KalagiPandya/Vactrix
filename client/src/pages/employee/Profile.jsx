import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiCalendar, FiBriefcase, FiClock, FiTool, FiAward, FiBarChart2, FiSave, FiCheck, FiX, FiArrowLeft, FiShield } from 'react-icons/fi';
import { FaStar, FaLightbulb } from 'react-icons/fa';

import { API } from '../../config/api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [skillList, setSkillList] = useState([]);
  const [experience, setExperience] = useState('');
  const [department, setDepartment] = useState('');
  const [certList, setCertList] = useState([]);
  const [certInput, setCertInput] = useState('');
  const [performanceRating, setPerformanceRating] = useState(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/users/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const d = res.data;
        setProfile(d);
        setSkillList(d.skills || []);
        setExperience(d.experience || 0);
        setDepartment(d.department || '');
        setCertList(d.certifications || []);
        setPerformanceRating(d.performanceRating || 3);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [token]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skillList.includes(s)) {
      setSkillList([...skillList, s]);
      setSkillInput('');
    }
  };
  const removeSkill = (s) => setSkillList(skillList.filter(x => x !== s));

  const addCert = () => {
    const c = certInput.trim();
    if (c && !certList.includes(c)) {
      setCertList([...certList, c]);
      setCertInput('');
    }
  };
  const removeCert = (c) => setCertList(certList.filter(x => x !== c));

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/users/profile`, {
        skills: skillList,
        experience: Number(experience),
        department,
        certifications: certList,
        performanceRating: Number(performanceRating),
      }, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Profile updated successfully!', 'success');
    } catch {
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const profileScore = (() => {
    let s = 0;
    if (skillList.length > 0) s += 30;
    if (experience > 0) s += 20;
    if (department) s += 20;
    if (certList.length > 0) s += 20;
    if (performanceRating) s += 10;
    return s;
  })();

  const ratingLabels = ['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'];
  const ratingColors = ['', '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6'];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080b14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif" }}>
      Loading profile...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: 'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        .field-input { width:100%; padding:12px 14px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:10px; font-size:14px; color:white; outline:none; transition:all 0.2s; font-family:inherit; }
        .field-input:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,0.15); }
        .field-input::placeholder { color:rgba(255,255,255,0.25); }
        .tag { display:inline-flex; align-items:center; gap:5px; padding:5px 10px; borderRadius:8px; fontSize:12px; fontWeight:600; cursor:pointer; transition:all 0.15s; }
        .rating-star:hover { transform: scale(1.2); }
        .rating-star { transition: all 0.15s; cursor: pointer; }
        .save-btn:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(59,130,246,0.4) !important; }
        .save-btn { transition: all 0.2s; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 1000, background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`, color: toast.type === 'success' ? '#86efac' : '#fca5a5', padding: '14px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', backdropFilter: 'blur(12px)', animation: 'slideIn 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {toast.type === 'success' ? <FiCheck /> : <FiX />} {toast.msg}
        </div>
      )}

      {/* Navbar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', cursor: 'pointer', background: 'linear-gradient(135deg, #ffffff, #90CAF9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} onClick={() => navigate('/dashboard')}>Vactrix</h1>
        <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
          <FiArrowLeft /> Dashboard
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '950px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', animation: 'fadeUp 0.4s ease both' }}>
          <div>
            <h2 style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiUser /> My Profile
            </h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Keep your profile updated to improve your match score</p>
          </div>
          {/* Profile completeness ring */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: `conic-gradient(#3b82f6 ${profileScore * 3.6}deg, rgba(255,255,255,0.06) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#080b14', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#60a5fa' }}>{profileScore}%</div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '6px', fontWeight: '600' }}>Profile Score</div>
          </div>
        </div>

        {/* Read-Only Info */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', marginBottom: '24px', animation: 'fadeUp 0.4s ease 0.1s both' }}>
          <h3 style={{ margin: '0 0 18px', fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Account Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { label: 'Full Name', value: profile?.name, icon: <FiUser /> },
              { label: 'Email', value: profile?.email, icon: <FiMail /> },
              { label: 'Role', value: profile?.role?.toUpperCase(), icon: <FiShield /> },
              { label: 'Member Since', value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—', icon: <FiCalendar /> },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{item.label}</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#60a5fa' }}>{item.icon}</span> {item.value || '—'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editable Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Department + Experience */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', animation: 'fadeUp 0.4s ease 0.15s both' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                <FiBriefcase /> Department
              </label>
              <input className="field-input" type="text" value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Engineering" />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                <FiClock /> Years of Experience
              </label>
              <input className="field-input" type="number" min="0" max="50" value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g. 3" />
            </div>
          </div>

          {/* Performance Rating */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px', animation: 'fadeUp 0.4s ease 0.2s both' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
              <FaStar /> Performance Rating
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {[1, 2, 3, 4, 5].map(val => (
                <div key={val} className="rating-star" onClick={() => setPerformanceRating(val)}
                  style={{ fontSize: '26px', color: val <= performanceRating ? '#fbbf24' : 'rgba(255,255,255,0.15)', transform: val === performanceRating ? 'scale(1.2)' : 'scale(1)', cursor: 'pointer' }}>
                  <FaStar />
                </div>
              ))}
              <div style={{ marginLeft: '12px' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: ratingColors[performanceRating] }}>{performanceRating}/5</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>{ratingLabels[performanceRating]}</div>
              </div>
            </div>
            <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(59,130,246,0.08)', borderRadius: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaLightbulb color="#60a5fa" /> Performance rating contributes <strong style={{ color: '#60a5fa' }}>20%</strong> to your final application score
            </div>
          </div>

          {/* Skills */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px', animation: 'fadeUp 0.4s ease 0.25s both' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              <FiTool /> Skills <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>— contributes 40% to score</span>
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input className="field-input" style={{ flex: 1 }} value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSkill()} placeholder="Type a skill and press Enter or click Add" />
              <button onClick={addSkill} style={{ padding: '12px 18px', background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '10px', color: '#60a5fa', cursor: 'pointer', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap' }}>+ Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '32px' }}>
              {skillList.length === 0 && <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>No skills added yet</span>}
              {skillList.map(skill => (
                <span key={skill} onClick={() => removeSkill(skill)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                  title="Click to remove">
                  {skill} <span style={{ fontSize: '10px', opacity: 0.7 }}>×</span>
                </span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px', animation: 'fadeUp 0.4s ease 0.3s both' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              <FiAward /> Certifications <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>— contributes 10% to score</span>
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input className="field-input" style={{ flex: 1 }} value={certInput} onChange={e => setCertInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCert()} placeholder="e.g. AWS Cloud Practitioner" />
              <button onClick={addCert} style={{ padding: '12px 18px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: '10px', color: '#c4b5fd', cursor: 'pointer', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap' }}>+ Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '32px' }}>
              {certList.length === 0 && <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>No certifications added yet</span>}
              {certList.map(cert => (
                <span key={cert} onClick={() => removeCert(cert)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#c4b5fd', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                  title="Click to remove">
                  <FiAward size={12} /> {cert} <span style={{ fontSize: '10px', opacity: 0.7 }}>×</span>
                </span>
              ))}
            </div>
          </div>

          {/* Score breakdown info */}
          <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '12px', padding: '16px 20px', animation: 'fadeUp 0.4s ease 0.35s both' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiBarChart2 /> How Your Score is Calculated
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { label: 'Skills Match', weight: '40%', color: '#3b82f6', val: skillList.length > 0 ? 'Set' : 'Missing', done: skillList.length > 0 },
                { label: 'Experience', weight: '30%', color: '#22c55e', val: experience > 0 ? `${experience} yrs` : 'Missing' },
                { label: 'Performance', weight: '20%', color: '#f59e0b', val: `${performanceRating}/5` },
                { label: 'Certifications', weight: '10%', color: '#a78bfa', val: certList.length > 0 ? `${certList.length} certs` : 'Missing' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: item.color }}>{item.weight}</div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', margin: '2px 0' }}>{item.label}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '4px' }}>{item.val} {item.done ? <FiCheck size={10} /> : null}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button className="save-btn" onClick={handleSave} disabled={saving}
            style={{ width: '100%', padding: '16px', background: saving ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #1d4ed8, #3b82f6)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '16px', fontWeight: '800', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 20px rgba(59,130,246,0.3)', letterSpacing: '0.3px', animation: 'fadeUp 0.4s ease 0.4s both', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <FiSave /> {saving ? 'Saving changes...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
