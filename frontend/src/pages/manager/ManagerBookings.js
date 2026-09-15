import React, { useState, useEffect } from 'react';
import { API } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import toast from 'react-hot-toast';
import '../customer/Dashboard.css';
import '../customer/Bookings.css';

const ManagerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [noteModal, setNoteModal] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => { load(); }, [filter]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get(filter !== 'all' ? `/bookings?status=${filter}` : '/bookings');
      setBookings(res.data.bookings || []);
    } catch (e) {}
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/bookings/${id}/status`, { status, manager_notes: note });
      toast.success(`Booking ${status}!`);
      setNoteModal(null); setNote(''); load();
    } catch (e) { toast.error('Action failed'); }
  };

  const badge = (s) => {
    const map = { pending:'badge-pending', confirmed:'badge-confirmed', cancelled:'badge-cancelled', completed:'badge-completed', rejected:'badge-rejected' };
    return <span className={`badge ${map[s]||''}`}>{s}</span>;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-inner">
          <div className="dash-header">
            <div><h1 className="dash-title">Booking Requests</h1><p className="dash-subtitle">Manage all booking requests for your halls.</p></div>
          </div>
          <div className="bookings-tabs">
            {['all','pending','confirmed','completed','cancelled'].map(t => (
              <button key={t} className={`bookings-tab ${filter===t?'active':''}`} onClick={()=>setFilter(t)}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>
          {loading ? <div className="page-loader"><div className="spinner"/></div> :
          bookings.length === 0 ? (
            <div className="empty-state" style={{background:'white',borderRadius:'var(--radius-lg)',padding:64}}>
              <div style={{fontSize:48}}>📋</div><h3>No bookings found</h3>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {bookings.map(b => (
                <div key={b.id} className="dash-card" style={{padding:20}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,flexWrap:'wrap'}}>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                        <div style={{fontWeight:700,fontSize:16}}>{b.hall_name}</div>
                        {badge(b.booking_status)}
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:8}}>
                        {[['Customer',b.customer_name],['Phone',b.customer_phone||'—'],['Event',b.event_type],
                          ['Date',new Date(b.event_date).toDateString()],['Time',`${b.start_time} – ${b.end_time}`],
                          ['Guests',b.guest_count],['Total',`PKR ${Number(b.total_amount).toLocaleString()}`],
                          ['Advance',`PKR ${Number(b.advance_payment).toLocaleString()}`]
                        ].map(([k,v])=>(
                          <div key={k} style={{fontSize:13}}><strong>{k}:</strong> {v}</div>
                        ))}
                      </div>
                      {b.special_requests && <div style={{marginTop:8,fontSize:13,color:'var(--text-muted)',background:'var(--cream)',padding:'8px 12px',borderRadius:8}}>Request: {b.special_requests}</div>}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:8,minWidth:120}}>
                      {b.booking_status==='pending' && <>
                        <button className="btn btn-primary btn-sm" onClick={()=>setNoteModal({id:b.id,action:'confirmed'})}>Confirm</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>setNoteModal({id:b.id,action:'rejected'})}>Reject</button>
                      </>}
                      {b.booking_status==='confirmed' && <button className="btn btn-ghost btn-sm" onClick={()=>updateStatus(b.id,'completed')}>Mark Done</button>}
                      <div style={{fontSize:11,color:'var(--text-muted)',textAlign:'center'}}>#{b.id?.slice(0,8).toUpperCase()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {noteModal && (
          <div className="modal-overlay" onClick={()=>setNoteModal(null)}>
            <div className="modal" onClick={e=>e.stopPropagation()}>
              <h3 className="modal-title">{noteModal.action==='confirmed'?'Confirm Booking':'Reject Booking'}</h3>
              <p className="modal-desc">Add a note for the customer (optional).</p>
              <textarea className="form-input" rows={3} placeholder="Add a note..." value={note} onChange={e=>setNote(e.target.value)}/>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={()=>{setNoteModal(null);setNote('');}}>Cancel</button>
                <button className={`btn ${noteModal.action==='confirmed'?'btn-primary':'btn-danger'}`} onClick={()=>updateStatus(noteModal.id,noteModal.action)}>
                  {noteModal.action==='confirmed'?'Confirm':'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ManagerBookings;
