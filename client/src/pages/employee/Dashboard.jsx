import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../../components/NotificationBell';
import { FiHome, FiBriefcase, FiFileText, FiUser, FiSearch, FiClock, FiCheckCircle, FiXCircle, FiTarget, FiZap, FiCircle, FiCheck, FiArrowRight } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

import { API } from '../../config/api';

function Skeleton({ h = 16, r = 6 }) {
  return <div style={{ height:`${h}px`, borderRadius:`${r}px`, background:'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite', marginBottom:'8px' }} />;
}

export default function Dashboard() {
  const [jobs,    setJobs]    = useState([]);
  const [myApps,  setMyApps]  = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${API}/jobs`, { headers }).catch(() => ({ data: [] })),
      axios.get(`${API}/applications/mine`, { headers }).catch(() => ({ data: [] })),
      axios.get(`${API}/users/profile`, { headers }).catch(() => ({ data: null })),
    ]).then(([jobsRes, appsRes, profileRes]) => {
      setJobs(jobsRes.data || []);
      setMyApps(appsRes.data || []);
      setProfile(profileRes.data);
      setLoading(false);
    });
  }, [token]);

  const openJobs      = jobs.filter(j => j.isOpen);
  const shortlisted   = myApps.filter(a => a.status === 'shortlisted');
  const approved      = myApps.filter(a => a.status === 'approved');
  const avgScore      = myApps.length ? Math.round(myApps.reduce((s, a) => s + (a.finalScore || 0), 0) / myApps.length) : 0;
  const profileStrength = profile ? Math.min(100, Math.round(
    ((profile.skills?.length > 0 ? 25 : 0) +
     (profile.certifications?.length > 0 ? 25 : 0) +
     (profile.experience > 0 ? 25 : 0) +
     (profile.department ? 25 : 0))
  )) : 0;

  const STATUS_META = {
    pending:     { color:'#f59e0b', icon:<FiClock />, label:'Pending'     },
    shortlisted: { color:'#a78bfa', icon:<FaStar />, label:'Shortlisted' },
    approved:    { color:'#22c55e', icon:<FiCheckCircle />, label:'Approved'    },
    rejected:    { color:'#ef4444', icon:<FiXCircle />, label:'Rejected'    },
  };

  return (
    <div style={{ minHeight:'100vh', background:'#080b14', fontFamily:"'DM Sans','Segoe UI',sans-serif", color:'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
        @keyframes shimmer { 0%{background-position:-200% 0;}100%{background-position:200% 0;} }
        .card { animation:fadeUp 0.4s ease both; }
        .job-card:hover { transform:translateY(-2px)!important; border-color:rgba(59,130,246,0.35)!important; }
        .nav-item:hover { background:rgba(255,255,255,0.08)!important; }
      `}</style>

      {/* Sidebar */}
      <div style={{ position:'fixed', left:0, top:0, width:'68px', height:'100vh', background:'rgba(255,255,255,0.025)', borderRight:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', alignItems:'center', paddingTop:'20px', gap:'6px', zIndex:100 }}>
        <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'linear-gradient(135deg,#1e40af,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', marginBottom:'20px', boxShadow:'0 6px 20px rgba(59,130,246,0.35)', cursor:'pointer' }} onClick={() => navigate('/dashboard')}>
          <FiTarget />
        </div>

        {[
          { icon:<FiHome />, tip:'Home',         path:'/dashboard' },
          { icon:<FiBriefcase />, tip:'Browse Jobs',  path:'/jobs' },
          { icon:<FiFileText />, tip:'My Applications', path:'/my-applications' },
          { icon:<FiUser />, tip:'Profile',      path:'/profile' },
        ].map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)} title={item.tip} className="nav-item"
            style={{ width:'42px', height:'42px', borderRadius:'11px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px', cursor:'pointer', transition:'all 0.2s', background: window.location.pathname === item.path ? 'rgba(59,130,246,0.2)' : 'transparent' }}>
            {item.icon}
          </div>
        ))}
        <div style={{ flex:1 }} />
        <div style={{ margin:'4px 0' }}><NotificationBell /></div>
        <div onClick={() => { logout(); navigate('/login'); }}
          style={{ width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#22c55e,#16a34a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'800', cursor:'pointer', marginBottom:'16px', marginTop:'4px' }}
          title="Logout">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
      </div>

      <div style={{ marginLeft:'68px', padding:'32px 36px' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'32px' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
              <span style={{ background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.3)', color:'#86efac', padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', letterSpacing:'1px' }}>EMPLOYEE</span>
              <span style={{ color:'rgba(255,255,255,0.25)' }}>•</span>
              <span style={{ color:'rgba(255,255,255,0.35)', fontSize:'13px' }}>{user?.department || 'Vactrix'}</span>
            </div>
            <h1 style={{ margin:0, fontSize:'28px', fontWeight:'800', letterSpacing:'-0.5px' }}>
              Welcome back, <span style={{ background:'linear-gradient(135deg,#60a5fa,#86efac)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{user?.name?.split(' ')[0]}</span>
            </h1>
            <p style={{ margin:'5px 0 0', color:'rgba(255,255,255,0.35)', fontSize:'14px' }}>Your career dashboard — track applications & discover opportunities</p>
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            <button onClick={() => navigate('/jobs')}
              style={{ display:'flex', alignItems:'center', gap:'8px', background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', border:'none', color:'white', padding:'10px 20px', borderRadius:'10px', cursor:'pointer', fontSize:'13px', fontWeight:'700', fontFamily:'inherit', boxShadow:'0 4px 15px rgba(59,130,246,0.3)' }}>
              <FiSearch /> Browse Jobs
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'16px', marginBottom:'28px' }}>
          {[
            { label:'Open Jobs',    value: loading ? null : openJobs.length,    icon:<FiBriefcase />, color:'#3b82f6', sub:'Available positions' },
            { label:'Applied',      value: loading ? null : myApps.length,      icon:<FiFileText />, color:'#06b6d4', sub:'Total applications'  },
            { label:'Shortlisted',  value: loading ? null : shortlisted.length, icon:<FaStar />, color:'#a78bfa', sub:'Under review'         },
            { label:'Approved',     value: loading ? null : approved.length,    icon:<FiCheckCircle />, color:'#22c55e', sub:'Congratulations!'     },
            { label:'Avg Score',    value: loading ? null : `${avgScore}%`,     icon:<FiTarget />, color:'#f59e0b', sub:'Across all apps'      },
          ].map((k, i) => (
            <div key={i} className="card" style={{ background:`${k.color}0d`, border:`1px solid ${k.color}20`, borderRadius:'14px', padding:'18px', animationDelay:`${i*0.06}s` }}>
              <div style={{ fontSize:'20px', color:k.color, marginBottom:'10px' }}>{k.icon}</div>
              {k.value === null ? <Skeleton h={28} r={6} /> : <div style={{ fontSize:'28px', fontWeight:'900', color:'white', letterSpacing:'-1px', marginBottom:'3px' }}>{k.value}</div>}
              <div style={{ fontSize:'13px', fontWeight:'700', color:'rgba(255,255,255,0.65)', marginBottom:'2px' }}>{k.label}</div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{k.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'18px', marginBottom:'18px' }}>
          {/* My Applications */}
          <div className="card" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden' }}>
            <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:'14px', fontWeight:'800', color:'rgba(255,255,255,0.8)', display:'flex', alignItems:'center', gap:'8px' }}>
                <FiFileText /> My Applications
              </span>
              <button onClick={() => navigate('/my-applications')} style={{ background:'none', border:'none', color:'#60a5fa', fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:'4px' }}>
                View all <FiArrowRight />
              </button>
            </div>
            {loading ? (
              <div style={{ padding:'20px' }}>{[...Array(4)].map((_,i) => <div key={i} style={{ marginBottom:'12px' }}><Skeleton h={52} r={10} /></div>)}</div>
            ) : myApps.length === 0 ? (
              <div style={{ padding:'48px', textAlign:'center', color:'rgba(255,255,255,0.25)' }}>
                <div style={{ fontSize:'36px', marginBottom:'12px', display:'flex', justifyContent:'center' }}><FiFileText /></div>
                <div style={{ fontSize:'14px', fontWeight:'700', marginBottom:'8px' }}>No applications yet</div>
                <button onClick={() => navigate('/jobs')} style={{ background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.3)', color:'#60a5fa', padding:'8px 16px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:'700', fontFamily:'inherit' }}>Browse Jobs</button>
              </div>
            ) : (
              <div style={{ maxHeight:'360px', overflowY:'auto' }}>
                {myApps.slice(0,8).map((app) => {
                  const meta = STATUS_META[app.status] || STATUS_META.pending;
                  return (
                    <div key={app._id} style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', justifyContent:'space-between', alignItems:'center', transition:'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <div>
                        <div style={{ fontWeight:'700', fontSize:'13px', marginBottom:'3px' }}>{app.jobId?.title || 'Job'}</div>
                        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>{app.jobId?.department} · Score: {app.finalScore}%</div>
                      </div>
                      <span style={{ fontSize:'11px', fontWeight:'700', padding:'3px 10px', borderRadius:'20px', background:`${meta.color}15`, color:meta.color, border:`1px solid ${meta.color}30`, display:'flex', alignItems:'center', gap:'4px' }}>
                        {meta.icon} {meta.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {/* Profile Strength */}
            <div className="card" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'22px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                <span style={{ fontSize:'14px', fontWeight:'800', color:'rgba(255,255,255,0.8)', display:'flex', alignItems:'center', gap:'8px' }}>
                  <FiUser /> Profile Strength
                </span>
                <button onClick={() => navigate('/profile')} style={{ background:'none', border:'none', color:'#60a5fa', fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:'4px' }}>
                  Edit <FiArrowRight />
                </button>
              </div>
              {loading ? <Skeleton h={8} r={4} /> : (
                <>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                    <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)' }}>Completion</span>
                    <span style={{ fontSize:'14px', fontWeight:'800', color: profileStrength >= 75 ? '#22c55e' : profileStrength >= 50 ? '#f59e0b' : '#ef4444' }}>{profileStrength}%</span>
                  </div>
                  <div style={{ height:'8px', background:'rgba(255,255,255,0.06)', borderRadius:'4px', overflow:'hidden', marginBottom:'16px' }}>
                    <div style={{ height:'100%', width:`${profileStrength}%`, background: profileStrength >= 75 ? 'linear-gradient(90deg,#22c55e,#16a34a)' : profileStrength >= 50 ? '#f59e0b' : '#ef4444', borderRadius:'4px', transition:'width 1s ease' }} />
                  </div>
                  {[
                    { label:'Skills added',        done: (profile?.skills?.length || 0) > 0 },
                    { label:'Certifications',       done: (profile?.certifications?.length || 0) > 0 },
                    { label:'Experience filled',    done: (profile?.experience || 0) > 0 },
                    { label:'Department set',       done: !!profile?.department },
                  ].map((item, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'7px' }}>
                      <span style={{ fontSize:'14px', color: item.done ? '#86efac' : 'rgba(255,255,255,0.2)' }}>{item.done ? <FiCheck /> : <FiCircle />}</span>
                      <span style={{ fontSize:'12px', color: item.done ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.3)' }}>{item.label}</span>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Quick Links */}
            <div className="card" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'22px' }}>
              <div style={{ fontSize:'14px', fontWeight:'800', color:'rgba(255,255,255,0.8)', marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px' }}>
                <FiZap /> Quick Actions
              </div>
              {[
                { icon:<FiBriefcase />, label:'Browse open jobs', path:'/jobs',            color:'#3b82f6' },
                { icon:<FiFileText />, label:'My applications',  path:'/my-applications', color:'#06b6d4' },
                { icon:<FiUser />, label:'Edit my profile',  path:'/profile',         color:'#22c55e' },
              ].map((item, i) => (
                <div key={i} onClick={() => navigate(item.path)}
                  style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px', borderRadius:'10px', cursor:'pointer', marginBottom:'6px', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:`${item.color}15`, color:item.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>{item.icon}</div>
                  <span style={{ fontSize:'13px', fontWeight:'700', color:'rgba(255,255,255,0.7)' }}>{item.label}</span>
                  <span style={{ marginLeft:'auto', color:'rgba(255,255,255,0.25)', fontSize:'14px' }}><FiArrowRight /></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Open Jobs Preview */}
        <div className="card" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' }}>
            <span style={{ fontSize:'14px', fontWeight:'800', color:'rgba(255,255,255,0.8)', display:'flex', alignItems:'center', gap:'8px' }}>
              <FiBriefcase /> Open Positions
            </span>
            <button onClick={() => navigate('/jobs')} style={{ background:'none', border:'none', color:'#60a5fa', fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:'4px' }}>
              View all <FiArrowRight />
            </button>
          </div>
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px' }}>{[...Array(3)].map((_,i) => <Skeleton key={i} h={80} r={10} />)}</div>
          ) : openJobs.length === 0 ? (
            <div style={{ padding:'32px', textAlign:'center', color:'rgba(255,255,255,0.25)' }}>
              <div style={{ fontSize:'32px', marginBottom:'10px', display:'flex', justifyContent:'center' }}><FiBriefcase /></div>
              <div style={{ fontSize:'14px' }}>No open jobs at the moment</div>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px' }}>
              {openJobs.slice(0,6).map((job) => {
                const alreadyApplied = myApps.some(a => a.jobId?._id === job._id || a.jobId === job._id);
                const COLORS = ['#3b82f6','#22c55e','#f59e0b','#a78bfa','#ec4899','#06b6d4'];
                const col = COLORS[openJobs.indexOf(job) % COLORS.length];
                return (
                  <div key={job._id} className="job-card"
                    style={{ background:`${col}08`, border:`1px solid ${col}20`, borderRadius:'12px', padding:'18px', cursor:'pointer', transition:'all 0.18s' }}
                    onClick={() => navigate(`/jobs/${job._id}`)}>
                    <div style={{ fontWeight:'800', fontSize:'14px', marginBottom:'5px', color:'white' }}>{job.title}</div>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'10px' }}>{job.department} · {job.minExperience}+ yrs</div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:'11px', color:col, fontWeight:'700' }}>{job.requiredSkills?.slice(0,2).join(', ')}</span>
                      {alreadyApplied ? (
                        <span style={{ fontSize:'11px', color:'#86efac', fontWeight:'700', display:'flex', alignItems:'center', gap:'3px' }}>Applied <FiCheck /></span>
                      ) : (
                        <span style={{ fontSize:'11px', color:col, fontWeight:'700', display:'flex', alignItems:'center', gap:'3px' }}>Apply <FiArrowRight /></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
