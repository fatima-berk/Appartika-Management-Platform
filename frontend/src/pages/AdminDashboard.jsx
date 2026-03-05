import React, { useState, useEffect } from 'react';
import {
  getAdminStats,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getAdminApartments,
  updateAdminApartment,
  deleteAdminApartment,
  getAdminReservations,
  updateAdminReservation,
  deleteAdminReservation,
  getAdminPayments,
  updateAdminPayment,
  deleteAdminPayment,
  getAdminReviews,
  updateAdminReview,
  deleteAdminReview,
} from '../services/api';
import '../styles/admin.css';

// Importation des icônes Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faBuilding,
  faCalendarAlt,
  faMoneyBillWave,
  faStar,
  faSync,
  faSearch,
  faFilter,
  faEdit,
  faTrash,
  faPlus,
  faChevronLeft,
  faChevronRight,
  faTimes,
  faSave,
  faCheckCircle,
  faClock,
  faExclamationCircle,
  faCashRegister,
  faCreditCard,
  faUniversity,
  faUserTie,
  faUser,
  faHome,
  faCalendarCheck,
  faCalendarTimes,
  faBan,
  faCheck,
  faExclamationTriangle,
  faChartLine,
  faEye,
  faEyeSlash,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faRulerCombined,
  faDoorOpen,
  faDoorClosed,
  faCommentDots,
  faStar as faSolidStar,
  faStarHalfAlt,
  faUserShield,
  faUserTag
} from '@fortawesome/free-solid-svg-icons';

export default function AdminDashboard({ currentPage, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentPage === 'dashboard') {
      loadStats();
    }
  }, [currentPage]);

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminStats();
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.message || 'Erreur lors du chargement des statistiques');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  if (currentPage === 'dashboard') {
    return (
      <div className="admin-dashboard">
        <div className="admin-header">
          <h2><FontAwesomeIcon icon={faChartLine} style={{ marginRight: '10px' }} />Tableau de Bord Administrateur</h2>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Chargement des statistiques...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p><FontAwesomeIcon icon={faExclamationCircle} /> {error}</p>
            <button onClick={loadStats} className="btn-primary">Réessayer</button>
          </div>
        ) : stats ? (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faUsers} style={{ fontSize: '2rem', color: 'white' }} />
              </div>
              <div className="stat-content">
                <h3>Utilisateurs</h3>
                <p className="stat-value">{stats.total_users}</p>
                <div className="stat-details">
                  <span><FontAwesomeIcon icon={faUserTie} /> Propriétaires: {stats.total_owners}</span>
                  <span><FontAwesomeIcon icon={faUser} /> Clients: {stats.total_clients}</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faBuilding} style={{ fontSize: '2rem', color: 'white' }} />
              </div>
              <div className="stat-content">
                <h3>Appartements</h3>
                <p className="stat-value">{stats.total_apartments}</p>
                <div className="stat-details">
                  <span><FontAwesomeIcon icon={faDoorOpen} /> Disponibles: {stats.available_apartments}</span>
                  <span><FontAwesomeIcon icon={faDoorClosed} /> Occupés: {stats.total_apartments - stats.available_apartments}</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize: '2rem', color: 'white' }} />
              </div>
              <div className="stat-content">
                <h3>Réservations</h3>
                <p className="stat-value">{stats.total_reservations}</p>
                <div className="stat-details">
                  <span><FontAwesomeIcon icon={faClock} /> En attente: {stats.pending_reservations}</span>
                  <span><FontAwesomeIcon icon={faCheckCircle} /> Acceptées: {stats.accepted_reservations}</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faMoneyBillWave} style={{ fontSize: '2rem', color: 'white' }} />
              </div>
              <div className="stat-content">
                <h3>Revenus</h3>
              
                <p className="stat-value">{parseFloat(stats.total_revenue || 0).toFixed(2)} dh</p>
                <div className="stat-details">
                  <span><FontAwesomeIcon icon={faClock} /> En attente: {parseFloat(stats.pending_payments || 0).toFixed(2)} dh</span>
                  <span><FontAwesomeIcon icon={faCreditCard} /> Total paiements: {stats.total_payments || 0}</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FontAwesomeIcon icon={faStar} style={{ fontSize: '2rem', color: 'white' }} />
              </div>
              <div className="stat-content">
                <h3>Avis</h3>
                <p className="stat-value">{stats.total_reviews || 0}</p>
                <div className="stat-details">
                  <span><FontAwesomeIcon icon={faSolidStar} /> Note moyenne: {stats.average_rating || 0}/5</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (currentPage === 'users') {
    return <UserManagement />;
  }

  if (currentPage === 'apartments') {
    return <ApartmentManagementAdmin />;
  }

  if (currentPage === 'reservations') {
    return <ReservationManagementAdmin />;
  }

  if (currentPage === 'payments') {
    return <PaymentManagementAdmin />;
  }

  if (currentPage === 'reviews') {
    return <ReviewManagementAdmin />;
  }

  return null;
}

