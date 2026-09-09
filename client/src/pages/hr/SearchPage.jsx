import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiMail, FiBriefcase, FiClock, FiAward, FiFileText, FiCheckCircle, FiUsers, FiTool, FiSliders, FiChevronRight, FiArrowLeft, FiArrowRight, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

import { API } from '../../config/api';

// Debounce hook
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Shared helpers
const scoreColor = s => s >= 70 ? '#86efac' : s >= 40 ? '#fbbf24' : '#fca5a5';
const scoreBg    = s => s >= 70 ? 'rgba(34,197,94,0.1)' : s >= 40 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';

const DEPT_COLORS = ['#3b82f6','#8b5cf6','#22c55e','#f59e0b','#ef4444','#14b8a6','#ec4899','#6366f1'];
function deptColor(dept) {
  const idx = Math.abs([...dept].reduce((a, c) => a + c.charCodeAt(0), 0)) % DEPT_COLORS.length;
  return DEPT_COLORS[idx];
}

// Pagination
function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  const nums = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) nums.push(i);
  return (
    <div style={{ display:'flex', gap:'6px', justifyContent:'center', marginTop:'24px', alignItems:'center' }}>
      <button onClick={() => onPage(page - 1)} disabled={page === 1}
        style={{ padding:'7px 12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'rgba(255,255,255,0.5)', cursor: page===1?'not-allowed':'pointer', fontFamily:'inherit', fontSize:'13px', opacity:page===1?0.4:1 }}>
        <FiArrowLeft />
      </button>
      {page > 3 && <><button onClick={() => onPage(1)} style={{ padding:'7px 12px', background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontFamily:'inherit', fontSize:'13px' }}>1</button><span style={{color:'rgba(255,255,255,0.3)'}}>…</span></>}
      {nums.map(n => (
        <button key={n} onClick={() => onPage(n)}
          style={{ padding:'7px 12px', background: n===page?'rgba(59,130,246,0.2)':'transparent', border:`1px solid ${n===page?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.1)'}`, borderRadius:'8px', color: n===page?'#60a5fa':'rgba(255,255,255,0.5)', cursor:'pointer', fontFamily:'inherit', fontSize:'13px', fontWeight:n===page?'800':'400' }}>{n}</button>
      ))}
      {page < pages - 2 && <><span style={{color:'rgba(255,255,255,0.3)'}}>…</span><button onClick={() => onPage(pages)} style={{ padding:'7px 12px', background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontFamily:'inherit', fontSize:'13px' }}>{pages}</button></>}
      <button onClick={() => onPage(page + 1)} disabled={page === pages}
        style={{ padding:'7px 12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'rgba(255,255,255,0.5)', cursor:page===pages?'not-allowed':'pointer', fontFamily:'inherit', fontSize:'13px', opacity:page===pages?0.4:1 }}>
        <FiArrowRight />
      </button>
    </div>
  );
}

// Candidate card
function CandidateCard({ user }) {
  const best = user.appStats?.bestScore || 0;
  const c    = deptColor(user.department || '?');
  return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'18px 20px', transition:'all 0.15s', cursor:'default' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(99,179,237,0.3)'; e.currentTarget.style.background='rgba(59,130,246,0.04)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.background='rgba(255,255,255,0.02)'; }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px' }}>
        <div style={{ display:'flex', gap:'12px', alignItems:'center', flex:1 }}>
          <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:`${c}20`, border:`1px solid ${c}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px', fontWeight:'900', color:c, flexShrink:0 }}>
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight:'800', fontSize:'15px', marginBottom:'3px' }}>{user.name}</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><FiMail size={12} /> {user.email}</span>
              {user.department && <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><FiBriefcase size={12} /> {user.department}</span>}
              <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><FiClock size={12} /> {user.experience || 0} yrs</span>
              <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><FaStar size={11} color="#f59e0b" /> {user.performanceRating || 3}/5</span>
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center', flexShrink:0 }}>
          {user.appStats?.totalApps > 0 && (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'18px', fontWeight:'900', color:scoreColor(best) }}>{best}%</div>
              <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', fontWeight:'700' }}>Best Score</div>
            </div>
          )}
        </div>
      </div>

      {user.skills?.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:'5px', marginTop:'10px' }}>
          {user.skills.slice(0, 6).map(s => (
            <span key={s} style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', color:'#93c5fd', padding:'2px 8px', borderRadius:'6px', fontSize:'10px', fontWeight:'600' }}>{s}</span>
          ))}
          {user.skills.length > 6 && <span style={{ color:'rgba(255,255,255,0.25)', fontSize:'10px', padding:'2px 0' }}>+{user.skills.length - 6}</span>}
        </div>
      )}

      <div style={{ display:'flex', gap:'8px', marginTop:'10px', flexWrap:'wrap' }}>
        {user.certifications?.length > 0 && (
          <span style={{ background:'rgba(167,139,250,0.1)', border:'1px solid rgba(167,139,250,0.2)', color:'#c4b5fd', padding:'2px 8px', borderRadius:'6px', fontSize:'10px', fontWeight:'600', display:'flex', alignItems:'center', gap:'4px' }}>
            <FiAward size={11} /> {user.certifications.length} cert{user.certifications.length > 1 ? 's' : ''}
          </span>
        )}
        {user.appStats?.totalApps > 0 && (
          <span style={{ background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.4)', padding:'2px 8px', borderRadius:'6px', fontSize:'10px', fontWeight:'600', display:'flex', alignItems:'center', gap:'4px' }}>
            <FiFileText size={11} /> {user.appStats.totalApps} application{user.appStats.totalApps > 1 ? 's' : ''}
          </span>
        )}
        {user.appStats?.approvedCount > 0 && (
          <span style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)', color:'#86efac', padding:'2px 8px', borderRadius:'6px', fontSize:'10px', fontWeight:'700', display:'flex', alignItems:'center', gap:'4px' }}>
            <FiCheckCircle size={11} /> {user.appStats.approvedCount} approved
          </span>
        )}
      </div>
    </div>
  );
}

// Job card
function JobCard({ job, navigate }) {
  const c = deptColor(job.department || '?');
  return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'18px 20px', cursor:'pointer', transition:'all 0.15s' }}
      onClick={() => navigate(`/jobs/${job._id}`)}
      onMouseEnter={e => { e.currentTarget.style.borderColor=`${c}50`; e.currentTarget.style.background=`${c}08`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.background='rgba(255,255,255,0.02)'; }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px' }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'5px', flexWrap:'wrap' }}>
            <span style={{ fontWeight:'800', fontSize:'15px' }}>{job.title}</span>
            <span style={{ background: job.isOpen?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${job.isOpen?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'}`, color:job.isOpen?'#86efac':'#fca5a5', padding:'2px 8px', borderRadius:'20px', fontSize:'10px', fontWeight:'800' }}>
              {job.isOpen ? '● OPEN' : '● CLOSED'}
            </span>
          </div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', display:'flex', gap:'12px', flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><FiBriefcase size={12} /> {job.department}</span>
            <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><FiClock size={12} /> {job.minExperience}+ yrs</span>
            {job.applicantStats?.count > 0 && <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><FiUsers size={12} /> {job.applicantStats.count} applied</span>}
          </div>
        </div>
        <span style={{ color:'rgba(255,255,255,0.3)', fontSize:'18px', flexShrink:0 }}><FiChevronRight /></span>
      </div>
      {job.requiredSkills?.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:'5px', marginTop:'10px' }}>
          {job.requiredSkills.slice(0, 5).map(s => (
            <span key={s} style={{ background:`${c}12`, border:`1px solid ${c}25`, color:c, padding:'2px 8px', borderRadius:'6px', fontSize:'10px', fontWeight:'600' }}>{s}</span>
          ))}
          {job.requiredSkills.length > 5 && <span style={{ color:'rgba(255,255,255,0.25)', fontSize:'10px' }}>+{job.requiredSkills.length - 5}</span>}
        </div>
      )}
    </div>
  );
}

