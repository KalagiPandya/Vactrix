import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const home = user
    ? user.role === 'hr' ? '/hr/dashboard'
    : user.role === 'admin' ? '/admin/dashboard'
    : '/dashboard'
    : '/login';

  return (
    <div style={{ minHeight:'100vh', background:'#080b14', fontFamily:"'DM Sans','Segoe UI',sans-serif", color:'white', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
        @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-14px);}}
        .home-btn:hover { opacity:0.88; transform:translateY(-2px); box-shadow:0 10px 30px rgba(59,130,246,0.35) !important; }
        .home-btn { transition:all 0.2s; }
      `}</style>
      <div style={{ textAlign:'center', padding:'32px' }}>
        <div style={{ fontSize:'72px', marginBottom:'16px', animation:'float 3s ease-in-out infinite', color:'#3b82f6', display:'flex', justifyContent:'center' }}>
          <FiSearch />
        </div>
        <h1 style={{ fontSize:'88px', fontWeight:'900', margin:'0', background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1 }}>404</h1>
        <p style={{ fontSize:'18px', color:'rgba(255,255,255,0.5)', margin:'16px 0 32px', fontWeight:'500' }}>This page doesn't exist in Vactrix</p>
        <button className="home-btn" onClick={() => navigate(home)}
          style={{ background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', border:'none', color:'white', padding:'14px 32px', borderRadius:'12px', fontSize:'15px', fontWeight:'800', cursor:'pointer', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:'8px' }}>
          <FiArrowLeft /> Go Back Home
        </button>
      </div>
    </div>
  );
}
