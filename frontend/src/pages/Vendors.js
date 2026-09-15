import React, { useState, useEffect } from 'react';
import { API } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import './Vendors.css';

const FALLBACK_IMAGES = {
  catering:     'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80',
  decoration:   'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=600&q=80',
  photography:  'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&q=80',
  music:        'https://images.unsplash.com/photo-1571266028243-d220c6a7d1bf?w=600&q=80',
  transport:    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=80',
  cake:         'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=600&q=80',
  flowers:      'https://images.unsplash.com/photo-1487530811015-780be8ea0b84?w=600&q=80',
  other:        'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80',
};

const TYPE_ICONS = {
  catering: '🍽️', decoration: '🌸', photography: '📸',
  music: '🎵', transport: '🚌', cake: '🎂', flowers: '🌹', other: '⭐',
};

const PLACEHOLDER_VENDORS = [
  { id: '1', business_name: 'Zafran Catering Services', vendor_type: 'catering',
    description: 'Premium catering with authentic Pakistani and continental cuisine for all event types. Over 15 years of experience serving weddings and corporate events across Lahore.',
    price_per_event: 80000, city: 'Lahore', owner_name: 'Chef Zafran Ahmed',
    phone: '+92-321-4567890', email: 'zafran.catering@gmail.com', avg_rating: 4.7,
    cover_image: FALLBACK_IMAGES.catering },
  { id: '2', business_name: 'Dream Decor Lahore', vendor_type: 'decoration',
    description: 'Premier decoration service in Lahore specializing in wedding stages, floral arrangements, fairy lights, and themed party decorations for all occasions.',
    price_per_event: 60000, city: 'Lahore', owner_name: 'Hina Malik',
    phone: '+92-300-9876543', email: 'dreamdecor.lahore@gmail.com', avg_rating: 4.8,
    cover_image: FALLBACK_IMAGES.decoration },
  { id: '3', business_name: 'Lens & Frame Photography', vendor_type: 'photography',
    description: 'Award-winning wedding and event photography studio based in Lahore. We offer cinematic videography, drone coverage, photo booths, and same-day edits.',
    price_per_event: 75000, city: 'Lahore', owner_name: 'Usman Baig',
    phone: '+92-333-1122334', email: 'lensframe.photo@gmail.com', avg_rating: 4.9,
    cover_image: FALLBACK_IMAGES.photography },
  { id: '4', business_name: 'Sound Wave DJ & Entertainment', vendor_type: 'music',
    description: "Lahore's top DJ and live entertainment provider. Services include professional DJ sets, qawwali nights, live band performances, and complete sound system rental.",
    price_per_event: 45000, city: 'Lahore', owner_name: 'DJ Hassan',
    phone: '+92-312-5566778', email: 'soundwave.dj@gmail.com', avg_rating: 4.6,
    cover_image: FALLBACK_IMAGES.music },
  { id: '5', business_name: 'The Cake Studio Lahore', vendor_type: 'cake',
    description: "Custom wedding cakes and dessert tables by Lahore's finest pastry chefs. Specializing in multi-tier wedding cakes, cupcake towers, and macaron walls.",
    price_per_event: 25000, city: 'Lahore', owner_name: 'Sara Bakers',
    phone: '+92-345-7788990', email: 'cakestudio.lhr@gmail.com', avg_rating: 4.7,
    cover_image: FALLBACK_IMAGES.cake },
  { id: '6', business_name: 'Gulshan Florist & Events', vendor_type: 'flowers',
    description: 'Fresh flower arrangements, bridal bouquets, stage garlands, and complete venue floral decoration by Lahore most beloved florist with over 20 years experience.',
    price_per_event: 35000, city: 'Lahore', owner_name: 'Gulshan Florist',
    phone: '+92-321-9988776', email: 'gulshan.florist@gmail.com', avg_rating: 4.5,
    cover_image: FALLBACK_IMAGES.flowers },
];

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [contactModal, setContactModal] = useState(null);

  useEffect(() => { fetchVendors(); }, [type]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type) params.set('vendor_type', type);
      if (search.trim()) params.set('search', search.trim());
      const res = await API.get(`/vendors?${params.toString()}`);
      const data = res.data.vendors || [];
      // Fix images: if cover_image is missing/broken, use fallback by type
      const fixed = data.map(v => ({
        ...v,
        cover_image: v.cover_image || FALLBACK_IMAGES[v.vendor_type] || FALLBACK_IMAGES.other,
      }));
      setVendors(fixed.length > 0 ? fixed : getFilteredPlaceholders());
    } catch (e) {
      setVendors(getFilteredPlaceholders());
    }
    setLoading(false);
  };

  const getFilteredPlaceholders = () => {
    let list = PLACEHOLDER_VENDORS;
    if (type) list = list.filter(v => v.vendor_type === type);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(v =>
        v.business_name.toLowerCase().includes(q) ||
        v.vendor_type.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q)
      );
    }
    return list;
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setSearch('');
  };

  const vendorTypes = [
    { val: '', label: '🌟 All Vendors' },
    { val: 'catering', label: '🍽️ Catering' },
    { val: 'decoration', label: '🌸 Decoration' },
    { val: 'photography', label: '📸 Photography' },
    { val: 'music', label: '🎵 Music & DJ' },
    { val: 'transport', label: '🚌 Transport' },
    { val: 'cake', label: '🎂 Cake' },
    { val: 'flowers', label: '🌹 Flowers' },
  ];

  return (
    <div>
      <Navbar />
      <div className="vendors-page">
        {/* Header */}
        <div className="vendors-header">
          <div className="container">
            <h1 className="vendors-title">Vendor Marketplace</h1>
            <p className="vendors-subtitle">Find trusted vendors for catering, decoration, photography and more.</p>
            <div style={{ display: 'flex', gap: 12, maxWidth: 520 }}>
              <input
                className="vendors-search"
                type="text"
                placeholder="🔍 Search vendors by name or type..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchVendors()}
              />
              <button className="btn btn-primary" onClick={fetchVendors}>Search</button>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Type Filter Pills */}
          <div className="vendor-types">
            {vendorTypes.map(vt => (
              <button
                key={vt.val}
                className={`vendor-type-btn ${type === vt.val ? 'active' : ''}`}
                onClick={() => handleTypeChange(vt.val)}
              >
                {vt.label}
              </button>
            ))}
          </div>

          {/* Results */}
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : vendors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🛍️</div>
              <h3 style={{ fontSize: 22, marginBottom: 8 }}>No vendors found</h3>
              <p>Try a different category or clear your search.</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setType(''); setSearch(''); }}>
                Show All Vendors
              </button>
            </div>
          ) : (
            <div className="vendors-grid">
              {vendors.map(v => (
                <div key={v.id} className="vendor-card">
                  <div className="vendor-card-img">
                    <img
                      src={v.cover_image}
                      alt={v.business_name}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMAGES[v.vendor_type] || FALLBACK_IMAGES.other;
                      }}
                    />
                    <div className="vendor-type-tag">
                      {TYPE_ICONS[v.vendor_type] || '⭐'} {v.vendor_type}
                    </div>
                  </div>
                  <div className="vendor-card-body">
                    <h3 className="vendor-name">{v.business_name}</h3>
                    <div className="vendor-owner">by {v.owner_name}</div>
                    <p className="vendor-desc">{(v.description || '').substring(0, 110)}...</p>
                    <div className="vendor-meta">
                      <span>📍 {v.city}</span>
                      {v.avg_rating > 0 && <span>⭐ {parseFloat(v.avg_rating).toFixed(1)}</span>}
                    </div>
                    <div className="vendor-footer">
                      <div className="vendor-price">
                        PKR {Number(v.price_per_event || 0).toLocaleString()}/event
                      </div>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setContactModal(v)}
                      >
                        📞 Contact
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CONTACT MODAL ────────────────────────────────────── */}
      {contactModal && (
        <div className="modal-overlay" onClick={() => setContactModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            {/* Modal Header */}
            <div style={{
              background: 'var(--dark)',
              margin: '-32px -32px 24px -32px',
              padding: '20px 24px',
              borderRadius: '16px 16px 0 0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 17 }}>
                  {contactModal.business_name}
                </div>
                <div style={{ color: 'var(--secondary)', fontSize: 12, marginTop: 3 }}>
                  {TYPE_ICONS[contactModal.vendor_type]} {contactModal.vendor_type} &nbsp;·&nbsp; 📍 {contactModal.city}
                </div>
              </div>
              <button
                onClick={() => setContactModal(null)}
                style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none',
                  borderRadius: '50%', width: 32, height: 32, cursor: 'pointer',
                  color: 'white', fontSize: 16, display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}
              >✕</button>
            </div>

            <h3 style={{ fontSize: 18, marginBottom: 6, color: 'var(--text-primary)' }}>Contact Information</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Choose how you want to reach {contactModal.owner_name || 'this vendor'}:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Phone Call */}
              <a
                href={`tel:${(contactModal.phone || contactModal.owner_phone || '+923001234567').replace(/\s/g, '')}`}
                className="btn btn-primary"
                style={{ textDecoration: 'none', textAlign: 'center', fontSize: 14 }}
              >
                📞 Call Now &nbsp;
                <span style={{ opacity: 0.8, fontSize: 12 }}>
                  {contactModal.phone || contactModal.owner_phone || '+92-300-123-4567'}
                </span>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${(contactModal.phone || contactModal.owner_phone || '923001234567').replace(/[^0-9]/g, '')}?text=Hello! I found your business on BookMyBanquets. I am interested in ${contactModal.business_name} services for my event. Can you please share more details?`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 8, padding: '11px 20px', borderRadius: 'var(--radius-lg)',
                  background: '#25D366', color: 'white', fontWeight: 600,
                  textDecoration: 'none', fontSize: 14
                }}
              >
                <span style={{ fontSize: 18 }}>💬</span> WhatsApp Message
              </a>

              {/* Email */}
              {(contactModal.email || contactModal.owner_email) && (
                <a
                  href={`mailto:${contactModal.email || contactModal.owner_email}?subject=Event Vendor Inquiry - ${contactModal.business_name}&body=Hello,%0A%0AI found your business on BookMyBanquets and I am interested in your services for my upcoming event.%0A%0APlease share your availability and package details.%0A%0AThank you.`}
                  className="btn btn-ghost"
                  style={{ textDecoration: 'none', textAlign: 'center', fontSize: 14 }}
                >
                  ✉️ Send Email &nbsp;
                  <span style={{ opacity: 0.7, fontSize: 11 }}>
                    {contactModal.email || contactModal.owner_email}
                  </span>
                </a>
              )}
            </div>

            {/* Info box */}
            <div style={{
              marginTop: 20, background: 'var(--cream)', borderRadius: 10,
              padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)',
              borderLeft: '3px solid var(--secondary)'
            }}>
              💡 Starting from <strong>PKR {Number(contactModal.price_per_event || 0).toLocaleString()}/event</strong>.
              Mention <strong>BookMyBanquets</strong> for best rates.
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setContactModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Vendors;