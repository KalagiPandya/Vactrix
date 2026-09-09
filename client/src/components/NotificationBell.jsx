import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { FiBell, FiFileText, FiXCircle, FiBriefcase, FiArrowRight, FiAward } from 'react-icons/fi';
import { FaStar, FaTrophy } from 'react-icons/fa';

const TYPE_META = {
  application_submitted:   { icon: <FiFileText size={14} />,  color: '#60a5fa' },
  application_shortlisted: { icon: <FaStar size={13} />,      color: '#86efac' },
  application_rejected:    { icon: <FiXCircle size={14} />,   color: '#fca5a5' },
  application_approved:    { icon: <FaTrophy size={13} />,    color: '#c4b5fd' },
  promotion_approved:      { icon: <FiAward size={14} />,     color: '#fbbf24' },
  new_job_posted:          { icon: <FiBriefcase size={14} />, color: '#5eead4' },
  system:                  { icon: <FiBell size={14} />,      color: '#94a3b8' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// Renders the dropdown panel via React Portal — completely outside the sidebar DOM
function NotifPanel({ btnRef, onClose, notifications, unreadCount, connected, markAsRead, markAllAsRead, deleteNotification }) {
  const navigate   = useNavigate();
  const panelRef   = useRef(null);
  const [pos, setPos] = useState({ top: 0 });

  // Calculate position from button rect
  useEffect(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    // Place panel to the right of sidebar (sidebar=68px), vertically centered on button
    const panelH = Math.min(480, window.innerHeight - 40);
    let top = rect.top;
    // Clamp so panel doesn't go off bottom of screen
    if (top + panelH > window.innerHeight - 20) {
      top = window.innerHeight - panelH - 20;
    }
    setPos({ top: Math.max(20, top) });
  }, [btnRef]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        btnRef.current  && !btnRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    // Small delay so the open-click doesn't immediately close
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [onClose, btnRef]);

  const handleClick = async (n) => {
    if (!n.isRead) await markAsRead(n._id);
    if (n.link) { navigate(n.link); onClose(); }
  };

  const panel = (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top:  pos.top,
        left: 78,   /* right edge of 68px sidebar + 10px gap */
        width: 360,
        maxHeight: 'calc(100vh - 40px)',
        background: '#0f172a',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16,
        boxShadow: '0 32px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04)',
        zIndex: 99999,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        animation: 'notifIn 0.18s cubic-bezier(0.16,1,0.3,1) both',
      }}
    >
      <style>{`
        @keyframes notifIn {
          from { opacity:0; transform:translateX(-12px) scale(0.97); }
          to   { opacity:1; transform:translateX(0)    scale(1); }
        }
        .ni:hover { background: rgba(255,255,255,0.05) !important; }
        .del-x { color: rgba(255,255,255,0.2); transition: color 0.15s; }
        .del-x:hover { color: #fca5a5 !important; }
        .notif-scroll::-webkit-scrollbar { width: 4px; }
        .notif-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: 'white' }}>Notifications</span>
          {unreadCount > 0 && (
            <span style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 800 }}>
              {unreadCount} new
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: connected ? '#86efac' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? '#22c55e' : '#6b7280', display: 'inline-block' }} />
            {connected ? 'Live' : 'Polling'}
          </span>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Scrollable list */}
      <div className="notif-scroll" style={{ overflowY: 'auto', flex: 1 }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.25)' }}>
            <div style={{ fontSize: 36, marginBottom: 12, display: 'flex', justifyContent: 'center' }}><FiBell /></div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>No notifications yet</div>
          </div>
        ) : (
          notifications.slice(0, 25).map((n) => {
            const meta = TYPE_META[n.type] || TYPE_META.system;
            return (
              <div
                key={n._id}
                className="ni"
                onClick={() => handleClick(n)}
                style={{ padding: '12px 18px', display: 'flex', gap: 12, alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: n.link ? 'pointer' : 'default', background: n.isRead ? 'transparent' : 'rgba(59,130,246,0.04)', transition: 'background 0.12s', position: 'relative' }}
              >
                {!n.isRead && <span style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', width: 5, height: 5, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />}

                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${meta.color}15`, border: `1px solid ${meta.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: meta.color, flexShrink: 0 }}>
                  {meta.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: n.isRead ? 600 : 800, fontSize: 13, color: n.isRead ? 'rgba(255,255,255,0.55)' : 'white', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>{timeAgo(n.createdAt)}</div>
                </div>

                <button
                  className="del-x"
                  onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '0 0 0 4px', lineHeight: 1, flexShrink: 0, fontFamily: 'inherit' }}
                >
                  ×
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '11px 18px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', flexShrink: 0 }}>
        <button
          onClick={() => { navigate('/notifications'); onClose(); }}
          style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          View all notifications <FiArrowRight />
        </button>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}

// ── Main component ─────────────────────────────────────────────────────
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const { notifications, unreadCount, connected, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const close = useCallback(() => setOpen(false), []);

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        ref={btnRef}
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative',
          background: open ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${open ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 10,
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 16,
          transition: 'all 0.15s',
          outline: 'none',
          color: 'white',
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; } }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; } }}
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 900, borderRadius: 10, padding: '1px 5px', minWidth: 17, textAlign: 'center', lineHeight: '15px', boxShadow: '0 0 0 2px #080b14' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Live indicator dot */}
      <span style={{ position: 'absolute', bottom: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: connected ? '#22c55e' : '#6b7280', border: '2px solid #080b14', pointerEvents: 'none' }} />

      {/* Portal panel — renders directly in document.body, never clipped by sidebar */}
      {open && (
        <NotifPanel
          btnRef={btnRef}
          onClose={close}
          notifications={notifications}
          unreadCount={unreadCount}
          connected={connected}
          markAsRead={markAsRead}
          markAllAsRead={markAllAsRead}
          deleteNotification={deleteNotification}
        />
      )}
    </div>
  );
}
