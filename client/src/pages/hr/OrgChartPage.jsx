import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiBriefcase, FiSettings, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';

import { API } from '../../config/api';

const DEPT_COLORS = {
  'Engineering':   { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.35)',  text: '#93c5fd',  dot: '#3b82f6' },
  'Product':       { bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.35)',  text: '#c4b5fd',  dot: '#8b5cf6' },
  'Design':        { bg: 'rgba(236,72,153,0.12)',  border: 'rgba(236,72,153,0.35)',  text: '#f9a8d4',  dot: '#ec4899' },
  'HR':            { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.35)',  text: '#fbbf24',  dot: '#f59e0b' },
  'Data Science':  { bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.35)',   text: '#86efac',  dot: '#22c55e' },
  'Finance':       { bg: 'rgba(20,184,166,0.12)',  border: 'rgba(20,184,166,0.35)',  text: '#5eead4',  dot: '#14b8a6' },
  'default':       { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.15)', text: '#e2e8f0',  dot: '#94a3b8' },
};

function getColor(dept) { return DEPT_COLORS[dept] || DEPT_COLORS.default; }

function OrgNodeCard({ node, isRoot }) {
  const c = getColor(node.department);
  return (
    <div style={{
      background: node.isVacant ? 'rgba(239,68,68,0.1)' : c.bg,
      border: `1px solid ${node.isVacant ? 'rgba(239,68,68,0.4)' : c.border}`,
      borderRadius: '10px', padding: '10px 14px', minWidth: '160px', maxWidth: '200px',
      textAlign: 'center', position: 'relative',
    }}>
      {node.isVacant && (
        <div style={{ position:'absolute', top:'-8px', left:'50%', transform:'translateX(-50%)', background:'rgba(239,68,68,0.9)', color:'white', fontSize:'9px', fontWeight:'800', padding:'2px 7px', borderRadius:'10px', whiteSpace:'nowrap' }}>VACANT</div>
      )}
      <div style={{ fontSize: isRoot ? '13px' : '12px', fontWeight: '800', color: c.text, marginBottom: '3px' }}>{node.title}</div>
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>{node.department}</div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.dot }} />
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontWeight: '600' }}>L{node.level}</span>
      </div>
      {node.occupiedBy && (
        <div style={{ marginTop:'6px', fontSize:'10px', color:'rgba(255,255,255,0.55)', background:'rgba(255,255,255,0.05)', borderRadius:'6px', padding:'3px 6px', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
          <FiUser size={11} /> {typeof node.occupiedBy === 'object' ? node.occupiedBy.name : 'Occupied'}
        </div>
      )}
    </div>
  );
}

