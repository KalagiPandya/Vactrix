import { useNavigate } from 'react-router-dom';
import { FiLayers, FiBarChart2, FiSliders, FiBell, FiZap, FiSearch, FiShield, FiBriefcase, FiUser, FiCheck, FiX, FiArrowRight } from 'react-icons/fi';
import { FaCrown, FaFire, FaBullseye } from 'react-icons/fa';

export default function LandingPage() {
  const navigate = useNavigate();

  const PROBLEMS = [
    {
      icon: <FiLayers size={28} color="#3b82f6" />,
      problem: 'When a senior leaves, nobody knows who to promote or what cascade of vacancies it creates.',
      solution: 'Vactrix runs a DFS graph traversal through your entire org chart and maps every resulting vacancy chain automatically.',
      label: 'Vacancy Chain Engine',
    },
    {
      icon: <FiBarChart2 size={28} color="#10b981" />,
      problem: 'HR teams make hiring decisions based on gut feeling — no real data on skill gaps or candidate quality.',
      solution: 'MongoDB aggregation pipelines compute real-time skill gap heatmaps across all employees and open roles.',
      label: 'Skill Intelligence',
    },
    {
      icon: <FiSliders size={28} color="#f59e0b" />,
      problem: 'Candidate scoring is hardcoded or manual — changes require a developer and a redeployment.',
      solution: 'Admins configure scoring weights (skills, experience, performance, certifications) live from the dashboard. No code. No redeploy.',
      label: 'Live Scoring Engine',
    },
    {
      icon: <FiBell size={28} color="#8b5cf6" />,
      problem: 'HR events happen but nobody finds out until they check their email hours later.',
      solution: 'Socket.IO pushes notifications instantly to online users. Offline users get them via REST polling on next login. Zero missed events.',
      label: 'Real-Time Intelligence',
    },
  ];

  const FEATURES = [
    { icon: <FiLayers size={22} />, title: 'DFS Vacancy Chain', desc: 'Graph algorithm that maps every promotion cascade from a single vacancy. O(N+E) time complexity.', color: '#3b82f6' },
    { icon: <FaFire size={22} />, title: 'Skill Gap Heatmap', desc: 'Server-side MongoDB aggregations show exactly which skills your org lacks vs what jobs demand.', color: '#ef4444' },
    { icon: <FaBullseye size={22} />, title: 'Weighted Scoring', desc: 'Four-component candidate scoring with admin-configurable weights. HashSet O(n) skill matching.', color: '#22c55e' },
    { icon: <FiZap size={22} />, title: 'Real-Time Events', desc: 'Socket.IO dual-delivery: instant push for online users, REST polling fallback for offline.', color: '#f59e0b' },
    { icon: <FiBarChart2 size={22} />, title: 'Hiring Analytics', desc: 'Funnel conversion rates, monthly trends, score distributions — all computed in MongoDB pipelines.', color: '#8b5cf6' },
    { icon: <FiBriefcase size={22} />, title: 'Org Intelligence', desc: 'Visual org hierarchy with vacancy indicators, depth analysis, and cascade risk scoring.', color: '#06b6d4' },
    { icon: <FiSearch size={22} />, title: 'Enterprise Search', desc: 'Debounced, indexed, paginated search across name, skills, department, certifications.', color: '#ec4899' },
    { icon: <FiShield size={22} />, title: 'Production Security', desc: 'Helmet + Rate limiting + JWT + Bcrypt + Express 5 compatible sanitization. 5 security layers.', color: '#14b8a6' },
  ];

  const STACK = [
    { name: 'React 18', role: 'Frontend', color: '#61dafb' },
    { name: 'Express 5', role: 'Backend', color: '#ffffff' },
    { name: 'MongoDB', role: 'Database', color: '#47a248' },
    { name: 'Socket.IO', role: 'Real-time', color: '#010101' },
    { name: 'Node.js 18', role: 'Runtime', color: '#339933' },
    { name: 'Recharts', role: 'Analytics UI', color: '#8884d8' },
    { name: 'JWT + Bcrypt', role: 'Auth', color: '#f59e0b' },
    { name: 'Helmet', role: 'Security', color: '#ef4444' },
  ];

  const ROLES = [
    { role: 'Admin', icon: <FaCrown size={22} />, color: '#c4b5fd', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', actions: ['Configure scoring weights live', 'View all users and roles', 'Access all dashboards', 'Platform-wide analytics'] },
    { role: 'HR Manager', icon: <FiBriefcase size={22} />, color: '#fbbf24', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', actions: ['Post and manage jobs', 'Run vacancy chain analysis', 'View skill heatmap', 'Score and shortlist candidates'] },
    { role: 'Employee', icon: <FiUser size={22} />, color: '#86efac', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', actions: ['Browse open positions', 'Apply and track applications', 'Manage skills and certifications', 'Receive real-time notifications'] },
  ];

  const COMPARED = [
    { feature: 'Vacancy chain DFS graph', vactrix: true,  others: false },
    { feature: 'MongoDB aggregation analytics', vactrix: true,  others: false },
    { feature: 'Admin-configurable scoring', vactrix: true,  others: false },
    { feature: 'Socket.IO real-time push', vactrix: true,  others: false },
    { feature: 'HashSet O(n) skill matching', vactrix: true,  others: false },
    { feature: 'Express 5 (not v4)', vactrix: true,  others: false },
    { feature: 'React Portal notifications', vactrix: true,  others: false },
    { feature: 'CRUD operations', vactrix: true,  others: true  },
    { feature: 'Role-based auth', vactrix: true,  others: true  },
    { feature: 'Job listings', vactrix: true,  others: true  },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#060910', fontFamily: "'DM Sans','Segoe UI',sans-serif", color: 'white', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);} }
        @keyframes float    { 0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);} }
        @keyframes pulse    { 0%,100%{opacity:0.4;}50%{opacity:0.8;} }
        @keyframes spin     { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
        @keyframes gradShift{ 0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;} }
        .fade-up    { animation: fadeUp 0.7s ease both; }
        .nav-btn:hover { background: rgba(255,255,255,0.1) !important; }
        .feature-card:hover { transform: translateY(-4px) !important; border-color: rgba(255,255,255,0.15) !important; }
        .prob-card:hover { border-color: rgba(59,130,246,0.4) !important; }
        .cta-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(59,130,246,0.5) !important; }
        .cta-secondary:hover { background: rgba(255,255,255,0.1) !important; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        section { padding: 96px 24px; max-width: 1200px; margin: 0 auto; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(6,9,16,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#1e40af,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
            <FiLayers />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>Vactrix</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="nav-btn" onClick={() => navigate('/login')}
            style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s' }}>
            Sign In
          </button>
          <button onClick={() => navigate('/register')}
            style={{ padding: '8px 18px', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', border: 'none', borderRadius: 9, color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', boxShadow: '0 4px 15px rgba(59,130,246,0.3)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Get Started Free <FiArrowRight />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ paddingTop: 160, paddingBottom: 120, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,0.08) 0%,transparent 70%)', top: -200, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', animation: 'pulse 4s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%)', bottom: 0, left: 100, pointerEvents: 'none', animation: 'pulse 5s ease-in-out infinite 1s' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(34,197,94,0.04) 0%,transparent 70%)', bottom: 50, right: 100, pointerEvents: 'none', animation: 'pulse 6s ease-in-out infinite 2s' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          {/* Badge */}
          <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 20, padding: '6px 16px', marginBottom: 32 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#93c5fd', letterSpacing: '0.5px' }}>ENTERPRISE HR PLATFORM · GRAPH-POWERED · REAL-TIME</span>
          </div>

          {/* Headline */}
          <h1 className="fade-up" style={{ fontSize: 'clamp(38px,6vw,72px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 24, animationDelay: '0.1s' }}>
            HR decisions powered by{' '}
            <span style={{ background: 'linear-gradient(135deg,#60a5fa,#a78bfa,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% 200%', animation: 'gradShift 4s ease infinite' }}>
              graph intelligence
            </span>
          </h1>

          {/* Subheadline */}
          <p className="fade-up" style={{ fontSize: 'clamp(16px,2.5vw,21px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 680, margin: '0 auto 20px', animationDelay: '0.2s' }}>
            Vactrix maps your organisation as an intelligent graph. When any role becomes vacant,
            our DFS engine simulates the entire promotion cascade — so you always know who to promote,
            who to hire, and where the skill gaps are.
          </p>

          <p className="fade-up" style={{ fontSize: 15, color: 'rgba(255,255,255,0.3)', marginBottom: 44, animationDelay: '0.25s' }}>
            Built for enterprises. Not for spreadsheets.
          </p>

          {/* CTAs */}
          <div className="fade-up" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64, animationDelay: '0.3s' }}>
            <button className="cta-primary" onClick={() => navigate('/register')}
              style={{ padding: '14px 32px', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', fontSize: 16, fontWeight: 800, fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(59,130,246,0.35)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Start Free — No Credit Card <FiArrowRight />
            </button>
            <button className="cta-secondary" onClick={() => navigate('/login')}
              style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: 16, fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.2s' }}>
              Sign In with Demo Account
            </button>
          </div>

          {/* Stats row */}
          <div className="fade-up" style={{ display: 'flex', gap: 0, justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', maxWidth: 640, margin: '0 auto', animationDelay: '0.4s' }}>
            {[
              { val: '35+', label: 'API Endpoints' },
              { val: '4',   label: 'Unique Algorithms' },
              { val: '3',   label: 'Role Dashboards' },
              { val: '7',   label: 'MongoDB Collections' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: '20px 16px', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROBLEM SECTION ── */}
      <div style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', letterSpacing: '2px', textTransform: 'uppercase' }}>The Problem</span>
            <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 900, letterSpacing: '-1px', marginTop: 12, marginBottom: 14 }}>HR teams are flying blind</h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', maxWidth: 560, margin: '0 auto' }}>Four critical problems every company faces that existing tools completely ignore.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {PROBLEMS.map((p, i) => (
              <div key={i} className="prob-card"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28, transition: 'border 0.2s', cursor: 'default' }}>
                <div style={{ marginBottom: 16 }}>{p.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>{p.label}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Problem: </strong>{p.problem}
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                  <strong style={{ color: '#86efac' }}>Vactrix: </strong>{p.solution}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── VS OTHER TOOLS ── */}
      <div style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', letterSpacing: '2px', textTransform: 'uppercase' }}>Comparison</span>
            <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, letterSpacing: '-1px', marginTop: 12, marginBottom: 14 }}>Why not just use a spreadsheet?</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>What Vactrix does that no other student or even many commercial HR tools do.</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '14px 24px', background: 'rgba(255,255,255,0.03)' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Feature</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Vactrix</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Others</span>
            </div>
            {COMPARED.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', padding: '13px 24px', borderBottom: i < COMPARED.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{row.feature}</span>
                <span style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                  {row.vactrix ? <FiCheck color="#22c55e" size={18} /> : <FiX color="#ef4444" size={18} />}
                </span>
                <span style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                  {row.others ? <FiCheck color="#22c55e" size={18} /> : <FiX color="#ef4444" size={18} />}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES GRID ── */}
      <div style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: '2px', textTransform: 'uppercase' }}>Platform Features</span>
            <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 900, letterSpacing: '-1px', marginTop: 12, marginBottom: 14 }}>Everything your HR team needs</h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.4)', maxWidth: 520, margin: '0 auto' }}>8 enterprise-grade modules, all connected, all real-time.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24, transition: 'all 0.2s', cursor: 'default' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}15`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 16 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8, color: 'white' }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROLE DASHBOARDS ── */}
      <div style={{ padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '2px', textTransform: 'uppercase' }}>Role-Based Access</span>
            <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 900, letterSpacing: '-1px', marginTop: 12, marginBottom: 14 }}>Three portals, one platform</h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.4)', maxWidth: 520, margin: '0 auto' }}>Each role sees exactly what they need — nothing more, nothing less.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            {ROLES.map((r, i) => (
              <div key={i} style={{ background: r.bg, border: `1px solid ${r.border}`, borderRadius: 20, padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${r.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: r.color }}>{r.icon}</div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{r.role}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {r.actions.map((a, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>
                      <FiArrowRight style={{ color: r.color, fontSize: 12 }} />
                      {a}
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate('/login')}
                  style={{ marginTop: 24, width: '100%', padding: '11px', background: `${r.color}18`, border: `1px solid ${r.color}35`, borderRadius: 10, color: r.color, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background=`${r.color}28`}
                  onMouseLeave={e => e.currentTarget.style.background=`${r.color}18`}>
                  Login as {r.role} <FiArrowRight style={{ verticalAlign: 'middle', marginLeft: 4 }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TECH STACK ── */}
      <div style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase' }}>Built with production-grade tech</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 32 }}>
            {STACK.map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{s.name}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{s.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA FINAL ── */}
      <div style={{ padding: '120px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,0.07) 0%,transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#1e40af,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 12px 32px rgba(59,130,246,0.4)', animation: 'float 3s ease-in-out infinite' }}>
            <FiLayers size={28} />
          </div>
          <h2 style={{ fontSize: 'clamp(30px,5vw,56px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 18 }}>
            Ready to see it in action?
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.45)', marginBottom: 40, lineHeight: 1.6 }}>
            Log in with a demo account. The entire platform is seeded with realistic Indian corporate data across 10 departments and 10 job postings.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <button className="cta-primary" onClick={() => navigate('/register')}
              style={{ padding: '14px 36px', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', border: 'none', borderRadius: 12, color: 'white', cursor: 'pointer', fontSize: 16, fontWeight: 800, fontFamily: 'inherit', boxShadow: '0 8px 24px rgba(59,130,246,0.35)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Create Free Account <FiArrowRight />
            </button>
            <button className="cta-secondary" onClick={() => navigate('/login')}
              style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: 'white', cursor: 'pointer', fontSize: 16, fontWeight: 700, fontFamily: 'inherit', transition: 'all 0.2s' }}>
              Sign In
            </button>
          </div>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { role: 'Admin', icon: <FaCrown size={12} />, email: 'admin@vactrix.com', pass: 'admin123' },
              { role: 'HR', icon: <FiBriefcase size={12} />, email: 'hr@vactrix.com', pass: 'hr123456' },
              { role: 'Employee', icon: <FiUser size={12} />, email: 'rohan.kapoor@vactrix.com', pass: 'emp12345' },
            ].map((item, i) => (
              <button key={i} onClick={() => navigate('/login')}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {item.icon} {item.email} / {item.pass}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#1e40af,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
            <FiLayers />
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>Vactrix</span>
        </div>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>Vacancy & Talent Intelligence Platform · MIT License · Built with React 18 + Express 5 + MongoDB</span>
        <div style={{ display: 'flex', gap: 16 }}>
          {['Login','Register','GitHub'].map((l,i)=>(
            <button key={i} onClick={() => i < 2 ? navigate(l === 'Login' ? '/login' : '/register') : null}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
              {l}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
