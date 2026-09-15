import React, { useState, useEffect } from 'react';
import { API } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import '../customer/Dashboard.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => { load(); }, [role]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/users?role=${role}&search=${search}`);
      setUsers(res.data.users || []);
    } catch(e) {}
    setLoading(false);
  };

  const toggle = async (id) => {
    try { await API.put(`/admin/users/${id}/toggle`); load(); } catch(e) {}
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-inner">
          <div className="dash-header">
            <div><h1 className="dash-title">User Management</h1><p className="dash-subtitle">View and manage all platform users.</p></div>
          </div>
          <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
            <input className="form-input" style={{maxWidth:260}} placeholder="Search name or email..." value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()}/>
            <select className="form-input" style={{maxWidth:160}} value={role} onChange={e=>setRole(e.target.value)}>
              <option value="">All Roles</option>
              <option value="customer">Customer</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <button className="btn btn-primary btn-sm" onClick={load}>Search</button>
          </div>
          <div className="dash-card" style={{overflowX:'auto'}}>
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>City</th><th>Verified</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={8} style={{textAlign:'center',padding:32}}><div className="spinner" style={{margin:'0 auto'}}/></td></tr>
                : users.length===0 ? <tr><td colSpan={8} style={{textAlign:'center',padding:32,color:'var(--text-muted)'}}>No users found</td></tr>
                : users.map(u=>(
                  <tr key={u.id}>
                    <td style={{fontWeight:600}}>{u.name}</td>
                    <td style={{fontSize:12}}>{u.email}</td>
                    <td><span className={`badge ${u.role==='admin'?'badge-gold':u.role==='manager'?'badge-confirmed':'badge-pending'}`}>{u.role}</span></td>
                    <td>{u.city||'—'}</td>
                    <td style={{textAlign:'center'}}>{u.is_verified?'✅':'❌'}</td>
                    <td><span className={`badge ${u.is_active?'badge-confirmed':'badge-cancelled'}`}>{u.is_active?'Active':'Inactive'}</span></td>
                    <td style={{fontSize:12}}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td><button className={`btn btn-sm ${u.is_active?'btn-danger':'btn-primary'}`} onClick={()=>toggle(u.id)}>{u.is_active?'Disable':'Enable'}</button></td>
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
export default AdminUsers;
