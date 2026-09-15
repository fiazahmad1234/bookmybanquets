import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import '../customer/Dashboard.css';

const AdminHalls = () => {
  const navigate = useNavigate();
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('pending');

  useEffect(() => { load(); }, [view]);

  const load = async () => {
    setLoading(true);
    try {
      const res = view==='pending' ? await API.get('/admin/halls/pending') : await API.get('/halls?limit=50');
      setHalls(res.data.halls || []);
    } catch(e) {}
    setLoading(false);
  };

  const approve = async (id, val) => {
    try { await API.put(`/halls/${id}/approve`, {is_approved:val}); load(); } catch(e) {}
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-inner">
          <div className="dash-header">
            <div><h1 className="dash-title">Hall Approvals</h1><p className="dash-subtitle">Approve or reject hall listings submitted by managers.</p></div>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:20}}>
            {['pending','all'].map(v=>(
              <button key={v} className={`btn btn-sm ${view===v?'btn-primary':'btn-ghost'}`} onClick={()=>setView(v)}>
                {v==='pending'?'Pending Approvals':'All Halls'}
              </button>
            ))}
          </div>
          {loading ? <div className="page-loader"><div className="spinner"/></div>
          : halls.length===0 ? (
            <div className="empty-state" style={{background:'white',borderRadius:'var(--radius-lg)',padding:64}}>
              <div style={{fontSize:48}}>✅</div><h3>No pending halls</h3><p>All halls have been reviewed.</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {halls.map(h=>(
                <div key={h.id} className="dash-card" style={{padding:20,display:'flex',gap:16,alignItems:'center',flexWrap:'wrap'}}>
                  {(h.cover_image||h.primary_image) && <img src={h.cover_image||h.primary_image} alt={h.name} style={{width:90,height:65,objectFit:'cover',borderRadius:8,flexShrink:0}}/>}
                  <div style={{flex:1,minWidth:200}}>
                    <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{h.name}</div>
                    <div style={{fontSize:13,color:'var(--text-muted)'}}>{h.city} · {h.capacity_max} guests · PKR {Number(h.price_per_day).toLocaleString()}/day</div>
                    <div style={{fontSize:12,color:'var(--text-muted)',marginTop:2}}>Manager: {h.manager_name} · Type: {h.hall_type}</div>
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                    <span className={`badge ${h.is_approved?'badge-confirmed':'badge-pending'}`}>{h.is_approved?'Approved':'Pending'}</span>
                    <button className="btn btn-ghost btn-sm" onClick={()=>navigate(`/halls/${h.id}`)}>View</button>
                    {!h.is_approved && <button className="btn btn-primary btn-sm" onClick={()=>approve(h.id,true)}>Approve</button>}
                    {h.is_approved && <button className="btn btn-danger btn-sm" onClick={()=>approve(h.id,false)}>Revoke</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminHalls;
