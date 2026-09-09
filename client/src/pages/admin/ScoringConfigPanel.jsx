import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiTool, FiClock, FiAward, FiPlus, FiX, FiActivity, FiCheck, FiBriefcase, FiTarget, FiSave, FiEye, FiBarChart2, FiFileText, FiAlertTriangle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

import { API } from '../../config/api';

const FACTOR_META = {
  skillWeight: { label: 'Skills Match',       icon: <FiTool />, color: '#3b82f6', desc: 'How well candidate skills match required skills (HashSet O(n))' },
  expWeight:   { label: 'Experience',          icon: <FiClock />, color: '#22c55e', desc: 'Years of experience vs minimum required (internal bonus applied)' },
  perfWeight:  { label: 'Performance Rating',  icon: <FaStar />, color: '#f59e0b', desc: 'Self-reported performance rating (1–5 scale, converted to %)' },
  certWeight:  { label: 'Certifications',      icon: <FiAward />, color: '#a78bfa', desc: 'Number of certifications held (capped at 100%)' },
};

const FORMULA_INFO = {
  weighted_sum:    { label: 'Weighted Sum',    icon: <FiPlus />, desc: 'Straightforward. Each factor × weight, then summed. Most predictable.' },
  geometric_mean:  { label: 'Geometric Mean',  icon: <FiX />, desc: 'Penalizes very low scores in any factor. Rewards well-rounded candidates.' },
  harmonic_mean:   { label: 'Harmonic Mean',   icon: <FiActivity />, desc: 'Strongly penalizes weak areas. Best for roles requiring all-round competence.' },
};