function DeptTree({ deptName, nodes, edges }) {
  const c = getColor(deptName);
  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });
  const childrenOf = {};
  nodes.forEach(n => { childrenOf[n.id] = []; });
  edges.forEach(e => {
    if (nodeMap[e.from] && nodeMap[e.to]) {
      childrenOf[e.from] = childrenOf[e.from] || [];
      childrenOf[e.from].push(e.to);
    }
  });

  const roots = nodes.filter(n => !edges.some(e => e.to === n.id && nodeMap[e.from]));

  function renderNode(nodeId, depth = 0) {
    const node = nodeMap[nodeId];
    if (!node) return null;
    const children = childrenOf[nodeId] || [];
    return (
      <div key={nodeId} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0' }}>
        <OrgNodeCard node={node} isRoot={depth === 0} />
        {children.length > 0 && (
          <>
            <div style={{ width:'1px', height:'18px', background:'rgba(255,255,255,0.12)' }} />
            <div style={{ display:'flex', gap:'12px', alignItems:'flex-start', position:'relative' }}>
              {children.length > 1 && (
                <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:`calc(100% - 20px)`, height:'1px', background:'rgba(255,255,255,0.12)' }} />
              )}
              {children.map(cid => (
                <div key={cid} style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ width:'1px', height:'18px', background:'rgba(255,255,255,0.12)' }} />
                  {renderNode(cid, depth + 1)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${c.border}`, borderRadius:'16px', padding:'24px', overflowX:'auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px' }}>
        <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:c.dot }} />
        <span style={{ fontSize:'14px', fontWeight:'800', color:c.text }}>{deptName}</span>
        <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', fontWeight:'600' }}>{nodes.length} positions</span>
      </div>
      <div style={{ display:'flex', justifyContent:'center' }}>
        {roots.map(r => renderNode(r.id))}
      </div>
    </div>
  );
}

export default function OrgChartPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [activeDept, setActiveDept] = useState('All');
  const { token } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    axios.get(`${API}/org/graph`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { setError(err.response?.data?.message || 'Failed to load org graph'); setLoading(false); });
  }, [token]);

  const departments = data ? Object.keys(data.departments) : [];
  const showDepts = activeDept === 'All' ? departments : [activeDept];

  return (
    <div style={{ minHeight:'100vh', background:'#080b14', fontFamily:"'DM Sans','Segoe UI',sans-serif", color:'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        .card { animation: fadeUp 0.4s ease both; }
        .dept-btn:hover { opacity:0.85; }
        .dept-btn { transition:all 0.15s; }
      `}</style>

      {/* Navbar */}
      <div style={{ background:'rgba(255,255,255,0.02)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:50 }}>
        <h1 style={{ margin:0, fontSize:'20px', fontWeight:'800', cursor:'pointer', background:'linear-gradient(135deg,#fff,#90CAF9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }} onClick={() => navigate('/hr/dashboard')}>Vactrix</h1>
        <button onClick={() => navigate('/hr/dashboard')} style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.7)', padding:'8px 16px', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'600' }}>
          <FiArrowLeft /> Dashboard
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '1700px', margin:'0 auto', padding:'36px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom:'28px', animation:'fadeUp 0.4s ease both' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'16px' }}>
            <div>
              <h2 style={{ margin:'0 0 6px', fontSize:'28px', fontWeight:'800', display:'flex', alignItems:'center', gap:'10px' }}>
                <FiBriefcase /> Organizational Graph
              </h2>
              <p style={{ margin:0, color:'rgba(255,255,255,0.4)', fontSize:'14px' }}>Real adjacency list graph — every box is a node, every line is a directed edge</p>
            </div>
            {data && (
              <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                {[
                  { label:'Nodes', value:data.summary.totalNodes, color:'#3b82f6' },
                  { label:'Edges', value:data.summary.totalEdges, color:'#22c55e' },
                  { label:'Depts', value:data.summary.departments, color:'#a78bfa' },
                  { label:'Vacant', value:data.summary.vacantNodes, color:'#f59e0b' },
                ].map((s, i) => (
                  <div key={i} style={{ background:`${s.color}12`, border:`1px solid ${s.color}25`, borderRadius:'10px', padding:'10px 16px', textAlign:'center' }}>
                    <div style={{ fontSize:'20px', fontWeight:'800', color:s.color }}>{s.value}</div>
                    <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)', fontWeight:'700', textTransform:'uppercase' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Complexity badge */}
        <div style={{ background:'rgba(139,92,246,0.07)', border:'1px solid rgba(139,92,246,0.2)', borderRadius:'10px', padding:'12px 18px', marginBottom:'24px', display:'flex', gap:'24px', flexWrap:'wrap', animation:'fadeUp 0.4s ease 0.06s both' }}>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>
            <span style={{ color:'#c4b5fd', fontWeight:'700' }}>Time:&nbsp;</span>O(N+E) build + O(N×C) DFS scoring
          </div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>
            <span style={{ color:'#c4b5fd', fontWeight:'700' }}>Space:&nbsp;</span>O(N+E) adjacency list + O(N) recursion stack
          </div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>
            <span style={{ color:'#c4b5fd', fontWeight:'700' }}>Structure:&nbsp;</span>Directed Acyclic Graph (DAG) — adjacency list representation
          </div>
        </div>

        {/* Dept filter */}
        {data && (
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'24px', animation:'fadeUp 0.4s ease 0.1s both' }}>
            {['All', ...departments].map(d => {
              const c = getColor(d);
              const isActive = activeDept === d;
              return (
                <button key={d} className="dept-btn" onClick={() => setActiveDept(d)}
                  style={{ padding:'7px 14px', borderRadius:'20px', border:`1px solid ${isActive ? c.border : 'rgba(255,255,255,0.1)'}`, background: isActive ? c.bg : 'transparent', color: isActive ? c.text : 'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:'12px', fontWeight:'700', fontFamily:'inherit' }}>
                  {d}
                </button>
              );
            })}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:'center', padding:'80px', color:'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize:'40px', marginBottom:'14px', display:'flex', justifyContent:'center' }}><FiSettings /></div>
            <div style={{ fontSize:'16px', fontWeight:'600' }}>Building organizational graph...</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'12px', padding:'16px 20px', color:'#fca5a5', fontSize:'14px', fontWeight:'600', display:'flex', alignItems:'center', gap:'8px' }}>
            <FiAlertTriangle /> {error}
          </div>
        )}

        {/* Department trees */}
        {data && (
          <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
            {showDepts.map((dept, i) => (
              <div key={dept} className="card" style={{ animationDelay:`${i*0.06}s` }}>
                <DeptTree
                  deptName={dept}
                  nodes={data.departments[dept] || []}
                  edges={data.graph.edges}
                />
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div style={{ marginTop:'28px', padding:'16px 20px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', animation:'fadeUp 0.4s ease both' }}>
          <div style={{ fontSize:'11px', fontWeight:'700', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'10px' }}>Legend</div>
          <div style={{ display:'flex', gap:'20px', flexWrap:'wrap' }}>
            <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', display:'flex', alignItems:'center', gap:'6px' }}>
              <div style={{ width:'30px', height:'1px', background:'rgba(255,255,255,0.3)' }} /> Edge = "reports to" relationship
            </span>
            <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', display:'flex', alignItems:'center', gap:'6px' }}>
              <div style={{ width:'12px', height:'12px', borderRadius:'3px', background:'rgba(239,68,68,0.3)', border:'1px solid rgba(239,68,68,0.5)' }} /> Vacant position
            </span>
            <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)' }}>L1 = Most senior, L5+ = Most junior</span>
          </div>
        </div>
      </div>
    </div>
  );
}
