const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Fonction pour récupérer le token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token;
};

// Fonction utilitaire pour gérer les réponses - VERSION AMÉLIORÉE
const handleResponse = async (response) => {
  const text = await response.text();
  
  if (!text) {
    throw new Error('Réponse vide du serveur');
  }

  try {
    const data = JSON.parse(text);
    
    if (!response.ok) {
      // Gestion améliorée des erreurs
      const errorMessage = data.message || 
                          (data.errors ? Object.values(data.errors).flat().join(', ') : null) ||
                          `Erreur HTTP: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Réponse serveur invalide (non JSON)');
    }
    throw error;
  }
};

// Fonction pour préparer les headers - NOUVELLE FONCTION UTILE
const getAuthHeaders = (contentType = 'application/json') => {
  const token = getAuthToken();
  const headers = {
    'Accept': 'application/json',
  };
  
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// ============================================================================
// SERVICES DE BASE
// ============================================================================

// Test de connexion API
export const testAPI = async () => {
  try {
    console.log('🔍 Test connexion API...');
    const response = await fetch(`${API_BASE_URL}/test`);
    const data = await handleResponse(response);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Test API échoué:', error);
    return { success: false, message: error.message };
  }
};

// Inscription
export const registerUser = async (name, email, password, role) => {
  try {
    console.log('🔄 Tentative d\'inscription...', { name, email, role });
    
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        password_confirmation: password,
        role: role
      })
    });

    console.log('📡 Statut réponse:', response.status);
    const data = await handleResponse(response);
    
    console.log('✅ Inscription réussie - Données:', data);
    
    return {
      success: true,
      user: data.user,
      token: data.token
    };
  } catch (error) {
    console.error('💥 Erreur inscription complète:', error);
    return { 
      success: false, 
      message: error.message || 'Erreur de connexion au serveur' 
    };
  }
};

// Connexion
export const loginUser = async (email, password, role) => {
  try {
    console.log('🔄 Tentative de connexion...', { email, role });
    
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password: password,
        role: role
      })
    });

    const data = await handleResponse(response);
    
    console.log('✅ Connexion réussie - Données:', data);
    
    return {
      success: true,
      user: data.user,
      token: data.token
    };
  } catch (error) {
    console.error('💥 Erreur connexion complète:', error);
    return { 
      success: false, 
      message: error.message || 'Erreur de connexion au serveur' 
    };
  }
};

// Déconnexion
export const logoutUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    await handleResponse(response);
    return { success: true };
  } catch (error) {
    console.error('Erreur déconnexion:', error);
    return { success: false, message: error.message };
  }
};

// Récupérer l'utilisateur connecté
export const getCurrentUser = async () => {
  try {
    console.log('🔐 Récupération utilisateur courant');
    
    const response = await fetch(`${API_BASE_URL}/user`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    return { success: false, message: error.message };
  }
};

// ============================================================================
// SERVICES POUR LA GESTION DES LOCATAIRES - VERSION CORRIGÉE
// ============================================================================

/**
 * Récupère tous les locataires d'un propriétaire
 */
export const getOwnerTenants = async (ownerId) => {
  try {
    console.log('🔐 Chargement locataires pour owner:', ownerId);
    
    const response = await fetch(`${API_BASE_URL}/tenants/owner/${ownerId}`, {
      headers: getAuthHeaders(),
    });
    
    console.log('📡 Statut réponse locataires:', response.status);
    
    const data = await handleResponse(response);
    return { 
      success: true, 
      data: data.data || [],
      count: data.count || 0,
      message: data.message
    };
  } catch (error) {
    console.error('❌ Erreur chargement locataires:', error);
    return { 
      success: false, 
      data: [], 
      message: error.message 
    };
  }
};

/**
 * Met à jour les informations d'un locataire - VERSION CORRIGÉE
 */
export const updateTenant = async (tenantId, updateData) => {
  try {
    console.log('🔐 Mise à jour locataire:', tenantId, updateData);
    
    const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });

    console.log('📡 Statut réponse mise à jour locataire:', response.status);
    
    const data = await handleResponse(response);
    return { 
      success: true, 
      data: data.data,
      message: data.message || 'Locataire mis à jour avec succès'
    };
  } catch (error) {
    console.error('❌ Erreur mise à jour locataire:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
};

/**
 * Résilie le contrat d'un locataire
 */
export const terminateContract = async (reservationId) => {
  try {
    console.log('🔐 Résiliation contrat pour réservation:', reservationId);
    
    const response = await fetch(`${API_BASE_URL}/tenants/terminate-contract/${reservationId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    console.log('📡 Statut réponse résiliation:', response.status);
    
    const data = await handleResponse(response);
    return { 
      success: true, 
      message: data.message || 'Contrat résilié avec succès',
      data: data.data
    };
  } catch (error) {
    console.error('❌ Erreur résiliation contrat:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
};

// ============================================================================
// SERVICES POUR LES APPARTEMENTS
// ============================================================================

// Appartements - Propriétaire
export const getOwnerApartments = async (ownerId) => {
  try {
    console.log('🔐 Chargement appartements pour owner:', ownerId);

    const response = await fetch(`${API_BASE_URL}/owner/${ownerId}/apartments`, {
      headers: getAuthHeaders(),
    });
    
    console.log('📡 Statut réponse:', response.status);
    
    const data = await handleResponse(response);
    return { success: true, data: data.data || [] };
  } catch (error) {
    console.error('❌ Erreur chargement appartements:', error);
    return { success: false, data: [], message: error.message };
  }
};

export const getAllApartments = async () => {
  try {
    console.log('🔐 Chargement des appartements...');
    
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/apartments`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    
    console.log('📡 Status réponse:', response.status);
    
    const data = await handleResponse(response);
    
    if (!response.ok) {
      console.error('❌ Erreur HTTP:', data);
      return { 
        success: false, 
        data: [], 
        message: data.message || `Erreur ${response.status}` 
      };
    }
    
    // Fonction helper pour construire l'URL complète d'une image
    const buildImageUrl = (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      // Construire l'URL complète depuis le backend
      const baseUrl = API_BASE_URL.replace('/api', '');
      return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    // Traiter les appartements
    const apartments = (data.data || []).map(apartment => {
      // Traiter toutes les images du tableau pour construire leurs URLs complètes
      const processedImages = (apartment.images || []).map(img => {
        const imageUrl = img.image_url || img.url || img.path || null;
        return {
          ...img,
          image_url: imageUrl ? buildImageUrl(imageUrl) : null,
          url: imageUrl ? buildImageUrl(imageUrl) : null
        };
      }).filter(img => img.image_url || img.url); // Filtrer les images invalides
      
      // Récupérer la première image pour image_url principal
      let mainImageUrl = 'https://via.placeholder.com/400x300';
      
      // Méthode 1: Vérifier les images liées (tableau traité)
      if (processedImages.length > 0) {
        mainImageUrl = processedImages[0].image_url || processedImages[0].url || mainImageUrl;
      }
      // Méthode 2: Vérifier l'image directe
      else if (apartment.image) {
        mainImageUrl = buildImageUrl(apartment.image) || mainImageUrl;
      }
      
      return {
        ...apartment,
        images: processedImages,
        image_url: mainImageUrl,
        // Assurer les types corrects
        available: Boolean(apartment.available),
        price_per_month: parseFloat(apartment.price_per_month) || 0,
        surface: parseInt(apartment.surface) || 0,
        rooms: parseInt(apartment.rooms) || 0
      };
    });
    
    console.log(`✅ ${apartments.length} appartements chargés`);
    return { success: true, data: apartments };
    
  } catch (error) {
    console.error('💥 Erreur chargement appartements:', error);
    return { 
      success: false, 
      data: [], 
      message: error.message || 'Erreur de connexion' 
    };
  }
};
    
// Créer un appartement
export const createApartment = async (apartmentData, ownerId) => {
  try {
    console.log('🔐 Création appartement pour owner:', ownerId);
    
    const response = await fetch(`${API_BASE_URL}/apartments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...apartmentData,
        owner_id: ownerId
      })
    });

    console.log('📡 Statut réponse création:', response.status);

    const data = await handleResponse(response);
    return { success: true, data: data.data };
  } catch (error) {
    console.error('❌ Erreur création appartement:', error);
    return { success: false, message: error.message };
  }
};

