import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiLayers, FiAlertTriangle, FiArrowRight, FiBriefcase, FiUser, FiRefreshCw } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';

import { API } from '../../config/api';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/auth/login`, {
        email: email.trim().toLowerCase(),
        password,
      });
      login(res.data.user, res.data.token);
      const role = res.data.user.role;
      if (role === 'hr')    return navigate('/hr/dashboard');
      if (role === 'admin') return navigate('/admin/dashboard');
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Too many attempts. Please wait a few minutes.');
      } else if (err.response) {
        setError(err.response.data?.message || `Login failed (${err.response.status})`);
      } else if (err.request) {
        setError('Cannot reach server. Make sure the backend is running on port 5000.');
      } else {
        setError('Something went wrong: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (em, pw) => { setEmail(em); setPassword(pw); setError(''); };

  const CREDS = [
    { role:'Admin',    icon:<FaCrown size={12} />,     e:'admin@vactrix.com',        p:'admin123',  color:'#c4b5fd' },
    { role:'HR',       icon:<FiBriefcase size={12} />, e:'hr@vactrix.com',           p:'hr123456',  color:'#fbbf24' },
    { role:'Employee', icon:<FiUser size={12} />,      e:'rohan.kapoor@vactrix.com', p:'emp12345',  color:'#86efac' },
    { role:'Employee', icon:<FiUser size={12} />,      e:'sneha.patel@vactrix.com',  p:'emp12345',  color:'#86efac' },
    { role:'Employee', icon:<FiUser size={12} />,      e:'vikram.singh@vactrix.com', p:'emp12345',  color:'#86efac' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#080b14', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans','Segoe UI',sans-serif", overflow:'hidden', position:'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);} }
        @keyframes float  { 0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);} }
        @keyframes pulse  { 0%,100%{opacity:0.4;}50%{opacity:0.7;} }
        .field { width:100%; padding:13px 16px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:11px; font-size:15px; color:white; outline:none; transition:all 0.2s; font-family:inherit; }
        .field:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,0.15); background:rgba(255,255,255,0.09); }
        .field::placeholder { color:rgba(255,255,255,0.25); }
        .submit-btn { width:100%; padding:15px; background:linear-gradient(135deg,#1d4ed8,#3b82f6); color:white; border:none; border-radius:12px; font-size:16px; font-weight:800; cursor:pointer; transition:all 0.2s; font-family:inherit; letter-spacing:0.3px; display:flex; align-items:center; justifyContent:center; gap:8px; }
        .submit-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 32px rgba(59,130,246,0.4); }
        .submit-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .cred-row { display:flex; justify-content:space-between; align-items:center; padding:7px 10px; border-radius:8px; cursor:pointer; transition:background 0.15s; }
        .cred-row:hover { background:rgba(255,255,255,0.06); }
        .quick-pill { padding:7px 13px; background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.25); border-radius:8px; color:#93c5fd; cursor:pointer; font-size:12px; font-weight:700; font-family:inherit; transition:all 0.15s; display:flex; align-items:center; gap:6px; }
        .quick-pill:hover { background:rgba(59,130,246,0.2); border-color:rgba(59,130,246,0.5); }
      `}</style>

      {/* Background blobs */}
      <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(59,130,246,0.07) 0%,transparent 70%)', top:-200, left:-200, pointerEvents:'none', animation:'pulse 4s ease-in-out infinite' }} />
      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.05) 0%,transparent 70%)', bottom:-150, right:-150, pointerEvents:'none', animation:'pulse 4s ease-in-out infinite 2s' }} />

      <div style={{ background:'rgba(255,255,255,0.03)', backdropFilter:'blur(24px)', borderRadius:24, padding:'44px 40px', width:'100%', maxWidth:460, border:'1px solid rgba(255,255,255,0.09)', boxShadow:'0 32px 64px rgba(0,0,0,0.6)', animation:'fadeUp 0.5s ease-out', position:'relative', zIndex:10, margin:20 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:64, height:64, borderRadius:18, background:'linear-gradient(135deg,#1e40af,#3b82f6)', marginBottom:16, boxShadow:'0 8px 32px rgba(59,130,246,0.4)', animation:'float 3s ease-in-out infinite', fontSize:28 }}>
            <FiLayers color="white" />
          </div>
          <h1 style={{ color:'white', fontSize:30, fontWeight:900, margin:'0 0 6px', letterSpacing:'-0.5px' }}>Vactrix</h1>
          <p style={{ color:'rgba(255,255,255,0.35)', margin:0, fontSize:13 }}>Vacancy Intelligence Platform</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5', padding:'12px 16px', borderRadius:10, marginBottom:22, fontSize:13, fontWeight:600, lineHeight:1.5, display:'flex', alignItems:'center', gap:8 }}>
            <FiAlertTriangle /> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:'block', marginBottom:8, color:'rgba(255,255,255,0.45)', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:'0.6px' }}>Email Address</label>
            <input className="field" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div style={{ marginBottom:28 }}>
            <label style={{ display:'block', marginBottom:8, color:'rgba(255,255,255,0.45)', fontWeight:700, fontSize:11, textTransform:'uppercase', letterSpacing:'0.6px' }}>Password</label>
            <input className="field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <><FiRefreshCw /> Signing in...</> : <>Sign In to Vactrix <FiArrowRight /></>}
          </button>
        </form>

        {/* Quick login */}
        <div style={{ marginTop:20, padding:'14px 16px', background:'rgba(255,255,255,0.03)', borderRadius:12, border:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:10 }}>Quick Login (Dev)</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
            <button className="quick-pill" type="button" onClick={() => quickFill('admin@vactrix.com',        'admin123')}><FaCrown /> Admin</button>
            <button className="quick-pill" type="button" onClick={() => quickFill('hr@vactrix.com',           'hr123456')}><FiBriefcase /> HR</button>
            <button className="quick-pill" type="button" onClick={() => quickFill('rohan.kapoor@vactrix.com', 'emp12345')}><FiUser /> Employee</button>
          </div>

          {/* All credentials */}
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:10 }}>
            {CREDS.map((c, i) => (
              <div key={i} className="cred-row" onClick={() => quickFill(c.e, c.p)}>
                <span style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.45)', fontFamily:'monospace' }}>{c.e}</span>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:10, fontFamily:'monospace', color:'rgba(255,255,255,0.25)' }}>{c.p}</span>
                  <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:20, background:`${c.color}18`, color:c.color, border:`1px solid ${c.color}30`, display:'inline-flex', alignItems:'center', gap:4 }}>{c.icon} {c.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign:'center', marginTop:20, color:'rgba(255,255,255,0.35)', fontSize:14 }}>
          New to Vactrix?{' '}
          <Link to="/register" style={{ color:'#60a5fa', fontWeight:700, textDecoration:'none' }}>Create account</Link>
        </p>
      </div>
    </div>
  );
}
