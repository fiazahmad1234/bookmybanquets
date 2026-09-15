import React, { useState, useEffect } from 'react';
import { API } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import '../customer/Dashboard.css';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('pending');

  useEffect(() => { load(); }, [view]);

  const load = async () => {
    setLoading(true);
    try {
      const res = view==='pending' ? await API.get('/admin/vendors/pending') : await API.get('/vendors');
      setVendors(res.data.vendors || []);
    } catch(e) {}
    setLoading(false);
  };

  const approve = async (id, val) => {
    try { await API.put(`/admin/vendors/${id}/approve`, {is_approved:val}); load(); } catch(e) {}
  };

  const typeIcons = {catering:'🍽️',decoration:'🌸',photography:'📸',music:'🎵',transport:'🚌',cake:'🎂',flowers:'🌹',other:'⭐'};

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-inner">
          <div className="dash-header">
            <div><h1 className="dash-title">Vendor Approvals</h1><p className="dash-subtitle">Review and approve vendor marketplace listings.</p></div>
          </div>
          <div style={{display:'flex',gap:8,marginBottom:20}}>
            {['pending','all'].map(v=>(
              <button key={v} className={`btn btn-sm ${view===v?'btn-primary':'btn-ghost'}`} onClick={()=>setView(v)}>
                {v==='pending'?'Pending':'All Vendors'}
              </button>
            ))}
          </div>
          {loading ? <div className="page-loader"><div className="spinner"/></div>
          : vendors.length===0 ? (
            <div className="empty-state" style={{background:'white',borderRadius:'var(--radius-lg)',padding:64}}>
              <div style={{fontSize:48}}>✅</div><h3>No pending vendors</h3>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {vendors.map(v=>(
                <div key={v.id} className="dash-card" style={{padding:20,display:'flex',gap:16,alignItems:'center',flexWrap:'wrap'}}>
                  <div style={{fontSize:36}}>{typeIcons[v.vendor_type]||'⭐'}</div>
                  <div style={{flex:1,minWidth:200}}>
                    <div style={{fontWeight:700,fontSize:15}}>{v.business_name}</div>
                    <div style={{fontSize:13,color:'var(--text-muted)'}}>{v.vendor_type} · {v.city} · PKR {Number(v.price_per_event||0).toLocaleString()}/event</div>
                    <div style={{fontSize:12,color:'var(--text-muted)'}}>Owner: {v.owner_name}</div>
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span className={`badge ${v.is_approved?'badge-confirmed':'badge-pending'}`}>{v.is_approved?'Approved':'Pending'}</span>
                    {!v.is_approved && <button className="btn btn-primary btn-sm" onClick={()=>approve(v.id,true)}>Approve</button>}
                    {v.is_approved && <button className="btn btn-danger btn-sm" onClick={()=>approve(v.id,false)}>Revoke</button>}
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
export default AdminVendors;