// Modifier un appartement
export const updateApartment = async (id, apartmentData) => {
  try {
    console.log('🔐 Modification appartement:', id);
    
    const response = await fetch(`${API_BASE_URL}/apartments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(apartmentData)
    });

    console.log('📡 Statut réponse modification:', response.status);

    const data = await handleResponse(response);
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur modification appartement:', error);
    return { success: false, message: error.message };
  }
};

// Supprimer un appartement
export const deleteApartment = async (id) => {
  try {
    console.log('🔐 Suppression appartement:', id);
    
    const response = await fetch(`${API_BASE_URL}/apartments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    console.log('📡 Statut réponse suppression:', response.status);

    await handleResponse(response);
    return { success: true };
  } catch (error) {
    console.error('Erreur suppression appartement:', error);
    return { success: false, message: error.message };
  }
};

// ============================================================================
// SERVICES POUR LES RÉSERVATIONS
// ============================================================================

// Obtenir les réservations d'un propriétaire
export const getOwnerReservations = async (ownerId) => {
  try {
    console.log('🔐 Chargement réservations pour owner:', ownerId);
    
    const response = await fetch(`${API_BASE_URL}/owner/${ownerId}/reservations`, {
      headers: getAuthHeaders(),
    });
    
    console.log('📡 Statut réponse réservations owner:', response.status);
    
    const data = await handleResponse(response);
    return { success: true, data: data.data || [] };
  } catch (error) {
    console.error('Erreur chargement réservations owner:', error);
    return { success: false, data: [], message: error.message };
  }
};

// Obtenir les réservations d'un client
export const getClientReservations = async (clientId) => {
  try {
    console.log('🔐 Chargement réservations pour client:', clientId);
    
    const response = await fetch(`${API_BASE_URL}/tenant/${clientId}/reservations`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return { success: true, data: data.data || [] };
  } catch (error) {
    console.error('Erreur chargement réservations client:', error);
    return { success: false, data: [], message: error.message };
  }
};

// Créer une réservation
export const createReservation = async (reservationData) => {
  try {
    console.log('🔐 Création réservation');
    
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reservationData)
    });

    console.log('📡 Statut réponse réservation:', response.status);

    const data = await handleResponse(response);
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur création réservation:', error);
    return { success: false, message: error.message };
  }
};