// Application card
function AppCard({ app }) {
  const STATUS_C = { pending:'#fbbf24', shortlisted:'#86efac', approved:'#c4b5fd', rejected:'#fca5a5' };
  return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'16px 20px', transition:'all 0.15s' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:'800', fontSize:'14px', marginBottom:'3px' }}>{app.user?.name || '—'}</div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><FiBriefcase size={12} /> {app.job?.title || '—'}</span>
            <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><FiBriefcase size={12} /> {app.job?.department || '—'}</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center', flexShrink:0 }}>
          <span style={{ background:scoreBg(app.finalScore), border:`1px solid ${scoreColor(app.finalScore)}40`, color:scoreColor(app.finalScore), padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'900' }}>{app.finalScore}%</span>
          <span style={{ background:`${STATUS_C[app.status]}15`, border:`1px solid ${STATUS_C[app.status]}35`, color:STATUS_C[app.status], padding:'4px 10px', borderRadius:'20px', fontSize:'10px', fontWeight:'800', textTransform:'uppercase' }}>{app.status}</span>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginTop:'10px' }}>
        {[{l:'Skills',v:app.skillScore,c:'#3b82f6'},{l:'Exp',v:app.expScore,c:'#22c55e'},{l:'Perf',v:Math.round(app.perfScore||0),c:'#f59e0b'}].map(s=>(
          <div key={s.l} style={{ textAlign:'center', background:`${s.c}0d`, borderRadius:'7px', padding:'6px' }}>
            <div style={{ fontSize:'14px', fontWeight:'800', color:s.c }}>{s.v}%</div>
            <div style={{ fontSize:'9px', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', fontWeight:'700' }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [tab,        setTab]        = useState('candidates');
  const [query,      setQuery]      = useState('');
  const [suggestions,setSuggestions]= useState([]);
  const [showSuggs,  setShowSuggs]  = useState(false);
  const [results,    setResults]    = useState([]);
  const [meta,       setMeta]       = useState({ total: 0, pages: 1, page: 1 });
  const [loading,    setLoading]    = useState(false);

  // Filters
  const [department, setDepartment] = useState('');
  const [skills,     setSkills]     = useState('');
  const [minExp,     setMinExp]     = useState(0);
  const [maxExp,     setMaxExp]     = useState(50);
  const [minScore,   setMinScore]   = useState(0);
  const [hasCerts,   setHasCerts]   = useState('');
  const [status,     setStatus]     = useState('');
  const [sortBy,     setSortBy]     = useState('');
  const [sortDir,    setSortDir]    = useState('desc');
  const [limit]                     = useState(10);

  const debouncedQuery = useDebounce(query, 350);
  const { token }  = useAuth();
  const navigate   = useNavigate();
  const inputRef   = useRef(null);

  // Auto-suggest
  useEffect(() => {
    if (debouncedQuery.length < 2) { setSuggestions([]); return; }
    const h = { Authorization: `Bearer ${token}` };
    axios.get(`${API}/search/suggestions`, { headers: h, params: { q: debouncedQuery } })
      .then(r => setSuggestions(r.data.suggestions || []))
      .catch(() => setSuggestions([]));
  }, [debouncedQuery, token]);

  // Main search
  const doSearch = useCallback(async (pg = 1) => {
    setLoading(true);
    setShowSuggs(false);
    const h = { Authorization: `Bearer ${token}` };
    try {
      const base = { q: debouncedQuery, department, sortDir, page: pg, limit };
      let res;
      if (tab === 'candidates') {
        const defaultSort = sortBy || 'name';
        res = await axios.get(`${API}/search/candidates`, { headers: h, params: { ...base, skills, minExp, maxExp, minScore, hasCerts, sortBy: defaultSort } });
      } else if (tab === 'jobs') {
        const defaultSort = sortBy || 'createdAt';
        res = await axios.get(`${API}/search/jobs`, { headers: h, params: { ...base, skills, minExp, maxExp, isOpen: '', sortBy: defaultSort } });
      } else {
        const defaultSort = sortBy || 'finalScore';
        res = await axios.get(`${API}/search/applications`, { headers: h, params: { ...base, status, minScore, sortBy: defaultSort } });
      }
      setResults(res.data.results || []);
      setMeta({ total: res.data.total, pages: res.data.pages, page: res.data.page });
    } catch { setResults([]); }
    setLoading(false);
  }, [debouncedQuery, tab, department, skills, minExp, maxExp, minScore, hasCerts, status, sortBy, sortDir, limit, token]);

  // Search on any filter/tab change
  useEffect(() => { doSearch(1); }, [doSearch]);

  const resetFilters = () => {
    setDepartment(''); setSkills(''); setMinExp(0); setMaxExp(50);
    setMinScore(0); setHasCerts(''); setStatus(''); setSortBy(''); setSortDir('desc');
  };

  const TABS = [
    { id:'candidates',   icon:<FiUsers />, label:'Candidates' },
    { id:'jobs',         icon:<FiBriefcase />, label:'Jobs' },
    { id:'applications', icon:<FiFileText />, label:'Applications' },
  ];

  const SORT_OPTIONS = {
    candidates:   [{ v:'name',name:'Name'},{v:'experience',name:'Experience'},{v:'performanceRating',name:'Rating'},{v:'createdAt',name:'Joined'}],
    jobs:         [{ v:'createdAt',name:'Posted'},{v:'title',name:'Title'},{v:'minExperience',name:'Experience'}],
    applications: [{ v:'finalScore',name:'Score'},{v:'skillScore',name:'Skill Score'},{v:'expScore',name:'Exp Score'},{v:'createdAt',name:'Date'}],
  };

  return (
    <div style={{ minHeight:'100vh', background:'#080b14', fontFamily:"'DM Sans','Segoe UI',sans-serif", color:'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        .result-card { animation:fadeUp 0.35s ease both; }
        .filter-select { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:9px; padding:8px 12px; color:white; font-size:13px; outline:none; cursor:pointer; font-family:inherit; transition:border-color 0.15s; width:100%; }
        .filter-select:focus { border-color:#3b82f6; }
        .filter-select option { background:#111827; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:3px; }
      `}</style>

      {/* Navbar */}
      <div style={{ background:'rgba(255,255,255,0.02)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'14px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:50 }}>
        <h1 style={{ margin:0, fontSize:'20px', fontWeight:'900', cursor:'pointer', background:'linear-gradient(135deg,#fff,#90CAF9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }} onClick={() => navigate('/hr/dashboard')}>Vactrix</h1>
        <button onClick={() => navigate('/hr/dashboard')} style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', padding:'7px 16px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'600', fontFamily:'inherit' }}>
          <FiArrowLeft /> Dashboard
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '1600px', margin:'0 auto', padding:'32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom:'28px', animation:'fadeUp 0.4s ease both' }}>
          <h2 style={{ margin:'0 0 5px', fontSize:'26px', fontWeight:'900', display:'flex', alignItems:'center', gap:'10px' }}>
            <FiSearch /> Enterprise Search
          </h2>
          <p style={{ margin:0, color:'rgba(255,255,255,0.35)', fontSize:'13px' }}>Debounced search · Server-side pagination · Compound indexed queries · Real-time suggestions</p>
        </div>

        {/* Search bar */}
        <div style={{ position:'relative', marginBottom:'20px', animation:'fadeUp 0.4s ease 0.04s both' }}>
          <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
            <div style={{ position:'relative', flex:1 }}>
              <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'18px', color:'rgba(255,255,255,0.3)', pointerEvents:'none', display:'flex', alignItems:'center' }}><FiSearch /></span>
              <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setShowSuggs(true); }}
                onFocus={() => suggestions.length && setShowSuggs(true)}
                onBlur={() => setTimeout(() => setShowSuggs(false), 180)}
                placeholder={`Search ${tab}... (debounced 350ms)`}
                style={{ width:'100%', padding:'14px 16px 14px 46px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'12px', fontSize:'15px', color:'white', outline:'none', fontFamily:'inherit', transition:'all 0.2s' }}
                onKeyDown={e => { if (e.key === 'Escape') { setQuery(''); setShowSuggs(false); } }}
              />
              {query && (
                <button onClick={() => { setQuery(''); setSuggestions([]); }} style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:'18px', lineHeight:1, fontFamily:'inherit' }}>×</button>
              )}

              {/* Suggestions dropdown */}
              {showSuggs && suggestions.length > 0 && (
                <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'#0f172a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', boxShadow:'0 16px 40px rgba(0,0,0,0.6)', zIndex:100, overflow:'hidden', animation:'fadeUp 0.2s ease both' }}>
                  {suggestions.map((s, i) => (
                    <div key={i} onMouseDown={() => { setQuery(s.label || s.value); setShowSuggs(false); doSearch(1); }}
                      style={{ padding:'10px 16px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', borderBottom:i<suggestions.length-1?'1px solid rgba(255,255,255,0.05)':'none', transition:'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <span style={{ fontSize:'14px', color:'#60a5fa' }}>{s.type==='skill'?<FiTool />:s.type==='department'?<FiBriefcase />:<FiBriefcase />}</span>
                      <div>
                        <div style={{ fontSize:'13px', fontWeight:'700', color:'white' }}>{s.label}</div>
                        {s.sublabel && <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>{s.sublabel}</div>}
                        {s.count && <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)' }}>×{s.count} employees</div>}
                      </div>
                      <span style={{ marginLeft:'auto', background:'rgba(255,255,255,0.06)', padding:'2px 7px', borderRadius:'5px', fontSize:'10px', color:'rgba(255,255,255,0.4)', fontWeight:'600', textTransform:'uppercase' }}>{s.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Tab selector next to search */}
            <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:'10px', padding:'4px', gap:'3px', flexShrink:0 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); resetFilters(); }}
                  style={{ padding:'8px 14px', borderRadius:'7px', border:'none', background: tab===t.id?'rgba(59,130,246,0.2)':'transparent', color: tab===t.id?'#60a5fa':'rgba(255,255,255,0.45)', cursor:'pointer', fontSize:'13px', fontWeight:'700', fontFamily:'inherit', display:'flex', alignItems:'center', gap:'6px', whiteSpace:'nowrap' }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:'20px', animation:'fadeUp 0.4s ease 0.08s both' }}>
          {/* Filter sidebar */}
          <div>
            <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px', padding:'18px', position:'sticky', top:'70px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                <span style={{ fontSize:'13px', fontWeight:'800', color:'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', gap:'6px' }}>
                  <FiSliders /> Filters
                </span>
                <button onClick={resetFilters} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:'11px', fontWeight:'700', fontFamily:'inherit' }}>Reset</button>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                {/* Department */}
                <div>
                  <label style={{ display:'block', fontSize:'10px', fontWeight:'700', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>Department</label>
                  <input value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Engineering"
                    style={{ width:'100%', padding:'8px 10px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'white', fontSize:'12px', outline:'none', fontFamily:'inherit' }} />
                </div>

                {/* Skills */}
                {(tab === 'candidates' || tab === 'jobs') && (
                  <div>
                    <label style={{ display:'block', fontSize:'10px', fontWeight:'700', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>Skills (comma-sep)</label>
                    <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Node.js"
                      style={{ width:'100%', padding:'8px 10px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'white', fontSize:'12px', outline:'none', fontFamily:'inherit' }} />
                  </div>
                )}

                {/* Experience range */}
                {tab !== 'applications' && (
                  <div>
                    <label style={{ display:'block', fontSize:'10px', fontWeight:'700', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>Experience: {minExp}–{maxExp} yrs</label>
                    <input type="range" min="0" max="50" value={minExp} onChange={e => setMinExp(Number(e.target.value))} style={{ width:'100%', accentColor:'#3b82f6', marginBottom:'4px' }} />
                    <input type="range" min="0" max="50" value={maxExp} onChange={e => setMaxExp(Number(e.target.value))} style={{ width:'100%', accentColor:'#22c55e' }} />
                  </div>
                )}

                {/* Min score */}
                {(tab === 'candidates' || tab === 'applications') && (
                  <div>
                    <label style={{ display:'block', fontSize:'10px', fontWeight:'700', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>Min Score: {minScore}%</label>
                    <input type="range" min="0" max="100" step="5" value={minScore} onChange={e => setMinScore(Number(e.target.value))} style={{ width:'100%', accentColor:'#a78bfa' }} />
                  </div>
                )}

                {/* Has certs */}
                {tab === 'candidates' && (
                  <div>
                    <label style={{ display:'block', fontSize:'10px', fontWeight:'700', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>Certifications</label>
                    <select value={hasCerts} onChange={e => setHasCerts(e.target.value)} className="filter-select">
                      <option value="">Any</option>
                      <option value="true">Has certifications</option>
                      <option value="false">No certifications</option>
                    </select>
                  </div>
                )}

                {/* Status filter for applications */}
                {tab === 'applications' && (
                  <div>
                    <label style={{ display:'block', fontSize:'10px', fontWeight:'700', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="filter-select">
                      <option value="">All</option>
                      <option value="pending">Pending</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                )}

                {/* Sort */}
                <div>
                  <label style={{ display:'block', fontSize:'10px', fontWeight:'700', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>Sort by</label>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="filter-select" style={{ marginBottom:'6px' }}>
                    <option value="">Default</option>
                    {(SORT_OPTIONS[tab] || []).map(o => <option key={o.v} value={o.v}>{o.name}</option>)}
                  </select>
                  <div style={{ display:'flex', gap:'5px' }}>
                    {['asc','desc'].map(d => (
                      <button key={d} onClick={() => setSortDir(d)}
                        style={{ flex:1, padding:'6px', background: sortDir===d?'rgba(59,130,246,0.15)':'transparent', border:`1px solid ${sortDir===d?'rgba(59,130,246,0.35)':'rgba(255,255,255,0.1)'}`, borderRadius:'7px', color: sortDir===d?'#60a5fa':'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:'11px', fontWeight:'700', fontFamily:'inherit', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                        {d === 'asc' ? <><FiArrowUp size={11} /> Asc</> : <><FiArrowDown size={11} /> Desc</>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            {/* Result count + info */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
              <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.4)' }}>
                {loading ? 'Searching...' : (
                  <span><span style={{ color:'white', fontWeight:'800' }}>{meta.total}</span> result{meta.total !== 1 ? 's' : ''}{query && <span> for "<span style={{color:'#60a5fa'}}>{query}</span>"</span>}</span>
                )}
              </div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)' }}>
                Page {meta.page} of {meta.pages} · {limit} per page
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {Array(4).fill(0).map((_,i) => (
                  <div key={i} style={{ height:'80px', borderRadius:'14px', background:'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.07) 50%,rgba(255,255,255,0.04) 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }} />
                ))}
                <style>{`@keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}`}</style>
              </div>
            )}

            {/* Empty */}
            {!loading && results.length === 0 && (
              <div style={{ textAlign:'center', padding:'80px', background:'rgba(255,255,255,0.02)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.25)' }}>
                <div style={{ fontSize:'48px', marginBottom:'14px', display:'flex', justifyContent:'center' }}><FiSearch /></div>
                <div style={{ fontSize:'17px', fontWeight:'600', marginBottom:'8px' }}>No results found</div>
                <div style={{ fontSize:'13px' }}>Try different keywords or reset filters</div>
              </div>
            )}

            {/* Results list */}
            {!loading && results.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {results.map((item, i) => (
                  <div key={item._id} className="result-card" style={{ animationDelay:`${i*0.03}s` }}>
                    {tab === 'candidates'   && <CandidateCard user={item}  navigate={navigate} />}
                    {tab === 'jobs'         && <JobCard        job={item}   navigate={navigate} />}
                    {tab === 'applications' && <AppCard        app={item} />}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <Pagination page={meta.page} pages={meta.pages} onPage={p => doSearch(p)} />
          </div>
        </div>
      </div>
    </div>
  );
}