function WeightSlider({ name, value, onChange, color, label, icon, desc, disabled }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${color}20`, borderRadius: '14px', padding: '20px', marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color }}>{icon}</div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '14px', color: 'white' }}>{label}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{desc}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right', minWidth: '56px' }}>
          <div style={{ fontSize: '26px', fontWeight: '900', color, lineHeight: 1 }}>{value}%</div>
        </div>
      </div>
      <input type="range" min="0" max="100" step="5" value={value}
        onChange={e => onChange(name, Number(e.target.value))}
        disabled={disabled}
        style={{ width: '100%', accentColor: color, cursor: disabled ? 'not-allowed' : 'pointer', height: '6px' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '4px' }}>
        <span>0%</span><span>50%</span><span>100%</span>
      </div>
    </div>
  );
}

export default function ScoringConfigPanel() {
  const [config,   setConfig]   = useState(null);
  const [weights,  setWeights]  = useState({ skillWeight: 40, expWeight: 30, perfWeight: 20, certWeight: 10 });
  const [formula,  setFormula]  = useState('weighted_sum');
  const [bonuses,  setBonuses]  = useState({ internalCandidateBonus: 5, perfectSkillMatchBonus: 10, seniorExperienceBonus: 5 });
  const [formulas, setFormulas] = useState([]);
  const [history,  setHistory]  = useState([]);
  const [preview,  setPreview]  = useState(null);
  const [previewInputs, setPreviewInputs] = useState({ skillMatch: 75, expScore: 80, perfRating: 4, certCount: 2 });
  const [saving,   setSaving]   = useState(false);
  const [recalcing,setRecalcing]= useState(false);
  const [toast,    setToast]    = useState(null);
  const [note,     setNote]     = useState('');
  const { token }  = useAuth();
  const navigate   = useNavigate();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    const h = { Authorization: `Bearer ${token}` };
    try {
      const [cfgRes, fmlRes] = await Promise.all([
        axios.get(`${API}/scoring/config`,   { headers: h }),
        axios.get(`${API}/scoring/formulas`, { headers: h }),
      ]);
      const cfg = cfgRes.data.config;
      setConfig(cfg);
      setWeights({ skillWeight: cfg.skillWeight, expWeight: cfg.expWeight, perfWeight: cfg.perfWeight, certWeight: cfg.certWeight });
      setFormula(cfg.formulaType || 'weighted_sum');
      setBonuses(b => cfg.bonusRules || b);
      setHistory(cfgRes.data.changeLog || []);
      setFormulas(fmlRes.data.formulas || []);
    } catch { /* silent */ }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  // Live preview whenever inputs change
  useEffect(() => {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    if (Math.abs(total - 100) > 0.5) { setPreview(null); return; }
    const h = { Authorization: `Bearer ${token}` };
    axios.post(`${API}/scoring/preview`, { ...weights, ...previewInputs }, { headers: h })
      .then(r => setPreview(r.data.preview))
      .catch(() => setPreview(null));
  }, [weights, previewInputs, token]);

  const handleWeightChange = (name, val) => {
    setWeights(prev => ({ ...prev, [name]: val }));
  };

  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const totalValid = Math.abs(total - 100) < 0.5;

  const handleSave = async () => {
    if (!totalValid) return showToast('Weights must sum to exactly 100%', 'error');
    setSaving(true);
    const h = { Authorization: `Bearer ${token}` };
    try {
      await axios.put(`${API}/scoring/config`, { ...weights, formulaType: formula, bonusRules: bonuses, note }, { headers: h });
      showToast('Scoring engine updated! All future applications will use new weights.');
      setNote('');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save', 'error');
    } finally { setSaving(false); }
  };

  const handleRecalculate = async () => {
    if (!window.confirm('Recalculate ALL existing application scores with the new weights? This cannot be undone.')) return;
    setRecalcing(true);
    const h = { Authorization: `Bearer ${token}` };
    try {
      const res = await axios.post(`${API}/applications/recalculate`, {}, { headers: h });
      showToast(`Recalculated ${res.data.updated} application scores`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Recalculation failed', 'error');
    } finally { setRecalcing(false); }
  };

  const scoreColor = s => s >= 70 ? '#86efac' : s >= 40 ? '#fbbf24' : '#fca5a5';

  return (
    <div style={{ minHeight: '100vh', background: '#080b14', fontFamily: "'DM Sans','Segoe UI',sans-serif", color: 'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
        @keyframes slideIn { from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);} }
        input[type=range]::-webkit-slider-runnable-track { height:6px; border-radius:3px; }
        .save-btn:hover { opacity:0.9!important; transform:translateY(-1px); box-shadow:0 8px 24px rgba(59,130,246,0.4)!important; }
        .save-btn { transition:all 0.18s; }
        .card { animation: fadeUp 0.4s ease both; }
        .formula-card:hover { border-color:rgba(139,92,246,0.4)!important; background:rgba(139,92,246,0.07)!important; }
        .formula-card { transition:all 0.15s; cursor:pointer; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:'24px', right:'24px', zIndex:9999, background: toast.type==='success'?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)', border:`1px solid ${toast.type==='success'?'rgba(34,197,94,0.4)':'rgba(239,68,68,0.4)'}`, color: toast.type==='success'?'#86efac':'#fca5a5', padding:'14px 20px', borderRadius:'12px', fontSize:'14px', fontWeight:'700', backdropFilter:'blur(12px)', animation:'slideIn 0.3s ease', maxWidth:'360px', lineHeight:'1.4', display:'flex', alignItems:'center', gap:'8px' }}>
          {toast.type === 'success' ? <FiCheck size={18} /> : <FiAlertTriangle size={18} />} {toast.msg}
        </div>
      )}

      {/* Navbar */}
      <div style={{ background:'rgba(255,255,255,0.02)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'14px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:50 }}>
        <h1 style={{ margin:0, fontSize:'20px', fontWeight:'900', cursor:'pointer', background:'linear-gradient(135deg,#fff,#90CAF9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }} onClick={() => navigate('/admin/dashboard')}>Vactrix</h1>
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={() => navigate('/admin/dashboard')} style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', padding:'7px 16px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'600', fontFamily:'inherit' }}>
            <FiArrowLeft /> Admin Dashboard
          </button>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '36px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: '28px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiTool /> Scoring Engine Configuration
              </h2>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
                Configure how candidate scores are calculated. Changes apply to all new applications.
                {config && <span style={{ color: 'rgba(255,255,255,0.25)', marginLeft: '8px' }}>v{config.version}</span>}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleRecalculate} disabled={recalcing}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', color: '#fbbf24', cursor: recalcing ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '700', fontFamily: 'inherit', opacity: recalcing ? 0.6 : 1 }}>
                <FiRefreshCw className={recalcing ? 'animate-spin' : ''} />
                {recalcing ? 'Recalculating...' : 'Recalculate All Scores'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          {/* LEFT: Sliders */}
          <div>
            {/* Weight sliders */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Factor Weights</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: totalValid ? '#86efac' : '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {total}% {totalValid ? <FiCheck /> : <><FiAlertTriangle size={12} /> must be 100%</>}
                  </div>
                </div>
              </div>

              {/* Total bar */}
              <div style={{ height: '10px', borderRadius: '5px', overflow: 'hidden', display: 'flex', marginBottom: '20px', gap: '2px' }}>
                {Object.entries(weights).map(([key, val]) => (
                  <div key={key} style={{ flex: val, background: FACTOR_META[key].color, transition: 'flex 0.3s ease', minWidth: val > 0 ? '2px' : 0 }} />
                ))}
              </div>

              {Object.entries(weights).map(([key, val]) => (
                <WeightSlider key={key} name={key} value={val} onChange={handleWeightChange}
                  color={FACTOR_META[key].color} label={FACTOR_META[key].label}
                  icon={FACTOR_META[key].icon} desc={FACTOR_META[key].desc} disabled={saving} />
              ))}
            </div>

            {/* Formula selector */}
            <div className="card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px', marginBottom: '20px', animationDelay: '0.06s' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: '800' }}>Scoring Formula</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {formulas.map(f => (
                  <div key={f.id} className="formula-card" onClick={() => setFormula(f.id)}
                    style={{ background: formula === f.id ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${formula === f.id ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: formula === f.id ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, color: '#c4b5fd' }}>{FORMULA_INFO[f.id]?.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: formula === f.id ? '#c4b5fd' : 'rgba(255,255,255,0.75)' }}>{f.label}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{f.desc}</div>
                    </div>
                    {formula === f.id && <span style={{ fontSize: '16px', color: '#c4b5fd' }}><FiCheck /></span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Bonus rules */}
            <div className="card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px', marginBottom: '20px', animationDelay: '0.1s' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: '800' }}>Bonus Rules</h3>
              {[
                { key: 'internalCandidateBonus', label: 'Internal Candidate Bonus', icon: <FiBriefcase />, color: '#3b82f6' },
                { key: 'perfectSkillMatchBonus', label: 'Perfect Skill Match Bonus', icon: <FiTarget />, color: '#22c55e' },
                { key: 'seniorExperienceBonus',  label: 'Senior Experience Bonus',  icon: <FaStar />, color: '#f59e0b' },
              ].map(b => (
                <div key={b.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px', color: b.color }}>{b.icon}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>{b.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="number" min="0" max="20" value={bonuses[b.key] || 0}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setBonuses(prev => ({ ...prev, [b.key]: val }));
                      }}
                      style={{ width: '60px', padding: '5px 8px', background: 'rgba(255,255,255,0.08)', border: `1px solid ${b.color}30`, borderRadius: '7px', color: b.color, fontSize: '14px', fontWeight: '800', textAlign: 'center', outline: 'none', fontFamily: 'inherit' }} />
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>pts</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Note + Save */}
            <div className="card" style={{ animationDelay: '0.14s' }}>
              <input type="text" value={note} onChange={e => setNote(e.target.value)}
                placeholder="Add a note for the change log (optional)..."
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'inherit', marginBottom: '12px' }} />
              <button className="save-btn" onClick={handleSave} disabled={saving || !totalValid}
                style={{ width: '100%', padding: '15px', background: totalValid ? 'linear-gradient(135deg,#1d4ed8,#3b82f6)' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '16px', fontWeight: '900', cursor: saving || !totalValid ? 'not-allowed' : 'pointer', boxShadow: totalValid ? '0 4px 20px rgba(59,130,246,0.25)' : 'none', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <FiSave /> {saving ? 'Saving...' : totalValid ? 'Save Configuration' : `Weights sum to ${total}% — must be 100%`}
              </button>
            </div>
          </div>

          {/* RIGHT: Live preview + history */}
          <div>
            {/* Live preview */}
            <div className="card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '22px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiEye /> Live Score Preview
              </h3>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '14px' }}>Adjust inputs to see how scores change in real-time</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                {[
                  { key: 'skillMatch', label: 'Skill Match %', min: 0, max: 100, step: 5, color: '#3b82f6' },
                  { key: 'expScore',   label: 'Exp Score %',   min: 0, max: 100, step: 5, color: '#22c55e' },
                  { key: 'perfRating', label: 'Perf Rating',   min: 1, max: 5,   step: 1, color: '#f59e0b' },
                  { key: 'certCount',  label: 'Cert Count',    min: 0, max: 10,  step: 1, color: '#a78bfa' },
                ].map(inp => (
                  <div key={inp.key}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{inp.label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="range" min={inp.min} max={inp.max} step={inp.step}
                        value={previewInputs[inp.key]}
                        onChange={e => setPreviewInputs(prev => ({ ...prev, [inp.key]: Number(e.target.value) }))}
                        style={{ flex: 1, accentColor: inp.color }} />
                      <span style={{ fontSize: '13px', fontWeight: '800', color: inp.color, minWidth: '30px', textAlign: 'right' }}>{previewInputs[inp.key]}</span>
                    </div>
                  </div>
                ))}
              </div>

              {preview && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px', marginBottom: '14px' }}>
                    {[
                      { label: 'Skill', val: preview.skillMatch, color: '#3b82f6' },
                      { label: 'Exp',   val: preview.expScore,   color: '#22c55e' },
                      { label: 'Perf',  val: preview.perfScore,  color: '#f59e0b' },
                      { label: 'Certs', val: preview.certScore,  color: '#a78bfa' },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center', background: `${s.color}0d`, border: `1px solid ${s.color}20`, borderRadius: '9px', padding: '10px' }}>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: s.color }}>{s.val}%</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', fontWeight: '700', marginTop: '2px' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px', background: `${scoreColor(preview.finalScore)}12`, border: `1px solid ${scoreColor(preview.finalScore)}30`, borderRadius: '10px' }}>
                    <div style={{ fontSize: '44px', fontWeight: '900', color: scoreColor(preview.finalScore), lineHeight: 1, letterSpacing: '-1px' }}>{preview.finalScore}%</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '5px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      {preview.finalScore >= 70 ? <><FiCheck color="#86efac" /> Strong Match</> : preview.finalScore >= 40 ? <><FiAlertTriangle color="#fbbf24" /> Moderate Match</> : <><FiX color="#fca5a5" /> Weak Match</>}
                    </div>
                  </div>
                </div>
              )}

              {!totalValid && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '12px', textAlign: 'center', color: '#fca5a5', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FiAlertTriangle /> Weights must sum to 100% for preview
                </div>
              )}
            </div>

            {/* Current weights display */}
            <div className="card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '22px', marginBottom: '20px', animationDelay: '0.06s' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiBarChart2 /> Active Weights
              </h3>
              {Object.entries(weights).map(([key, val]) => {
                const m = FACTOR_META[key];
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '14px', width: '24px', color: m.color }}>{m.icon}</span>
                    <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${val}%`, background: m.color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: m.color, minWidth: '36px', textAlign: 'right' }}>{val}%</span>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', minWidth: '70px' }}>{m.label}</span>
                  </div>
                );
              })}
              <div style={{ marginTop: '12px', padding: '10px', background: formula === 'weighted_sum' ? 'rgba(139,92,246,0.08)' : 'rgba(245,158,11,0.08)', border: `1px solid ${formula === 'weighted_sum' ? 'rgba(139,92,246,0.2)' : 'rgba(245,158,11,0.2)'}`, borderRadius: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                Formula: <span style={{ fontWeight: '700', color: '#c4b5fd' }}>{FORMULA_INFO[formula]?.label}</span>
              </div>
            </div>

            {/* Change history */}
            <div className="card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '22px', animationDelay: '0.1s' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiFileText /> Change Log
              </h3>
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>No changes recorded yet</div>
              ) : history.slice(0, 6).map((h, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '9px', marginBottom: '7px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#c4b5fd' }}>v{h.version}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>{h.changedAt ? new Date(h.changedAt).toLocaleDateString() : ''}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {h.weights && Object.entries(h.weights).map(([k, v]) => (
                      <span key={k} style={{ background: `${FACTOR_META[k]?.color || '#fff'}15`, color: FACTOR_META[k]?.color || '#fff', padding: '2px 7px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {FACTOR_META[k]?.icon} {v}%
                      </span>
                    ))}
                  </div>
                  {h.note && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '4px', fontStyle: 'italic' }}>"{h.note}"</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
