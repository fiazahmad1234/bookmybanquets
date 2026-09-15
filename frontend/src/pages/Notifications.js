import React, { useState, useEffect } from 'react';
import { API, useAuth } from '../context/AuthContext';
import Sidebar from '../components/common/Sidebar';
import './customer/Dashboard.css';

const Notifications = () => {
  const { fetchNotifications } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifs(res.data.notifications || []);
    } catch(e) {}
    setLoading(false);
  };

  const markRead = async (id) => {
    try { await API.put(`/notifications/${id}/read`); load(); fetchNotifications(); } catch(e) {}
  };

  const markAll = async () => {
    try { await API.put('/notifications/all/read'); load(); fetchNotifications(); } catch(e) {}
  };

  const icons = { booking:'📋', message:'💬', success:'✅', warning:'⚠️', info:'ℹ️', payment:'💰', review:'⭐' };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-inner">
          <div className="dash-header">
            <div><h1 className="dash-title">Notifications</h1><p className="dash-subtitle">Your latest activity and updates.</p></div>
            <button className="btn btn-ghost" onClick={markAll}>Mark all as read</button>
          </div>
          {loading ? <div className="page-loader"><div className="spinner"/></div>
          : notifs.length === 0 ? (
            <div className="empty-state" style={{background:'white',borderRadius:'var(--radius-lg)',padding:64}}>
              <div style={{fontSize:48}}>🔔</div><p>No notifications yet</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {notifs.map(n => (
                <div key={n.id} onClick={()=>markRead(n.id)} style={{
                  background:'white', borderRadius:'var(--radius-lg)', padding:'16px 20px',
                  border:`1px solid ${n.is_read?'var(--border-light)':'var(--secondary)'}`,
                  cursor:'pointer', display:'flex', gap:14, alignItems:'flex-start',
                  opacity: n.is_read ? 0.7 : 1, transition:'opacity 0.2s'
                }}>
                  <span style={{fontSize:22}}>{icons[n.type]||'🔔'}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:14,marginBottom:3}}>{n.title}</div>
                    <div style={{fontSize:13,color:'var(--text-muted)'}}>{n.message}</div>
                    <div style={{fontSize:11,color:'var(--text-muted)',marginTop:5}}>{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                  {!n.is_read && <div style={{width:8,height:8,borderRadius:'50%',background:'var(--secondary)',flexShrink:0,marginTop:4}}/>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Notifications;