// Composant de gestion des paiements
function PaymentManagementAdmin() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  useEffect(() => {
    loadPayments();
  }, [search, statusFilter, methodFilter, pagination.current_page]);

  const loadPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminPayments({
        page: pagination.current_page,
        search,
        status: statusFilter,
        method: methodFilter
      });
      if (response.success) {
        setPayments(response.data);
        setPagination(response.pagination || pagination);
      } else {
        setError(response.message || 'Erreur lors du chargement des paiements');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (paymentId, newStatus) => {
    try {
      const response = await updateAdminPayment(paymentId, { status: newStatus });
      if (response.success) {
        loadPayments();
      } else {
        alert(response.message || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      alert('Erreur de connexion au serveur');
    }
  };

  const handleMethodUpdate = async (paymentId, newMethod) => {
    try {
      const response = await updateAdminPayment(paymentId, { method: newMethod });
      if (response.success) {
        loadPayments();
      } else {
        alert(response.message || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      alert('Erreur de connexion au serveur');
    }
  };

  const handleDelete = async (paymentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) return;

    try {
      const response = await deleteAdminPayment(paymentId);
      if (response.success) {
        loadPayments();
      } else {
        alert(response.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      alert('Erreur de connexion au serveur');
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'cash': return <FontAwesomeIcon icon={faCashRegister} />;
      case 'card': return <FontAwesomeIcon icon={faCreditCard} />;
      case 'transfer': return <FontAwesomeIcon icon={faUniversity} />;
      default: return null;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <FontAwesomeIcon icon={faCheckCircle} />;
      case 'pending': return <FontAwesomeIcon icon={faClock} />;
      case 'failed': return <FontAwesomeIcon icon={faExclamationCircle} />;
      default: return null;
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2><FontAwesomeIcon icon={faMoneyBillWave} style={{ marginRight: '10px' }} />Gestion des Paiements</h2>
      </div>

      <div className="filters">
        <div className="search-wrapper" style={{ position: 'relative', flex: 1 }}>
          <FontAwesomeIcon icon={faSearch} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#7f8c8d'
          }} />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou appartement..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination({ ...pagination, current_page: 1 });
            }}
            className="search-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <div className="filter-wrapper" style={{ position: 'relative' }}>
          <FontAwesomeIcon icon={faFilter} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#7f8c8d',
            zIndex: 1
          }} />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination({ ...pagination, current_page: 1 });
            }}
            className="filter-select"
            style={{ paddingLeft: '40px' }}
          >
            <option value="">Tous les statuts</option>
            <option value="paid">Payé</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoué</option>
          </select>
        </div>
        <div className="filter-wrapper" style={{ position: 'relative' }}>
          <FontAwesomeIcon icon={faCreditCard} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#7f8c8d',
            zIndex: 1
          }} />
          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPagination({ ...pagination, current_page: 1 });
            }}
            className="filter-select"
            style={{ paddingLeft: '40px' }}
          >
            <option value="">Toutes les méthodes</option>
            <option value="cash">Espèces</option>
            <option value="card">Carte</option>
            <option value="transfer">Virement</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p><FontAwesomeIcon icon={faExclamationCircle} /> {error}</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Appartement</th>
                  <th>Montant</th>
                  <th>Méthode</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id}>
                    <td>{payment.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faUser} style={{ color: '#7f8c8d' }} />
                        <div>
                          {payment.reservation?.user?.name || payment.user?.name || '-'}
                          <br />
                          <small style={{ color: '#7f8c8d' }}>
                            <FontAwesomeIcon icon={faEnvelope} /> {payment.reservation?.user?.email || payment.user?.email || '-'}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faHome} style={{ color: '#7f8c8d' }} />
                        {payment.reservation?.apartment?.title || '-'}
                      </div>
                    </td>
                  
                    <td><strong>{parseFloat(payment.amount || 0).toFixed(2)} dh</strong></td>
                    <td>
                      <select
                        value={payment.method}
                        onChange={(e) => handleMethodUpdate(payment.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="cash"><FontAwesomeIcon icon={faCashRegister} /> Espèces</option>
                        <option value="card"><FontAwesomeIcon icon={faCreditCard} /> Carte</option>
                        <option value="transfer"><FontAwesomeIcon icon={faUniversity} /> Virement</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={payment.status}
                        onChange={(e) => handleStatusUpdate(payment.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending"><FontAwesomeIcon icon={faClock} /> En attente</option>
                        <option value="paid"><FontAwesomeIcon icon={faCheckCircle} /> Payé</option>
                        <option value="failed"><FontAwesomeIcon icon={faExclamationCircle} /> Échoué</option>
                      </select>
                    </td>
                    <td>
                      <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px', color: '#7f8c8d' }} />
                      {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <button onClick={() => handleDelete(payment.id)} className="btn-delete">
                        <FontAwesomeIcon icon={faTrash} /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.last_page > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPagination({ ...pagination, current_page: pagination.current_page - 1 })}
                disabled={pagination.current_page === 1}
              >
                <FontAwesomeIcon icon={faChevronLeft} /> Précédent
              </button>
              <span>Page {pagination.current_page} sur {pagination.last_page}</span>
              <button
                onClick={() => setPagination({ ...pagination, current_page: pagination.current_page + 1 })}
                disabled={pagination.current_page === pagination.last_page}
              >
                Suivant <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Composant de gestion des avis
function ReviewManagementAdmin() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    loadReviews();
  }, [search, ratingFilter, pagination.current_page]);

  const loadReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminReviews({
        page: pagination.current_page,
        search,
        rating: ratingFilter
      });
      if (response.success) {
        setReviews(response.data);
        setPagination(response.pagination || pagination);
      } else {
        setError(response.message || 'Erreur lors du chargement des avis');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating || 5,
      comment: review.comment || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;

    try {
      const response = await deleteAdminReview(reviewId);
      if (response.success) {
        loadReviews();
      } else {
        alert(response.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      alert('Erreur de connexion au serveur');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await updateAdminReview(editingReview.id, formData);
      if (response.success) {
        setShowModal(false);
        setEditingReview(null);
        loadReviews();
      } else {
        setError(response.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReview(null);
    setError('');
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <FontAwesomeIcon
        key={index}
        icon={index < rating ? faSolidStar : faStar}
        style={{ color: index < rating ? '#f39c12' : '#ddd' }}
      />
    ));
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2><FontAwesomeIcon icon={faStar} style={{ marginRight: '10px' }} />Gestion des Avis</h2>
      </div>

      <div className="filters">
        <div className="search-wrapper" style={{ position: 'relative', flex: 1 }}>
          <FontAwesomeIcon icon={faSearch} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#7f8c8d'
          }} />
          <input
            type="text"
            placeholder="Rechercher par nom, email, appartement ou commentaire..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination({ ...pagination, current_page: 1 });
            }}
            className="search-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <div className="filter-wrapper" style={{ position: 'relative' }}>
          <FontAwesomeIcon icon={faFilter} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#7f8c8d',
            zIndex: 1
          }} />
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPagination({ ...pagination, current_page: 1 });
            }}
            className="filter-select"
            style={{ paddingLeft: '40px' }}
          >
            <option value="">Toutes les notes</option>
            <option value="5">5 étoiles</option>
            <option value="4">4 étoiles</option>
            <option value="3">3 étoiles</option>
            <option value="2">2 étoiles</option>
            <option value="1">1 étoile</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p><FontAwesomeIcon icon={faExclamationCircle} /> {error}</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Appartement</th>
                  <th>Note</th>
                  <th>Commentaire</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(review => (
                  <tr key={review.id}>
                    <td>{review.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faUser} style={{ color: '#7f8c8d' }} />
                        <div>
                          {review.user?.name || '-'}
                          <br />
                          <small style={{ color: '#7f8c8d' }}>
                            <FontAwesomeIcon icon={faEnvelope} /> {review.user?.email || '-'}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faHome} style={{ color: '#7f8c8d' }} />
                        {review.apartment?.title || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '1.2rem', display: 'flex', gap: '2px' }}>
                        {renderStars(review.rating)}
                      </div>
                      <small>({review.rating}/5)</small>
                    </td>
                    <td className="comment-cell">
                      {review.comment ? (
                        <span title={review.comment}>
                          <FontAwesomeIcon icon={faCommentDots} style={{ marginRight: '8px', color: '#7f8c8d' }} />
                          {review.comment}
                        </span>
                      ) : (
                        <span className="no-comment">Aucun commentaire</span>
                      )}
                    </td>
                    <td>
                      <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px', color: '#7f8c8d' }} />
                      {new Date(review.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <button onClick={() => handleEdit(review)} className="btn-edit">
                        <FontAwesomeIcon icon={faEdit} /> Modifier
                      </button>
                      <button onClick={() => handleDelete(review.id)} className="btn-delete">
                        <FontAwesomeIcon icon={faTrash} /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.last_page > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPagination({ ...pagination, current_page: pagination.current_page - 1 })}
                disabled={pagination.current_page === 1}
              >
                <FontAwesomeIcon icon={faChevronLeft} /> Précédent
              </button>
              <span>Page {pagination.current_page} sur {pagination.last_page}</span>
              <button
                onClick={() => setPagination({ ...pagination, current_page: pagination.current_page + 1 })}
                disabled={pagination.current_page === pagination.last_page}
              >
                Suivant <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          )}
        </>
      )}

      {showModal && editingReview && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#7f8c8d'
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h3><FontAwesomeIcon icon={faEdit} style={{ marginRight: '10px' }} />Modifier l'avis</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label><FontAwesomeIcon icon={faStar} style={{ marginRight: '8px' }} />Note *</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating })}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '2rem',
                        cursor: 'pointer',
                        color: rating <= formData.rating ? '#f39c12' : '#ddd',
                        padding: '5px'
                      }}
                    >
                      <FontAwesomeIcon icon={rating <= formData.rating ? faSolidStar : faStar} />
                    </button>
                  ))}
                </div>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  required
                >
                  <option value="1">1 étoile</option>
                  <option value="2">2 étoiles</option>
                  <option value="3">3 étoiles</option>
                  <option value="4">4 étoiles</option>
                  <option value="5">5 étoiles</option>
                </select>
              </div>
              <div className="form-group">
                <label><FontAwesomeIcon icon={faCommentDots} style={{ marginRight: '8px' }} />Commentaire</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  rows="4"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
              {error && <div className="error-message"><FontAwesomeIcon icon={faExclamationCircle} /> {error}</div>}
              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  <FontAwesomeIcon icon={faTimes} /> Annuler
                </button>
                <button type="submit" className="btn-primary">
                  <FontAwesomeIcon icon={faSave} /> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant de gestion des utilisateurs