// Mettre à jour une réservation
export const updateReservation = async (reservationId, updateData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });

    console.log('📡 Statut réponse modification réservation:', response.status);
    const data = await handleResponse(response);
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur modification réservation:', error);
    return { success: false, message: error.message };
  }
};

// ============================================================================
// SERVICES POUR LES PAIEMENTS
// ============================================================================

export const getPayments = async (userId) => {
  try {
    console.log('🔐 Chargement paiements pour user:', userId);
    
    const response = await fetch(`${API_BASE_URL}/owner/${userId}/payments`, {
      headers: getAuthHeaders(),
    });
    
    console.log('📡 Statut réponse paiements:', response.status);
    
    const data = await handleResponse(response);
    return { success: true, data: data.data || [] };
  } catch (error) {
    console.error('❌ Erreur chargement paiements:', error);
    return { success: false, data: [], message: error.message };
  }
};

// Obtenir les paiements d'un client
export const getClientPayments = async (clientId) => {
  try {
    console.log('🔐 Chargement paiements pour client:', clientId);
    
    const response = await fetch(`${API_BASE_URL}/user/${clientId}/payments`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return { success: true, data: data.data || [] };
  } catch (error) {
    console.error('❌ Erreur chargement paiements client:', error);
    return { success: false, data: [], message: error.message };
  }
};

export const updatePayment = async (paymentId, updateData) => {
  try {
    console.log('🔐 Mise à jour paiement:', paymentId, updateData);
    
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });

    console.log('📡 Statut réponse mise à jour paiement:', response.status);
    
    const data = await handleResponse(response);
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Erreur mise à jour paiement:', error);
    return { success: false, message: error.message };
  }
};

// Fonction améliorée pour créer un paiement
export const createPayment = async (paymentData) => {
  try {
    console.log('🔐 Création paiement:', paymentData);
    
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData)
    });

    const data = await handleResponse(response);
    return { 
      success: true, 
      data: data.data, 
      message: data.message || 'Paiement créé avec succès' 
    };
  } catch (error) {
    console.error('❌ Erreur création paiement:', error);
    return { 
      success: false, 
      message: error.message || 'Erreur lors de la création du paiement' 
    };
  }
};

