import React, { useState, useEffect, useRef } from 'react';
import { API, useAuth } from '../context/AuthContext';
import Sidebar from '../components/common/Sidebar';
import './Messages.css';
import './customer/Dashboard.css';

const Messages = () => {
  const { user } = useAuth();
  const [convs, setConvs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { loadConvs(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [msgs]);

  const loadConvs = async () => {
    try { const r = await API.get('/messages/conversations'); setConvs(r.data.conversations||[]); } catch(e){}
  };

  const openConv = async (c) => {
    setSelected(c);
    try { const r = await API.get(`/messages/${c.other_user_id}`); setMsgs(r.data.messages||[]); } catch(e){}
  };

  const send = async () => {
    if (!newMsg.trim()||!selected) return;
    try {
      await API.post('/messages',{receiver_id:selected.other_user_id,message:newMsg});
      setNewMsg(''); openConv(selected); loadConvs();
    } catch(e){}
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-inner">
          <h1 className="dash-title" style={{marginBottom:20}}>Messages</h1>
          <div className="messages-layout">
            <div className="conv-list">
              {convs.length===0 ? (
                <div className="conv-empty"><div style={{fontSize:36}}>💬</div><p>No conversations yet</p><small>Message a hall manager from any hall page</small></div>
              ) : convs.map(c=>(
                <div key={c.other_user_id} className={`conv-item ${selected?.other_user_id===c.other_user_id?'active':''}`} onClick={()=>openConv(c)}>
                  <div className="conv-avatar">{c.other_user_name?.[0]?.toUpperCase()}</div>
                  <div className="conv-info">
                    <div className="conv-name">{c.other_user_name}</div>
                    <div className="conv-role">{c.other_user_role}</div>
                    <div className="conv-last">{c.last_message?.substring(0,35)}...</div>
                  </div>
                  {c.unread_count>0 && <span className="conv-badge">{c.unread_count}</span>}
                </div>
              ))}
            </div>
            <div className="chat-window">
              {!selected ? (
                <div className="chat-empty"><div style={{fontSize:48}}>💬</div><h3>Select a conversation</h3><p>Choose from the left panel to start chatting</p></div>
              ) : <>
                <div className="chat-header">
                  <div className="conv-avatar">{selected.other_user_name?.[0]?.toUpperCase()}</div>
                  <div><div className="chat-header-name">{selected.other_user_name}</div><div className="chat-header-role">{selected.other_user_role}</div></div>
                </div>
                <div className="chat-messages">
                  {msgs.length===0 && <div style={{textAlign:'center',color:'var(--text-muted)',padding:32}}>No messages yet. Say hello!</div>}
                  {msgs.map(m=>(
                    <div key={m.id} className={`msg-row ${m.sender_id===user?.id?'sent':'received'}`}>
                      <div className="msg-bubble">
                        {m.message}
                        <div className="msg-time">{new Date(m.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef}/>
                </div>
                <div className="chat-input-bar">
                  <input className="chat-input" placeholder="Type a message..." value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}/>
                  <button className="btn btn-primary" onClick={send} disabled={!newMsg.trim()}>Send</button>
                </div>
              </>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Messages;