function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
    phone: ''
  });

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, pagination.current_page]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminUsers({
        page: pagination.current_page,
        search,
        role: roleFilter
      });
      if (response.success) {
        setUsers(response.data);
        setPagination(response.pagination || pagination);
      } else {
        setError(response.message || 'Erreur lors du chargement des utilisateurs');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'client', phone: '' });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'client',
      phone: user.phone || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const response = await deleteAdminUser(userId);
      if (response.success) {
        loadUsers();
      } else {
        alert(response.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      alert('Erreur de connexion au serveur');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userData = { ...formData };
      if (!userData.password) delete userData.password;

      let response;
      if (editingUser) {
        response = await updateAdminUser(editingUser.id, userData);
      } else {
        if (!userData.password) {
          setError('Le mot de passe est requis pour créer un utilisateur');
          return;
        }
        response = await createAdminUser(userData);
      }

      if (response.success) {
        setShowModal(false);
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: 'client', phone: '' });
        loadUsers();
      } else {
        setError(response.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'client', phone: '' });
    setError('');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <FontAwesomeIcon icon={faUserShield} />;
      case 'owner': return <FontAwesomeIcon icon={faUserTie} />;
      case 'client': return <FontAwesomeIcon icon={faUser} />;
      default: return <FontAwesomeIcon icon={faUser} />;
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2><FontAwesomeIcon icon={faUsers} style={{ marginRight: '10px' }} />Gestion des Utilisateurs</h2>
        <button onClick={handleCreate} className="btn-primary">
          <FontAwesomeIcon icon={faPlus} /> Ajouter un utilisateur
        </button>
      </div>

      <div className="filters">
        <div className="search-wrapper" style={{ position: 'relative', flex: 1 }}>
          <FontAwesomeIcon icon={faSearch} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#7f8c8d'
          }} />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination({ ...pagination, current_page: 1 });
            }}
            className="search-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <div className="filter-wrapper" style={{ position: 'relative' }}>
          <FontAwesomeIcon icon={faFilter} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#7f8c8d',
            zIndex: 1
          }} />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPagination({ ...pagination, current_page: 1 });
            }}
            className="filter-select"
            style={{ paddingLeft: '40px' }}
          >
            <option value="">Tous les rôles</option>
            <option value="admin">Administrateur</option>
            <option value="owner">Propriétaire</option>
            <option value="client">Client</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p><FontAwesomeIcon icon={faExclamationCircle} /> {error}</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Téléphone</th>
                  <th>Date de création</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getRoleIcon(user.role)}
                        {user.name}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faEnvelope} style={{ color: '#7f8c8d' }} />
                        {user.email}
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {getRoleIcon(user.role)} {user.role === 'admin' ? 'Admin' : user.role === 'owner' ? 'Propriétaire' : 'Client'}
                      </span>
                    </td>
                    <td>
                      {user.phone ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FontAwesomeIcon icon={faPhone} style={{ color: '#7f8c8d' }} />
                          {user.phone}
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px', color: '#7f8c8d' }} />
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <button onClick={() => handleEdit(user)} className="btn-edit">
                        <FontAwesomeIcon icon={faEdit} /> Modifier
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="btn-delete">
                        <FontAwesomeIcon icon={faTrash} /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.last_page > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPagination({ ...pagination, current_page: pagination.current_page - 1 })}
                disabled={pagination.current_page === 1}
              >
                <FontAwesomeIcon icon={faChevronLeft} /> Précédent
              </button>
              <span>Page {pagination.current_page} sur {pagination.last_page}</span>
              <button
                onClick={() => setPagination({ ...pagination, current_page: pagination.current_page + 1 })}
                disabled={pagination.current_page === pagination.last_page}
              >
                Suivant <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={handleCloseModal}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#7f8c8d'
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h3><FontAwesomeIcon icon={editingUser ? faEdit : faPlus} style={{ marginRight: '10px' }} />
              {editingUser ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label><FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />Nom complet *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label><FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '8px' }} />Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label><FontAwesomeIcon icon={editingUser ? faEyeSlash : faEye} style={{ marginRight: '8px' }} />
                  Mot de passe {editingUser ? '(laisser vide pour ne pas changer)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label><FontAwesomeIcon icon={faUserTag} style={{ marginRight: '8px' }} />Rôle *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="client">Client</option>
                  <option value="owner">Propriétaire</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <div className="form-group">
                <label><FontAwesomeIcon icon={faPhone} style={{ marginRight: '8px' }} />Téléphone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              {error && <div className="error-message"><FontAwesomeIcon icon={faExclamationCircle} /> {error}</div>}
              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  <FontAwesomeIcon icon={faTimes} /> Annuler
                </button>
                <button type="submit" className="btn-primary">
                  <FontAwesomeIcon icon={faSave} /> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant de gestion des appartements
function ApartmentManagementAdmin() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [availableFilter, setAvailableFilter] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  useEffect(() => {
    loadApartments();
  }, [search, cityFilter, availableFilter, pagination.current_page]);

  const loadApartments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminApartments({
        page: pagination.current_page,
        search,
        city: cityFilter,
        available: availableFilter
      });
      if (response.success) {
        setApartments(response.data);
        setPagination(response.pagination || pagination);
      } else {
        setError(response.message || 'Erreur lors du chargement des appartements');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (apartmentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet appartement ?')) return;

    try {
      const response = await deleteAdminApartment(apartmentId);
      if (response.success) {
        loadApartments();
      } else {
        alert(response.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      alert('Erreur de connexion au serveur');
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2><FontAwesomeIcon icon={faBuilding} style={{ marginRight: '10px' }} />Gestion des Appartements</h2>
      </div>

      <div className="filters">
        <div className="search-wrapper" style={{ position: 'relative', flex: 1 }}>
          <FontAwesomeIcon icon={faSearch} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#7f8c8d'
          }} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination({ ...pagination, current_page: 1 });
            }}
            className="search-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <div className="search-wrapper" style={{ position: 'relative', flex: 1 }}>
          <FontAwesomeIcon icon={faMapMarkerAlt} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#7f8c8d'
          }} />
          <input
            type="text"
            placeholder="Ville..."
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setPagination({ ...pagination, current_page: 1 });
            }}
            className="search-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <div className="filter-wrapper" style={{ position: 'relative' }}>
          <FontAwesomeIcon icon={faFilter} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#7f8c8d',
            zIndex: 1
          }} />
          <select
            value={availableFilter}
            onChange={(e) => {
              setAvailableFilter(e.target.value);
              setPagination({ ...pagination, current_page: 1 });
            }}
            className="filter-select"
            style={{ paddingLeft: '40px' }}
          >
            <option value="">Tous</option>
            <option value="true">Disponibles</option>
            <option value="false">Non disponibles</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p><FontAwesomeIcon icon={faExclamationCircle} /> {error}</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Titre</th>
                  <th>Propriétaire</th>
                  <th>Ville</th>
                  <th>Prix/mois</th>
                  <th>Surface</th>
                  <th>Pièces</th>
                  <th>Disponible</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apartments.map(apt => (
                  <tr key={apt.id}>
                    <td>{apt.id}</td>
                    <td>{apt.title}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faUserTie} style={{ color: '#7f8c8d' }} />
                        {apt.owner?.name || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: '#7f8c8d' }} />
                        {apt.city}
                      </div>
                    </td>
                    <td>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    {parseFloat(apt.price_per_month || 0).toFixed(2)} dh
  </div>
