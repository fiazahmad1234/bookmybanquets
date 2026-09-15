import React, { useState, useEffect } from 'react';
import { API } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import '../customer/Dashboard.css';
import './ManagerCalendar.css';

const ManagerCalendar = () => {
  const [halls, setHalls] = useState([]);
  const [selectedHall, setSelectedHall] = useState('');
  const [bookedDates, setBookedDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayBookings, setDayBookings] = useState([]);

  useEffect(() => { fetchHalls(); }, []);
  useEffect(() => { if (selectedHall) fetchCalendar(); }, [selectedHall, currentMonth]);

  const fetchHalls = async () => {
    try {
      const res = await API.get('/halls/my-halls');
      const hs = res.data.halls || [];
      setHalls(hs);
      if (hs.length > 0) setSelectedHall(hs[0].id);
    } catch (e) {}
  };

  const fetchCalendar = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const res = await API.get(`/halls/${selectedHall}/calendar?year=${year}&month=${month}`);
      setBookedDates(res.data.bookedDates || []);
    } catch (e) {}
  };

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const isBooked = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookedDates.find(b => b.event_date?.startsWith(dateStr));
  };

  const handleDayClick = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    const dayB = bookedDates.filter(b => b.event_date?.startsWith(dateStr));
    setDayBookings(dayB);
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const days = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const today = new Date();
  const isToday = (d) => today.getDate() === d && today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear();

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const statusColor = { confirmed: 'var(--success)', pending: 'var(--warning)', cancelled: 'var(--error)' };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-inner">
          <div className="dash-header">
            <div>
              <h1 className="dash-title">Booking Calendar</h1>
              <p className="dash-subtitle">Visual calendar showing all booked and available dates.</p>
            </div>
          </div>

          {halls.length > 1 && (
            <div style={{ marginBottom: 20 }}>
              <select className="form-input" style={{ maxWidth: 280 }} value={selectedHall} onChange={e => setSelectedHall(e.target.value)}>
                {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
            {/* Calendar */}
            <div className="calendar-card">
              <div className="cal-header">
                <button className="cal-nav" onClick={prevMonth}>‹</button>
                <h3 className="cal-month">{monthName}</h3>
                <button className="cal-nav" onClick={nextMonth}>›</button>
              </div>

              {/* Legend */}
              <div className="cal-legend">
                <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--success)' }} /><span>Confirmed</span></div>
                <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--warning)' }} /><span>Pending</span></div>
                <div className="legend-item"><div className="legend-dot today-dot" /><span>Today</span></div>
              </div>

              <div className="cal-grid">
                {dayNames.map(d => <div key={d} className="cal-day-name">{d}</div>)}
                {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} className="cal-cell empty" />)}
                {[...Array(days)].map((_, i) => {
                  const day = i + 1;
                  const booked = isBooked(day);
                  const todayClass = isToday(day) ? 'today' : '';
                  const bookedClass = booked ? `booked-${booked.booking_status || 'confirmed'}` : '';
                  const selectedClass = selectedDate?.endsWith(`-${String(day).padStart(2, '0')}`) ? 'selected' : '';
                  return (
                    <div key={day} className={`cal-cell ${todayClass} ${bookedClass} ${selectedClass}`}
                      onClick={() => handleDayClick(day)}>
                      <span className="cal-day-num">{day}</span>
                      {booked && <div className="cal-dot" style={{ background: statusColor[booked.booking_status] || 'var(--success)' }} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Info */}
            <div className="cal-detail-card">
              {selectedDate ? (
                <>
                  <h3 className="cal-detail-title">
                    {new Date(selectedDate + 'T00:00:00').toDateString()}
                  </h3>
                  {dayBookings.length === 0 ? (
                    <div className="cal-available">
                      <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
                      <p>This date is <strong>available</strong> for bookings!</p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{dayBookings.length} booking(s) on this day</p>
                      {dayBookings.map((b, i) => (
                        <div key={i} className="cal-booking-item">
                          <div className="cal-time">{b.start_time} – {b.end_time}</div>
                          <span className={`badge badge-${b.booking_status}`}>{b.booking_status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📅</div>
                  <p>Click on a date to see booking details</p>
                </div>
              )}

              <div className="cal-summary">
                <h4>This Month Summary</h4>
                <div className="cal-sum-row">
                  <span>Booked Dates</span>
                  <strong>{[...new Set(bookedDates.map(b => b.event_date?.slice(0, 10)))].length}</strong>
                </div>
                <div className="cal-sum-row">
                  <span>Confirmed</span>
                  <strong style={{ color: 'var(--success)' }}>{bookedDates.filter(b => b.booking_status === 'confirmed').length}</strong>
                </div>
                <div className="cal-sum-row">
                  <span>Pending</span>
                  <strong style={{ color: 'var(--warning)' }}>{bookedDates.filter(b => b.booking_status === 'pending').length}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerCalendar;