// Fonction pour vérifier si un paiement existe déjà
export const checkExistingPayment = async (reservationId) => {
  try {
    console.log('🔐 Vérification paiement existant pour réservation:', reservationId);
    
    const response = await fetch(`${API_BASE_URL}/payments/check/${reservationId}`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return { 
      success: true, 
      exists: data.exists || false,
      data: data.data 
    };
  } catch (error) {
    console.error('❌ Erreur vérification paiement:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
};

// ============================================================================
// SERVICES POUR LA GESTION DU PROFIL
// ============================================================================

export const getUserProfile = async (userId) => {
  try {
    console.log('🔐 Chargement profil utilisateur:', userId);
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: getAuthHeaders(),
    });
    
    console.log('📡 Statut réponse profil:', response.status);
    
    const data = await handleResponse(response);
    return { success: true, user: data.user };
  } catch (error) {
    console.error('❌ Erreur chargement profil:', error);
    return { success: false, message: error.message };
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    console.log('🔐 Mise à jour profil utilisateur:', userId, profileData);
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });

    console.log('📡 Statut réponse mise à jour profil:', response.status);
    
    const data = await handleResponse(response);
    
    // Mettre à jour le localStorage avec les nouvelles données
    if (data.user) {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = {
        ...currentUser,
        ...data.user
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('✅ localStorage mis à jour avec:', updatedUser);
    }
    
    return { success: true, user: data.user, message: data.message };
  } catch (error) {
    console.error('❌ Erreur mise à jour profil:', error);
    return { success: false, message: error.message };
  }
};

export const changePassword = async (userId, passwordData) => {
  try {
    console.log('🔐 Changement mot de passe utilisateur:', userId);
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(passwordData)
    });

    console.log('📡 Statut réponse changement mot de passe:', response.status);
    
    const data = await handleResponse(response);
    return { success: true, message: data.message };
  } catch (error) {
    console.error('❌ Erreur changement mot de passe:', error);
    return { success: false, message: error.message };
  }
};
// services/api.js - AJOUTS POUR LES AVIS

/**
 * Récupère les avis pour les appartements d'un propriétaire
 */
// services/api.js - FONCTION ESSENTIELLE

/**
 * Récupère les avis pour les appartements d'un propriétaire
 */
export const getOwnerReviews = async (ownerId) => {
  try {
    console.log('🔐 Chargement avis pour owner:', ownerId);
    
    const response = await fetch(`${API_BASE_URL}/owner/${ownerId}/reviews`, {
      headers: getAuthHeaders(),
    });
    
    console.log('📡 Statut réponse avis:', response.status);
    
    const data = await handleResponse(response);
    return { 
      success: true, 
      data: data.data || [],
      message: data.message
    };
  } catch (error) {
    console.error('❌ Erreur chargement avis:', error);
    return { 
      success: false, 
      data: [], 
      message: error.message 
    };
  }
};
/**
 * Récupère tous les avis (pour l'admin)
 */
export const getAllReviews = async () => {
  try {
    console.log('🔐 Chargement de tous les avis');
    
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return { 
      success: true, 
      data: data.data || [],
      message: data.message
    };
  } catch (error) {
    console.error('❌ Erreur chargement avis:', error);
    return { 
      success: false, 
      data: [], 
      message: error.message 
    };
  }
};

/**
 * Met à jour un avis (statut, réponse, etc.)
 */