</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faRulerCombined} style={{ color: '#7f8c8d' }} />
                        {apt.surface} m²
                      </div>
                    </td>
                    <td>{apt.rooms}</td>
                    <td>
                      <span className={apt.available ? 'status-available' : 'status-unavailable'}>
                        <FontAwesomeIcon icon={apt.available ? faDoorOpen : faDoorClosed} /> 
                        {apt.available ? ' Disponible' : ' Indisponible'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(apt.id)} className="btn-delete">
                        <FontAwesomeIcon icon={faTrash} /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.last_page > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPagination({ ...pagination, current_page: pagination.current_page - 1 })}
                disabled={pagination.current_page === 1}
              >
                <FontAwesomeIcon icon={faChevronLeft} /> Précédent
              </button>
              <span>Page {pagination.current_page} sur {pagination.last_page}</span>
              <button
                onClick={() => setPagination({ ...pagination, current_page: pagination.current_page + 1 })}
                disabled={pagination.current_page === pagination.last_page}
              >
                Suivant <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Composant de gestion des réservations
function ReservationManagementAdmin() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

  useEffect(() => {
    loadReservations();
  }, [statusFilter, search, pagination.current_page]);

  const loadReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminReservations({
        page: pagination.current_page,
        status: statusFilter,
        search
      });
      if (response.success) {
        setReservations(response.data);
        setPagination(response.pagination || pagination);
      } else {
        setError(response.message || 'Erreur lors du chargement des réservations');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reservationId, newStatus) => {
    try {
      const response = await updateAdminReservation(reservationId, { status: newStatus });
      if (response.success) {
        loadReservations();
      } else {
        alert(response.message || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      alert('Erreur de connexion au serveur');
    }
  };

  const handleDelete = async (reservationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) return;

    try {
      const response = await deleteAdminReservation(reservationId);
      if (response.success) {
        loadReservations();
      } else {
        alert(response.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      alert('Erreur de connexion au serveur');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FontAwesomeIcon icon={faClock} />;
      case 'accepted': return <FontAwesomeIcon icon={faCheckCircle} />;
      case 'rejected': return <FontAwesomeIcon icon={faTimes} />;
      case 'cancelled': return <FontAwesomeIcon icon={faBan} />;
      default: return null;
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2><FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '10px' }} />Gestion des Réservations</h2>
      </div>

      <div className="filters">
        <div className="search-wrapper" style={{ position: 'relative', flex: 1 }}>
          <FontAwesomeIcon icon={faSearch} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#7f8c8d'
          }} />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou titre..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination({ ...pagination, current_page: 1 });
            }}
            className="search-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <div className="filter-wrapper" style={{ position: 'relative' }}>
          <FontAwesomeIcon icon={faFilter} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#7f8c8d',
            zIndex: 1
          }} />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination({ ...pagination, current_page: 1 });
            }}
            className="filter-select"
            style={{ paddingLeft: '40px' }}
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="accepted">Acceptée</option>
            <option value="rejected">Rejetée</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p><FontAwesomeIcon icon={faExclamationCircle} /> {error}</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Appartement</th>
                  <th>Date début</th>
                  <th>Date fin</th>
                  <th>Prix total</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(res => (
                  <tr key={res.id}>
                    <td>{res.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faUser} style={{ color: '#7f8c8d' }} />
                        {res.user?.name || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faHome} style={{ color: '#7f8c8d' }} />
                        {res.apartment?.title || '-'}
                      </div>
                    </td>
                    <td>
                      <FontAwesomeIcon icon={faCalendarCheck} style={{ marginRight: '8px', color: '#7f8c8d' }} />
                      {new Date(res.start_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <FontAwesomeIcon icon={faCalendarTimes} style={{ marginRight: '8px', color: '#7f8c8d' }} />
                      {new Date(res.end_date).toLocaleDateString('fr-FR')}
                    </td>
                   <td>
  {parseFloat(res.total_price || 0).toFixed(2)} dh
</td>
                    <td>
                      <select
                        value={res.status}
                        onChange={(e) => handleStatusUpdate(res.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending"><FontAwesomeIcon icon={faClock} /> En attente</option>
                        <option value="accepted"><FontAwesomeIcon icon={faCheckCircle} /> Acceptée</option>
                        <option value="rejected"><FontAwesomeIcon icon={faTimes} /> Rejetée</option>
                        <option value="cancelled"><FontAwesomeIcon icon={faBan} /> Annulée</option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(res.id)} className="btn-delete">
                        <FontAwesomeIcon icon={faTrash} /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.last_page > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPagination({ ...pagination, current_page: pagination.current_page - 1 })}
                disabled={pagination.current_page === 1}
              >
                <FontAwesomeIcon icon={faChevronLeft} /> Précédent
              </button>
              <span>Page {pagination.current_page} sur {pagination.last_page}</span>
              <button
                onClick={() => setPagination({ ...pagination, current_page: pagination.current_page + 1 })}
                disabled={pagination.current_page === pagination.last_page}
              >
                Suivant <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}