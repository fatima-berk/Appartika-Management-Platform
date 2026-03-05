import React, { useState, useEffect } from 'react';
import { reservationService, apartmentService } from '../services/api';
import './ReservationManagement.css';

const ReservationManagement = ({ onNavigate }) => {
  const [reservations, setReservations] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);
  const [notification, setNotification] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [sortBy, setSortBy] = useState('newest');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    cancelled: 0,
    revenue: 0
  });

  useEffect(() => {
    loadReservations();
    loadApartments();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadReservations = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) return;

      const response = await reservationService.getOwnerReservations(user.id);
      
      if (response.success) {
        console.log('📊 Réservations chargées:', response.data);
        setReservations(response.data || []);
        updateStats(response.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
      showNotification('Erreur lors du chargement des réservations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadApartments = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) return;

      const response = await apartmentService.getOwnerApartments(user.id);
      if (response.success) {
        setApartments(response.data || []);
      }
    } catch (error) {
      console.error('Erreur chargement appartements:', error);
    }
  };

  const updateStats = (reservationsList) => {
    const stats = {
      total: reservationsList.length,
      pending: reservationsList.filter(r => r.status === 'pending').length,
      accepted: reservationsList.filter(r => r.status === 'accepted').length,
      rejected: reservationsList.filter(r => r.status === 'rejected').length,
      cancelled: reservationsList.filter(r => r.status === 'cancelled').length,
      revenue: reservationsList
        .filter(r => r.status === 'accepted')
        .reduce((sum, r) => sum + parseFloat(r.total_price || 0), 0)
    };
    setStats(stats);
  };

  const handleStatusUpdate = async (reservationId, newStatus) => {
    try {
      const response = await reservationService.updateReservationStatus(reservationId, newStatus);
      
      if (response.success) {
        setReservations(prev => 
          prev.map(res => 
            res.id === reservationId 
              ? { ...res, status: newStatus }
              : res
          )
        );
        showNotification(`Réservation ${getStatusText(newStatus)} avec succès!`, 'success');
        setTimeout(loadReservations, 500);
      }
    } catch (error) {
      showNotification('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleUpdateReservation = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const updateData = {
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        total_price: formData.get('total_price')
      };

      const response = await reservationService.updateReservation(
        editingReservation.id, 
        updateData
      );
      
      if (response.success) {
        setReservations(prev => 
          prev.map(res => 
            res.id === editingReservation.id 
              ? { ...res, ...updateData }
              : res
          )
        );
        setEditingReservation(null);
        showNotification('Réservation modifiée avec succès!', 'success');
      }
    } catch (error) {
      showNotification('Erreur lors de la modification', 'error');
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      try {
        const response = await reservationService.deleteReservation(reservationId);
        if (response.success) {
          setReservations(prev => prev.filter(res => res.id !== reservationId));
          showNotification('Réservation supprimée avec succès!', 'success');
        }
      } catch (error) {
        showNotification('Erreur lors de la suppression', 'error');
      }
    }
  };

  // Fonction pour obtenir l'image principale d'un appartement
  const getApartmentImage = (apartment) => {
    if (apartment?.images && apartment.images.length > 0) {
      return apartment.images[0].image_url;
    }
    return apartment?.image || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'en attente',
      accepted: 'acceptée',
      rejected: 'refusée',
      cancelled: 'annulée'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      accepted: '#10b981',
      rejected: '#ef4444',
      cancelled: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      accepted: '✅',
      rejected: '❌',
      cancelled: '🚫'
    };
    return icons[status] || '📋';
  };

  const sortedAndFilteredReservations = reservations
    .filter(reservation => {
      const matchesFilter = filter === 'all' || reservation.status === filter;
      const matchesSearch = 
        reservation.apartment?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.apartment?.city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'price-high':
          return (b.total_price || 0) - (a.total_price || 0);
        case 'price-low':
          return (a.total_price || 0) - (b.total_price || 0);
        default:
          return 0;
      }
    });

  const StatCard = ({ icon, title, value, color, onClick }) => (
    <div 
      className={`stat-card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ borderLeftColor: color }}
    >
      <div className="stat-header">
        <div className="stat-icon" style={{ backgroundColor: color + '20', color }}>
          {icon}
        </div>
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
      </div>
    </div>
  );

  // Composant pour la vue Grille
  const ReservationCard = ({ reservation }) => (
    <div className="reservation-card" data-status={reservation.status}>
      <div className="card-header">
        <div className="apartment-info">
          <div className="apartment-image">
            <img 
              src={getApartmentImage(reservation.apartment)} 
              alt={reservation.apartment?.title}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
              }}
            />
            <div className="image-overlay">
              <span className="price-tag">{reservation.apartment?.price_per_month}dh/mois</span>
            </div>
          </div>
          <div className="apartment-details">
            <h3>{reservation.apartment?.title || 'Appartement sans nom'}</h3>
            <div className="location">
              <span className="location-icon">📍</span>
              {reservation.apartment?.address || 'Adresse non spécifiée'}, {reservation.apartment?.city || 'Ville inconnue'}
            </div>
            <div className="apartment-features">
              <div className="feature">
                <span className="feature-icon">🏠</span>
                <span>{reservation.apartment?.surface || '?'}m²</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🛏️</span>
                <span>{reservation.apartment?.rooms || '?'} pièces</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="status-indicator" style={{ backgroundColor: getStatusColor(reservation.status) }}>
          <span className="status-icon">{getStatusIcon(reservation.status)}</span>
          <span className="status-text">{getStatusText(reservation.status)}</span>
        </div>
      </div>

      <div className="reservation-content">
        <div className="client-section">
          <div className="client-avatar">
            {reservation.user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="client-info">
            <h4 className="client-name">{reservation.user?.name || 'Client inconnu'}</h4>
            <p className="client-email">{reservation.user?.email || 'Email non disponible'}</p>
            <div className="reservation-id">ID: #{reservation.id}</div>
          </div>
        </div>

        <div className="dates-section">
          <div className="date-range">
            <div className="date">
              <span className="date-label">Arrivée</span>
              <span className="date-value">
                {reservation.start_date ? new Date(reservation.start_date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : 'Date inconnue'}
              </span>
            </div>
            <div className="date-separator">
              <div className="line"></div>
              <span className="duration">
                {reservation.start_date && reservation.end_date 
                  ? Math.ceil((new Date(reservation.end_date) - new Date(reservation.start_date)) / (1000 * 60 * 60 * 24))
                  : '?'
                }j
              </span>
            </div>
            <div className="date">
              <span className="date-label">Départ</span>
              <span className="date-value">
                {reservation.end_date ? new Date(reservation.end_date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : 'Date inconnue'}
              </span>
            </div>
          </div>
        </div>

        <div className="price-section">
          <div className="price-total">
            <span className="price-label">Total</span>
            <span className="price-value">{reservation.total_price || '0'}dh</span>
          </div>
        </div>
      </div>

      <div className="card-actions">
        {reservation.status === 'pending' && (
          <div className="action-group">
            <button
              className="btn-action btn-accept"
              onClick={() => handleStatusUpdate(reservation.id, 'accepted')}
            >
              <span className="btn-icon">✓</span>
              Accepter
            </button>
            <button
              className="btn-action btn-reject"
              onClick={() => handleStatusUpdate(reservation.id, 'rejected')}
            >
              <span className="btn-icon">✕</span>
              Refuser
            </button>
          </div>
        )}
        
        <div className="action-group">
          <button
            className="btn-action btn-secondary"
            onClick={() => setSelectedReservation(reservation)}
          >
            <span className="btn-icon">👁️</span>
            Détails
          </button>

          <button
            className="btn-action btn-warning"
            onClick={() => setEditingReservation(reservation)}
          >
            <span className="btn-icon">✏️</span>
            Modifier
          </button>
          
          {reservation.status === 'accepted' && (
            <button
              className="btn-action btn-warning"
              onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
            >
              <span className="btn-icon">🚫</span>
              Annuler
            </button>
          )}

         {/*  <button
            className="btn-action btn-danger"
            onClick={() => handleDeleteReservation(reservation.id)}
          >
            <span className="btn-icon">🗑️</span>
            Supprimer
          </button> */}
        </div>
      </div>
    </div>
  );

  // Composant pour la vue Liste
  const ReservationListItem = ({ reservation }) => (
    <div className="reservation-list-item" data-status={reservation.status}>
      <div className="list-item-main">
        <div className="list-apartment-info">
          <img 
            src={getApartmentImage(reservation.apartment)} 
            alt={reservation.apartment?.title}
            className="list-apartment-image"
          />
          <div className="list-apartment-details">
            <h4>{reservation.apartment?.title}</h4>
            <div className="list-location">
              <span>📍 {reservation.apartment?.city}</span>
            </div>
          </div>
        </div>

        <div className="list-client-info">
          <div className="list-client-avatar">
            {reservation.user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="list-client-name">{reservation.user?.name}</div>
            <div className="list-client-email">{reservation.user?.email}</div>
          </div>
        </div>

        <div className="list-dates">
          <div className="list-date-range">
            <div>{new Date(reservation.start_date).toLocaleDateString('fr-FR')}</div>
            <div className="list-date-separator">→</div>
            <div>{new Date(reservation.end_date).toLocaleDateString('fr-FR')}</div>
          </div>
          <div className="list-duration">
            {Math.ceil((new Date(reservation.end_date) - new Date(reservation.start_date)) / (1000 * 60 * 60 * 24))} jours
          </div>
        </div>

        <div className="list-price">
          <div className="list-price-value">{reservation.total_price}dh</div>
        </div>

        <div className="list-status">
          <div 
            className="list-status-badge"
            style={{ backgroundColor: getStatusColor(reservation.status) }}
          >
            {getStatusIcon(reservation.status)} {getStatusText(reservation.status)}
          </div>
        </div>

        <div className="list-actions">
          {reservation.status === 'pending' && (
            <>
              <button
                className="list-btn list-btn-accept"
                onClick={() => handleStatusUpdate(reservation.id, 'accepted')}
                title="Accepter"
              >
                ✓
              </button>
              <button
                className="list-btn list-btn-reject"
                onClick={() => handleStatusUpdate(reservation.id, 'rejected')}
                title="Refuser"
              >
                ✕
              </button>
            </>
          )}
          <button
            className="list-btn list-btn-details"
            onClick={() => setSelectedReservation(reservation)}
            title="Détails"
          >
            👁️
          </button>
          <button
            className="list-btn list-btn-edit"
            onClick={() => setEditingReservation(reservation)}
            title="Modifier"
          >
            ✏️
          </button>
       {/*    <button
            className="list-btn list-btn-delete"
            onClick={() => handleDeleteReservation(reservation.id)}
            title="Supprimer"
          >
            🗑️
          </button> */}
        </div>
      </div>
    </div>
  );

  return (
    <div className="reservation-management premium">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <div className="notification-icon">
              {notification.type === 'success' ? '✅' : '❌'}
            </div>
            <div className="notification-message">{notification.message}</div>
            <button 
              className="notification-close"
              onClick={() => setNotification(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="management-header">
        <div className="header-main">
          <div className="header-title">
            <h1>🎯 Gestion des Réservations</h1>
            <p>Supervisez et gérez toutes les demandes de réservation</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn-back"
              onClick={() => onNavigate('dashboard')}
            >
              <span className="btn-icon">←</span>
              Retour au Dashboard
            </button>
          {/*   <button 
              className="btn-refresh"
              onClick={loadReservations}
              disabled={loading}
            >
              <span className="btn-icon">🔄</span>
              {loading ? 'Chargement...' : 'Actualiser'}
            </button> */}
          </div>
        </div>
      </header>

      {/* Statistics Dashboard */}
      <section className="stats-dashboard">
        <div className="stats-grid">
          <StatCard
            icon="📊"
            title="Total Réservations"
            value={stats.total}
            color="#6366f1"
          />
          <StatCard
            icon="⏳"
            title="En Attente"
            value={stats.pending}
            color="#f59e0b"
            onClick={() => setFilter('pending')}
          />
          <StatCard
            icon="✅"
            title="Acceptées"
            value={stats.accepted}
            color="#10b981"
            onClick={() => setFilter('accepted')}
          />
          <StatCard
            icon="❌"
            title="Refusées"
            value={stats.rejected}
            color="#ef4444"
            onClick={() => setFilter('rejected')}
          />
       
        </div>
      </section>

      {/* Controls Bar */}
      <section className="controls-bar">
        <div className="controls-main">
          <div className="search-container">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Rechercher un appartement, un client, une ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="search-clear"
                  onClick={() => setSearchTerm('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="view-controls">
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <span className="btn-icon">◼️◼️</span>
                Grille
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <span className="btn-icon">☰</span>
                Liste
              </button>
            </div>

            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Plus récentes</option>
              <option value="oldest">Plus anciennes</option>
              <option value="price-high">Prix élevé</option>
              <option value="price-low">Prix bas</option>
            </select>

            <div className="filter-buttons">
              {['all', 'pending', 'accepted', 'rejected', 'cancelled'].map(status => (
                <button
                  key={status}
                  className={`filter-btn ${filter === status ? 'active' : ''}`}
                  onClick={() => setFilter(status)}
                  style={filter === status ? { 
                    backgroundColor: getStatusColor(status) + '20',
                    color: getStatusColor(status),
                    borderColor: getStatusColor(status)
                  } : {}}
                >
                  {getStatusIcon(status)} {getStatusText(status)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reservations Content */}
      <main className="reservations-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Chargement des réservations...</p>
          </div>
        ) : sortedAndFilteredReservations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <div className="empty-icon">📋</div>
            </div>
            <div className="empty-content">
              <h3>Aucune réservation trouvée</h3>
              <p>
                {searchTerm || filter !== 'all' 
                  ? 'Aucune réservation ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez aucune réservation pour le moment.'
                }
              </p>
              {(searchTerm || filter !== 'all') && (
                <button 
                  className="btn-clear-filters"
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                  }}
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="reservations-grid">
            {sortedAndFilteredReservations.map(reservation => (
              <ReservationCard 
                key={reservation.id} 
                reservation={reservation} 
              />
            ))}
          </div>
        ) : (
          <div className="reservations-list">
            <div className="list-header">
              <div className="list-column">Appartement</div>
              <div className="list-column">Client</div>
              <div className="list-column">Dates</div>
              <div className="list-column">Prix</div>
              <div className="list-column">Statut</div>
              <div className="list-column">Actions</div>
            </div>
            <div className="list-body">
              {sortedAndFilteredReservations.map(reservation => (
                <ReservationListItem 
                  key={reservation.id} 
                  reservation={reservation} 
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Détails */}
      {selectedReservation && (
        <div className="modal-overlay" onClick={() => setSelectedReservation(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Détails de la Réservation</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedReservation(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-sections">
                <div className="detail-section">
                  <h3>🏠 Appartement</h3>
                  <div className="apartment-preview">
                    <img 
                      src={getApartmentImage(selectedReservation.apartment)} 
                      alt={selectedReservation.apartment?.title}
                      className="apartment-preview-image"
                    />
                    <div className="apartment-info">
                      <h4>{selectedReservation.apartment?.title}</h4>
                      <p>{selectedReservation.apartment?.address}, {selectedReservation.apartment?.city}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>👤 Client</h3>
                  <div className="client-details">
                    <div className="client-avatar large">
                      {selectedReservation.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4>{selectedReservation.user?.name}</h4>
                      <p>{selectedReservation.user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>📅 Dates et Prix</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Arrivée</label>
                      <span>{new Date(selectedReservation.start_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="detail-item">
                      <label>Départ</label>
                      <span>{new Date(selectedReservation.end_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="detail-item">
                      <label>Durée</label>
                      <span>{Math.ceil((new Date(selectedReservation.end_date) - new Date(selectedReservation.start_date)) / (1000 * 60 * 60 * 24))} jours</span>
                    </div>
                    <div className="detail-item">
                      <label>Prix Total</label>
                      <span className="price-large">{selectedReservation.total_price}dh</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>📊 Statut</h3>
                  <div 
                    className="status-badge large"
                    style={{ backgroundColor: getStatusColor(selectedReservation.status) }}
                  >
                    {getStatusIcon(selectedReservation.status)} {getStatusText(selectedReservation.status).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setSelectedReservation(null)}
                >
                  Fermer
                </button>
                <button
                  className="btn-warning"
                  onClick={() => {
                    setEditingReservation(selectedReservation);
                    setSelectedReservation(null);
                  }}
                >
                  ✏️ Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Édition */}
      {editingReservation && (
        <div className="modal-overlay" onClick={() => setEditingReservation(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Modifier la Réservation</h2>
              <button 
                className="modal-close"
                onClick={() => setEditingReservation(null)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleUpdateReservation} className="modal-body">
              <div className="form-sections">
                <div className="form-section">
                  <h3>📅 Dates de Réservation</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Date d'arrivée *</label>
                      <input
                        type="date"
                        name="start_date"
                        defaultValue={editingReservation.start_date}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Date de départ *</label>
                      <input
                        type="date"
                        name="end_date"
                        defaultValue={editingReservation.end_date}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>💰 Prix</h3>
                  <div className="form-group">
                    <label>Prix total (dh) *</label>
                    <input
                      type="number"
                      name="total_price"
                      defaultValue={editingReservation.total_price}
                      step="0.01"
                      min="0"
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>ℹ️ Informations</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Appartement</label>
                      <span>{editingReservation.apartment?.title}</span>
                    </div>
                    <div className="info-item">
                      <label>Client</label>
                      <span>{editingReservation.user?.name}</span>
                    </div>
                    <div className="info-item">
                      <label>Statut actuel</label>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(editingReservation.status) }}
                      >
                        {getStatusText(editingReservation.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setEditingReservation(null)}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    💾 Enregistrer les modifications
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationManagement;