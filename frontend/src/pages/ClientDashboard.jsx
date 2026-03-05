import React, { useState, useEffect } from 'react';
import { 
  getAllApartments, 
  createReservation, 
  updateReservation,
  getClientReservations,
  getClientPayments,
  createPayment,
  getApartmentReviews
} from '../services/api';
import ProfilePage from './ProfilePage';
import './ClientDashboard.css';
import ClientReviews from './ClientReviews';




const Icon = ({ name, className = '', size = 20 }) => {
  const icons = {
    bed: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 8l2 2M22 8l-2 2M6 8v12M18 8v12"/>
      </svg>
    ),
    ruler: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M21.3 8.7l-5.6-5.6a1 1 0 0 0-1.4 0L2.7 14.7a1 1 0 0 0 0 1.4l5.6 5.6a1 1 0 0 0 1.4 0L21.3 10.1a1 1 0 0 0 0-1.4zM7.5 10.5l2 2M9.5 7.5l2 2M11.5 4.5l2 2M13.5 1.5l2 2"/>
      </svg>
    ),
    location: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    calendar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    star: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" className={className}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    heart: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    heartFill: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    eye: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    chevronLeft: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    ),
    chevronRight: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    ),
    x: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
    share: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
    explore: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <circle cx="12" cy="12" r="10"/><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    money: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    filter: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
    users: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    clock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    alert: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    )
  };
  
  return icons[name] || null;
};

