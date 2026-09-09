import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../../components/NotificationBell';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, Cell,
} from 'recharts';
import {
  FiBriefcase, FiFileText, FiCheckCircle, FiXCircle, FiClock,
  FiCalendar, FiTarget, FiUsers, FiBarChart2, FiAward,
  FiGitBranch, FiAlertTriangle, FiRefreshCw, FiTrendingDown, FiTrendingUp,
} from 'react-icons/fi';
import { FaStar, FaTrophy, FaFire } from 'react-icons/fa';

import { API } from '../../config/api';

const C = {
  blue:'#3b82f6', purple:'#8b5cf6', green:'#22c55e',
  amber:'#f59e0b', red:'#ef4444', teal:'#14b8a6',
  pink:'#ec4899', indigo:'#6366f1', cyan:'#06b6d4',
};
const DEPT_COLORS = [C.blue,C.purple,C.green,C.amber,C.red,C.teal,C.pink,C.indigo,C.cyan];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'rgba(15,23,42,0.97)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'12px 16px', fontSize:'13px', minWidth:'140px' }}>
      {label && <div style={{ color:'rgba(255,255,255,0.5)', fontWeight:'700', marginBottom:'8px', fontSize:'11px', textTransform:'uppercase' }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display:'flex', justifyContent:'space-between', gap:'20px', color:'white', marginBottom:'4px' }}>
          <span style={{ color: p.color || 'rgba(255,255,255,0.6)' }}>{p.name}</span>
          <span style={{ fontWeight:'800' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function Section({ title, subtitle, icon, children, delay = '0s' }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'18px', padding:'28px', animation:`fadeUp 0.5s ease ${delay} both` }}>
      <div style={{ marginBottom:'22px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
          <span style={{ fontSize:'18px', color:'#60a5fa' }}>{icon}</span>
          <h3 style={{ margin:0, fontSize:'17px', fontWeight:'800', color:'white' }}>{title}</h3>
        </div>
        {subtitle && <p style={{ margin:'0 0 0 28px', fontSize:'12px', color:'rgba(255,255,255,0.35)', fontWeight:'500' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function KPI({ label, value, sub, color, icon, delay }) {
  return (
    <div style={{ background:`${color}0d`, border:`1px solid ${color}22`, borderRadius:'16px', padding:'22px', animation:`fadeUp 0.5s ease ${delay} both`, transition:'transform 0.2s' }}
      onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'}
      onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px' }}>
        <div style={{ width:'42px', height:'42px', borderRadius:'11px', background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'19px', color }}>{icon}</div>
        <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:color, marginTop:'6px' }} />
      </div>
      <div style={{ fontSize:'34px', fontWeight:'900', letterSpacing:'-1px', color:'white', marginBottom:'5px' }}>{value ?? '—'}</div>
      <div style={{ fontSize:'14px', fontWeight:'700', color:'rgba(255,255,255,0.7)', marginBottom:'3px' }}>{label}</div>
      {sub && <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)' }}>{sub}</div>}
    </div>
  );
}

function Skeleton({ h = 280 }) {
  return <div style={{ height:`${h}px`, borderRadius:'10px', background:'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }} />;
}

function SkillBar({ skill, count, max, color }) {
  const pct = max ? Math.round((count / max) * 100) : 0;
  const label = skill && typeof skill === 'object'
    ? (skill.name || skill.cert || JSON.stringify(skill))
    : String(skill || '');
  return (
    <div style={{ marginBottom:'10px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px' }}>
        <span style={{ fontSize:'13px', fontWeight:'600', color:'rgba(255,255,255,0.8)', textTransform:'capitalize' }}>{label}</span>
        <span style={{ fontSize:'12px', fontWeight:'800', color }}>×{count}</span>
      </div>
      <div style={{ height:'6px', background:'rgba(255,255,255,0.06)', borderRadius:'3px', overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:'3px', transition:'width 0.8s ease' }} />
      </div>
    </div>
  );
}

function EmptyState({ icon=<FiBarChart2 />, title='No data yet', sub='Data will appear once your team starts using Vactrix.' }) {
  return (
    <div style={{ padding:'48px 24px', textAlign:'center', color:'rgba(255,255,255,0.3)' }}>
      <div style={{ fontSize:'36px', marginBottom:'12px', display:'flex', justifyContent:'center', color:'rgba(255,255,255,0.4)' }}>{icon}</div>
      <div style={{ fontSize:'15px', fontWeight:'700', marginBottom:'6px', color:'rgba(255,255,255,0.5)' }}>{title}</div>
      <div style={{ fontSize:'13px' }}>{sub}</div>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div style={{ padding:'40px', textAlign:'center' }}>
      <div style={{ fontSize:'36px', marginBottom:'12px', color:'#fca5a5', display:'flex', justifyContent:'center' }}><FiAlertTriangle /></div>
      <div style={{ fontSize:'14px', fontWeight:'600', color:'rgba(255,255,255,0.5)', marginBottom:'14px' }}>Failed to load data</div>
      {onRetry && <button onClick={onRetry} style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.3)', color:'#60a5fa', padding:'8px 18px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'700', fontFamily:'inherit' }}><FiRefreshCw /> Retry</button>}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [funnel,   setFunnel]   = useState(null);
  const [dept,     setDept]     = useState(null);
  const [skills,   setSkills]   = useState(null);
  const [promos,   setPromos]   = useState(null);
  const [loading,  setLoading]  = useState({ funnel:true, dept:true, skills:true, promos:true });
  const [errors,   setErrors]   = useState({ funnel:false, dept:false, skills:false, promos:false });
  const [activeSection, setActiveSection] = useState('funnel');
  const { token } = useAuth();
  const navigate  = useNavigate();

  const load = useCallback(() => {
    const h = { Authorization: `Bearer ${token}` };
    setLoading({ funnel:true, dept:true, skills:true, promos:true });
    setErrors({ funnel:false, dept:false, skills:false, promos:false });

    axios.get(`${API}/analytics/hiring-funnel`,  { headers: h })
      .then(r => { setFunnel(r.data);  setLoading(p=>({...p,funnel:false})); })
      .catch(()=>{ setErrors(p=>({...p,funnel:true})); setLoading(p=>({...p,funnel:false})); });

    axios.get(`${API}/analytics/department`,     { headers: h })
      .then(r => { setDept(r.data);    setLoading(p=>({...p,dept:false})); })
      .catch(()=>{ setErrors(p=>({...p,dept:true})); setLoading(p=>({...p,dept:false})); });

    axios.get(`${API}/analytics/skills`,         { headers: h })
      .then(r => { setSkills(r.data);  setLoading(p=>({...p,skills:false})); })
      .catch(()=>{ setErrors(p=>({...p,skills:true})); setLoading(p=>({...p,skills:false})); });

    axios.get(`${API}/analytics/promotions`,     { headers: h })
      .then(r => { setPromos(r.data);  setLoading(p=>({...p,promos:false})); })
      .catch(()=>{ setErrors(p=>({...p,promos:true})); setLoading(p=>({...p,promos:false})); });
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const NAV = [
    { id:'funnel',   icon:<FiTrendingDown />, label:'Hiring Funnel'  },
    { id:'dept',     icon:<FiBriefcase />,    label:'Departments'     },
    { id:'skills',   icon:<FaFire />,          label:'Skill Heatmap'  },
    { id:'promos',   icon:<FiTrendingUp />,   label:'Promotions'     },
  ];

  const kpis = funnel ? [
    { label:'Total Applications', value:funnel.totals?.total,      icon:<FiFileText />, color:C.blue,   sub:'All time',               delay:'0s'    },
    { label:'Hired',              value:funnel.totals?.hired,      icon:<FiCheckCircle />, color:C.green,  sub:`${funnel.conversionRate||'0%'} conv. rate`, delay:'0.06s' },
    { label:'Shortlisted',        value:funnel.totals?.shortlisted,icon:<FaStar />, color:C.purple, sub:'Under consideration',     delay:'0.12s' },
    { label:'Rejected',           value:funnel.totals?.rejected,   icon:<FiXCircle />, color:C.red,    sub:'Not progressed',         delay:'0.18s' },
    { label:'Pending Review',     value:funnel.totals?.pending,    icon:<FiClock />, color:C.amber,  sub:'Awaiting decision',       delay:'0.24s' },
    { label:'Open Jobs',          value:dept?.departments?.reduce((s,d)=>s+d.openJobs,0)??'—', icon:<FiBriefcase />, color:C.teal, sub:'Across all departments', delay:'0.3s' },
  ] : [];

  const safeSkillGap = (skills?.skillGap || [])
    .filter(s => typeof s.gap === 'number')
    .map(s => ({
      ...s,
      skill: typeof s.skill === 'object' ? (s.skill?.name || String(s.skill)) : (s.skill || ''),
    }));
  const maxGap = safeSkillGap.length > 0 ? Math.max(...safeSkillGap.map(x => x.gap), 1) : 1;

  const vacancyData = Object.entries(dept?.vacancies || {})
    .filter(([,v]) => v > 0)
    .map(([k,v]) => ({ department: k, vacant: v }));

  return (
    <div style={{ minHeight:'100vh', background:'#060910', fontFamily:"'DM Sans','Segoe UI',sans-serif", color:'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
        @keyframes shimmer  { 0%{background-position:200% 0;}100%{background-position:-200% 0;} }
        .recharts-text { fill: rgba(255,255,255,0.45) !important; font-family:'DM Sans',sans-serif !important; font-size:11px !important; }
        .recharts-cartesian-axis-tick-value { fill: rgba(255,255,255,0.4) !important; }
        .recharts-legend-item-text { color: rgba(255,255,255,0.7) !important; font-size:12px !important; }
        .nav-pill:hover { background:rgba(255,255,255,0.08)!important; }
        .nav-pill { transition:all 0.15s; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:3px; }
      `}</style>

      {/* Sidebar */}
      <div style={{ position:'fixed', left:0, top:0, width:'68px', height:'100vh', background:'rgba(255,255,255,0.025)', borderRight:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', alignItems:'center', paddingTop:'20px', gap:'6px', zIndex:100 }}>
        <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'linear-gradient(135deg,#1e40af,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', marginBottom:'20px', cursor:'pointer', boxShadow:'0 6px 18px rgba(59,130,246,0.35)' }} onClick={() => navigate('/hr/dashboard')}>
          <FiTarget />
        </div>
        {NAV.map(n => (
          <div key={n.id} onClick={() => setActiveSection(n.id)} title={n.label} className="nav-pill"
            style={{ width:'42px', height:'42px', borderRadius:'11px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px', cursor:'pointer', background: activeSection===n.id ? 'rgba(59,130,246,0.2)' : 'transparent', border: activeSection===n.id ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent' }}>
            {n.icon}
          </div>
        ))}
        <div style={{ flex:1 }} />
        <div style={{ marginBottom:'16px' }}>
          <NotificationBell />
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft:'68px' }}>
      <div style={{ padding:'32px 36px', maxWidth:'1800px', margin:'0 auto' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'32px' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
              <span style={{ background:'rgba(59,130,246,0.15)', border:'1px solid rgba(59,130,246,0.3)', color:'#93c5fd', padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', letterSpacing:'1px' }}>ANALYTICS</span>
            </div>
            <h1 style={{ margin:0, fontSize:'30px', fontWeight:'900', letterSpacing:'-0.5px' }}>HR Analytics Dashboard</h1>
            <p style={{ margin:'5px 0 0', color:'rgba(255,255,255,0.35)', fontSize:'14px' }}>Hiring funnel · Skill heatmap · Department analytics · Promotions</p>
          </div>
          <button onClick={load} style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.25)', color:'#60a5fa', padding:'10px 18px', borderRadius:'10px', cursor:'pointer', fontSize:'13px', fontWeight:'700', fontFamily:'inherit' }}>
            <FiRefreshCw /> Refresh
          </button>
        </div>

        {/* KPI Row */}
        {!loading.funnel && !loading.dept && funnel && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'14px', marginBottom:'32px' }}>
            {kpis.map((k,i) => <KPI key={i} {...k} />)}
          </div>
        )}
        {(loading.funnel || loading.dept) && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'14px', marginBottom:'32px' }}>
            {[...Array(6)].map((_,i) => <Skeleton key={i} h={120} />)}
          </div>
        )}

        {/* Section Nav */}
        <div style={{ display:'flex', gap:'4px', background:'rgba(255,255,255,0.04)', borderRadius:'12px', padding:'4px', marginBottom:'28px', width:'fit-content' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setActiveSection(n.id)}
              style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 18px', borderRadius:'9px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:'700', background: activeSection===n.id ? 'rgba(59,130,246,0.2)' : 'transparent', color: activeSection===n.id ? '#60a5fa' : 'rgba(255,255,255,0.4)', fontFamily:'inherit', transition:'all 0.15s' }}>
              {n.icon} {n.label}
            </button>
          ))}
        </div>

        {/* FUNNEL */}
        {activeSection === 'funnel' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:'20px' }}>
              <Section icon={<FiTrendingDown />} title="Hiring Funnel" subtitle="Application pipeline by stage">
                {loading.funnel ? <Skeleton /> : errors.funnel ? <ErrorState onRetry={load} /> :
                  !funnel?.funnel?.length ? <EmptyState icon={<FiTrendingDown />} title="No applications yet" /> : (
                  <div>
                    {funnel.funnel.map((stage, i) => (
                      <div key={i} style={{ marginBottom:'14px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'7px' }}>
                          <span style={{ fontSize:'13px', fontWeight:'700', color:'rgba(255,255,255,0.8)' }}>{stage.stage}</span>
                          <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                            <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>{stage.pct}%</span>
                            <span style={{ fontSize:'16px', fontWeight:'900', color:stage.color }}>{stage.count}</span>
                          </div>
                        </div>
                        <div style={{ height:'8px', background:'rgba(255,255,255,0.06)', borderRadius:'4px', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${stage.pct}%`, background:stage.color, borderRadius:'4px', transition:'width 0.9s ease' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section icon={<FiCalendar />} title="Monthly Application Trend" subtitle="Applications vs. hires over 6 months" delay="0.06s">
                {loading.funnel ? <Skeleton /> : errors.funnel ? <ErrorState onRetry={load} /> :
                  !funnel?.monthlyTrend?.length ? <EmptyState icon={<FiCalendar />} title="No trend data" /> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={funnel.monthlyTrend} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                      <defs>
                        <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.blue} stopOpacity={0.3}/><stop offset="95%" stopColor={C.blue} stopOpacity={0}/></linearGradient>
                        <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.green} stopOpacity={0.3}/><stop offset="95%" stopColor={C.green} stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fill:'rgba(255,255,255,0.4)', fontSize:11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill:'rgba(255,255,255,0.4)', fontSize:11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize:'12px', paddingTop:'10px' }} />
                      <Area type="monotone" dataKey="applied" name="Applied" stroke={C.blue} fill="url(#gradBlue)" strokeWidth={2} />
                      <Area type="monotone" dataKey="hired"   name="Hired"   stroke={C.green} fill="url(#gradGreen)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Section>
            </div>

            <Section icon={<FiTarget />} title="Score Distribution" subtitle="Candidate quality breakdown by score range" delay="0.1s">
              {loading.funnel ? <Skeleton h={200} /> : errors.funnel ? <ErrorState onRetry={load} /> :
                !funnel?.scoreDistribution?.length ? <EmptyState icon={<FiTarget />} title="No score data yet" sub="Score distribution appears once candidates are scored." /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={funnel.scoreDistribution} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="range" tick={{ fill:'rgba(255,255,255,0.4)', fontSize:11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:'rgba(255,255,255,0.4)', fontSize:11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Candidates" radius={[6,6,0,0]}>
                      {funnel.scoreDistribution.map((_,i) => <Cell key={i} fill={DEPT_COLORS[i%DEPT_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Section>
          </div>
        )}

        {/* DEPARTMENTS */}
        {activeSection === 'dept' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
            <Section icon={<FiBriefcase />} title="Department Overview" subtitle="Jobs, applications, and hiring metrics per department">
              {loading.dept ? <Skeleton h={200} /> : errors.dept ? <ErrorState onRetry={load} /> :
                !dept?.departments?.length ? <EmptyState icon={<FiBriefcase />} title="No department data" /> : (
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                    <thead>
                      <tr>
                        {['Department','Open Jobs','Total Apps','Hired','Shortlisted','Avg Score','Hiring Rate'].map(h => (
                          <th key={h} style={{ textAlign:'left', padding:'10px 14px', color:'rgba(255,255,255,0.4)', fontWeight:'700', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dept.departments.map((d,i) => (
                        <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.15s' }}
                          onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <td style={{ padding:'12px 14px', fontWeight:'700', color:'white' }}>{d.department}</td>
                          <td style={{ padding:'12px 14px', color:C.blue, fontWeight:'700' }}>{d.openJobs}</td>
                          <td style={{ padding:'12px 14px', color:'rgba(255,255,255,0.7)' }}>{d.totalApps}</td>
                          <td style={{ padding:'12px 14px', color:C.green, fontWeight:'700' }}>{d.hired}</td>
                          <td style={{ padding:'12px 14px', color:C.purple }}>{d.shortlisted}</td>
                          <td style={{ padding:'12px 14px', color:C.amber }}>{d.avgScore}%</td>
                          <td style={{ padding:'12px 14px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                              <div style={{ flex:1, height:'5px', background:'rgba(255,255,255,0.06)', borderRadius:'3px', overflow:'hidden' }}>
                                <div style={{ height:'100%', width:`${d.hiringRate}%`, background:C.green, borderRadius:'3px' }} />
                              </div>
                              <span style={{ fontSize:'12px', fontWeight:'700', color:C.green, minWidth:'32px' }}>{d.hiringRate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
              <Section icon={<FiUsers />} title="Headcount by Department" subtitle="Current employee distribution" delay="0.06s">
                {loading.dept ? <Skeleton /> : errors.dept ? <ErrorState onRetry={load} /> :
                  !dept?.headcount?.length ? <EmptyState icon={<FiUsers />} title="No headcount data" /> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart data={dept.headcount.slice(0,8)}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="_id" tick={{ fill:'rgba(255,255,255,0.45)', fontSize:11 }} />
                      <PolarRadiusAxis tick={{ fill:'rgba(255,255,255,0.3)', fontSize:9 }} />
                      <Radar name="Headcount" dataKey="count" stroke={C.blue} fill={C.blue} fillOpacity={0.2} strokeWidth={2} />
                      <Tooltip content={<ChartTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </Section>

              <Section icon={<FiTrendingDown />} title="Vacancy by Department" subtitle="Open positions from org chart" delay="0.1s">
                {loading.dept ? <Skeleton /> : errors.dept ? <ErrorState onRetry={load} /> :
                  !vacancyData.length ? <EmptyState icon={<FiCheckCircle />} title="No vacancies" sub="All positions are filled." /> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={vacancyData} layout="vertical" margin={{ top:5, right:20, left:20, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" tick={{ fill:'rgba(255,255,255,0.4)', fontSize:11 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="department" type="category" tick={{ fill:'rgba(255,255,255,0.5)', fontSize:11 }} axisLine={false} tickLine={false} width={100} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="vacant" name="Vacant Positions" radius={[0,5,5,0]}>
                        {vacancyData.map((_,i) => <Cell key={i} fill={DEPT_COLORS[i%DEPT_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Section>
            </div>

            <Section icon={<FiBarChart2 />} title="Hiring Trend by Department" subtitle="Monthly hires — top 5 departments" delay="0.14s">
              {loading.dept ? <Skeleton h={200} /> : errors.dept ? <ErrorState onRetry={load} /> :
                !dept?.deptTrend?.length || !dept?.topDepts?.length ? <EmptyState icon={<FiBarChart2 />} title="No trend data yet" /> : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={dept.deptTrend} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill:'rgba(255,255,255,0.4)', fontSize:11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:'rgba(255,255,255,0.4)', fontSize:11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize:'12px' }} />
                    {dept.topDepts.map((d, i) => (
                      <Line key={d} type="monotone" dataKey={d} name={d} stroke={DEPT_COLORS[i%DEPT_COLORS.length]} strokeWidth={2} dot={{ r:3 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Section>
          </div>
        )}

        {/* SKILL HEATMAP */}
        {activeSection === 'skills' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
              <Section icon={<FiCheckCircle />} title="Top Available Skills" subtitle="Skills employees currently have">
                {loading.skills ? <Skeleton /> : errors.skills ? <ErrorState onRetry={load} /> :
                  !(skills?.availableSkills?.length) ? <EmptyState icon={<FiCheckCircle />} title="No skills recorded" sub="Add skills to employee profiles." /> :
                  skills.availableSkills.slice(0,12).map((s,i) => (
                    <SkillBar key={i} skill={s.skill} count={s.count} max={skills.availableSkills[0]?.count||1} color={C.green} />
                  ))
                }
              </Section>

              <Section icon={<FiFileText />} title="Most Required Skills" subtitle="Skills jobs demand most" delay="0.06s">
                {loading.skills ? <Skeleton /> : errors.skills ? <ErrorState onRetry={load} /> :
                  !(skills?.requiredSkills?.length) ? <EmptyState icon={<FiFileText />} title="No required skills" sub="Post jobs with required skills to see data." /> :
                  skills.requiredSkills.slice(0,12).map((s,i) => (
                    <SkillBar key={i} skill={s.skill} count={s.count} max={skills.requiredSkills[0]?.count||1} color={C.blue} />
                  ))
                }
              </Section>
            </div>

            {/* Skill Gap Heatmap */}
            <Section icon={<FaFire />} title="Skill Gap Analysis — Heatmap" subtitle="Required demand vs available supply. Bigger gap = urgent hiring need" delay="0.1s">
              {loading.skills ? <Skeleton h={200} /> : errors.skills ? <ErrorState onRetry={load} /> :
                !safeSkillGap.length ? <EmptyState icon={<FaFire />} title="No skill gap data" sub="Gaps appear once jobs have required skills and employees have skill data." /> : (
                <div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:'10px', marginBottom:'20px' }}>
                    {safeSkillGap.slice(0,15).map((s,i) => {
                      const intensity = maxGap > 0 ? Math.min(Math.abs(s.gap) / maxGap, 1) : 0;
                      const skillLabel = typeof s.skill === 'object' ? (s.skill?.name || String(s.skill)) : (s.skill || '');
                      const isGap = s.gap > 0;
                      const bg     = isGap ? `rgba(239,68,68,${0.07 + intensity * 0.33})` : `rgba(34,197,94,${0.07 + intensity * 0.2})`;
                      const border = isGap ? `rgba(239,68,68,${0.15 + intensity * 0.45})` : `rgba(34,197,94,${0.2})`;
                      return (
                        <div key={i} style={{ background:bg, border:`1px solid ${border}`, borderRadius:'10px', padding:'12px 14px', transition:'transform 0.15s', cursor:'default' }}
                          onMouseEnter={e=>e.currentTarget.style.transform='scale(1.03)'}
                          onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                          <div style={{ fontWeight:'700', fontSize:'12px', color:'rgba(255,255,255,0.85)', textTransform:'capitalize', marginBottom:'6px' }}>{skillLabel}</div>
                          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', color:'rgba(255,255,255,0.45)', marginBottom:'6px' }}>
                            <span>Need: <b style={{ color:C.red }}>{s.required}</b></span>
                            <span>Have: <b style={{ color:C.green }}>{s.available}</b></span>
                          </div>
                          <div style={{ fontSize:'13px', fontWeight:'900', color: isGap ? C.red : C.green, display:'flex', alignItems:'center', gap:'4px' }}>
                            {isGap ? <><FiAlertTriangle size={12} /> Gap: {s.gap}</> : <><FiCheckCircle size={12} /> Covered</>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {safeSkillGap.slice(0,10).length > 0 && (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={safeSkillGap.slice(0,10)} margin={{ top:5, right:10, left:-20, bottom:30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="skill" tick={{ fill:'rgba(255,255,255,0.4)', fontSize:10 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" />
                        <YAxis tick={{ fill:'rgba(255,255,255,0.4)', fontSize:11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize:'12px', paddingTop:'12px' }} />
                        <Bar dataKey="required"  name="Required"  fill={C.red}   radius={[4,4,0,0]} />
                        <Bar dataKey="available" name="Available" fill={C.green} radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}
            </Section>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
              <Section icon={<FiAward />} title="Top Certifications" subtitle="Most held certifications across employees" delay="0.14s">
                {loading.skills ? <Skeleton h={200} /> : errors.skills ? <ErrorState onRetry={load} /> :
                  !(skills?.certifications?.length) ? <EmptyState icon={<FiAward />} title="No certifications recorded" sub="Add certifications to employee profiles." /> :
                  skills.certifications.map((c,i) => (
                    <SkillBar key={i} skill={typeof c.cert === 'object' ? (c.cert?.name || String(c.cert)) : (c.cert || '')} count={c.count} max={skills.certifications[0]?.count||1} color={C.amber} />
                  ))
                }
              </Section>

              <Section icon={<FiBriefcase />} title="Skills by Department" subtitle="Top skills in each department" delay="0.18s">
                {loading.skills ? <Skeleton h={200} /> : errors.skills ? <ErrorState onRetry={load} /> :
                  !Object.keys(skills?.deptSkillMap||{}).length ? <EmptyState icon={<FiBriefcase />} title="No department skill data" /> : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                    {Object.entries(skills.deptSkillMap||{}).slice(0,6).map(([dept, deptSkills], i) => (
                      <div key={i}>
                        <div style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', marginBottom:'7px', textTransform:'uppercase', letterSpacing:'0.4px' }}>{dept}</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                          {(deptSkills||[]).map((s, j) => (
                            <span key={j} style={{ background:`${DEPT_COLORS[i%DEPT_COLORS.length]}15`, border:`1px solid ${DEPT_COLORS[i%DEPT_COLORS.length]}30`, color:DEPT_COLORS[i%DEPT_COLORS.length], padding:'3px 9px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', textTransform:'capitalize' }}>
                              {typeof s.skill === 'object' ? (s.skill?.name || String(s.skill)) : s.skill} <span style={{ opacity:0.6 }}>×{s.count}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          </div>
        )}

        {/* PROMOTIONS */}
        {activeSection === 'promos' && (
          <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
            {!loading.promos && promos && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px' }}>
                {[
                  { label:'Success Rate',    value:promos.summary?.successRate, icon:<FiTarget />, color:C.green,  sub:`${promos.summary?.approved||0} approved` },
                  { label:'Total Processed', value:promos.summary?.totalApplications, icon:<FiFileText />, color:C.blue, sub:'All applications' },
                  { label:'Avg Chain Depth', value:promos.summary?.avgChainDepth, icon:<FiGitBranch />, color:C.purple, sub:'DFS traversal depth' },
                  { label:'Pending',         value:promos.summary?.pending, icon:<FiClock />, color:C.amber, sub:'Awaiting decision' },
                ].map((k,i) => <KPI key={i} {...k} delay={`${i*0.06}s`} />)}
              </div>
            )}
            {loading.promos && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px' }}>
                {[...Array(4)].map((_,i) => <Skeleton key={i} h={120} />)}
              </div>
            )}

            <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:'20px' }}>
              <Section icon={<FiTrendingUp />} title="Promotion Approval Trend" subtitle="Monthly approvals vs rejections">
                {loading.promos ? <Skeleton /> : errors.promos ? <ErrorState onRetry={load} /> :
                  !promos?.promoTrend?.length ? <EmptyState icon={<FiTrendingUp />} title="No promotion trend data" /> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={promos.promoTrend} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                      <defs>
                        <linearGradient id="gradGreen2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.green} stopOpacity={0.3}/><stop offset="95%" stopColor={C.green} stopOpacity={0}/></linearGradient>
                        <linearGradient id="gradRed2"   x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.red}   stopOpacity={0.2}/><stop offset="95%" stopColor={C.red}   stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fill:'rgba(255,255,255,0.4)', fontSize:11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill:'rgba(255,255,255,0.4)', fontSize:11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize:'12px', paddingTop:'10px' }} />
                      <Area type="monotone" dataKey="approved" name="Approved" stroke={C.green} fill="url(#gradGreen2)" strokeWidth={2} />
                      <Area type="monotone" dataKey="rejected" name="Rejected" stroke={C.red}   fill="url(#gradRed2)"   strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </Section>

              <Section icon={<FiBarChart2 />} title="Score Breakdown by Status" subtitle="Avg component scores per outcome" delay="0.06s">
                {loading.promos ? <Skeleton /> : errors.promos ? <ErrorState onRetry={load} /> :
                  !promos?.scoreByStatus?.length ? <EmptyState icon={<FiBarChart2 />} title="No score breakdown data" /> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={promos.scoreByStatus} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="status" tick={{ fill:'rgba(255,255,255,0.4)', fontSize:11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill:'rgba(255,255,255,0.4)', fontSize:11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize:'12px' }} />
                      <Bar dataKey="skillScore" name="Skill"  fill={C.blue}   radius={[3,3,0,0]} />
                      <Bar dataKey="expScore"   name="Exp"    fill={C.purple} radius={[3,3,0,0]} />
                      <Bar dataKey="perfScore"  name="Perf"   fill={C.green}  radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Section>
            </div>

            <Section icon={<FaTrophy />} title="Top Performers" subtitle="Highest scoring approved promotions" delay="0.1s">
              {loading.promos ? <Skeleton h={160} /> : errors.promos ? <ErrorState onRetry={load} /> :
                !promos?.topPerformers?.length ? <EmptyState icon={<FaTrophy />} title="No promotions approved yet" sub="Approve a promotion to see top performers here." /> : (
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                    <thead>
                      <tr>
                        {['Name','Department','Experience','Job Title','Score','Skill','Exp'].map(h => (
                          <th key={h} style={{ textAlign:'left', padding:'10px 14px', color:'rgba(255,255,255,0.4)', fontWeight:'700', fontSize:'11px', textTransform:'uppercase', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {promos.topPerformers.map((p,i) => (
                        <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding:'12px 14px', fontWeight:'700' }}>{p.name}</td>
                          <td style={{ padding:'12px 14px', color:'rgba(255,255,255,0.55)' }}>{p.department}</td>
                          <td style={{ padding:'12px 14px', color:C.blue }}>{p.experience}y</td>
                          <td style={{ padding:'12px 14px', color:'rgba(255,255,255,0.6)' }}>{p.jobTitle}</td>
                          <td style={{ padding:'12px 14px', fontWeight:'900', color:C.green }}>{p.finalScore}%</td>
                          <td style={{ padding:'12px 14px', color:C.blue }}>{p.skillScore}%</td>
                          <td style={{ padding:'12px 14px', color:C.purple }}>{p.expScore}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
