import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../../components/NotificationBell';
import { FiUsers, FiUser, FiBriefcase, FiFileText, FiSettings, FiSearch, FiBarChart2, FiZap, FiArrowRight } from 'react-icons/fi';
import { FaCrown, FaStar } from 'react-icons/fa';

import { API } from '../../config/api';

function Skeleton({ h = 16, r = 6 }) {
  return <div style={{ height:`${h}px`, borderRadius:`${r}px`, background:'linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite', marginBottom:'8px' }} />;
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${API}/analytics/summary`, { headers }).catch(() => ({ data: null })),
      axios.get(`${API}/users`,             { headers }).catch(() => ({ data: [] })),
    ]).then(([sumRes, usersRes]) => {
      setSummary(sumRes.data);
      setUsers(usersRes.data || []);
      setLoading(false);
    });
  }, [token]);

  const employees = users.filter(u => u.role === 'employee');
  const hrUsers   = users.filter(u => u.role === 'hr');

  return (
    <div style={{ minHeight:'100vh', background:'#080b14', fontFamily:"'DM Sans','Segoe UI',sans-serif", color:'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
        @keyframes shimmer { 0%{background-position:-200% 0;}100%{background-position:200% 0;} }
        .card { animation:fadeUp 0.4s ease both; }
        .row-hover:hover { background:rgba(255,255,255,0.04)!important; }
        .action-tile:hover { transform:translateY(-3px)!important; }
      `}</style>

      {/* Sidebar */}
      <div style={{ position:'fixed', left:0, top:0, width:'68px', height:'100vh', background:'rgba(255,255,255,0.025)', borderRight:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', alignItems:'center', paddingTop:'20px', gap:'6px', zIndex:100 }}>
        <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'linear-gradient(135deg,#7c3aed,#a78bfa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', marginBottom:'20px', boxShadow:'0 6px 20px rgba(139,92,246,0.35)', cursor:'pointer' }}>
          <FaCrown color="white" />
        </div>
        {[
          { icon:<FiBarChart2 />, tip:'Analytics', path:'/hr/analytics' },
          { icon:<FiSearch />, tip:'Search',    path:'/hr/search' },
          { icon:<FiBriefcase />, tip:'Org Chart', path:'/hr/org-chart' },
          { icon:<FiSettings />, tip:'Scoring Config', path:'/admin/scoring-config' },
        ].map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)} title={item.tip}
            style={{ width:'42px', height:'42px', borderRadius:'11px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px', cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            {item.icon}
          </div>
        ))}
        <div style={{ flex:1 }} />
        <div style={{ margin:'4px 0' }}><NotificationBell /></div>
        <div onClick={() => { logout(); navigate('/login'); }}
          style={{ width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#a78bfa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'800', cursor:'pointer', marginBottom:'16px', marginTop:'4px' }}
          title={`${user?.name} — Logout`}>
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
      </div>

      <div style={{ marginLeft:'68px', padding:'32px 36px' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'32px' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
              <span style={{ background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.3)', color:'#c4b5fd', padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700', letterSpacing:'1px' }}>ADMINISTRATOR</span>
            </div>
            <h1 style={{ margin:0, fontSize:'30px', fontWeight:'900', letterSpacing:'-0.5px' }}>
              Admin Dashboard
            </h1>
            <p style={{ margin:'5px 0 0', color:'rgba(255,255,255,0.35)', fontSize:'14px' }}>Platform overview · User management · System configuration</p>
          </div>
          <button onClick={() => navigate('/admin/scoring-config')}
            style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.3)', color:'#c4b5fd', padding:'10px 18px', borderRadius:'10px', cursor:'pointer', fontSize:'13px', fontWeight:'700', fontFamily:'inherit' }}>
            <FiSettings /> Scoring Config
          </button>
        </div>

        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'18px', marginBottom:'28px' }}>
          {[
            { label:'Total Users',       value: loading ? null : users.length,                icon:<FiUsers />, color:'#3b82f6', delay:'0s' },
            { label:'Employees',         value: loading ? null : employees.length,             icon:<FiUser />, color:'#22c55e', delay:'0.06s' },
            { label:'HR Managers',       value: loading ? null : hrUsers.length,               icon:<FiBriefcase />, color:'#f59e0b', delay:'0.12s' },
            { label:'Total Applications',value: loading ? null : summary?.kpis?.totalApplications ?? '—', icon:<FiFileText />, color:'#a78bfa', delay:'0.18s' },
          ].map((k, i) => (
            <div key={i} className="card" style={{ background:`${k.color}0d`, border:`1px solid ${k.color}20`, borderRadius:'16px', padding:'22px', animationDelay:k.delay }}>
              <div style={{ fontSize:'24px', color:k.color, marginBottom:'12px' }}>{k.icon}</div>
              {k.value === null ? <Skeleton h={34} r={8} /> : <div style={{ fontSize:'34px', fontWeight:'900', color:'white', letterSpacing:'-1px', marginBottom:'4px' }}>{k.value}</div>}
              <div style={{ fontSize:'13px', fontWeight:'700', color:'rgba(255,255,255,0.6)' }}>{k.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'18px', marginBottom:'18px' }}>
          {/* User Table */}
          <div className="card" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden' }}>
            <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:'14px', fontWeight:'800', color:'rgba(255,255,255,0.8)', display:'flex', alignItems:'center', gap:'8px' }}>
                <FiUsers /> All Users
              </span>
              <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)' }}>{users.length} registered</span>
            </div>
            {loading ? (
              <div style={{ padding:'20px' }}>{[...Array(6)].map((_,i) => <div key={i} style={{ marginBottom:'12px' }}><Skeleton h={44} r={8} /></div>)}</div>
            ) : (
              <div style={{ maxHeight:'420px', overflowY:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead style={{ position:'sticky', top:0, background:'rgba(15,23,42,0.95)' }}>
                    <tr>
                      {['Name','Role','Department','Rating'].map(col => (
                        <th key={col} style={{ textAlign:'left', padding:'10px 16px', fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const roleColor = { admin:'#c4b5fd', hr:'#fbbf24', employee:'#86efac' }[u.role] || '#94a3b8';
                      return (
                        <tr key={u._id} className="row-hover" style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.12s' }}>
                          <td style={{ padding:'12px 16px' }}>
                            <div style={{ fontWeight:'700', fontSize:'13px' }}>{u.name}</div>
                            <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{u.email}</div>
                          </td>
                          <td style={{ padding:'12px 16px' }}>
                            <span style={{ fontSize:'11px', fontWeight:'700', padding:'2px 8px', borderRadius:'20px', background:`${roleColor}15`, color:roleColor, border:`1px solid ${roleColor}30`, textTransform:'capitalize' }}>{u.role}</span>
                          </td>
                          <td style={{ padding:'12px 16px', fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>{u.department || '—'}</td>
                          <td style={{ padding:'12px 16px', fontSize:'13px', color:'#fbbf24', fontWeight:'700' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'2px' }}>
                              {[...Array(u.performanceRating || 0)].map((_, idx) => (
                                <FaStar key={idx} size={12} />
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Departments + Quick Actions */}
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div className="card" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'22px' }}>
              <div style={{ fontSize:'14px', fontWeight:'800', color:'rgba(255,255,255,0.8)', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px' }}>
                <FiBarChart2 /> Top Departments
              </div>
              {loading ? [...Array(4)].map((_,i) => <Skeleton key={i} />) :
                (summary?.topDepartments || []).slice(0,5).map((d, i) => {
                  const colors = ['#3b82f6','#22c55e','#f59e0b','#a78bfa','#ec4899'];
                  const max = summary.topDepartments[0]?.jobs || 1;
                  return (
                    <div key={i} style={{ marginBottom:'11px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                        <span style={{ fontSize:'12px', fontWeight:'600', color:'rgba(255,255,255,0.65)' }}>{d.department}</span>
                        <span style={{ fontSize:'12px', fontWeight:'800', color:colors[i] }}>{d.jobs} jobs</span>
                      </div>
                      <div style={{ height:'5px', background:'rgba(255,255,255,0.06)', borderRadius:'3px', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${Math.round((d.jobs/max)*100)}%`, background:colors[i], borderRadius:'3px', transition:'width 0.8s ease' }} />
                      </div>
                    </div>
                  );
                })
              }
            </div>

            <div className="card" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', padding:'22px', animationDelay:'0.1s' }}>
              <div style={{ fontSize:'14px', fontWeight:'800', color:'rgba(255,255,255,0.8)', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px' }}>
                <FiZap /> Quick Actions
              </div>
              {[
                { icon:<FiSettings />, label:'Scoring Config',  path:'/admin/scoring-config', color:'#a78bfa' },
                { icon:<FiBarChart2 />, label:'Full Analytics',   path:'/hr/analytics',         color:'#06b6d4' },
                { icon:<FiSearch />, label:'Search Employees', path:'/hr/search',            color:'#3b82f6' },
                { icon:<FiBriefcase />, label:'Org Chart',        path:'/hr/org-chart',         color:'#22c55e' },
              ].map((item, i) => (
                <div key={i} onClick={() => navigate(item.path)}
                  style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px', borderRadius:'10px', cursor:'pointer', marginBottom:'6px', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <div style={{ width:'34px', height:'34px', borderRadius:'9px', background:`${item.color}15`, color:item.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px' }}>{item.icon}</div>
                  <span style={{ fontSize:'13px', fontWeight:'700', color:'rgba(255,255,255,0.75)' }}>{item.label}</span>
                  <span style={{ marginLeft:'auto', color:'rgba(255,255,255,0.25)', fontSize:'14px' }}>
                    <FiArrowRight />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
