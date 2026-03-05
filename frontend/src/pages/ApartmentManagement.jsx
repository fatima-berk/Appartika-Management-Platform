import React, { useState, useEffect } from 'react';
import { apartmentService } from '../services/api';
import AddApartmentModal from './AddApartmentModal';
import EditApartmentModal from './EditApartmentModal';
import DeleteApartmentButton from './DeleteApartmentButton';
import ApartmentImageModal from './ApartmentImageModal';

const ApartmentManagement = ({ onStatsUpdate, selectedApartmentId }) => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingApartment, setEditingApartment] = useState(null);
  const [imageApartment, setImageApartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [priceDisplay, setPriceDisplay] = useState('month'); // 'month' or 'day'

  // Banque d'images de fallback
  const fallbackImages = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  ];

  // Fonction pour obtenir une image de fallback
  const getFallbackImage = (apartmentId) => {
    const index = apartmentId ? apartmentId % fallbackImages.length : 0;
    return fallbackImages[index];
  };

  // Fonction pour obtenir l'image principale d'un appartement
  const getPrimaryImage = (apartment) => {
    if (apartment.images && apartment.images.length > 0) {
      return apartment.images[0].image_url || apartment.images[0].url;
    }
    if (apartment.image) {
      return apartment.image;
    }
    return getFallbackImage(apartment.id);
  };

  // Fonction pour obtenir le prix affiché (REEL depuis la DB)
  const getDisplayPrice = (apartment) => {
    if (priceDisplay === 'day') {
      // Utilise le prix par jour STOCKÉ dans la DB
      return apartment.price_per_day;
    }
    // Utilise le prix par mois STOCKÉ dans la DB
    return apartment.price_per_month;
  };

  // Fonction pour obtenir le libellé du prix
  const getPriceLabel = () => {
    return priceDisplay === 'day' ? 'Jour' : 'Mois';
  };

  // Fonction pour calculer le prix alternatif (pour l'affichage comparatif)
  const getAlternatePrice = (apartment) => {
    if (priceDisplay === 'day') {
      // Si on affiche par jour, montrer le prix mensuel
      return apartment.price_per_month;
    } else {
      // Si on affiche par mois, montrer le prix journalier
      return apartment.price_per_day;
    }
  };

  // Fonction pour obtenir le libellé alternatif
  const getAlternateLabel = () => {
    return priceDisplay === 'day' ? 'Mois' : 'Jour';
  };

  const loadApartments = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || !user.id) {
        console.log('❌ Utilisateur non trouvé dans le localStorage');
        return;
      }

      console.log('🔄 Chargement des appartements pour user:', user.id);
      const response = await apartmentService.getOwnerApartments(user.id);
      
      if (response.success) {
        console.log('✅ Appartements chargés:', response.data.length);
        
        const apartmentsWithProcessedImages = response.data.map(apartment => ({
          ...apartment,
          primaryImage: getPrimaryImage(apartment),
          allImages: apartment.images || []
        }));
        
        setApartments(apartmentsWithProcessedImages);
        setLastUpdate(new Date());
        
        if (onStatsUpdate) {
          const availableCount = response.data.filter(apt => apt.available).length;
          const totalRevenue = response.data.reduce((sum, apt) => sum + parseFloat(apt.price_per_month || 0), 0);
          
          onStatsUpdate({
            totalApartments: response.data.length,
            availableApartments: availableCount,
            totalReservations: 0,
            monthlyRevenue: totalRevenue
          });
        }
      } else {
        console.error('❌ Erreur lors du chargement:', response.message);
      }
    } catch (error) {
      console.error('💥 Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApartments();
  }, []);

  // Effet pour ouvrir automatiquement le modal d'édition si un appartement est sélectionné
  useEffect(() => {
    if (selectedApartmentId && apartments.length > 0) {
      const apartment = apartments.find(apt => apt.id === parseInt(selectedApartmentId));
      if (apartment) {
        console.log('🏠 Ouverture automatique du modal pour:', apartment.title);
        // Attendre un peu pour que la page soit rendue
        setTimeout(() => {
          setEditingApartment(apartment);
          setShowEditModal(true);
          // Faire défiler jusqu'à la carte de l'appartement
          const apartmentCard = document.querySelector(`[data-apartment-id="${apartment.id}"]`);
          if (apartmentCard) {
            apartmentCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Mettre en surbrillance la carte
            apartmentCard.style.boxShadow = '0 20px 60px rgba(102, 126, 234, 0.5)';
            apartmentCard.style.transform = 'scale(1.02)';
            setTimeout(() => {
              apartmentCard.style.boxShadow = '';
              apartmentCard.style.transform = '';
            }, 2000);
          }
        }, 300);
      }
    }
  }, [selectedApartmentId, apartments]);

  const refreshApartments = () => {
    console.log('🔄 Forcer le rafraîchissement des appartements');
    loadApartments();
  };

  const filteredApartments = apartments.filter(apartment => {
    const matchesSearch = apartment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apartment.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apartment.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'available' && apartment.available) ||
                         (filterStatus === 'occupied' && !apartment.available);
    
    return matchesSearch && matchesStatus;
  });

  const openEditModal = (apartment) => {
    setEditingApartment(apartment);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditingApartment(null);
    setShowEditModal(false);
  };

  const openImageModal = (apartment) => {
    setImageApartment(apartment);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setImageApartment(null);
    setShowImageModal(false);
  };

  // Styles (gardez les mêmes styles que précédemment)
  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1400px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      minHeight: '100vh'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '40px',
      gap: '30px'
    },
    headerContent: {
      flex: 1
    },
    title: {
      fontSize: '3rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: '0 0 8px 0',
      lineHeight: '1.1'
    },
    subtitle: {
      fontSize: '1.2rem',
      color: '#64748b',
      margin: '0 0 25px 0',
      fontWeight: '500'
    },
    refreshSection: {
      display: 'flex',
      gap: '15px',
      marginBottom: '25px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    refreshButton: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.9rem',
      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      opacity: 1
    },
    priceToggle: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      padding: '10px 16px',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    toggleButton: {
      background: 'none',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease'
    },
    toggleActive: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      boxShadow: '0 2px 10px rgba(102, 126, 234, 0.3)'
    },
    lastUpdate: {
      color: '#64748b',
      fontSize: '0.9rem',
      fontStyle: 'italic'
    },
    addButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      padding: '16px 32px',
      borderRadius: '16px',
      cursor: 'pointer',
      fontWeight: '700',
      fontSize: '1.1rem',
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      minWidth: '220px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '40px'
    },
    statCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      padding: '25px',
      borderRadius: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      textAlign: 'center',
      transition: 'all 0.3s ease'
    },
    statValue: {
      fontSize: '2.5rem',
      fontWeight: '800',
      color: '#1e293b',
      margin: '0 0 8px 0'
    },
    statLabel: {
      fontSize: '1rem',
      color: '#64748b',
      fontWeight: '600',
      margin: '0'
    },
    controls: {
      display: 'flex',
      gap: '20px',
      marginBottom: '30px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    searchInput: {
      flex: '1',
      minWidth: '300px',
      padding: '15px 20px',
      border: 'none',
      borderRadius: '15px',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      fontSize: '1rem',
      transition: 'all 0.3s ease'
    },
    filterSelect: {
      padding: '15px 20px',
      border: 'none',
      borderRadius: '15px',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      fontSize: '1rem',
      cursor: 'pointer',
      minWidth: '180px'
    },
    apartmentsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '30px'
    },
    apartmentCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.4s ease',
      position: 'relative'
    },
    cardImage: {
      height: '220px',
      position: 'relative',
      overflow: 'hidden'
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.4s ease'
    },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)'
    },
    statusBadge: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    cardContent: {
      padding: '25px'
    },
    apartmentTitle: {
      fontSize: '1.4rem',
      fontWeight: '700',
      color: '#1e293b',
      margin: '0 0 12px 0',
      lineHeight: '1.3'
    },
    apartmentLocation: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#64748b',
      fontSize: '1rem',
      margin: '0 0 20px 0',
      fontWeight: '500'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '15px',
      marginBottom: '25px'
    },
    feature: {
      textAlign: 'center',
      padding: '12px',
      background: 'rgba(241, 245, 249, 0.6)',
      borderRadius: '12px',
      transition: 'all 0.3s ease'
    },
    featureValue: {
      fontSize: '1.3rem',
      fontWeight: '800',
      color: '#1e293b',
      display: 'block',
      marginBottom: '4px'
    },
    featureLabel: {
      fontSize: '0.8rem',
      color: '#64748b',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    cardActions: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap'
    },
    actionButton: {
      flex: '1',
      padding: '12px 16px',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px'
    },
    emptyState: {
      gridColumn: '1 / -1',
      textAlign: 'center',
      padding: '80px 40px',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '24px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
    },
    loadingState: {
      gridColumn: '1 / -1',
      textAlign: 'center',
      padding: '60px 20px'
    },
    loadingSpinner: {
      width: '60px',
      height: '60px',
      border: '4px solid rgba(102, 126, 234, 0.2)',
      borderTop: '4px solid #667eea',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 20px auto'
    },
    imageCounter: {
      position: 'absolute',
      bottom: '15px',
      left: '15px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
      backdropFilter: 'blur(10px)'
    },
    priceComparison: {
      fontSize: '0.8rem',
      color: '#64748b',
      marginTop: '4px',
      fontStyle: 'italic'
    },
    noPriceSet: {
      fontSize: '0.7rem',
      color: '#ef4444',
      marginTop: '4px',
      fontStyle: 'italic'
    }
  };

  const ApartmentCard = ({ apartment }) => {
    const displayPrice = getDisplayPrice(apartment);
    const priceLabel = getPriceLabel();
    const alternatePrice = getAlternatePrice(apartment);
    const alternateLabel = getAlternateLabel();

    return (
      <div 
        style={styles.apartmentCard}
        data-apartment-id={apartment.id}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
          const img = e.currentTarget.querySelector('img');
          if (img) img.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.1)';
          const img = e.currentTarget.querySelector('img');
          if (img) img.style.transform = 'scale(1)';
        }}
      >
        <div style={styles.cardImage}>
          <img 
            src={apartment.primaryImage} 
            alt={apartment.title}
            style={styles.image}
            onError={(e) => {
              e.target.src = getFallbackImage(apartment.id);
            }}
          />
          <div style={styles.imageOverlay}></div>
          <div 
            style={{
              ...styles.statusBadge,
              background: apartment.available ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
              color: 'white'
            }}
          >
            {apartment.available ? '🟢 Disponible' : '🔴 Occupé'}
          </div>
          {(apartment.allImages && apartment.allImages.length > 0) && (
            <div style={styles.imageCounter}>
              📸 {apartment.allImages.length} image(s)
            </div>
          )}
        </div>
        
        <div style={styles.cardContent}>
          <h3 style={styles.apartmentTitle}>{apartment.title}</h3>
          <p style={styles.apartmentLocation}>
            📍 {apartment.address}, {apartment.city}
          </p>
          
          <div style={styles.featuresGrid}>
            <div 
              style={styles.feature}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(241, 245, 249, 0.6)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span style={{...styles.featureValue, color: '#667eea'}}>
                {displayPrice ? `${displayPrice}dh` : 'N/A'}
              </span>
              <span style={styles.featureLabel}>{priceLabel}</span>
              
              {/* Affichage du prix alternatif */}
              {alternatePrice ? (
                <div style={styles.priceComparison}>
                  ≈ {alternatePrice}dh/{alternateLabel.toLowerCase()}
                </div>
              ) : (
                <div style={styles.noPriceSet}>
                  Prix {alternateLabel.toLowerCase()} non défini
                </div>
              )}
            </div>
            
            <div 
              style={styles.feature}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(241, 245, 249, 0.6)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span style={{...styles.featureValue, color: '#10b981'}}>
                {apartment.surface}m²
              </span>
              <span style={styles.featureLabel}>Surface</span>
            </div>
            
            <div 
              style={styles.feature}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(241, 245, 249, 0.6)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span style={{...styles.featureValue, color: '#f59e0b'}}>
                {apartment.rooms}
              </span>
              <span style={styles.featureLabel}>Pièces</span>
            </div>
          </div>
          
          {apartment.description && (
            <p style={{
              color: '#64748b',
              fontSize: '0.9rem',
              lineHeight: '1.5',
              margin: '0 0 20px 0',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {apartment.description}
            </p>
          )}
          
          <div style={styles.cardActions}>
            <button
              onClick={() => {
                console.log('🖼️ Clic sur le bouton Images pour:', apartment.title);
                openImageModal(apartment);
              }}
              style={{
                ...styles.actionButton,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                flex: '1 1 auto',
                minWidth: '120px',
                order: 1
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              📸 Images
            </button>
            <button
              onClick={() => openEditModal(apartment)}
              style={{
                ...styles.actionButton,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                order: 2
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ✏️ Modifier
            </button>
            <DeleteApartmentButton 
              apartmentId={apartment.id}
              apartmentTitle={apartment.title}
              onDelete={refreshApartments}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header avec Statistiques */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Portfolio Immobilier</h1>
          <p style={styles.subtitle}>
            Gérez votre collection de {apartments.length} appartement(s) - Prix réels depuis la base de données
          </p>
          
          {/* Section Rafraîchissement et Toggle Prix */}
          <div style={styles.refreshSection}>
            <button
              onClick={refreshApartments}
              disabled={loading}
              style={{
                ...styles.refreshButton,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                }
              }}
            >
              🔄 {loading ? 'Chargement...' : 'Rafraîchir la liste'}
            </button>
            
            <div style={styles.priceToggle}>
              <span style={{fontWeight: '600', color: '#374151'}}>Afficher les prix:</span>
              <button
                onClick={() => setPriceDisplay('month')}
                style={{
                  ...styles.toggleButton,
                  ...(priceDisplay === 'month' ? styles.toggleActive : {})
                }}
              >
                📅 Par Mois
              </button>
              <button
                onClick={() => setPriceDisplay('day')}
                style={{
                  ...styles.toggleButton,
                  ...(priceDisplay === 'day' ? styles.toggleActive : {})
                }}
              >
                🌞 Par Jour
              </button>
            </div>
            
            <div style={styles.lastUpdate}>
              Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>

          <div style={styles.statsGrid}>
            <div 
              style={styles.statCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={styles.statValue}>{apartments.length}</div>
              <div style={styles.statLabel}>Appartementss</div>
            </div>
            <div 
              style={styles.statCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={styles.statValue}>
                {apartments.filter(apt => apt.available).length}
              </div>
              <div style={styles.statLabel}>Disponibles</div>
            </div>
            <div 
              style={styles.statCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={styles.statValue}>
                {apartments.reduce((sum, apt) => sum + parseFloat(apt.price_per_month || 0), 0).toLocaleString()}dh
              </div>
              <div style={styles.statLabel}>Revenu Mensuel</div>
            </div>
            <div 
              style={styles.statCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={styles.statValue}>
                {apartments.reduce((sum, apt) => sum + parseFloat(getDisplayPrice(apt) || 0), 0).toLocaleString()}dh
              </div>
              <div style={styles.statLabel}>Revenu / {getPriceLabel().toLowerCase()}</div>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          disabled={loading}
          style={{
            ...styles.addButton,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
            }
          }}
        >
          <span style={{fontSize: '1.4rem'}}>+</span>
          Ajouter un Bien
        </button>
      </div>

      {/* Contrôles de recherche et filtre */}
      <div style={styles.controls}>
        <input
          type="text"
          placeholder="🔍 Rechercher un appartement, une adresse ou une ville..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
          onFocus={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 1)';
            e.target.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.12)';
          }}
          onBlur={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.9)';
            e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="all">Tous les statuts</option>
          <option value="available">🟢 Disponibles</option>
          <option value="occupied">🔴 Occupés</option>
        </select>
      </div>

      {/* Grille des appartements */}
      <div style={styles.apartmentsGrid}>
        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.loadingSpinner}></div>
            <h3 style={{color: '#1e293b', marginBottom: '10px'}}>Chargement de votre portfolio...</h3>
            <p style={{color: '#64748b'}}>Récupération des prix réels depuis la base de données</p>
          </div>
        ) : filteredApartments.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{
              fontSize: '6rem', 
              marginBottom: '20px', 
              opacity: '0.7',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🏗️
            </div>
            <h2 style={{
              color: '#1e293b', 
              marginBottom: '15px', 
              fontSize: '2rem',
              background: 'linear-gradient(135deg, #1e293b 0%, #374151 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {searchTerm || filterStatus !== 'all' ? 'Aucun résultat trouvé' : 'Votre portfolio est vide'}
            </h2>
            <p style={{
              color: '#64748b', 
              fontSize: '1.1rem', 
              marginBottom: '30px',
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.6'
            }}>
              {searchTerm || filterStatus !== 'all' 
                ? `Aucun appartement ne correspond à "${searchTerm}". Essayez d'autres termes de recherche.` 
                : 'Commencez par ajouter votre premier bien immobilier avec ses prix journalier et mensuel.'
              }
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              style={styles.addButton}
            >
              <span style={{fontSize: '1.4rem'}}>+</span>
              Créer mon premier appartement
            </button>
          </div>
        ) : (
          filteredApartments.map(apartment => (
            <ApartmentCard key={apartment.id} apartment={apartment} />
          ))
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddApartmentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            refreshApartments();
          }}
          priceDisplay={priceDisplay}
        />
      )}

      {showEditModal && editingApartment && (
        <EditApartmentModal
          apartment={editingApartment}
          onClose={closeEditModal}
          onSuccess={() => {
            closeEditModal();
            refreshApartments();
          }}
          priceDisplay={priceDisplay}
        />
      )}

      {showImageModal && imageApartment && (
        <ApartmentImageModal
          apartment={imageApartment}
          onClose={closeImageModal}
          onSuccess={() => {
            refreshApartments();
          }}
        />
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ApartmentManagement;