const ClientDashboard = ({ currentPage, onNavigate }) => {
  const [apartments, setApartments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRooms, setMinRooms] = useState('');
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [exploreImageIndex, setExploreImageIndex] = useState(0);
  const [reservationDates, setReservationDates] = useState({
    start_date: '',
    end_date: ''
  });
  const [paymentData, setPaymentData] = useState({
    method: 'card',
    amount: '',
    reservation_id: null
  });
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [activeTab, setActiveTab] = useState('all');
  const [paymentLoading, setPaymentLoading] = useState(false);
  // Avis pour un appartement (dans le modal d'exploration)
  const [apartmentReviews, setApartmentReviews] = useState([]);
  const [apartmentReviewsLoading, setApartmentReviewsLoading] = useState(false);
  const [apartmentAverageRating, setApartmentAverageRating] = useState(0);
  const [apartmentTotalReviews, setApartmentTotalReviews] = useState(0);
  
  // États pour le carrousel global
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [imageLoading, setImageLoading] = useState(true);
  
  // États pour le carrousel de chaque carte d'appartement
  const [apartmentImageIndices, setApartmentImageIndices] = useState({});

  const userProfile = JSON.parse(localStorage.getItem('user')) || {};
  

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
      const firstImage = apartment.images[0];
      return firstImage.image_url || firstImage.url || firstImage.path || null;
    }
    if (apartment.image_url) {
      return apartment.image_url;
    }
    if (apartment.image) {
      return apartment.image;
    }
    return getFallbackImage(apartment.id);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 5000);
  };

  // Charger les données
  useEffect(() => {
    switch (currentPage) {
      case 'dashboard':
        loadApartments();
        break;
      case 'reservations':
        loadReservations();
        break;
      case 'payments':
        loadPayments();
        break;
      case 'reviews':
        // Pour les avis, on a besoin des réservations (et de leur état de paiement)
        loadReservations();
        break;
      default:
        loadApartments();
    }
  }, [currentPage]);

  // Charger les appartements
  const loadApartments = async () => {
    setLoading(true);
    try {
      const response = await getAllApartments();
      
      if (response.success && response.data) {
        setApartments(response.data);
      } else {
        showNotification(response.message || 'Aucun appartement disponible', 'info');
      }
    } catch (error) {
      console.error('Erreur chargement appartements:', error);
      showNotification('Erreur chargement appartements', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Charger les réservations AVEC VÉRIFICATION DES PAIEMENTS
  const loadReservations = async () => {
    setLoading(true);
    try {
      if (!userProfile.id) {
        showNotification('Utilisateur non identifié', 'error');
        return;
      }

      // Charger les réservations
      const reservationResponse = await getClientReservations(userProfile.id);
      
      // Charger les paiements pour vérification
      let existingPayments = [];
      try {
        const paymentResponse = await getClientPayments(userProfile.id);
        if (paymentResponse.success && paymentResponse.data) {
          existingPayments = paymentResponse.data;
        }
      } catch (error) {
        console.error('Erreur chargement paiements:', error);
      }
      
      if (reservationResponse.success && reservationResponse.data) {
        const reservationsWithPaymentCheck = reservationResponse.data.map(reservation => {
          const existingPayment = existingPayments.find(p => p.reservation_id === reservation.id);
          return {
            ...reservation,
            hasPayment: !!existingPayment,
            payment: existingPayment || null
          };
        });
        
        setReservations(reservationsWithPaymentCheck);
      } else {
        showNotification(reservationResponse.message || 'Aucune réservation trouvée', 'info');
        setReservations([]);
      }
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
      showNotification('Erreur chargement réservations', 'error');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les paiements
  const loadPayments = async () => {
    setLoading(true);
    try {
      if (!userProfile.id) {
        showNotification('Utilisateur non identifié', 'error');
        return;
      }

      const response = await getClientPayments(userProfile.id);
      
      if (response.success && response.data) {
        setPayments(response.data);
      } else {
        showNotification(response.message || 'Aucun paiement trouvé', 'info');
        setPayments([]);
      }
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
      showNotification('Erreur chargement paiements', 'error');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour le carrousel
  const nextImage = () => {
    if (selectedApartment && selectedApartment.images) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === selectedApartment.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedApartment && selectedApartment.images) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? selectedApartment.images.length - 1 : prevIndex - 1
      );
    }
  };

  const handleImageClick = (apartment) => {
    setSelectedApartment(apartment);
    setCurrentImageIndex(0);
    setShowImageModal(true);
  };

  // Fonction pour changer l'image dans le carrousel d'une carte
  const changeApartmentImage = (apartmentId, direction, e) => {
    e.stopPropagation();
    const apartment = apartments.find(apt => apt.id === apartmentId);
    if (!apartment || !apartment.images || apartment.images.length <= 1) return;
    
    setApartmentImageIndices(prev => {
      const currentIndex = prev[apartmentId] || 0;
      let newIndex;
      
      if (direction === 'next') {
        newIndex = (currentIndex + 1) % apartment.images.length;
      } else {
        newIndex = currentIndex === 0 ? apartment.images.length - 1 : currentIndex - 1;
      }
      
      return { ...prev, [apartmentId]: newIndex };
    });
  };

  // Fonction pour obtenir l'image actuelle d'un appartement dans le carrousel
  const getCurrentApartmentImage = (apartment) => {
    if (!apartment.images || apartment.images.length === 0) {
      return getPrimaryImage(apartment);
    }
    
    const currentIndex = apartmentImageIndices[apartment.id] || 0;
    const currentImage = apartment.images[currentIndex];
    return currentImage?.image_url || currentImage?.url || getPrimaryImage(apartment);
  };

  const toggleFavorite = (apartmentId, e) => {
    e.stopPropagation();
    setFavorites(prev => {
      if (prev.includes(apartmentId)) {
        return prev.filter(id => id !== apartmentId);
      } else {
        return [...prev, apartmentId];
      }
    });
  };
const handleShare = async (apartment, e) => {
  e.stopPropagation();
  
  // Texte complet avec emojis pour rendre ça engageant
  const shareContent = `
✨ ${apartment.title} ✨

📍 Où ? ${apartment.city}, ${apartment.address}
💰 Prix : ${apartment.price_per_month} DH/mois
🛏️ ${apartment.rooms} chambres | 📐 ${apartment.surface}m²

${apartment.description ? apartment.description.substring(0, 150) + '...' : 'Appartement disponible'}

👉 Rejoignez l'application Appartika pour réserver cet appartement !
  `.trim();

  if (navigator.share) {
    // Partager avec l'API native
    await navigator.share({
      title: `Appartement à ${apartment.city}`,
      text: shareContent,
    });
  } else {
    // Copier dans le presse-papier
    navigator.clipboard.writeText(shareContent);
    showNotification('✅ Infos copiées ! Partagez-les où vous voulez.', 'success');
  }
};
  // CORRECTION DU FLUX RÉSERVATION-PAIEMENT
  const handleReserve = (apartment) => {
    if (!apartment.available) {
      showNotification('Cet appartement n\'est pas disponible', 'error');
      return;
    }
    
    setSelectedApartment(apartment);
    // Réinitialiser les dates
    setReservationDates({
      start_date: '',
      end_date: ''
    });
    setShowReservationModal(true);
  };

  const handleExplore = (apartment) => {
    setSelectedApartment(apartment);
    setExploreImageIndex(0);
    loadApartmentReviews(apartment.id);
    setShowExploreModal(true);
  };

  // Charger les avis pour un appartement donné
  const loadApartmentReviews = async (apartmentId) => {
    if (!apartmentId) return;
    setApartmentReviewsLoading(true);
    try {
      const response = await getApartmentReviews(apartmentId);
      if (response.success) {
        setApartmentReviews(response.data || []);
        setApartmentAverageRating(response.averageRating || response.average_rating || 0);
        setApartmentTotalReviews(response.totalReviews || response.total_reviews || 0);
      } else {
        setApartmentReviews([]);
        setApartmentAverageRating(0);
        setApartmentTotalReviews(0);
      }
    } catch (error) {
      console.error('Erreur chargement avis appartement:', error);
      setApartmentReviews([]);
      setApartmentAverageRating(0);
      setApartmentTotalReviews(0);
    } finally {
      setApartmentReviewsLoading(false);
    }
  };

  const nextExploreImage = () => {
    if (selectedApartment && selectedApartment.images) {
      setExploreImageIndex((prev) => 
        prev === selectedApartment.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevExploreImage = () => {
    if (selectedApartment && selectedApartment.images) {
      setExploreImageIndex((prev) => 
        prev === 0 ? selectedApartment.images.length - 1 : prev - 1
      );
    }
  };

  // CORRECTION : Création de réservation SANS paiement immédiat
  const handleSubmitReservation = async () => {
    console.log("handleSubmitReservation appelé");
    console.log("Dates sélectionnées:", reservationDates);
    
    // Validation des dates
    if (!reservationDates.start_date || !reservationDates.end_date) {
      console.log("Dates manquantes - start:", reservationDates.start_date, "end:", reservationDates.end_date);
      showNotification('Veuillez sélectionner les dates de début et de fin', 'error');
      return;
    }
    
    // Vérifier que la date de fin est après la date de début
    const startDate = new Date(reservationDates.start_date);
    const endDate = new Date(reservationDates.end_date);
    
    if (endDate <= startDate) {
      showNotification('La date de fin doit être après la date de début', 'error');
      return;
    }

    if (!userProfile.id) {
      showNotification('Vous devez être connecté pour réserver', 'error');
      return;
    }

    try {
      const reservationData = {
        apartment_id: selectedApartment.id,
        user_id: userProfile.id,
        start_date: reservationDates.start_date,
        end_date: reservationDates.end_date,
        status: 'pending' // En attente de validation par l'admin
      };

      console.log("Données de réservation envoyées:", reservationData);
      const response = await createReservation(reservationData);

      if (response.success && response.data) {
        const createdReservation = response.data;
        
        // Calculer le montant total (pour information seulement)
        const start = new Date(reservationDates.start_date);
        const end = new Date(reservationDates.end_date);
        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const amount = selectedApartment.price_per_day 
          ? (selectedApartment.price_per_day * daysDiff)
          : (selectedApartment.price_per_month / 30 * daysDiff);

        showNotification(
          'Réservation créée avec succès! En attente de confirmation par admin.',
          'success'
        );
        
        // Fermer le modal
        setShowReservationModal(false);
        setReservationDates({ start_date: '', end_date: '' });
        
        // Recharger les réservations
        await loadReservations();
        
        // Rediriger vers les réservations
        setTimeout(() => {
          onNavigate('reservations');
        }, 1000);
        
      } else {
        showNotification(response.message || 'Erreur lors de la réservation', 'error');
      }
    } catch (error) {
      console.error('Erreur création réservation:', error);
      showNotification(error.message || 'Erreur lors de la réservation', 'error');
    }
  };

  // CORRECTION : handlePay - Vérifie que la réservation est acceptée et ouvre directement le modal
  const handlePay = async (reservation) => {
    console.log("Tentative de paiement pour réservation:", reservation);
    
    if (!reservation) {
      showNotification('Réservation non trouvée', 'error');
      return;
    }
    
    // VÉRIFICATION IMPORTANTE : La réservation doit être acceptée pour pouvoir payer
    if (reservation.status !== 'accepted') {
      if (reservation.status === 'pending') {
        showNotification(
          'Cette réservation est en attente de confirmation par admin. Vous pourrez payer une fois qu\'elle sera acceptée.',
          'info'
        );
      } else if (reservation.status === 'cancelled' || reservation.status === 'rejected') {
        showNotification('Cette réservation a été annulée ou refusée', 'error');
      }
      return;
    }
    
    // Charger les paiements pour vérifier s'il en existe déjà un
    try {
      if (!userProfile.id) {
        showNotification('Utilisateur non identifié', 'error');
        return;
      }

      const paymentResponse = await getClientPayments(userProfile.id);
      
      if (paymentResponse.success && paymentResponse.data) {
        const existingPayment = paymentResponse.data.find(p => p.reservation_id === reservation.id);
        
        if (existingPayment) {
          showNotification('Un paiement existe déjà pour cette réservation', 'info');
          return;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des paiements:', error);
      // Continuer même en cas d'erreur de vérification
    }
    
    // Si aucune vérification n'a bloqué, ouvrir le modal de paiement
    setSelectedReservation(reservation);
    
    // Calculer le montant
    let amount = reservation.total_price || 0;
    if (!amount || amount === 0) {
      const apartment = reservation.apartment || selectedApartment;
      if (apartment) {
        const start = new Date(reservation.start_date);
        const end = new Date(reservation.end_date);
        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        
        if (apartment.price_per_day) {
          amount = apartment.price_per_day * daysDiff;
        } else if (apartment.price_per_month) {
          amount = (apartment.price_per_month / 30) * daysDiff;
        }
      }
    }
    
    setPaymentData({
      method: 'card',
      amount: amount ? parseFloat(amount).toFixed(2) : '0.00',
      reservation_id: reservation.id
    });
    
    // OUVERTURE DIRECTE DU MODAL
    setShowPaymentModal(true);
  };

  // CORRECTION : handleSubmitPayment - Validation améliorée
  const handleSubmitPayment = async () => {
    if (!selectedReservation) {
      showNotification('Réservation non trouvée', 'error');
      return;
    }

    // Vérifier que la réservation est toujours acceptée
    if (selectedReservation.status !== 'accepted') {
      showNotification('Cette réservation n\'est plus valable pour le paiement', 'error');
      return;
    }

    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      showNotification('Veuillez saisir un montant valide', 'error');
      return;
    }

    setPaymentLoading(true);

    try {
      const paymentDataToSend = {
        reservation_id: selectedReservation.id,
        amount: parseFloat(paymentData.amount),
        method: paymentData.method,
        status: 'paid'
      };

      console.log("Envoi du paiement:", paymentDataToSend);
      const response = await createPayment(paymentDataToSend);

      if (response.success) {
        showNotification('Paiement effectué avec succès!', 'success');
        setShowPaymentModal(false);
        setSelectedReservation(null);
        setPaymentData({ method: 'card', amount: '', reservation_id: null });
        
        // Recharger les données
        await loadPayments();
        await loadReservations();
        
        // Rediriger vers les paiements
        setTimeout(() => {
          onNavigate('payments');
        }, 1500);
      } else {
        showNotification(response.message || 'Erreur lors du paiement. Veuillez réessayer.', 'error');
      }
    } catch (error) {
      console.error('Erreur paiement:', error);
      showNotification('Erreur lors du paiement. Veuillez réessayer.', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCancelReservation = async (reservation) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    try {
      const response = await updateReservation(reservation.id, { status: 'cancelled' });
      
      if (response.success) {
        showNotification('Réservation annulée avec succès', 'success');
        loadReservations();
      } else {
        showNotification(response.message || 'Erreur lors de l\'annulation', 'error');
      }
    } catch (error) {
      console.error('Erreur annulation:', error);
      showNotification('Erreur lors de l\'annulation', 'error');
    }
  };

  // Filtrage optimisé des appartements
  const filteredApartments = apartments.filter(apt => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      (apt.title && apt.title.toLowerCase().includes(searchLower)) ||
      (apt.description && apt.description.toLowerCase().includes(searchLower)) ||
      (apt.address && apt.address.toLowerCase().includes(searchLower)) ||
      (apt.city && apt.city.toLowerCase().includes(searchLower));
    
    const matchesCity = !searchCity || 
      (apt.city && apt.city.toLowerCase().includes(searchCity.toLowerCase()));
    
    const matchesPrice = !maxPrice || 
      parseFloat(apt.price_per_month || 0) <= parseFloat(maxPrice);
    
    const matchesRooms = !minRooms || 
      parseInt(apt.rooms || 0) >= parseInt(minRooms);
    
    return matchesSearch && matchesCity && matchesPrice && matchesRooms;
  });

  // Filtrage des réservations
  const filteredReservations = reservations.filter(reservation => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return reservation.status === 'pending';
    if (activeTab === 'accepted') return reservation.status === 'accepted';
    if (activeTab === 'cancelled') return reservation.status === 'cancelled';
    return true;
  });

  // RENDER: Page Dashboard
  if (currentPage === 'dashboard') {
    return (
      <div className="client-dashboard">
        {/* Notification */}
        {notification.show && (
          <div className={`toast-notification ${notification.type}`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ show: false, message: '', type: 'success' })}>
              ×
            </button>
          </div>
        )}
        <div className="search-section">
          <div className="search-filters">
            <div className="search-input-wrapper">
              <Icon name="search" size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="search-input-wrapper">
              <Icon name="location" size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Ville"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="search-input-wrapper">
              <Icon name="money" size={18} className="search-icon" />
              <input
                type="number"
                placeholder="Prix max (dh)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="search-input-wrapper">
              <Icon name="bed" size={18} className="search-icon" />
              <input
                type="number"
                placeholder="Chambres min"
                value={minRooms}
                onChange={(e) => setMinRooms(e.target.value)}
                className="search-input"
              />
            </div>
            <button onClick={loadApartments} className="search-btn">
              <Icon name="filter" size={18} />
              Filtrer
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement des appartements...</p>
          </div>
        ) : filteredApartments.length > 0 ? (
          <>
            <div className="results-info">
              <p>{filteredApartments.length} appartement(s) trouvé(s)</p>
            </div>
            <div className="apartments-grid">
              {filteredApartments.map(apt => (
                <div key={apt.id} className="apartment-card">
                  <div className="apartment-image-container">
                    <div className="image-wrapper" onClick={() => handleImageClick(apt)}>
                      <img 
                        src={getCurrentApartmentImage(apt)} 
                        alt={apt.title}
                        className="apartment-main-image"
                        onError={(e) => {
                          e.target.src = getFallbackImage(apt.id);
                          e.target.onerror = null;
                        }}
                        loading="lazy"
                      />
                      
                      {/* Contrôles du carrousel */}
                      {apt.images && apt.images.length > 1 && (
                        <>
                          <button 
                            className="carousel-nav-btn carousel-prev"
                            onClick={(e) => changeApartmentImage(apt.id, 'prev', e)}
                          >
                            <Icon name="chevronLeft" size={24} />
                          </button>
                          <button 
                            className="carousel-nav-btn carousel-next"
                            onClick={(e) => changeApartmentImage(apt.id, 'next', e)}
                          >
                            <Icon name="chevronRight" size={24} />
                          </button>
                          <div className="carousel-indicator-card">
                            {(apartmentImageIndices[apt.id] || 0) + 1} / {apt.images.length}
                          </div>
                        </>
                      )}
                      
                      {/* Badge de statut */}
                      <div className={`status-badge ${apt.available ? 'available' : 'unavailable'}`}>
                        <Icon name="calendar" size={14} />
                        {apt.available ? 'Disponible' : 'Occupé'}
                      </div>
                      
                      {/* Badge de favori */}
                      <button 
                        className={`favorite-btn ${favorites.includes(apt.id) ? 'active' : ''}`}
                        onClick={(e) => toggleFavorite(apt.id, e)}
                      >
                        <Icon name={favorites.includes(apt.id) ? 'heartFill' : 'heart'} size={18} />
                      </button>
                      
                      {/* Indicateur d'images multiples */}
                      {apt.images && apt.images.length > 1 && (
                        <div className="image-count-badge">
                          <Icon name="eye" size={14} />
                          {apt.images.length}
                        </div>
                      )}
                    </div>
                    
                    {/* Mini-carrousel pour les images */}
                    {apt.images && apt.images.length > 1 && (
                      <div className="thumbnail-carousel">
                        {apt.images.slice(0, 4).map((img, idx) => {
                          const currentIndex = apartmentImageIndices[apt.id] || 0;
                          return (
                            <div 
                              key={idx}
                              className={`thumbnail ${idx === currentIndex ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setApartmentImageIndices(prev => ({ ...prev, [apt.id]: idx }));
                              }}
                            >
                              <img 
                                src={img.image_url || img.url || getPrimaryImage(apt)} 
                                alt={`${apt.title} ${idx + 1}`}
                                onError={(e) => {
                                  e.target.src = getFallbackImage(apt.id);
                                  e.target.onerror = null;
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div className="apartment-info">
                    <div className="apartment-header">
                      <h3 className="apartment-title">{apt.title}</h3>
                      <div className="apartment-rating">
                        <Icon name="star" size={16} />
                        <span>4.8</span>
                      </div>
                    </div>
                    
                    <div className="apartment-location">
                      <Icon name="location" size={16} />
                      <span>{apt.city}, {apt.address}</span>
                    </div>
                    
                    {/* Description courte */}
                    {apt.description && (
                      <div className="apartment-description-short">
                        {apt.description.length > 100 
                          ? `${apt.description.substring(0, 100)}...` 
                          : apt.description}
                      </div>
                    )}
                    
                    <div className="apartment-specs">
                      <div className="spec-item">
                        <Icon name="bed" size={16} />
                        <span>{apt.rooms} chambres</span>
                      </div>
                      <div className="spec-item">
                        <Icon name="ruler" size={16} />
                        <span>{apt.surface}m²</span>
                      </div>
                      {apt.price_per_day && (
                        <div className="spec-item">
                          <Icon name="money" size={16} />
                          <span>{apt.price_per_day}dh/jour</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="apartment-price-section">
                      <div className="price-main">
                        <span className="price-amount">{apt.price_per_month}dh</span>
                        <span className="price-period">/mois</span>
                      </div>
                      <div className="price-breakdown">
                        <span className="price-detail">Soit ~{Math.round(apt.price_per_month / 30)}dh/jour</span>
                      </div>
                    </div>
                    
                    <div className="apartment-actions">
                      <button 
                        className="btn-explore"
                        onClick={() => handleExplore(apt)}
                        type="button"
                      >
                        <Icon name="explore" size={18} />
                        Explorer
                      </button>
                      
                      <button 
                        className="btn-reserve"
                        onClick={() => handleReserve(apt)}
                        disabled={!apt.available}
                        type="button"
                      >
                        {apt.available ? 'Réserver maintenant' : 'Indisponible'}
                      </button>
                      
                      <button 
                        className="btn-share"
                        onClick={(e) => handleShare(apt, e)}
                        title="Partager"
                      >
                        <Icon name="share" size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="no-apartments-found">
            <div className="empty-state">
              <div className="empty-state-icon">
                <Icon name="bed" size={48} />
              </div>
              <h3>Aucun appartement trouvé</h3>
              <p>Essayez de modifier vos critères de recherche</p>
              <button onClick={() => {
                setSearchTerm('');
                setSearchCity('');
                setMaxPrice('');
                setMinRooms('');
                loadApartments();
              }} className="btn-primary">
                Voir tous les appartements
              </button>
            </div>
          </div>
        )}

        {/* Modal Exploration Complet */}
        {showExploreModal && selectedApartment && (
          <div className="modal-overlay explore-overlay" onClick={() => setShowExploreModal(false)}>
            <div className="explore-modal-content" onClick={e => e.stopPropagation()}>
              <div className="explore-modal-header">
                <div className="explore-header-left">
                  <h2>{selectedApartment.title}</h2>
                  <div className="explore-location">
                    <Icon name="location" size={18} />
                    <span>{selectedApartment.city}, {selectedApartment.address}</span>
                  </div>
                  <div className="explore-rating">
                    <Icon name="star" size={18} />
                    {apartmentTotalReviews > 0 ? (
                      <>
                        <span>{apartmentAverageRating.toFixed(1)}</span>
                        <span className="rating-text">
                          ({apartmentTotalReviews} avis)
                        </span>
                      </>
                    ) : (
                      <span className="rating-text">Aucun avis pour le moment</span>
                    )}
                  </div>
                </div>
                <button onClick={() => setShowExploreModal(false)} className="close-modal-btn">
                  <Icon name="x" size={24} />
                </button>
              </div>

              {/* Carrousel d'images principal */}
              <div className="explore-image-section">
                {selectedApartment.images && selectedApartment.images.length > 0 ? (
                  <>
                    <div className="explore-main-image-container">
                      <button 
                        className="explore-carousel-btn prev" 
                        onClick={prevExploreImage}
                        disabled={selectedApartment.images.length <= 1}
                      >
                        <Icon name="chevronLeft" size={24} />
                      </button>
                      <img 
                        src={selectedApartment.images[exploreImageIndex]?.image_url || selectedApartment.images[exploreImageIndex]?.url || getPrimaryImage(selectedApartment)}
                        alt={`${selectedApartment.title} - Image ${exploreImageIndex + 1}`}
                        className="explore-main-image"
                        onError={(e) => {
                          e.target.src = getFallbackImage(selectedApartment.id);
                        }}
                      />
                      <button 
                        className="explore-carousel-btn next" 
                        onClick={nextExploreImage}
                        disabled={selectedApartment.images.length <= 1}
                      >
                        <Icon name="chevronRight" size={24} />
                      </button>
                      {selectedApartment.images.length > 1 && (
                        <div className="explore-image-counter">
                          {exploreImageIndex + 1} / {selectedApartment.images.length}
                        </div>
                      )}
                    </div>
                    
                    {/* Miniatures */}
                    {selectedApartment.images.length > 1 && (
                      <div className="explore-thumbnails">
                        {selectedApartment.images.map((img, idx) => (
                          <div 
                            key={idx}
                            className={`explore-thumbnail ${idx === exploreImageIndex ? 'active' : ''}`}
                            onClick={() => setExploreImageIndex(idx)}
                          >
                            <img 
                              src={img.image_url || img.url || getPrimaryImage(selectedApartment)} 
                              alt={`Miniature ${idx + 1}`}
                              onError={(e) => {
                                e.target.src = getFallbackImage(selectedApartment.id);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="explore-main-image-container">
                    <img 
                      src={getPrimaryImage(selectedApartment)}
                      alt={selectedApartment.title}
                      className="explore-main-image"
                      onError={(e) => {
                        e.target.src = getFallbackImage(selectedApartment.id);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Informations détaillées */}
              <div className="explore-content">
                <div className="explore-main-info">
                  {/* Description complète */}
                  <div className="explore-section">
                    <h3>Description</h3>
                    <p className="explore-description">
                      {selectedApartment.description || "Appartement spacieux et moderne, idéalement situé dans un quartier calme et résidentiel. Parfait pour un séjour confortable et agréable."}
                    </p>
                  </div>

                  {/* Caractéristiques principales */}
                  <div className="explore-section">
                    <h3>Caractéristiques</h3>
                    <div className="explore-features-grid">
                      <div className="explore-feature">
                        <Icon name="bed" size={20} />
                        <div>
                          <span className="feature-label">Chambres</span>
                          <span className="feature-value">{selectedApartment.rooms}</span>
                        </div>
                      </div>
                      <div className="explore-feature">
                        <Icon name="ruler" size={20} />
                        <div>
                          <span className="feature-label">Surface</span>
                          <span className="feature-value">{selectedApartment.surface}m²</span>
                        </div>
                      </div>
                      <div className="explore-feature">
                        <Icon name="money" size={20} />
                        <div>
                          <span className="feature-label">Prix mensuel</span>
                          <span className="feature-value">{selectedApartment.price_per_month}dh</span>
                        </div>
                      </div>
                      <div className="explore-feature">
                        <Icon name="calendar" size={20} />
                        <div>
                          <span className="feature-label">Disponibilité</span>
                          <span className={`feature-value ${selectedApartment.available ? 'available' : 'unavailable'}`}>
                            {selectedApartment.available ? 'Disponible' : 'Occupé'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Avis des clients */}
                  <div className="explore-section">
                    <h3>Avis des clients</h3>
                  {apartmentReviewsLoading ? (
                    <p>Chargement des avis...</p>
                  ) : apartmentReviews.length > 0 ? (
                    <div className="reviews-container">
                      {apartmentReviews.map(review => (
                        <div key={review.id} className="review-card">
                          <div className="review-header">
                            <div className="review-author">
                              {review.user?.name || 'Utilisateur'}
                            </div>
                            <div className="review-rating">
                              {[...Array(5)].map((_, i) => (
                                <Icon 
                                  key={i} 
                                  name="star" 
                                  size={16} 
                                  className={i < (review.rating || 0) ? "star-filled" : "star-empty"} 
                                />
                              ))}
                              <span className="rating-number">
                                {(review.rating || 0)}/5
                              </span>
                            </div>
                          </div>
                          <div className="review-date">
                            {review.created_at
                              ? new Date(review.created_at).toLocaleDateString('fr-FR')
                              : ''}
                          </div>
                          <p className="review-comment">{review.comment}</p>
                          {review.response && (
                            <div className="review-response">
                              <div className="response-header">
                                <strong>Réponse du propriétaire :</strong>
                              </div>
                              <p className="response-text">{review.response}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Aucun avis pour cet appartement pour le moment.</p>
                  )}
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowExploreModal(false);
                      onNavigate('reviews');
                    }}
                  >
                    Voir / laisser un avis
                  </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="explore-actions">
                  <button 
                    className="btn-explore-reserve"
                    onClick={() => {
                      setShowExploreModal(false);
                      handleReserve(selectedApartment);
                    }}
                    disabled={!selectedApartment.available}
                  >
                    {selectedApartment.available ? 'Réserver cet appartement' : 'Indisponible pour le moment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Réservation */}
        {showReservationModal && selectedApartment && (
          <div className="modal-overlay" onClick={() => setShowReservationModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header-detailed">
                <h3>Réserver: {selectedApartment.title}</h3>
                <button onClick={() => setShowReservationModal(false)} className="close-modal-btn">
                  <Icon name="x" size={24} />
                </button>
              </div>
              <div className="modal-form">
                <div className="payment-apartment-preview">
                  <img 
                    src={getPrimaryImage(selectedApartment)} 
                    alt={selectedApartment.title}
                    className="payment-apartment-image"
                    onError={(e) => {
                      e.target.src = getFallbackImage(selectedApartment.id);
                    }}
                  />
                  <div className="payment-apartment-info">
                    <h4>{selectedApartment.title}</h4>
                    <p><Icon name="location" size={16} /> {selectedApartment.city}, {selectedApartment.address}</p>
                    <p><Icon name="money" size={16} /> {selectedApartment.price_per_month}dh/mois</p>
                    {selectedApartment.price_per_day && (
                      <p><Icon name="money" size={16} /> {selectedApartment.price_per_day}dh/jour</p>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label><Icon name="calendar" size={16} /> Date d'arrivée</label>
                  <input
                    type="date"
                    value={reservationDates.start_date}
                    onChange={e => {
                      setReservationDates({...reservationDates, start_date: e.target.value});
                    }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label><Icon name="calendar" size={16} /> Date de départ</label>
                  <input
                    type="date"
                    value={reservationDates.end_date}
                    onChange={e => {
                      setReservationDates({...reservationDates, end_date: e.target.value});
                    }}
                    min={reservationDates.start_date || new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                {/* Calcul automatique du prix */}
                {reservationDates.start_date && reservationDates.end_date && (
                  <div className="price-calculator">
                    <div className="summary-item">
                      <span className="summary-label">Durée du séjour:</span>
                      <span className="summary-value">
                        {(() => {
                          const start = new Date(reservationDates.start_date);
                          const end = new Date(reservationDates.end_date);
                          const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                          return `${days} jour(s)`;
                        })()}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Prix total estimé:</span>
                      <span className="summary-value price">
                        {(() => {
                          const start = new Date(reservationDates.start_date);
                          const end = new Date(reservationDates.end_date);
                          const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                          const price = selectedApartment.price_per_day 
                            ? (selectedApartment.price_per_day * days)
                            : (selectedApartment.price_per_month / 30 * days);
                          return `${price.toFixed(2)}dh`;
                        })()}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Information sur le flux */}
                <div className="reservation-info-box">
                  <Icon name="clock" size={20} />
                  <div>
                    <p><strong>Processus de réservation :</strong></p>
                    <ol>
                      <li>Création de la réservation (statut: en attente)</li>
                      <li>Confirmation par l'admin (statut: acceptée)</li>
                      <li>Paiement de la réservation</li>
                    </ol>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button onClick={handleSubmitReservation} className="btn-primary">
                  Confirmer la réservation
                </button>
                <button onClick={() => setShowReservationModal(false)} className="btn-secondary">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Carrousel d'Images */}
        {showImageModal && selectedApartment && selectedApartment.images && (
          <div className="modal-overlay dark" onClick={() => setShowImageModal(false)}>
            <div className="image-modal-content" onClick={e => e.stopPropagation()}>
              <div className="image-modal-header">
                <h3>{selectedApartment.title}</h3>
                <button onClick={() => setShowImageModal(false)} className="close-modal-btn">
                  <Icon name="x" size={24} />
                </button>
              </div>
              
              <div className="carousel-container">
                <button className="carousel-btn prev" onClick={prevImage}>
                  <Icon name="chevronLeft" size={24} />
                </button>
                
                <div className="main-carousel">
                  <img 
                    src={selectedApartment.images[currentImageIndex]?.image_url || selectedApartment.images[currentImageIndex]?.url || getPrimaryImage(selectedApartment)}
                    alt={`${selectedApartment.title} - Image ${currentImageIndex + 1}`}
                    className="carousel-image"
                    onLoad={() => setImageLoading(false)}
                    onError={(e) => {
                      e.target.src = getFallbackImage(selectedApartment.id);
                      setImageLoading(false);
                    }}
                  />
                  {imageLoading && <div className="image-loading">Chargement...</div>}
                </div>
                
                <button className="carousel-btn next" onClick={nextImage}>
                  <Icon name="chevronRight" size={24} />
                </button>
                
                <div className="carousel-indicators">
                  {selectedApartment.images.map((_, idx) => (
                    <button
                      key={idx}
                      className={`indicator ${idx === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(idx)}
                    />
                  ))}
                </div>
                
                <div className="image-counter">
                  {currentImageIndex + 1} / {selectedApartment.images.length}
                </div>
              </div>
              
              <div className="thumbnail-scroll">
                {selectedApartment.images.map((img, idx) => (
                  <div 
                    key={idx}
                    className={`thumbnail-modal ${idx === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  >
                    <img 
                      src={img.image_url || img.url || getPrimaryImage(selectedApartment)} 
                      alt={`Miniature ${idx + 1}`}
                      onError={(e) => {
                        e.target.src = getFallbackImage(selectedApartment.id);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

       
      </div>
    );
  }
  

  // RENDER: Page Réservations - AVEC FLUX CORRECT
  if (currentPage === 'reservations') {
    return (
      <div className="client-dashboard">
        {notification.show && (
          <div className={`toast-notification ${notification.type}`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ show: false, message: '', type: 'success' })}>
              ×
            </button>
          </div>
        )}
        
        <div className="dashboard-header">
          <h1 className="dashboard-title">Mes Réservations</h1>
          <p className="dashboard-subtitle">Gérez toutes vos réservations en un seul endroit</p>
         {/*  <button onClick={loadReservations} className="refresh-btn">
            <Icon name="search" size={18} /> Actualiser
          </button> */}
        </div>
        
        <div className="filters-tabs">
          <button 
            className={activeTab === 'all' ? 'active' : ''}
            onClick={() => setActiveTab('all')}
          >
            <Icon name="calendar" size={16} /> Toutes ({reservations.length})
          </button>
          <button 
            className={activeTab === 'pending' ? 'active' : ''}
            onClick={() => setActiveTab('pending')}
          >
            ⏳ En attente ({reservations.filter(r => r.status === 'pending').length})
          </button>
          <button 
            className={activeTab === 'accepted' ? 'active' : ''}
            onClick={() => setActiveTab('accepted')}
          >
            ✅ Acceptées ({reservations.filter(r => r.status === 'accepted').length})
          </button>
          <button 
            className={activeTab === 'cancelled' ? 'active' : ''}
            onClick={() => setActiveTab('cancelled')}
          >
            ❌ Annulées ({reservations.filter(r => r.status === 'cancelled').length})
          </button>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement de vos réservations...</p>
          </div>
        ) : filteredReservations.length > 0 ? (
          <div className="reservations-list">
            {filteredReservations.map(reservation => (
              <div key={reservation.id} className="reservation-card">
                <div className="reservation-info">
                  <div className="reservation-header">
                    <h3>{reservation.apartment?.title || 'Appartement'}</h3>
                    <span className={`reservation-status status-${reservation.status}`}>
                      {reservation.status === 'pending' && '⏳ En attente'}
                      {reservation.status === 'accepted' && '✅ Acceptée'}
                      {reservation.status === 'rejected' && '❌ Refusée'}
                      {reservation.status === 'cancelled' && '🚫 Annulée'}
                    </span>
                  </div>
                  
                  <div className="reservation-details">
                    <div className="detail-item">
                      <Icon name="location" size={16} />
                      <span>{reservation.apartment?.city || 'Ville non spécifiée'}</span>
                    </div>
                    <div className="detail-item">
                      <Icon name="calendar" size={16} />
                      <span>
                        Du {new Date(reservation.start_date).toLocaleDateString('fr-FR')} 
                        au {new Date(reservation.end_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="detail-item">
                      <Icon name="money" size={16} />
                      <span className="price">{parseFloat(reservation.total_price || 0).toLocaleString('fr-FR')}dh</span>
                    </div>
                    
                    {/* Instructions selon le statut */}
                    {reservation.status === 'pending' && !reservation.hasPayment && (
                      <div className="status-instruction pending">
                        <Icon name="clock" size={16} />
                        <span>En attente de confirmation par l'admin'</span>
                      </div>
                    )}
                    
                    {reservation.status === 'accepted' && !reservation.hasPayment && (
                      <div className="status-instruction accepted">
                        <Icon name="alert" size={16} />
                        <span>Réservation acceptée - Paiement disponible</span>
                      </div>
                    )}
                    
                    {reservation.hasPayment && (
                      <div className="status-instruction paid">
                        <Icon name="check" size={16} />
                        <span>Paiement effectué</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="reservation-actions">
                  {/* Paiement disponible SEULEMENT si réservation acceptée ET pas déjà payée */}
                  {reservation.status === 'accepted' && !reservation.hasPayment && (
                    <button 
                      className="btn-pay"
                      onClick={() => handlePay(reservation)}
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? 'Chargement...' : 'Payer maintenant'}
                    </button>
                  )}
                  
                  {/* Annulation possible seulement pour les réservations en attente non payées */}
                  {reservation.status === 'pending' && !reservation.hasPayment && (
                    <button 
                      className="btn-cancel"
                      onClick={() => handleCancelReservation(reservation)}
                    >
                      Annuler
                    </button>
                  )}
                  
                  {/* Indicateur de paiement effectué */}
                  {reservation.hasPayment && (
                    <div className="payment-status">
                      <span className="payment-badge">
                        <Icon name="check" size={14} /> Payé
                      </span>
                    </div>
                  )}
              
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="empty-state">
              <div className="empty-state-icon">
                <Icon name="calendar" size={48} />
              </div>
              <h3>Aucune réservation trouvée</h3>
              <p>Vous n'avez pas encore fait de réservation</p>
              <button onClick={() => onNavigate('dashboard')} className="btn-primary">
                <Icon name="search" size={18} /> Chercher un appartement
              </button>
            </div>
          </div>
        )}
         {showPaymentModal && selectedReservation && (
          <div className="modal-overlay" onClick={() => {
            setShowPaymentModal(false);
            setSelectedReservation(null);
          }}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header-detailed">
                <h3>💳 Effectuer le paiement</h3>
                <button 
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedReservation(null);
                  }}
                  className="close-modal-btn"
                >
                  ×
                </button>
              </div>
              
              <div className="modal-form">
                {selectedReservation.apartment && (
                  <div className="payment-apartment-preview">
                    <img 
                      src={getPrimaryImage(selectedReservation.apartment)} 
                      alt={selectedReservation.apartment.title || 'Appartement'}
                      className="payment-apartment-image"
                      onError={(e) => {
                        e.target.src = getFallbackImage(selectedReservation.apartment?.id);
                      }}
                    />
                    <div className="payment-apartment-info">
                      <h4>{selectedReservation.apartment.title || 'Appartement'}</h4>
                      <p><Icon name="location" size={16} /> {selectedReservation.apartment.city || ''}</p>
                    </div>
                  </div>
                )}
                <div className="payment-summary">
                  <div className="summary-item">
                    <span className="summary-label">Appartement:</span>
                    <span className="summary-value">
                      {selectedReservation.apartment?.title || 'Appartement'}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Dates:</span>
                    <span className="summary-value">
                      {new Date(selectedReservation.start_date).toLocaleDateString()} - {new Date(selectedReservation.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Montant:</span>
                    <span className="summary-value price">
                      {paymentData.amount}dh
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Statut réservation:</span>
                    <span className="summary-value accepted">
                      ✅ Acceptée
                    </span>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>
                    💳 Méthode de paiement
                    <select
                      value={paymentData.method}
                      onChange={e => setPaymentData({
                        ...paymentData,
                        method: e.target.value
                      })}
                    >
                      <option value="card">💳 Carte bancaire</option>
                      <option value="cash">💵 Espèces</option>
                      <option value="transfer">🏦 Virement bancaire</option>
                    </select>
                  </label>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  onClick={handleSubmitPayment} 
                  className="btn-primary"
                  disabled={paymentLoading}
                >
                  {paymentLoading ? '💳 Traitement...' : '💳 Confirmer le paiement'}
                </button>
                <button 
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedReservation(null);
                  }}
                  className="btn-secondary"
                  disabled={paymentLoading}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
          )} 
          </div>

  );}

  // RENDER: Page Paiements
  if (currentPage === 'payments') {
    return (
      <div className="client-dashboard">
        {notification.show && (
          <div className={`toast-notification ${notification.type}`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ show: false, message: '', type: 'success' })}>
              ×
            </button>
          </div>
        )}
        
        <div className="dashboard-header">
          <h1 className="dashboard-title">Mes Paiements</h1>
          <p className="dashboard-subtitle">Historique de tous vos paiements</p>
       {/*    <button onClick={loadPayments} className="refresh-btn">
            <Icon name="search" size={18} /> Actualiser
          </button> */}
        </div>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement de vos paiements...</p>
          </div>
        ) : payments.length > 0 ? (
          <div className="payments-list">
            {payments.map(payment => (
              <div key={payment.id} className="payment-card">
                <div className="payment-info">
                  <div className="payment-header">
                    <h3>Paiement #{payment.id}</h3>
                    <span className={`payment-status status-${payment.status}`}>
                      {payment.status === 'paid' ? '✅ Payé' : payment.status}
                    </span>
                  </div>
                  
                  <div className="payment-details">
                    <div className="detail-item">
                      <Icon name="money" size={16} />
                      <span className="amount">{parseFloat(payment.amount || 0).toLocaleString('fr-FR')}dh</span>
                    </div>
                    <div className="detail-item">
                      <Icon name="calendar" size={16} />
                      <span>Effectué le {new Date(payment.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="detail-item">
                      <span className="method-label">Méthode:</span>
                      <span className="method-value">
                        {payment.method === 'card' && '💳 Carte bancaire'}
                        {payment.method === 'cash' && '💵 Espèces'}
                        {payment.method === 'transfer' && '🏦 Virement bancaire'}
                        {!['card', 'cash', 'transfer'].includes(payment.method) && payment.method}
                      </span>
                    </div>
                    {payment.reservation_id && (
                      <div className="detail-item">
                        <Icon name="calendar" size={16} />
                        <span>Pour réservation #{payment.reservation_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Résumé financier */}
            <div className="financial-summary">
              <h3>Résumé financier</h3>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Total payé:</span>
                  <span className="stat-value">
                    {payments
                      .filter(p => p.status === 'paid')
                      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
                      .toLocaleString('fr-FR')}dh
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Nombre de paiements:</span>
                  <span className="stat-value">{payments.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Réservations payées:</span>
                  <span className="stat-value">
                    {reservations.filter(r => r.hasPayment).length} / {reservations.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-results">
            <div className="empty-state">
              <div className="empty-state-icon">
                <Icon name="money" size={48} />
              </div>
              <h3>Aucun paiement trouvé</h3>
              <p>Vous n'avez pas encore effectué de paiement</p>
              <button onClick={() => onNavigate('reservations')} className="btn-primary">
                <Icon name="calendar" size={18} /> Voir mes réservations
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
// RENDER: Page Avis
if (currentPage === 'reviews') {
  return (
    <div className="client-dashboard">
      {notification.show && (
        <div className={`toast-notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification({ show: false, message: '', type: 'success' })}>
            ×
          </button>
        </div>
      )}
  <ClientReviews 
        onNavigate={onNavigate}
        reservations={reservations}
        showNotification={showNotification}
      />
    </div>
  );
}

  if (currentPage === 'profile') {
    return (
      <div className="client-dashboard">
        {notification.show && (
          <div className={`toast-notification ${notification.type}`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ show: false, message: '', type: 'success' })}>
              ×
            </button>
          </div>
        )}
        <ProfilePage 
          onNavigate={onNavigate}
          onProfileUpdate={(updatedUser) => {
            localStorage.setItem('user', JSON.stringify(updatedUser));
            showNotification('Profil mis à jour avec succès', 'success');
          }}
        />
      </div>
    );
  }

  return null;
};

export default ClientDashboard;