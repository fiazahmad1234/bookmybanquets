import React from 'react';
import { Link } from 'react-router-dom';
import './HallCard.css';

const HallCard = ({ hall, onCompare, compareList = [] }) => {
  const isInCompare = compareList.includes(hall.id);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`star ${i < Math.floor(rating) ? '' : 'empty'}`}>★</span>
    ));
  };

  const primaryImage = hall.primary_image || hall.cover_image ||
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800';

  return (
    <div className="hall-card">
      <div className="hall-card-image">
        <img src={primaryImage} alt={hall.name} loading="lazy" />
        <div className="hall-card-type">{hall.hall_type}</div>
        {hall.avg_rating >= 4.5 && <div className="hall-card-featured">⭐ Top Rated</div>}
        {onCompare && (
          <button
            className={`compare-toggle ${isInCompare ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); onCompare(hall.id); }}
            title={isInCompare ? 'Remove from compare' : 'Add to compare'}
          >
            {isInCompare ? '✓' : '+'} Compare
          </button>
        )}
      </div>

      <div className="hall-card-body">
        <div className="hall-card-header">
          <h3 className="hall-card-name">{hall.name}</h3>
          <div className="hall-card-rating">
            <div className="stars">{renderStars(hall.avg_rating || 0)}</div>
            <span className="rating-text">{parseFloat(hall.avg_rating || 0).toFixed(1)}</span>
            <span className="rating-count">({hall.total_reviews || 0})</span>
          </div>
        </div>

        <div className="hall-card-location">
          📍 {hall.address}, {hall.city}
        </div>

        <div className="hall-card-amenities">
          {hall.is_ac && <span className="amenity-tag">❄️ AC</span>}
          {hall.has_kitchen && <span className="amenity-tag">👨‍🍳 Kitchen</span>}
          {hall.has_stage && <span className="amenity-tag">🎤 Stage</span>}
          {hall.catering_available && <span className="amenity-tag">🍽️ Catering</span>}
          {hall.outdoor_space && <span className="amenity-tag">🌿 Outdoor</span>}
          {hall.has_sound_system && <span className="amenity-tag">🔊 Sound</span>}
        </div>

        <div className="hall-card-footer">
          <div className="hall-card-info">
            <div className="info-item">
              <span className="info-icon">👥</span>
              <span>{hall.capacity_min}–{hall.capacity_max} guests</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🚗</span>
              <span>{hall.parking_capacity || 0} parking</span>
            </div>
          </div>

          <div className="hall-card-price-section">
            <div className="hall-card-price">
              <span className="price-label">Starting from</span>
              <span className="price-amount">PKR {Number(hall.price_per_day).toLocaleString()}</span>
              <span className="price-unit">/day</span>
            </div>
            <Link to={`/halls/${hall.id}`} className="btn btn-primary btn-sm">
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallCard;
