import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiLayers, FiAlertTriangle, FiCheck, FiArrowRight, FiRefreshCw } from 'react-icons/fi';

import { API } from '../../config/api';
const DEPARTMENTS = ['Engineering','Product','Design','Marketing','Sales','Finance','HR','Operations','Legal','Data Science'];

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', department:'' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/auth/register`, form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#080b14', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans','Segoe UI',sans-serif", position:'relative', overflow:'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);} }
        @keyframes float { 0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);} }
        .field { width:100%; padding:13px 16px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:11px; font-size:14px; color:white; outline:none; transition:all 0.2s; font-family:inherit; }
        .field:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,0.18); }
        .field::placeholder { color:rgba(255,255,255,0.25); }
        select.field option { background:#111827; }
        .submit-btn { width:100%; padding:15px; background:linear-gradient(135deg,#1d4ed8,#3b82f6); color:white; border:none; border-radius:12px; font-size:16px; font-weight:800; cursor:pointer; transition:all 0.2s; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:8px; }
        .submit-btn:hover { opacity:0.9; transform:translateY(-2px); box-shadow:0 10px 28px rgba(59,130,246,0.38); }
        .submit-btn:disabled { background:rgba(255,255,255,0.08); cursor:not-allowed; transform:none; box-shadow:none; }
      `}</style>

      <div style={{ position:'absolute', width:'500px', height:'500px', borderRadius:'50%', background:'rgba(59,130,246,0.06)', top:'-150px', right:'-150px', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:'350px', height:'350px', borderRadius:'50%', background:'rgba(139,92,246,0.05)', bottom:'-100px', left:'-100px', pointerEvents:'none' }} />

      <div style={{ background:'rgba(255,255,255,0.03)', backdropFilter:'blur(24px)', borderRadius:'24px', padding:'48px', width:'100%', maxWidth:'440px', border:'1px solid rgba(255,255,255,0.09)', boxShadow:'0 30px 60px rgba(0,0,0,0.5)', animation:'fadeInUp 0.55s ease-out', position:'relative', zIndex:10, margin:'24px' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'64px', height:'64px', borderRadius:'18px', background:'linear-gradient(135deg,#1e40af,#3b82f6)', marginBottom:'14px', boxShadow:'0 8px 24px rgba(59,130,246,0.35)', animation:'float 3s ease-in-out infinite', fontSize:'28px' }}>
            <FiLayers color="white" />
          </div>
          <h1 style={{ color:'white', fontSize:'26px', fontWeight:'800', margin:'0 0 5px', background:'linear-gradient(135deg,#ffffff,#90CAF9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Join Vactrix</h1>
          <p style={{ color:'rgba(255,255,255,0.4)', margin:0, fontSize:'13px' }}>Create your account to get started</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5', padding:'12px 16px', borderRadius:'10px', marginBottom:'18px', fontSize:'14px', fontWeight:'600', display:'flex', alignItems:'center', gap:'8px' }}>
            <FiAlertTriangle /> {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{ background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.3)', color:'#86efac', padding:'14px 16px', borderRadius:'10px', marginBottom:'18px', fontSize:'14px', fontWeight:'700', textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
            <FiCheck /> Account created! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { label:'Full Name',    key:'name',     type:'text',     placeholder:'e.g. Arjun Sharma' },
            { label:'Email Address',key:'email',    type:'email',    placeholder:'you@company.com' },
            { label:'Password',     key:'password', type:'password', placeholder:'Min. 6 characters' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom:'16px' }}>
              <label style={{ display:'block', marginBottom:'7px', color:'rgba(255,255,255,0.55)', fontWeight:'700', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.6px' }}>{f.label}</label>
              <input className="field" type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => set(f.key, e.target.value)} required />
            </div>
          ))}

          {/* Department dropdown */}
          <div style={{ marginBottom:'24px' }}>
            <label style={{ display:'block', marginBottom:'7px', color:'rgba(255,255,255,0.55)', fontWeight:'700', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.6px' }}>Department</label>
            <select className="field" value={form.department} onChange={e => set('department', e.target.value)} required>
              <option value="">— Select your department —</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={loading || success}>
            {loading ? <><FiRefreshCw /> Creating account...</> : success ? <><FiCheck /> Done!</> : <>Create Account <FiArrowRight /></>}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:'22px', color:'rgba(255,255,255,0.35)', fontSize:'14px', margin:'22px 0 0' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'#60a5fa', fontWeight:'700', textDecoration:'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