export const updateReview = async (reviewId, updateData) => {
  try {
    console.log('🔐 Mise à jour avis:', reviewId, updateData);
    
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });

    const data = await handleResponse(response);
    return { 
      success: true, 
      data: data.data,
      message: data.message || 'Avis mis à jour avec succès'
    };
  } catch (error) {
    console.error('❌ Erreur mise à jour avis:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
};

/**
 * Supprime un avis
 */
export const deleteReview = async (reviewId) => {
  try {
    console.log('🔐 Suppression avis:', reviewId);
    
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    await handleResponse(response);
    return { 
      success: true, 
      message: 'Avis supprimé avec succès'
    };
  } catch (error) {
    console.error('❌ Erreur suppression avis:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
};

/**
 * Crée un avis
 */
export const createReview = async (reviewData) => {
  try {
    console.log('🔐 Création avis:', reviewData);
    
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData)
    });

    const data = await handleResponse(response);
    return { 
      success: true, 
      data: data.data,
      message: data.message || 'Avis créé avec succès'
    };
  } catch (error) {
    console.error('❌ Erreur création avis:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
};

/**
 * Crée une réponse à un avis
 */
export const createReviewResponse = async (reviewId, responseData) => {
  try {
    console.log('🔐 Création réponse avis:', reviewId);
    
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/response`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(responseData)
    });

    const data = await handleResponse(response);
    return { 
      success: true, 
      data: data.data,
      message: data.message || 'Réponse ajoutée avec succès'
    };
  } catch (error) {
    console.error('❌ Erreur création réponse:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
};
// ============================================================================
// SERVICES GROUPÉS POUR L'EXPORT
// ============================================================================

export const tenantService = {
  getOwnerTenants,
  updateTenant,
  terminateContract,
};

// ============================================================================
// SERVICES POUR LES IMAGES D'APPARTEMENTS
// ============================================================================

// Récupérer les images d'un appartement
export const getApartmentImages = async (apartmentId) => {
  try {
    console.log('🔐 Chargement images pour appartement:', apartmentId);
    
    const response = await fetch(`${API_BASE_URL}/apartments/${apartmentId}/images`, {
      headers: getAuthHeaders(),
    });
    
    console.log('📡 Statut réponse images:', response.status);
    
    const data = await handleResponse(response);
    return { success: true, data: data.data || [] };
  } catch (error) {
    console.error('❌ Erreur chargement images:', error);
    return { success: false, data: [], message: error.message };
  }
};

// Uploader une image pour un appartement
export const uploadApartmentImage = async (apartmentId, imageFile) => {
  try {
    console.log('🔐 Upload image pour appartement:', apartmentId);
    console.log('📁 Fichier:', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type
    });
    
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const token = getAuthToken();
    if (!token) {
      console.error('❌ Aucun token d\'authentification trouvé');
      return { success: false, message: 'Vous devez être connecté pour uploader des images' };
    }
    
    console.log('📤 Envoi de la requête...');
    const response = await fetch(`${API_BASE_URL}/apartments/${apartmentId}/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        // Ne pas définir Content-Type pour FormData, le navigateur le fait automatiquement
      },
      body: formData
    });
    
    console.log('📡 Statut réponse upload:', response.status);
    console.log('📡 Headers réponse:', Object.fromEntries(response.headers.entries()));
    
    const data = await handleResponse(response);
    
    if (response.ok) {
      console.log('✅ Upload réussi:', data);
      return { success: true, data: data.data, message: data.message };
    } else {
      console.error('❌ Erreur upload:', data);
      return { success: false, message: data.message || 'Erreur lors de l\'upload' };
    }
  } catch (error) {
    console.error('❌ Erreur upload image:', error);
    console.error('❌ Détails erreur:', {
      message: error.message,
      stack: error.stack
    });
    return { success: false, message: error.message || 'Erreur de connexion au serveur' };
  }
};

