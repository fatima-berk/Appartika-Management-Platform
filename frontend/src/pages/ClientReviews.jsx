// ClientReviews.jsx - Version corrigée
import React, { useState, useEffect } from 'react';
import { 
  getUserReviews,
  createReview,
  updateUserReview,
  deleteUserReview,
  canUserReviewReservation,
  getApartmentReviews
} from '../services/api';
import './ClientReviews.css';

const Icon = ({ name, className = '', size = 20 }) => {
  const icons = {
    star: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" className={className}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    starEmpty: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    trash: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    ),
    edit: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
    ),
    calendar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ),
    location: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    ),
    check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    ),
    x: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    )
  };
  
  return icons[name] || null;
};

const ClientReviews = ({ onNavigate, reservations = [], showNotification }) => {
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    apartment_id: null,
    reservation_id: null,
    rating: 5,
    comment: '',
  });
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [activeTab, setActiveTab] = useState('my-reviews');
  const [verifying, setVerifying] = useState(false);

  const userProfile = JSON.parse(localStorage.getItem('user')) || {};

  // Charger les avis de l'utilisateur
  const loadUserReviews = async () => {
    if (!userProfile.id) {
      showNotification('Veuillez vous connecter pour voir vos avis', 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Chargement des avis pour utilisateur:', userProfile.id);
      const response = await getUserReviews(userProfile.id);
      
      console.log('📋 Réponse chargement avis:', response);
      
      if (response.success) {
        setUserReviews(response.data || []);
        showNotification('Avis chargés avec succès', 'success');
      } else {
        showNotification(response.message || 'Aucun avis trouvé', 'info');
        setUserReviews([]);
      }
    } catch (error) {
      console.error('❌ Erreur chargement avis:', error);
      showNotification('Erreur lors du chargement des avis', 'error');
      setUserReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si on peut laisser un avis pour une réservation
  const handleCreateReview = async (reservation) => {
    if (!reservation || !reservation.id) {
      showNotification('Réservation non valide', 'error');
      return;
    }

    setVerifying(true);
    try {
      console.log('🔍 Vérification pour réservation:', reservation.id);
      
      const canReviewResponse = await canUserReviewReservation(reservation.id);
      
      console.log('📋 Réponse vérification:', canReviewResponse);
      
      if (!canReviewResponse.success) {
        showNotification(canReviewResponse.message || 'Erreur de vérification', 'error');
        return;
      }
      
      if (!canReviewResponse.canReview) {
        showNotification(
          canReviewResponse.message || 'Vous ne pouvez pas laisser d\'avis pour cette réservation', 
          'info'
        );
        return;
      }
      
      // Préparer les données pour le modal
      setReviewData({
        apartment_id: reservation.apartment_id,
        reservation_id: reservation.id,
        rating: 5,
        comment: '',
      });
      setSelectedReservation(reservation);
      setEditingReview(null);
      setShowReviewModal(true);
      
    } catch (error) {
      console.error('❌ Erreur vérification droit avis:', error);
      showNotification('Erreur lors de la vérification', 'error');
    } finally {
      setVerifying(false);
    }
  };

  // Soumettre un avis
  const handleSubmitReview = async () => {
    // Validation
    if (!reviewData.comment.trim() || reviewData.comment.length < 10) {
      showNotification('Le commentaire doit contenir au moins 10 caractères', 'error');
      return;
    }

    if (!reviewData.apartment_id) {
      showNotification('Appartement non spécifié', 'error');
      return;
    }

    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      showNotification('La note doit être entre 1 et 5 étoiles', 'error');
      return;
    }

    try {
      let response;
      let message;
      
      if (editingReview) {
        // Mettre à jour un avis existant
        console.log('🔄 Mise à jour avis:', editingReview.id);
        response = await updateUserReview(editingReview.id, {
          rating: reviewData.rating,
          comment: reviewData.comment
        });
        message = 'Avis mis à jour avec succès!';
      } else {
        // Créer un nouvel avis
        console.log('🔄 Création avis:', reviewData);
        response = await createReview(reviewData);
        message = 'Avis publié avec succès!';
      }
      
      console.log('📋 Réponse soumission avis:', response);
      
      if (response.success) {
        showNotification(message, 'success');
        
        // Fermer le modal et réinitialiser
        setShowReviewModal(false);
        setReviewData({ 
          apartment_id: null, 
          reservation_id: null, 
          rating: 5, 
          comment: '' 
        });
        setEditingReview(null);
        setSelectedReservation(null);
        
        // Recharger les avis
        await loadUserReviews();
        
        // Recharger les réservations si besoin
        if (typeof onNavigate === 'function') {
          onNavigate('reviews');
        }
      } else {
        showNotification(response.message || 'Erreur lors de la publication', 'error');
      }
    } catch (error) {
      console.error('❌ Erreur soumission avis:', error);
      showNotification('Erreur lors de la publication', 'error');
    }
  };

  // Supprimer un avis
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.')) {
      return;
    }

    try {
      console.log('🔄 Suppression avis:', reviewId);
      const response = await deleteUserReview(reviewId);
      
      console.log('📋 Réponse suppression:', response);
      
      if (response.success) {
        showNotification('Avis supprimé avec succès', 'success');
        await loadUserReviews();
      } else {
        showNotification(response.message || 'Erreur lors de la suppression', 'error');
      }
    } catch (error) {
      console.error('❌ Erreur suppression avis:', error);
      showNotification('Erreur lors de la suppression', 'error');
    }
  };

  // Modifier un avis
  const handleEditReview = (review) => {
    console.log('🔄 Modification avis:', review);
    setEditingReview(review);
    setReviewData({
      apartment_id: review.apartment_id,
      reservation_id: review.reservation_id,
      rating: review.rating,
      comment: review.comment,
    });
    setSelectedReservation(null);
    setShowReviewModal(true);
  };

  // Charger les avis au démarrage
  useEffect(() => {
    if (userProfile.id) {
      loadUserReviews();
    } else {
      showNotification('Veuillez vous connecter pour voir vos avis', 'info');
      setLoading(false);
    }
  }, [userProfile.id]);

  // Filtrer les réservations qui peuvent recevoir un avis
  const getReservationsForReview = () => {
    return reservations.filter(reservation => {
      // Nouvelle règle : le client peut laisser un avis dans tous les cas,
      // on ne filtre que pour éviter de proposer une réservation déjà notée.
      if (hasReviewedApartment(reservation.apartment_id)) {
        return false;
      }
      return true;
    });
  };

  // Vérifier si l'utilisateur a déjà laissé un avis pour un appartement
  const hasReviewedApartment = (apartmentId) => {
    return userReviews.some(review => review.apartment_id === apartmentId);
  };

  // Réservations éligibles pour un avis
  const eligibleReservations = getReservationsForReview();

  if (loading) {
    return (
      <div className="client-reviews">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement de vos avis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-reviews">
      <div className="reviews-header">
        <h1 className="reviews-title">Mes Avis</h1>
        <p className="reviews-subtitle">Gérez les avis que vous avez publiés</p>
        <button onClick={loadUserReviews} className="refresh-btn" disabled={loading}>
          {loading ? 'Chargement...' : '🔄 Actualiser'}
        </button>
      </div>

      <div className="reviews-tabs">
        <button 
          className={activeTab === 'my-reviews' ? 'active' : ''}
          onClick={() => setActiveTab('my-reviews')}
          disabled={loading}
        >
          <Icon name="star" size={16} /> Mes Avis ({userReviews.length})
        </button>
        <button 
          className={activeTab === 'can-review' ? 'active' : ''}
          onClick={() => setActiveTab('can-review')}
          disabled={loading}
        >
          <Icon name="calendar" size={16} /> Réservations éligibles ({eligibleReservations.length})
        </button>
      </div>

      {activeTab === 'my-reviews' && (
        <>
          {userReviews.length > 0 ? (
            <div className="reviews-list">
              {userReviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-card-header">
                    <div className="review-apartment-info">
                      <h3>{review.apartment?.title || 'Appartement'}</h3>
                      <div className="review-location">
                        <Icon name="location" size={14} />
                        <span>{review.apartment?.city || 'Ville'}</span>
                      </div>
                    </div>
                    <div className="review-rating-badge">
                      {[...Array(5)].map((_, i) => (
                        <Icon 
                          key={i} 
                          name={i < review.rating ? "star" : "starEmpty"} 
                          size={16} 
                          className={i < review.rating ? "star-filled" : "star-empty"} 
                        />
                      ))}
                      <span className="rating-number">{review.rating}/5</span>
                    </div>
                  </div>
                  
                  <div className="review-content">
                    <p className="review-comment">{review.comment}</p>
                    <div className="review-meta">
                      <div className="review-date">
                        <Icon name="calendar" size={14} />
                        Publié le {new Date(review.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      {review.response && (
                        <div className="review-response">
                          <div className="response-header">
                            <strong>Réponse du propriétaire:</strong>
                          </div>
                          <p className="response-text">{review.response}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="review-actions">
                    <button 
                      className="btn-edit-review"
                      onClick={() => handleEditReview(review)}
                      disabled={verifying}
                    >
                      <Icon name="edit" size={14} /> Modifier
                    </button>
                    <button 
                      className="btn-delete-review"
                      onClick={() => handleDeleteReview(review.id)}
                      disabled={verifying}
                    >
                      <Icon name="trash" size={14} /> Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Icon name="star" size={48} />
                </div>
                <h3>Aucun avis publié</h3>
                <p>Vous n'avez pas encore publié d'avis</p>
                <button 
                  onClick={() => setActiveTab('can-review')} 
                  className="btn-primary"
                >
                  Voir les réservations éligibles
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'can-review' && (
        <>
          {eligibleReservations.length > 0 ? (
            <div className="can-review-list">
              {eligibleReservations.map(reservation => {
                const alreadyReviewed = hasReviewedApartment(reservation.apartment_id);
                
                return (
                  <div key={reservation.id} className="can-review-card">
                    <div className="can-review-info">
                      <div className="can-review-header">
                        <h3>{reservation.apartment?.title || 'Appartement'}</h3>
                        <div className="can-review-status">
                          {alreadyReviewed ? (
                            <span className="already-reviewed">
                              <Icon name="check" size={14} /> Déjà noté
                            </span>
                          ) : (
                            <span className="can-review">
                              <Icon name="star" size={14} /> Peut être noté
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="can-review-details">
                        <div className="detail-item">
                          <Icon name="location" size={14} />
                          <span>{reservation.apartment?.city || 'Ville'}</span>
                        </div>
                        <div className="detail-item">
                          <Icon name="calendar" size={14} />
                          <span>
                            Séjour du {new Date(reservation.start_date).toLocaleDateString()} 
                            au {new Date(reservation.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="detail-item">
                          <Icon name="star" size={14} />
                          <span>
                            {alreadyReviewed 
                              ? 'Vous avez déjà noté cet appartement' 
                              : 'Vous pouvez donner votre avis sur votre séjour'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="can-review-actions">
                      {!alreadyReviewed ? (
                        <button 
                          className="btn-create-review"
                          onClick={() => handleCreateReview(reservation)}
                          disabled={verifying}
                        >
                          {verifying ? 'Vérification...' : 'Laisser un avis'}
                        </button>
                      ) : (
                        <button 
                          className="btn-view-review"
                          onClick={() => {
                            const userReview = userReviews.find(r => r.apartment_id === reservation.apartment_id);
                            if (userReview) {
                              handleEditReview(userReview);
                            }
                          }}
                          disabled={verifying}
                        >
                          <Icon name="edit" size={14} /> Voir/Modifier mon avis
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              
              <div className="reviews-info-box">
                <div className="info-header">
                  <Icon name="star" size={20} />
                  <h4>Comment laisser un bon avis ?</h4>
                </div>
                <ul className="info-list">
                  <li>Soyez honnête sur votre expérience</li>
                  <li>Décrivez ce que vous avez aimé</li>
                  <li>Mentionnez les points d'amélioration éventuels</li>
                  <li>Respectez la vie privée des autres</li>
                  <li>Ne donnez pas d'informations personnelles</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="no-results">
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Icon name="calendar" size={48} />
                </div>
                <h3>Aucune réservation éligible</h3>
                <p>Vous n'avez pas de réservations qui peuvent être notées pour le moment.</p>
                
                <div className="eligibility-criteria">
                  <h4>Pour laisser un avis :</h4>
                  <ul className="criteria-list">
                    <li className="criteria-item">
                      <Icon name="check" size={16} className="criteria-icon" />
                      <span>La réservation doit <strong>vous appartenir</strong></span>
                    </li>
                    <li className="criteria-item">
                      <Icon name="check" size={16} className="criteria-icon" />
                      <span>Vous ne devez pas avoir <strong>déjà laissé un avis</strong> pour cet appartement</span>
                    </li>
                  </ul>
                </div>
                
                <div className="empty-state-actions">
                  <button 
                    onClick={() => onNavigate('reservations')} 
                    className="btn-primary"
                  >
                    Voir mes réservations
                  </button>
                  <button 
                    onClick={() => onNavigate('dashboard')} 
                    className="btn-secondary"
                  >
                    Chercher un appartement
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de création/modification d'avis */}
      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content review-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header-detailed">
              <h3>
                {editingReview ? '✏️ Modifier mon avis' : '⭐ Laisser un avis'}
              </h3>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="close-modal-btn"
              >
                <Icon name="x" size={24} />
              </button>
            </div>
            
            <div className="modal-form">
              {selectedReservation?.apartment && (
                <div className="review-apartment-preview">
                  <div className="review-apartment-info">
                    <h4>{selectedReservation.apartment.title || 'Appartement'}</h4>
                    <p>
                      <Icon name="calendar" size={14} />
                      Votre séjour : {new Date(selectedReservation.start_date).toLocaleDateString()} 
                      - {new Date(selectedReservation.end_date).toLocaleDateString()}
                    </p>
                    <p>
                      <Icon name="location" size={14} />
                      {selectedReservation.apartment.city}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label>Votre note</label>
                <div className="rating-stars-input">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= reviewData.rating ? 'active' : ''}`}
                      onClick={() => setReviewData({...reviewData, rating: star})}
                    >
                      <Icon 
                        name={star <= reviewData.rating ? "star" : "starEmpty"} 
                        size={32} 
                      />
                    </button>
                  ))}
                  <span className="rating-text">
                    {reviewData.rating} étoile{reviewData.rating > 1 ? 's' : ''} sur 5
                  </span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Votre commentaire</label>
                <textarea
                  value={reviewData.comment}
                  onChange={e => setReviewData({...reviewData, comment: e.target.value})}
                  placeholder="Décrivez votre expérience... (minimum 10 caractères)"
                  rows="5"
                  maxLength="1000"
                  className="review-textarea"
                />
                <div className="char-count">
                  {reviewData.comment.length}/1000 caractères
                  {reviewData.comment.length < 10 && (
                    <span className="char-warning"> (minimum 10 caractères)</span>
                  )}
                </div>
              </div>
              
              <div className="review-guidelines">
                <h5><Icon name="star" size={16} /> Conseils pour votre avis :</h5>
                <ul>
                  <li>Soyez précis et objectif</li>
                  <li>Décrivez ce que vous avez aimé ou moins aimé</li>
                  <li>Parlez de l'emplacement, du confort, de la propreté</li>
                  <li>Respectez la vie privée des autres</li>
                </ul>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={handleSubmitReview} 
                className="btn-primary"
                disabled={reviewData.comment.length < 10 || !reviewData.rating}
              >
                {editingReview ? '✏️ Mettre à jour' : '⭐ Publier l\'avis'}
              </button>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientReviews;