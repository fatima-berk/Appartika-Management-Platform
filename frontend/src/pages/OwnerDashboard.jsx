import React, { useState, useEffect } from 'react';
import { getOwnerApartments, getOwnerReservations, getPayments, getOwnerReviews } from '../services/api';
import './OwnerDashboard.css';

const OwnerDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalApartments: 0,
    availableApartments: 0,
    occupiedApartments: 0,
    monthlyRevenue: 0,
    totalReservations: 0,
    pendingPayments: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [reviews, setReviews] = useState([]);

  const userProfile = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      if (!userProfile?.id) return;

      const apartmentsResponse = await getOwnerApartments(userProfile.id);
      const reservationsResponse = await getOwnerReservations(userProfile.id);
      const paymentsResponse = await getPayments(userProfile.id);
      
      if (apartmentsResponse.success) {
        const apartments = apartmentsResponse.data || [];
        const availableCount = apartments.filter(apt => apt.available === 1 || apt.available === true).length;
        
        const monthlyRevenue = apartments.reduce((sum, apt) => {
          return sum + parseFloat(apt.price_per_month || 0);
        }, 0);

        const reservations = reservationsResponse.success ? reservationsResponse.data : [];
        const payments = paymentsResponse.success ? paymentsResponse.data : [];
        
        const pendingPaymentsCount = payments.filter(payment => 
          payment.status === 'pending'
        ).length;

        setStats({
          totalApartments: apartments.length,
          availableApartments: availableCount,
          occupiedApartments: apartments.length - availableCount,
          monthlyRevenue: monthlyRevenue,
          totalReservations: reservations.length,
          pendingPayments: pendingPaymentsCount
        });

        generateRecentActivity(apartments, reservations, payments);
        generateNotifications(apartments, reservations, payments);
        loadReviews(apartments);
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (apartments) => {
    try {
      const reviewsResponse = await getOwnerReviews(userProfile.id);
      
      if (reviewsResponse.success) {
        if (reviewsResponse.data && reviewsResponse.data.length > 0) {
          const formattedReviews = reviewsResponse.data.map(review => ({
            id: review.id,
            userName: review.user?.name || 'Locataire',
            apartmentName: review.apartment?.title || 'Appartement',
            rating: review.rating,
            comment: review.comment,
            date: review.created_at || review.date,
            apartmentId: review.apartment_id
          }));
          setReviews(formattedReviews);
        } else {
          setReviews([]);
        }
      } else {
        console.error('Erreur API avis:', reviewsResponse.message);
        setReviews([]);
      }
    } catch (error) {
      console.error('Erreur chargement avis:', error);
      setReviews([]);
    }
  };

  const generateRecentActivity = (apartments, reservations, payments) => {
    const activities = [];
    
    const recentReservations = [...reservations]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);

    recentReservations.forEach(reservation => {
      const apartment = apartments.find(apt => apt.id === reservation.apartment_id);
      const statusText = getReservationStatusText(reservation.status);
      
      activities.push({
        id: `reservation-${reservation.id}`,
        type: 'reservation',
        message: `Réservation ${statusText} - ${apartment?.title || 'Appartement'}`,
        time: formatTimeAgo(reservation.created_at),
        amount: `${reservation.total_price || '0'}dh`,
        status: reservation.status
      });
    });

    const recentPayments = [...payments]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 2);

    recentPayments.forEach(payment => {
      const reservation = reservations.find(res => res.id === payment.reservation_id);
      const apartment = reservation ? apartments.find(apt => apt.id === reservation.apartment_id) : null;
      const statusText = getPaymentStatusText(payment.status);
      
      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        message: `Paiement ${statusText} - ${apartment?.title || 'Appartement'}`,
        time: formatTimeAgo(payment.created_at),
        amount: `${payment.amount || '0'}dh`,
        status: payment.status
      });
    });

    const sortedActivities = activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 4);

    setRecentActivity(sortedActivities);
  };

  const generateNotifications = (apartments, reservations, payments) => {
    const notificationsList = [];

    const pendingReservations = reservations.filter(res => res.status === 'pending');
    if (pendingReservations.length > 0) {
      notificationsList.push({
        id: 'notif-pending-reservations',
        type: 'warning',
        message: `${pendingReservations.length} réservation(s) en attente de validation`,
        time: 'Maintenant',
        action: () => onNavigate('reservations')
      });
    }

    const pendingPayments = payments.filter(payment => payment.status === 'pending');
    if (pendingPayments.length > 0) {
      notificationsList.push({
        id: 'notif-pending-payments',
        type: 'warning',
        message: `${pendingPayments.length} paiement(s) en attente`,
        time: 'Maintenant',
        action: () => onNavigate('payments')
      });
    }

    const availableApartments = apartments.filter(apt => apt.available === 1 || apt.available === true);
    if (availableApartments.length > 0) {
      notificationsList.push({
        id: 'notif-available-apartments',
        type: 'info',
        message: `${availableApartments.length} appartement(s) disponible(s) à la location`,
        time: 'Aujourd\'hui',
        action: () => onNavigate('apartments')
      });
    }

    if (notificationsList.length === 0) {
      notificationsList.push({
        id: 'notif-welcome',
        type: 'info',
        message: 'Bienvenue sur votre tableau de bord !',
        time: 'Aujourd\'hui',
        action: null
      });
    }

    setNotifications(notificationsList);
  };

  const getReservationStatusText = (status) => {
    const statusMap = {
      'pending': 'en attente',
      'accepted': 'acceptée',
      'rejected': 'refusée',
      'cancelled': 'annulée'
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusText = (status) => {
    const statusMap = {
      'paid': 'payé',
      'pending': 'en attente',
      'failed': 'échoué'
    };
    return statusMap[status] || status;
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Récemment';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'À l\'instant';
    } else if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} h`;
    } else if (diffDays === 1) {
      return 'Hier';
    } else {
      return `Il y a ${diffDays} j`;
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color, onClick }) => (
    <div className={`stat-card ${color}`} onClick={onClick}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
        <span className="stat-subtitle">{subtitle}</span>
      </div>
      <div className="stat-trend">→</div>
    </div>
  );

  const QuickAction = ({ icon, title, description, onClick, color }) => (
    <div className={`quick-action ${color}`} onClick={onClick}>
      <div className="action-icon">{icon}</div>
      <div className="action-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <div className="action-arrow">→</div>
    </div>
  );

  const ProfileSection = () => (
    <div className="profile-section">
      <div className="profile-header">
        <div className="profile-avatar">
          {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="profile-info">
          <h3>{userProfile?.name || 'Utilisateur'}</h3>
          <p>{userProfile?.email || 'Email non disponible'}</p>
          <span className="profile-badge">Propriétaire</span>
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <span className="stat-number">{stats.totalApartments}</span>
          <span className="stat-label">Biens</span>
        </div>
        <div className="profile-stat">
          <span className="stat-number">{stats.totalReservations}</span>
          <span className="stat-label">Réservations</span>
        </div>
        <div className="profile-stat">
          <span className="stat-number">{stats.monthlyRevenue}dh</span>
          <span className="stat-label">Revenu/mois</span>
        </div>
      </div>

      <div className="profile-actions">
        <button 
          className="profile-btn primary" 
          onClick={() => onNavigate('profile')}
        >
          📋 Modifier le profil
        </button>
      </div>
    </div>
  );

  const NotificationPanel = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="notification-panel">
        <div className="notification-header">
          <h3>Notifications</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="notification-list">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${notification.type}`}
                onClick={notification.action || undefined}
              >
                <div className="notification-icon">
                  {notification.type === 'warning' && '⚠️'}
                  {notification.type === 'info' && 'ℹ️'}
                  {notification.type === 'success' && '✅'}
                </div>
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">{notification.time}</span>
                </div>
                {notification.action && (
                  <div className="notification-arrow">→</div>
                )}
              </div>
            ))
          ) : (
            <div className="no-notifications">
              <p>Aucune notification</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ReviewsPanel = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const renderStars = (rating) => {
      return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    const handleViewApartment = (apartmentId) => {
      console.log('🏠 Navigation vers appartement:', apartmentId);
      onNavigate('apartments', { selectedApartmentId: apartmentId });
    };

    return (
      <div className="reviews-panel">
        <div className="reviews-header">
          <h3>📝 Avis des Locataires</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.map(review => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="review-user">
                    <strong>{review.userName}</strong>
                    <span className="review-apartment">{review.apartmentName}</span>
                  </div>
                  <div className="review-rating">
                    <span className="stars">{renderStars(review.rating)}</span>
                    <span className="rating-number">({review.rating}/5)</span>
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
                <div className="review-footer">
                  <span className="review-date">
                    {new Date(review.date).toLocaleDateString('fr-FR')}
                  </span>
                  <button 
                    className="view-apartment-btn"
                    onClick={() => handleViewApartment(review.apartmentId)}
                  >
                    Voir l'appartement →
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-reviews">
              <div className="no-reviews-icon">💬</div>
              <p>Aucun avis pour le moment</p>
              <span className="no-reviews-text">
                Les avis de vos locataires apparaîtront ici
              </span>
            </div>
          )}
        </div>
        <div className="reviews-summary">
          <div className="reviews-stats">
            <div className="stat-item">
              <span className="stat-value">{reviews.length}</span>
              <span className="stat-label">Avis total</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'
                }
              </span>
              <span className="stat-label">Note moyenne</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const handleNotificationsClick = () => {
    setShowNotifications(!showNotifications);
    setShowReviews(false);
  };

  const handleReviewsClick = () => {
    setShowReviews(!showReviews);
    setShowNotifications(false);
  };

  const handleViewAllActivities = () => {
    onNavigate('reservations');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Chargement de votre tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="owner-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Tableau de Bord Propriétaire</h1>
          <div className="header-actions">
            <button 
              className="header-btn reviews-btn" 
              onClick={handleReviewsClick}
              title="Avis des locataires"
            >
              💬
              {reviews.length > 0 && (
                <span className="notification-badge">{reviews.length}</span>
              )}
            </button>
            
            <button 
              className="header-btn" 
              onClick={handleNotificationsClick}
            >
              🔔
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <ReviewsPanel 
        isOpen={showReviews} 
        onClose={() => setShowReviews(false)} 
      />

      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />

      <div className="dashboard-content">
        <div className="content-left">
          <div className="welcome-banner">
            <div className="welcome-content">
              <h2>Bon retour, {userProfile?.name?.split(' ')[0] || 'Propriétaire'}! 👋</h2>
              <p>Voici un aperçu de votre activité immobilière aujourd'hui</p>
            </div>
            <div className="welcome-graphic">
              <div className="floating-elements">
                <div className="floating-building">🏢</div>
                <div className="floating-home">🏠</div>
                <div className="floating-coin">💰</div>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <StatCard
              icon="🏢"
              title="Appartements Total"
              value={stats.totalApartments}
              subtitle="Dans votre portfolio"
              color="blue"
              onClick={() => onNavigate('apartments')}
            />
            <StatCard
              icon="✅"
              title="Disponibles"
              value={stats.availableApartments}
              subtitle="Prêts à être loués"
              color="green"
              onClick={() => onNavigate('apartments')}
            />
            <StatCard
              icon="🚫"
              title="Occupés"
              value={stats.occupiedApartments}
              subtitle="Actuellement loués"
              color="red"
              onClick={() => onNavigate('tenants')}
            />
            <StatCard
              icon="💰"
              title="Revenu Mensuel"
              value={`${stats.monthlyRevenue.toLocaleString()}dh`}
              subtitle="Revenu total"
              color="purple"
              onClick={() => onNavigate('payments')}
            />
            <StatCard
              icon="📅"
              title="Réservations"
              value={stats.totalReservations}
              subtitle="Ce mois-ci"
              color="orange"
              onClick={() => onNavigate('reservations')}
            />
            <StatCard
              icon="⏳"
              title="Paiements en Attente"
              value={stats.pendingPayments}
              subtitle="À traiter"
              color="yellow"
              onClick={() => onNavigate('payments')}
            />
          </div>

          <div className="quick-actions-section">
            <div className="section-header">
              <h2>Actions Rapides</h2>
            </div>
            <div className="quick-actions-grid">
              <QuickAction
                icon="➕"
                title="Ajouter un Appartement"
                description="Ajoutez un nouveau bien à votre portfolio"
                color="primary"
                onClick={() => onNavigate('apartments')}
              />
              <QuickAction
                icon="💰"
                title="Gérer les Paiements"
                description="Suivez vos revenus et paiements"
                color="success"
                onClick={() => onNavigate('payments')}
              />
              <QuickAction
                icon="📅"
                title="Voir les Réservations"
                description="Gérez vos réservations en cours"
                color="warning"
                onClick={() => onNavigate('reservations')}
              />
              <QuickAction
                icon="👥"
                title="Gérer les Locataires"
                description="Consultez vos locataires actuels"
                color="info"
                onClick={() => onNavigate('tenants')}
              />
            </div>
          </div>
        </div>

        <div className="content-right">
          <ProfileSection />

          <div className="recent-activity-section">
            <div className="section-header">
              <h2>Activité Récente</h2>
              <button className="view-all-btn" onClick={handleViewAllActivities}>
                Voir tout →
              </button>
            </div>
            <div className="activity-list">
              {recentActivity.length > 0 ? (
                recentActivity.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${activity.type} ${activity.status}`}>
                      {activity.type === 'reservation' && '📅'}
                      {activity.type === 'payment' && '💰'}
                    </div>
                    <div className="activity-content">
                      <p className="activity-message">{activity.message}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                    {activity.amount && (
                      <div className="activity-amount">{activity.amount}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-activity">
                  <p>Aucune activité récente</p>
                  <span className="activity-time">Vos activités apparaîtront ici</span>
                </div>
              )}
            </div>
          </div>

          <div className="performance-section">
            <div className="section-header">
              <h2>Performance du Mois</h2>
              <span className="performance-badge">
                {stats.totalApartments > 0 ? 
                  `${Math.round((stats.occupiedApartments / stats.totalApartments) * 100)}%` : 
                  '0%'
                }
              </span>
            </div>
            <div className="performance-summary">
              <div className="performance-item">
                <span className="performance-label">Taux d'occupation</span>
                <div className="performance-bar">
                  <div 
                    className="performance-fill"
                    style={{ 
                      width: stats.totalApartments > 0 ? 
                        `${(stats.occupiedApartments / stats.totalApartments) * 100}%` : '0%' 
                    }}
                  ></div>
                </div>
                <span className="performance-value">
                  {stats.occupiedApartments}/{stats.totalApartments} biens
                </span>
              </div>
              <div className="performance-item">
                <span className="performance-label">Revenu moyen</span>
                <span className="performance-value">
                  {stats.totalApartments > 0 ? 
                    `${Math.round(stats.monthlyRevenue / stats.totalApartments)}dh/mois` : 
                    '0dh/mois'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;