// Supprimer une image d'appartement
export const deleteApartmentImage = async (imageId) => {
  try {
    console.log('🔐 Suppression image:', imageId);
    
    const response = await fetch(`${API_BASE_URL}/apartment-images/${imageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    console.log('📡 Statut réponse suppression image:', response.status);
    
    await handleResponse(response);
    return { success: true, message: 'Image supprimée avec succès' };
  } catch (error) {
    console.error('❌ Erreur suppression image:', error);
    return { success: false, message: error.message };
  }
};

export const apartmentService = {
  getOwnerApartments,
  getAllApartments,
  createApartment,
  updateApartment,
  deleteApartment,
};

export const apartmentImageService = {
  getApartmentImages,
  uploadApartmentImage,
  deleteApartmentImage,
};

export const reservationService = {
  getOwnerReservations,
  createReservation,
  updateReservation,
};

export const paymentService = {
  getPayments,
  updatePayment,
};

export const userService = {
  getUserProfile,
  updateUserProfile,
  changePassword,
};
// services/api.js - Ajouter à la fin du fichier

export const reviewService = {
  getOwnerReviews,
  getAllReviews,
  updateReview,
  deleteReview,
  createReviewResponse,
};

// ============================================================================
// SERVICES POUR L'ADMINISTRATEUR
// ============================================================================

/**
 * Récupère les statistiques globales pour le dashboard admin
 */
export const getAdminStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return { success: true, data: data.data };
  } catch (error) {
    console.error('❌ Erreur récupération stats admin:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Récupère tous les utilisateurs avec pagination
 */
export const getAdminUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.page) queryParams.append('page', params.page);

    const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return { success: true, data: data.data, pagination: data.pagination };
  } catch (error) {
    console.error('❌ Erreur récupération utilisateurs:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Récupère un utilisateur spécifique
 */
export const getAdminUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return { success: true, data: data.data };
  } catch (error) {
    console.error('❌ Erreur récupération utilisateur:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Crée un nouvel utilisateur
 */
export const createAdminUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    
    const data = await handleResponse(response);
    return { success: true, data: data.data, message: data.message };
  } catch (error) {
    console.error('❌ Erreur création utilisateur:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Met à jour un utilisateur
 */
export const updateAdminUser = async (userId, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    
    const data = await handleResponse(response);
    return { success: true, data: data.data, message: data.message };
  } catch (error) {
    console.error('❌ Erreur mise à jour utilisateur:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Supprime un utilisateur
 */
export const deleteAdminUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return { success: true, message: data.message };
  } catch (error) {
    console.error('❌ Erreur suppression utilisateur:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Récupère tous les appartements avec pagination
 */
export const getAdminApartments = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.search) queryParams.append('search', params.search);
    if (params.city) queryParams.append('city', params.city);
    if (params.available) queryParams.append('available', params.available);
    if (params.page) queryParams.append('page', params.page);

    const response = await fetch(`${API_BASE_URL}/admin/apartments?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return { success: true, data: data.data, pagination: data.pagination };
  } catch (error) {
    console.error('❌ Erreur récupération appartements:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Met à jour un appartement
 */
export const updateAdminApartment = async (apartmentId, apartmentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/apartments/${apartmentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(apartmentData)
    });
    
    const data = await handleResponse(response);
    return { success: true, data: data.data, message: data.message };
  } catch (error) {
    console.error('❌ Erreur mise à jour appartement:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Supprime un appartement
 */
export const deleteAdminApartment = async (apartmentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/apartments/${apartmentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return { success: true, message: data.message };
  } catch (error) {
    console.error('❌ Erreur suppression appartement:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Récupère toutes les réservations avec pagination
 */
export const getAdminReservations = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);

    const response = await fetch(`${API_BASE_URL}/admin/reservations?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return { success: true, data: data.data, pagination: data.pagination };
  } catch (error) {
    console.error('❌ Erreur récupération réservations:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Met à jour une réservation
 */
export const updateAdminReservation = async (reservationId, reservationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/reservations/${reservationId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(reservationData)
    });
    
    const data = await handleResponse(response);
    return { success: true, data: data.data, message: data.message };
  } catch (error) {
    console.error('❌ Erreur mise à jour réservation:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Supprime une réservation
 */
export const deleteAdminReservation = async (reservationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/reservations/${reservationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return { success: true, message: data.message };
  } catch (error) {
    console.error('❌ Erreur suppression réservation:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Récupère tous les paiements avec pagination
 */
export const getAdminPayments = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.status) queryParams.append('status', params.status);
    if (params.method) queryParams.append('method', params.method);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);

    const response = await fetch(`${API_BASE_URL}/admin/payments?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return { success: true, data: data.data, pagination: data.pagination };
  } catch (error) {
    console.error('❌ Erreur récupération paiements:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Met à jour un paiement
 */
export const updateAdminPayment = async (paymentId, paymentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/payments/${paymentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData)
    });
    
    const data = await handleResponse(response);
    return { success: true, data: data.data, message: data.message };
  } catch (error) {
    console.error('❌ Erreur mise à jour paiement:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Supprime un paiement
 */
export const deleteAdminPayment = async (paymentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/payments/${paymentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return { success: true, message: data.message };
  } catch (error) {
    console.error('❌ Erreur suppression paiement:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Récupère tous les avis avec pagination
 */
export const getAdminReviews = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.rating) queryParams.append('rating', params.rating);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);

    const response = await fetch(`${API_BASE_URL}/admin/reviews?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return { success: true, data: data.data, pagination: data.pagination };
  } catch (error) {
    console.error('❌ Erreur récupération avis:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Met à jour un avis
 */
export const updateAdminReview = async (reviewId, reviewData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData)
    });
    
    const data = await handleResponse(response);
    return { success: true, data: data.data, message: data.message };
  } catch (error) {
    console.error('❌ Erreur mise à jour avis:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Supprime un avis
 */
export const deleteAdminReview = async (reviewId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return { success: true, message: data.message };
  } catch (error) {
    console.error('❌ Erreur suppression avis:', error);
    return { success: false, message: error.message };
  }
};
// ============================================================================
// SERVICES POUR LES AVIS
// ============================================================================

/**
 * Récupère les avis pour un appartement spécifique
 */
export const getApartmentReviews = async (apartmentId) => {
  try {
    console.log('🔐 Chargement avis pour appartement:', apartmentId);
    
    const response = await fetch(`${API_BASE_URL}/apartments/${apartmentId}/reviews`, {
      headers: getAuthHeaders(),
    });
    
    console.log('📡 Statut réponse avis appartement:', response.status);
    
    const data = await handleResponse(response);
    return { 
      success: true, 
      data: data.data || [],
      averageRating: data.average_rating || 0,
      totalReviews: data.total_reviews || 0,
      message: data.message
    };
  } catch (error) {
    console.error('❌ Erreur chargement avis appartement:', error);
    return { 
      success: false, 
      data: [], 
      averageRating: 0,
      totalReviews: 0,
      message: error.message 
    };
  }
};

/**
 * Crée un nouvel avis pour un appartement
 */

/**
 * Vérifie si l'utilisateur peut laisser un avis pour une réservation
 */
export const canUserReviewReservation = async (reservationId, userId) => {
  try {
    console.log('🔐 Vérification droit avis pour réservation:', reservationId, userId);
    
    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/can-review?user_id=${userId}`, {
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return { 
      success: true, 
      canReview: data.can_review || false,
      message: data.message
    };
  } catch (error) {
    console.error('❌ Erreur vérification droit avis:', error);
    return { 
      success: false, 
      canReview: false,
      message: error.message 
    };
  }
};

/**
 * Récupère les avis de l'utilisateur connecté
 */
export const getUserReviews = async (userId) => {
  try {
    console.log('🔐 Chargement avis utilisateur:', userId);
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}/reviews`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return { 
      success: true, 
      data: data.data || [],
      message: data.message
    };
  } catch (error) {
    console.error('❌ Erreur chargement avis utilisateur:', error);
    return { 
      success: false, 
      data: [], 
      message: error.message 
    };
  }
};

/**
 * Met à jour un avis existant
 */
export const updateUserReview = async (reviewId, reviewData) => {
  try {
    console.log('🔐 Mise à jour avis:', reviewId, reviewData);
    
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData)
    });

    const data = await handleResponse(response);
    return { 
      success: true, 
      data: data.data,
      message: data.message || 'Avis mis à jour avec succès'
    };
  } catch (error) {
    console.error('❌ Erreur mise à jour avis:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
};

/**
 * Supprime un avis
 */
export const deleteUserReview = async (reviewId) => {
  try {
    console.log('🔐 Suppression avis:', reviewId);
    
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    return { 
      success: true, 
      message: data.message || 'Avis supprimé avec succès'
    };
  } catch (error) {
    console.error('❌ Erreur suppression avis:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
};
export const adminService = {
  getAdminStats,
  getAdminUsers,
  getAdminUser,
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
};
// services/api.js - SECTION CORRIGÉE POUR LES AVIS

/**
 * Récupère les avis pour les appartements d'un propriétaire
 */


/**
 * Récupère les avis d'un appartement spécifique
 */

/**
 * Crée un nouvel avis

  

/**
 * Vérifie si l'utilisateur peut laisser un avis pour une réservation
 */

/**
 * Récupère les avis de l'utilisateur connecté


/**
 * Met à jour un avis existant

/**
 * Supprime un avis
 */

 




/* 
// Service groupé pour les avis
export const reviewService = {
  getOwnerReviews,
  getApartmentReviews,
  createReview,
  canUserReviewReservation,
  getUserReviews,
  updateUserReview,
  deleteUserReview,
  createReviewResponse,
  getAllReviews
}; */