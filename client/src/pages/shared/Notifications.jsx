import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { FiBell, FiFileText, FiXCircle, FiBriefcase, FiArrowLeft, FiCheck, FiAward } from 'react-icons/fi';
import { FaStar, FaTrophy } from 'react-icons/fa';

const TYPE_META = {
  application_submitted:   { icon:<FiFileText />,    color:'#60a5fa',  label:'Application'  },
  application_shortlisted: { icon:<FaStar />,        color:'#86efac',  label:'Shortlisted'  },
  application_rejected:    { icon:<FiXCircle />,     color:'#fca5a5',  label:'Rejected'     },
  application_approved:    { icon:<FaTrophy />,      color:'#c4b5fd',  label:'Approved'     },
  promotion_approved:      { icon:<FiAward />,       color:'#fbbf24',  label:'Promotion'    },
  new_job_posted:          { icon:<FiBriefcase />,   color:'#5eead4',  label:'New Job'      },
  system:                  { icon:<FiBell />,        color:'#94a3b8',  label:'System'       },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'Yesterday' : `${d}d ago`;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState('all');

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read')   return  n.isRead;
    return true;
  });

  return (
    <div style={{ minHeight:'100vh', background:'#080b14', fontFamily:"'DM Sans','Segoe UI',sans-serif", color:'white' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
        * { box-sizing:border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
        .notif-row:hover { background:rgba(255,255,255,0.04)!important; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:3px; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '900px', margin:'0 auto', padding:'40px 24px' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'32px', animation:'fadeUp 0.4s ease' }}>
          <div>
            <button onClick={() => navigate(-1)} style={{ display:'flex', alignItems:'center', gap:'6px', background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:'14px', fontWeight:'600', fontFamily:'inherit', marginBottom:'12px', padding:0 }}>
              <FiArrowLeft /> Back
            </button>
            <h1 style={{ margin:0, fontSize:'28px', fontWeight:'900', display:'flex', alignItems:'center', gap:'10px' }}>
              <FiBell /> Notifications
            </h1>
            <p style={{ margin:'5px 0 0', color:'rgba(255,255,255,0.35)', fontSize:'14px' }}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead}
              style={{ display:'flex', alignItems:'center', gap:'6px', background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.3)', color:'#60a5fa', padding:'10px 18px', borderRadius:'10px', cursor:'pointer', fontSize:'13px', fontWeight:'700', fontFamily:'inherit' }}>
              <FiCheck /> Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:'4px', background:'rgba(255,255,255,0.04)', borderRadius:'12px', padding:'4px', marginBottom:'24px', width:'fit-content' }}>
          {['all','unread','read'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'8px 18px', borderRadius:'9px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight:'700', background: filter===f ? 'rgba(59,130,246,0.2)' : 'transparent', color: filter===f ? '#60a5fa' : 'rgba(255,255,255,0.4)', fontFamily:'inherit', textTransform:'capitalize', transition:'all 0.15s' }}>
              {f} {f==='all' ? `(${notifications.length})` : f==='unread' ? `(${unreadCount})` : `(${notifications.length - unreadCount})`}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'16px', overflow:'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ padding:'64px', textAlign:'center', color:'rgba(255,255,255,0.25)' }}>
              <div style={{ fontSize:'40px', marginBottom:'14px', display:'flex', justifyContent:'center' }}><FiBell /></div>
              <div style={{ fontSize:'15px', fontWeight:'700', marginBottom:'6px' }}>No notifications</div>
              <div style={{ fontSize:'13px' }}>{filter === 'unread' ? `You're all caught up!` : 'Nothing here yet.'}</div>
            </div>
          ) : (
            filtered.map((n, i) => {
              const meta = TYPE_META[n.type] || TYPE_META.system;
              return (
                <div key={n._id} className="notif-row"
                  style={{ display:'flex', gap:'16px', alignItems:'flex-start', padding:'18px 22px', borderBottom: i < filtered.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: n.isRead ? 'transparent' : 'rgba(59,130,246,0.03)', cursor: n.link ? 'pointer' : 'default', transition:'background 0.15s', position:'relative', animation:`fadeUp 0.35s ease ${Math.min(i,5)*0.05}s both` }}
                  onClick={() => { if (!n.isRead) markAsRead(n._id); if (n.link) navigate(n.link); }}>

                  {!n.isRead && <span style={{ position:'absolute', left:'8px', top:'50%', transform:'translateY(-50%)', width:'5px', height:'5px', borderRadius:'50%', background:'#3b82f6', flexShrink:0 }} />}

                  <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:`${meta.color}12`, border:`1px solid ${meta.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', color:meta.color, flexShrink:0 }}>
                    {meta.icon}
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'16px', marginBottom:'5px' }}>
                      <div style={{ fontWeight: n.isRead ? '600' : '800', fontSize:'14px', color: n.isRead ? 'rgba(255,255,255,0.65)' : 'white' }}>{n.title}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
                        <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.25)', fontWeight:'600', whiteSpace:'nowrap' }}>{timeAgo(n.createdAt)}</span>
                        <span style={{ fontSize:'10px', fontWeight:'700', padding:'2px 7px', borderRadius:'10px', background:`${meta.color}15`, color:meta.color, border:`1px solid ${meta.color}25` }}>{meta.label}</span>
                      </div>
                    </div>
                    <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', lineHeight:'1.5', marginBottom:'8px' }}>{n.message}</div>
                    <div style={{ display:'flex', gap:'8px' }}>
                      {!n.isRead && (
                        <button onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }}
                          style={{ background:'none', border:'none', color:'#60a5fa', fontSize:'12px', fontWeight:'700', cursor:'pointer', padding:'0', fontFamily:'inherit' }}>
                          Mark read
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                        style={{ background:'none', border:'none', color:'rgba(255,255,255,0.25)', fontSize:'12px', fontWeight:'600', cursor:'pointer', padding:'0', fontFamily:'inherit' }}
                        onMouseEnter={e => e.currentTarget.style.color='#fca5a5'}
                        onMouseLeave={e => e.currentTarget.style.color='rgba(255,255,255,0.25)'}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
