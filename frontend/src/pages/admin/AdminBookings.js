import React, { useState, useEffect } from 'react';
import { API } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import '../customer/Dashboard.css';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => { load(); }, [status]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get(status ? `/bookings?status=${status}` : '/bookings');
      setBookings(res.data.bookings || []);
    } catch(e) {}
    setLoading(false);
  };

  const badge = (s) => {
    const m = {pending:'badge-pending',confirmed:'badge-confirmed',cancelled:'badge-cancelled',completed:'badge-completed',rejected:'badge-rejected'};
    return <span className={`badge ${m[s]||''}`}>{s}</span>;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-inner">
          <div className="dash-header">
            <div><h1 className="dash-title">All Bookings</h1><p className="dash-subtitle">Platform-wide overview of every booking.</p></div>
          </div>
          <div style={{marginBottom:16}}>
            <select className="form-input" style={{maxWidth:200}} value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {['pending','confirmed','completed','cancelled','rejected'].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="dash-card" style={{overflowX:'auto'}}>
            <table className="data-table">
              <thead><tr><th>Customer</th><th>Hall</th><th>Event</th><th>Date</th><th>Guests</th><th>Amount (PKR)</th><th>Status</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={7} style={{textAlign:'center',padding:32}}><div className="spinner" style={{margin:'0 auto'}}/></td></tr>
                : bookings.length===0 ? <tr><td colSpan={7} style={{textAlign:'center',padding:32,color:'var(--text-muted)'}}>No bookings found</td></tr>
                : bookings.map(b=>(
                  <tr key={b.id}>
                    <td><div style={{fontWeight:600,fontSize:13}}>{b.customer_name}</div><div style={{fontSize:11,color:'var(--text-muted)'}}>{b.customer_email}</div></td>
                    <td style={{fontSize:13}}>{b.hall_name}</td>
                    <td style={{fontSize:13}}>{b.event_type}</td>
                    <td style={{fontSize:13}}>{new Date(b.event_date).toLocaleDateString()}</td>
                    <td style={{textAlign:'center'}}>{b.guest_count}</td>
                    <td style={{fontWeight:600,fontSize:13}}>{Number(b.total_amount).toLocaleString()}</td>
                    <td>{badge(b.booking_status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminBookings;
