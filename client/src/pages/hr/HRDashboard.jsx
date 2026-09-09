import { useState, useEffect } from 'react';
import NotificationBell from '../../components/NotificationBell';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiBarChart2, FiBriefcase, FiUsers, FiPlus, FiGitBranch, FiSearch, FiTarget, FiArrowRight } from 'react-icons/fi';

import { API } from '../../config/api';

const NAV_ITEMS = [
  { icon:<FiBarChart2 />, tip:'Overview',   path:null,               tab:'overview'  },
  { icon:<FiBriefcase />, tip:'Jobs',       path:null,               tab:'jobs'      },
  { icon:<FiUsers />, tip:'Candidates', path:null,               tab:'candidates'},
];
const QUICK_LINKS = [
  { icon:<FiPlus />, tip:'Post Job',   path:'/hr/post-job'   },
  { icon:<FiGitBranch />, tip:'Promotions', path:'/hr/promotions' },
  { icon:<FiBriefcase />, tip:'Org Chart',  path:'/hr/org-chart'  },
  { icon:<FiSearch />, tip:'Search',     path:'/hr/search'     },
  { icon:<FiBarChart2 />, tip:'Analytics',  path:'/hr/analytics'  },
];

function Skeleton({ w='100%', h=16, r=6 }) {
  return <div style={{ width:w, height:`${h}px`, borderRadius:`${r}px`, background:'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }} />;
}

export default function HRDashboard() {
  const [jobs,          setJobs]          = useState([]);
  const [allApplicants, setAllApplicants] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState('overview');
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    axios.get(`${API}/jobs`, { headers }).then(async (jobsRes) => {
      const jobList = jobsRes.data;
      setJobs(jobList);
      const appData = await Promise.all(
        jobList.map(job =>
          axios.get(`${API}/applications/${job._id}/applicants`, { headers })
            .then(r => ({ jobId: job._id, count: r.data.length, applicants: r.data }))
            .catch(() => ({ jobId: job._id, count: 0, applicants: [] }))
        )
      );
      setAllApplicants(appData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const totalApplicants = allApplicants.reduce((s, j) => s + j.count, 0);
  const avgScore = (() => {
    const scores = allApplicants.flatMap(j => j.applicants.map(a => a.finalScore)).filter(Boolean);
    return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  })();
  const topCandidates = allApplicants
    .flatMap(j => j.applicants.map(a => ({ ...a, jobTitle: jobs.find(jb => jb._id === j.jobId)?.title || '' })))
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 8);
  const deptBreakdown = jobs.reduce((acc, j) => { acc[j.department] = (acc[j.department] || 0) + 1; return acc; }, {});
  const openJobs      = jobs.filter(j => j.isOpen);
  const DEPT_COLORS   = ['#3b82f6','#22c55e','#f59e0b','#a78bfa','#ec4899','#06b6d4','#ef4444','#14b8a6'];

  return (
    <div style={{ minHeight:'100vh', background:'#080b14', fontFamily:"'DM Sans','Segoe UI',sans-serif", color:'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:3px; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);} }
        @keyframes shimmer { 0%{background-position:-200% 0;}100%{background-position:200% 0;} }
        .stat-card { animation:fadeUp 0.45s ease both; transition:transform 0.2s,box-shadow 0.2s; }
        .stat-card:hover { transform:translateY(-4px)!important; }
        .nav-btn:hover { background:rgba(255,255,255,0.08)!important; }
        .job-row:hover { background:rgba(255,255,255,0.04)!important; }
        .cand-row:hover { background:rgba(255,255,255,0.04)!important; }
        .quick-link:hover { background:rgba(255,255,255,0.08)!important; }
      `}</style>

      {/* Sidebar */}
      <div style={{ position:'fixed', left:0, top:0, width:'68px', height:'100vh', background:'rgba(255,255,255,0.025)', borderRight:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', alignItems:'center', paddingTop:'20px', gap:'6px', zIndex:100 }}>
        <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'linear-gradient(135deg,#1e40af,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', marginBottom:'20px', boxShadow:'0 6px 20px rgba(59,130,246,0.35)', cursor:'pointer' }} onClick={() => navigate('/hr/dashboard')}>
          <FiTarget />
        </div>

        {NAV_ITEMS.map(item => (
          <div key={item.tab} onClick={() => setActiveTab(item.tab)} title={item.tip} className="nav-btn"
            style={{ width:'42px', height:'42px', borderRadius:'11px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px', cursor:'pointer', background: activeTab===item.tab ? 'rgba(59,130,246,0.2)' : 'transparent', border: activeTab===item.tab ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent', transition:'all 0.2s' }}>
            {item.icon}
          </div>
        ))}

        <div style={{ flex:1 }} />

        {QUICK_LINKS.map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)} title={item.tip} className="quick-link"
            style={{ width:'42px', height:'42px', borderRadius:'11px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px', cursor:'pointer', transition:'all 0.2s' }}>
            {item.icon}
          </div>
        ))}

        {/* Notification Bell in sidebar */}
        <div style={{ margin:'4px 0' }}>
          <NotificationBell />
        </div>

        {/* Avatar */}
        <div title={`${user?.name} — Logout`} onClick={() => { logout(); navigate('/login'); }}
          style={{ width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#f59e0b,#d97706)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'800', cursor:'pointer', marginBottom:'16px', marginTop:'4px', boxShadow:'0 4px 12px rgba(245,158,11,0.3)' }}>
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft:'68px', padding:'32px 36px' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'32px' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
              <span style={{ background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.3)', color:'#fbbf24', padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', letterSpacing:'1px' }}>HR MANAGER</span>
              <span style={{ color:'rgba(255,255,255,0.25)' }}>•</span>
              <span style={{ color:'rgba(255,255,255,0.35)', fontSize:'13px' }}>{user?.department || 'Human Resources'}</span>
            </div>
            <h1 style={{ margin:0, fontSize:'30px', fontWeight:'800', letterSpacing:'-0.5px' }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
              <span style={{ background:'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{user?.name?.split(' ')[0]}</span>
            </h1>
            <p style={{ margin:'5px 0 0', color:'rgba(255,255,255,0.35)', fontSize:'14px' }}>Here's your recruitment pipeline overview for today.</p>
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            <button onClick={() => navigate('/hr/promotions')}
              style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.3)', color:'#a78bfa', padding:'10px 16px', borderRadius:'10px', cursor:'pointer', fontSize:'13px', fontWeight:'700', fontFamily:'inherit' }}>
              <FiGitBranch /> Vacancy Chain
            </button>
            <button onClick={() => navigate('/hr/post-job')}
              style={{ display:'flex', alignItems:'center', gap:'6px', background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', border:'none', color:'white', padding:'10px 20px', borderRadius:'10px', cursor:'pointer', fontSize:'13px', fontWeight:'700', fontFamily:'inherit', boxShadow:'0 4px 15px rgba(59,130,246,0.3)' }}>
              <FiPlus /> Post New Job
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div style={{ display:'flex', gap:'4px', background:'rgba(255,255,255,0.04)', borderRadius:'12px', padding:'4px', marginBottom:'28px', width:'fit-content' }}>
          {NAV_ITEMS.map(tab => (
            <button key={tab.tab} onClick={() => setActiveTab(tab.tab)}
              style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 20px', borderRadius:'9px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:'700', background: activeTab===tab.tab ? 'rgba(59,130,246,0.2)' : 'transparent', color: activeTab===tab.tab ? '#60a5fa' : 'rgba(255,255,255,0.4)', fontFamily:'inherit', transition:'all 0.15s' }}>
              {tab.icon} {tab.tip}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'18px', marginBottom:'28px' }}>
              {[
                { label:'Open Positions',   value: loading ? null : openJobs.length,      icon:<FiBriefcase />, color:'#3b82f6', sub:'Active postings',    delay:'0s'    },
                { label:'Total Applicants', value: loading ? null : totalApplicants,      icon:<FiUsers />, color:'#22c55e', sub:'Across all jobs',     delay:'0.08s' },
                { label:'Avg Score',        value: loading ? null : `${avgScore}%`,        icon:<FiTarget />, color:'#f59e0b', sub:'Candidate quality',   delay:'0.16s' },
                { label:'Departments',      value: loading ? null : Object.keys(deptBreakdown).length, icon:<FiBriefcase />, color:'#a78bfa', sub:'Hiring across teams', delay:'0.24s' },
              ].map((stat, i) => (
                <div key={i} className="stat-card" style={{ background:`${stat.color}0d`, border:`1px solid ${stat.color}20`, borderRadius:'16px', padding:'22px', animationDelay:stat.delay }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px' }}>
                    <div style={{ width:'42px', height:'42px', borderRadius:'11px', background:`${stat.color}18`, color:stat.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'19px' }}>{stat.icon}</div>
                    <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:stat.color, display:'block', marginTop:'5px' }} />
                  </div>
                  {stat.value === null ? <Skeleton h={36} r={8} /> : (
                    <div style={{ fontSize:'34px', fontWeight:'900', color:'white', letterSpacing:'-1px', marginBottom:'4px' }}>{stat.value}</div>
                  )}
                  <div style={{ fontSize:'14px', fontWeight:'700', color:'rgba(255,255,255,0.75)', marginBottom:'2px' }}>{stat.label}</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)' }}>{stat.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:'18px', marginBottom:'18px' }}>
              {/* Department Breakdown */}
              <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'24px' }}>
                <h3 style={{ margin:'0 0 18px', fontSize:'14px', fontWeight:'800', color:'rgba(255,255,255,0.8)', textTransform:'uppercase', letterSpacing:'0.5px', display:'flex', alignItems:'center', gap:'8px' }}>
                  <FiBriefcase /> By Department
                </h3>
                {loading ? [...Array(4)].map((_,i) => <div key={i} style={{ marginBottom:'14px' }}><Skeleton h={12} /><div style={{ height:'6px' }} /></div>) :
                  Object.keys(deptBreakdown).length === 0 ? <div style={{ color:'rgba(255,255,255,0.25)', fontSize:'13px', textAlign:'center', padding:'20px' }}>No jobs posted yet</div> :
                  Object.entries(deptBreakdown).map(([dept, count]) => {
                    const pct = Math.round((count / jobs.length) * 100);
                    const col = DEPT_COLORS[Object.keys(deptBreakdown).indexOf(dept) % DEPT_COLORS.length];
                    return (
                      <div key={dept} style={{ marginBottom:'13px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                          <span style={{ fontSize:'13px', fontWeight:'600', color:'rgba(255,255,255,0.7)' }}>{dept}</span>
                          <span style={{ fontSize:'13px', fontWeight:'800', color:col }}>{count}</span>
                        </div>
                        <div style={{ height:'5px', background:'rgba(255,255,255,0.06)', borderRadius:'3px', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background:col, borderRadius:'3px', transition:'width 0.8s ease' }} />
                        </div>
                      </div>
                    );
                  })
                }
              </div>

              {/* Recent Jobs */}
              <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'24px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' }}>
                  <h3 style={{ margin:0, fontSize:'14px', fontWeight:'800', color:'rgba(255,255,255,0.8)', textTransform:'uppercase', letterSpacing:'0.5px', display:'flex', alignItems:'center', gap:'8px' }}>
                    <FiBriefcase /> Recent Jobs
                  </h3>
                  <button onClick={() => setActiveTab('jobs')} style={{ background:'none', border:'none', color:'#60a5fa', fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:'4px' }}>
                    View all <FiArrowRight />
                  </button>
                </div>
                {loading ? [...Array(4)].map((_,i) => <div key={i} style={{ marginBottom:'12px' }}><Skeleton h={52} r={10} /></div>) :
                  jobs.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'32px', color:'rgba(255,255,255,0.25)' }}>
                      <div style={{ fontSize:'32px', marginBottom:'10px', display:'flex', justifyContent:'center' }}><FiBriefcase /></div>
                      <div style={{ fontSize:'13px' }}>No jobs posted yet</div>
                      <button onClick={() => navigate('/hr/post-job')} style={{ marginTop:'12px', background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.3)', color:'#60a5fa', padding:'7px 14px', borderRadius:'8px', cursor:'pointer', fontSize:'12px', fontWeight:'700', fontFamily:'inherit' }}>Post a Job</button>
                    </div>
                  ) :
                  jobs.slice(0,5).map((job) => {
                    const appInfo = allApplicants.find(a => a.jobId === job._id);
                    return (
                      <div key={job._id} className="job-row" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', borderRadius:'10px', marginBottom:'6px', cursor:'pointer', border:'1px solid transparent', transition:'all 0.15s' }}
                        onClick={() => navigate(`/hr/applicants/${job._id}`)}>
                        <div>
                          <div style={{ fontWeight:'700', fontSize:'14px', marginBottom:'3px' }}>{job.title}</div>
                          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>{job.department} · {appInfo?.count || 0} applicants</div>
                        </div>
                        <span style={{ fontSize:'11px', fontWeight:'700', padding:'3px 10px', borderRadius:'20px', background: job.isOpen ? 'rgba(34,197,94,0.12)' : 'rgba(100,116,139,0.12)', color: job.isOpen ? '#86efac' : '#94a3b8', border: `1px solid ${job.isOpen ? 'rgba(34,197,94,0.3)' : 'rgba(100,116,139,0.2)'}` }}>
                          {job.isOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                    );
                  })
                }
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'14px' }}>
              {[
                { icon:<FiBarChart2 />, title:'Analytics',    desc:'Hiring funnel, skill heatmap & promotions', color:'#06b6d4', action:() => navigate('/hr/analytics') },
                { icon:<FiSearch />, title:'Search',       desc:'Find candidates by skill, score or dept',   color:'#3b82f6', action:() => navigate('/hr/search') },
                { icon:<FiBriefcase />, title:'Org Chart',    desc:'Visualize the company hierarchy',           color:'#a78bfa', action:() => navigate('/hr/org-chart') },
                { icon:<FiGitBranch />, title:'Promotions',   desc:'Run DFS vacancy chain analysis',            color:'#22c55e', action:() => navigate('/hr/promotions') },
                { icon:<FiPlus />, title:'Post Job',     desc:'Add a new open position',                   color:'#f59e0b', action:() => navigate('/hr/post-job') },
              ].map((item, i) => (
                <div key={i} onClick={item.action}
                  style={{ background:`${item.color}0a`, border:`1px solid ${item.color}1a`, borderRadius:'14px', padding:'20px', cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor=`${item.color}40`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)';    e.currentTarget.style.borderColor=`${item.color}1a`; }}>
                  <div style={{ fontSize:'24px', color:item.color, marginBottom:'10px' }}>{item.icon}</div>
                  <div style={{ fontSize:'14px', fontWeight:'800', color:'rgba(255,255,255,0.9)', marginBottom:'4px' }}>{item.title}</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', lineHeight:'1.4' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* JOBS TAB */}
        {activeTab === 'jobs' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <div style={{ fontSize:'16px', fontWeight:'800', color:'rgba(255,255,255,0.8)' }}>
                {loading ? '—' : `${jobs.length} Job Postings`}
              </div>
              <button onClick={() => navigate('/hr/post-job')}
                style={{ display:'flex', alignItems:'center', gap:'6px', background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', border:'none', color:'white', padding:'9px 18px', borderRadius:'9px', cursor:'pointer', fontSize:'13px', fontWeight:'700', fontFamily:'inherit' }}>
                <FiPlus /> Post New Job
              </button>
            </div>
            <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden' }}>
              {loading ? (
                <div style={{ padding:'24px' }}>{[...Array(5)].map((_,i) => <div key={i} style={{ marginBottom:'14px' }}><Skeleton h={60} r={10} /></div>)}</div>
              ) : jobs.length === 0 ? (
                <div style={{ padding:'60px', textAlign:'center', color:'rgba(255,255,255,0.25)' }}>
                  <div style={{ fontSize:'40px', marginBottom:'12px', display:'flex', justifyContent:'center' }}><FiBriefcase /></div>
                  <div style={{ fontSize:'15px', fontWeight:'700', marginBottom:'8px' }}>No jobs posted yet</div>
                  <button onClick={() => navigate('/hr/post-job')} style={{ background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.3)', color:'#60a5fa', padding:'9px 18px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'700', fontFamily:'inherit' }}>Post First Job</button>
                </div>
              ) : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                      {['Job Title','Department','Experience','Applicants','Status','Actions'].map(h => (
                        <th key={h} style={{ textAlign:'left', padding:'14px 18px', fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => {
                      const appInfo = allApplicants.find(a => a.jobId === job._id);
                      return (
                        <tr key={job._id} className="job-row" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.15s' }}>
                          <td style={{ padding:'14px 18px' }}>
                            <div style={{ fontWeight:'700', fontSize:'14px', marginBottom:'3px' }}>{job.title}</div>
                            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'220px' }}>{job.description?.slice(0,60)}...</div>
                          </td>
                          <td style={{ padding:'14px 18px', color:'rgba(255,255,255,0.6)', fontSize:'13px' }}>{job.department}</td>
                          <td style={{ padding:'14px 18px', color:'rgba(255,255,255,0.5)', fontSize:'13px' }}>{job.minExperience}+ yrs</td>
                          <td style={{ padding:'14px 18px' }}>
                            <span style={{ fontWeight:'800', fontSize:'16px', color:'#60a5fa' }}>{appInfo?.count || 0}</span>
                          </td>
                          <td style={{ padding:'14px 18px' }}>
                            <span style={{ fontSize:'11px', fontWeight:'700', padding:'3px 10px', borderRadius:'20px', background: job.isOpen ? 'rgba(34,197,94,0.12)' : 'rgba(100,116,139,0.1)', color: job.isOpen ? '#86efac' : '#94a3b8', border: `1px solid ${job.isOpen ? 'rgba(34,197,94,0.25)' : 'rgba(100,116,139,0.2)'}` }}>
                              {job.isOpen ? 'Open' : 'Closed'}
                            </span>
                          </td>
                          <td style={{ padding:'14px 18px' }}>
                            <button onClick={() => navigate(`/hr/applicants/${job._id}`)}
                              style={{ background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.25)', color:'#60a5fa', padding:'6px 13px', borderRadius:'7px', cursor:'pointer', fontSize:'12px', fontWeight:'700', fontFamily:'inherit' }}>
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* CANDIDATES TAB */}
        {activeTab === 'candidates' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <div style={{ fontSize:'16px', fontWeight:'800', color:'rgba(255,255,255,0.8)' }}>
                Top {topCandidates.length} Candidates by Score
              </div>
              <button onClick={() => navigate('/hr/search')}
                style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.25)', color:'#60a5fa', padding:'9px 16px', borderRadius:'9px', cursor:'pointer', fontSize:'13px', fontWeight:'700', fontFamily:'inherit' }}>
                <FiSearch /> Advanced Search
              </button>
            </div>
            <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden' }}>
              {loading ? (
                <div style={{ padding:'24px' }}>{[...Array(5)].map((_,i) => <div key={i} style={{ marginBottom:'14px' }}><Skeleton h={56} r={10} /></div>)}</div>
              ) : topCandidates.length === 0 ? (
                <div style={{ padding:'60px', textAlign:'center', color:'rgba(255,255,255,0.25)' }}>
                  <div style={{ fontSize:'40px', marginBottom:'12px', display:'flex', justifyContent:'center' }}><FiUsers /></div>
                  <div style={{ fontSize:'15px', fontWeight:'700' }}>No candidates yet</div>
                  <div style={{ fontSize:'13px', marginTop:'6px' }}>Candidates appear once employees apply for jobs</div>
                </div>
              ) : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                      {['Rank','Candidate','Applied For','Score','Skill','Exp','Status'].map(h => (
                        <th key={h} style={{ textAlign:'left', padding:'14px 18px', fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.5px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topCandidates.map((c, i) => {
                      const statusColor = { approved:'#22c55e', shortlisted:'#a78bfa', rejected:'#ef4444', pending:'#f59e0b' }[c.status] || '#94a3b8';
                      return (
                        <tr key={c._id} className="cand-row" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.15s' }}>
                          <td style={{ padding:'14px 18px' }}>
                            <span style={{ width:'28px', height:'28px', borderRadius:'50%', background: i < 3 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)', color: i < 3 ? '#fbbf24' : 'rgba(255,255,255,0.4)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'800', border: i < 3 ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.08)' }}>
                              {i + 1}
                            </span>
                          </td>
                          <td style={{ padding:'14px 18px' }}>
                            <div style={{ fontWeight:'700', fontSize:'14px' }}>{c.userId?.name || 'Candidate'}</div>
                            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)' }}>{c.userId?.department}</div>
                          </td>
                          <td style={{ padding:'14px 18px', color:'rgba(255,255,255,0.55)', fontSize:'13px' }}>{c.jobTitle}</td>
                          <td style={{ padding:'14px 18px' }}>
                            <span style={{ fontWeight:'900', fontSize:'16px', color: c.finalScore >= 70 ? '#22c55e' : c.finalScore >= 50 ? '#f59e0b' : '#ef4444' }}>{c.finalScore}%</span>
                          </td>
                          <td style={{ padding:'14px 18px', color:'rgba(255,255,255,0.5)', fontSize:'13px' }}>{c.skillScore}%</td>
                          <td style={{ padding:'14px 18px', color:'rgba(255,255,255,0.5)', fontSize:'13px' }}>{c.expScore}%</td>
                          <td style={{ padding:'14px 18px' }}>
                            <span style={{ fontSize:'11px', fontWeight:'700', padding:'3px 9px', borderRadius:'20px', background:`${statusColor}15`, color:statusColor, border:`1px solid ${statusColor}35`, textTransform:'capitalize' }}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
