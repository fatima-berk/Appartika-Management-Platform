import React, { useState, useEffect } from 'react';
import { getOwnerTenants, terminateContract } from '../services/api';
import './TenantManagement.css';

const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const userProfile = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    loadTenants();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 4000);
  };

  const loadTenants = async () => {
    try {
      if (!userProfile?.id) return;

      const response = await getOwnerTenants(userProfile.id);
      
      if (response.success) {
        // Mapper les données pour normaliser tenant_status en status
        const mappedTenants = (response.data || []).map(tenant => ({
          ...tenant,
          status: tenant.tenant_status || tenant.status || 'active'
        }));
        setTenants(mappedTenants);
        console.log('✅ Locataires chargés:', mappedTenants.length);
      } else {
        console.error('❌ Erreur chargement locataires:', response.message);
        setTenants([]);
      }
    } catch (error) {
      console.error('💥 Erreur chargement:', error);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour contacter un locataire
 // Fonction pour contacter un locataire - SOLUTION ULTIME
const handleContactTenant = (tenant) => {
  if (!tenant.email) {
    showNotification('Email non disponible pour ce locataire', 'error');
    return;
  }

  // Créer une modal d'email intégrée
  showEmailModal(tenant);
};

// Fonction pour afficher une modal d'email
const showEmailModal = (tenant) => {
  const subject = "Information concernant votre location";
  const senderName = userProfile?.name || 'Le propriétaire';
  const defaultBody = `Bonjour ${tenant.name},\n\nJe vous contacte concernant votre location au ${tenant.apartment_title}.\n\nCordialement,\n${senderName}`;
  
  // Créer la modal
  const modal = document.createElement('div');
  modal.id = 'email-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    padding: 20px;
  `;
  
  // Contenu de la modal
  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease-out;
    ">
      <div style="
        padding: 24px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div>
          <h3 style="margin: 0; color: #111827; font-size: 20px; font-weight: 600;">
            ✉️ Envoyer un email à ${tenant.name}
          </h3>
          <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">
            Destinataire: <strong>${tenant.email}</strong>
          </p>
        </div>
        <button id="close-email-modal" style="
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
          border-radius: 4px;
          &:hover { background: #f3f4f6; }
        ">
          ×
        </button>
      </div>
      
      <div style="padding: 24px;">
        <div style="margin-bottom: 20px;">
          <label style="
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #374151;
          ">
            Sujet
          </label>
          <input 
            type="text" 
            id="email-subject"
            value="${subject}"
            style="
              width: 100%;
              padding: 12px;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              font-size: 16px;
              &:focus { outline: none; border-color: #3b82f6; }
            "
          />
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #374151;
          ">
            Message
          </label>
          <textarea 
            id="email-body"
            rows="8"
            style="
              width: 100%;
              padding: 12px;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              font-size: 16px;
              font-family: inherit;
              resize: vertical;
              &:focus { outline: none; border-color: #3b82f6; }
            "
          >${defaultBody}</textarea>
        </div>
        
        <div style="
          background: #f3f4f6;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
          color: #6b7280;
        ">
          <strong>💡 Astuce:</strong> Copiez le texte ci-dessus et collez-le dans votre application email préférée.
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap;">
          <button id="copy-email-content" style="
            padding: 12px 24px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            &:hover { background: #059669; }
          ">
            📋 Copier le contenu
          </button>
          
          <button id="open-gmail" style="
            padding: 12px 24px;
            background: #ea4335;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            &:hover { background: #d62516; }
          ">
            📧 Ouvrir dans Gmail
          </button>
          
          <button id="open-outlook" style="
            padding: 12px 24px;
            background: #0078d4;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            &:hover { background: #006cbd; }
          ">
            📨 Ouvrir dans Outlook
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Ajouter les styles d'animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    #email-subject:focus, #email-body:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  `;
  document.head.appendChild(style);
  
  // Ajouter la modal au DOM
  document.body.appendChild(modal);
  
  // Gérer les événements
  document.getElementById('close-email-modal').onclick = () => {
    document.body.removeChild(modal);
    document.head.removeChild(style);
  };
  
  // Copier le contenu
  document.getElementById('copy-email-content').onclick = async () => {
    const subject = document.getElementById('email-subject').value;
    const body = document.getElementById('email-body').value;
    const content = `À: ${tenant.email}\nSujet: ${subject}\n\n${body}`;
    
    try {
      await navigator.clipboard.writeText(content);
      showNotification('✅ Contenu copié dans le presse-papier!', 'success');
    } catch (err) {
      // Fallback pour les anciens navigateurs
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showNotification('✅ Contenu copié!', 'success');
    }
  };
  
  // Ouvrir dans Gmail
  document.getElementById('open-gmail').onclick = () => {
    const subject = encodeURIComponent(document.getElementById('email-subject').value);
    const body = encodeURIComponent(document.getElementById('email-body').value);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${tenant.email}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    document.body.removeChild(modal);
    document.head.removeChild(style);
  };
  
  // Ouvrir dans Outlook
  document.getElementById('open-outlook').onclick = () => {
    const subject = encodeURIComponent(document.getElementById('email-subject').value);
    const body = encodeURIComponent(document.getElementById('email-body').value);
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${tenant.email}&subject=${subject}&body=${body}`;
    window.open(outlookUrl, '_blank', 'noopener,noreferrer');
    document.body.removeChild(modal);
    document.head.removeChild(style);
  };
  
  // Fermer en cliquant à l'extérieur
  modal.onclick = (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
      document.head.removeChild(style);
    }
  };
  
  // Fermer avec Escape
  document.addEventListener('keydown', function closeOnEscape(e) {
    if (e.key === 'Escape') {
      document.body.removeChild(modal);
      document.head.removeChild(style);
      document.removeEventListener('keydown', closeOnEscape);
    }
  });
};
  // Fonction pour ouvrir la modal de résiliation
  const handleOpenDeleteModal = (tenant) => {
    if (!tenant.reservation_id) {
      showNotification('Impossible de trouver la réservation associée', 'error');
      return;
    }
    setSelectedTenant(tenant);
    setShowDeleteModal(true);
  };

  // Fonction pour résilier un locataire
  const handleDeleteTenant = async () => {
    if (!selectedTenant) return;

    try {
      const response = await terminateContract(selectedTenant.reservation_id);
      
      if (response.success) {
        showNotification('Contrat résilié avec succès !', 'success');
        loadTenants();
      } else {
        showNotification(response.message || 'Échec de la résiliation', 'error');
      }
    } catch (error) {
      showNotification('Erreur lors de la résiliation: ' + error.message, 'error');
    } finally {
      setShowDeleteModal(false);
      setSelectedTenant(null);
    }
  };

  // Filtrer les locataires
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = 
      tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.apartment_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Gérer le filtre de statut (inclure cancelled et rejected dans inactive)
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'inactive') {
        matchesStatus = tenant.status === 'inactive' || tenant.status === 'cancelled' || tenant.status === 'rejected';
      } else {
        matchesStatus = tenant.status === statusFilter;
      }
    }
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
  const statusConfig = {
    active: { label: 'Actif', color: '#10b981', bgColor: '#ecfdf5', icon: '✅' },
    pending: { label: 'En attente', color: '#f59e0b', bgColor: '#fffbeb', icon: '⏳' },
    completed: { label: 'Terminé', color: '#3b82f6', bgColor: '#eff6ff', icon: '📅' },
    cancelled: { label: 'Annulé', color: '#ef4444', bgColor: '#fef2f2', icon: '❌' },
    rejected: { label: 'Refusé', color: '#6b7280', bgColor: '#f3f4f6', icon: '🚫' },
    inactive: { label: 'Inactif', color: '#6b7280', bgColor: '#f3f4f6', icon: '💤' }
  };
  
  const config = statusConfig[status] || statusConfig.inactive;
  
  return (
    <span className="status-badge" style={{
      background: config.bgColor,
      color: config.color,
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}>
      {config.icon} {config.label}
    </span>
  );
};

  const getPaymentBadge = (paymentStatus) => {
    const config = paymentStatus === 'paid' 
      ? { label: 'Payé', color: '#10b981', bgColor: '#ecfdf5' }
      : { label: 'En attente', color: '#f59e0b', bgColor: '#fffbeb' };
    
    return (
      <span className="payment-badge" style={{
        background: config.bgColor,
        color: config.color,
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600'
      }}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

 
  const formatCurrency = (amount) => {
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0
  }).format(amount || 0);

  return `${formatted} DH`;
};


  if (loading) {
    return (
      <div className="tenants-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des locataires...</p>
      </div>
    );
  }

  return (
    <div className="tenant-management">
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="tenants-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Gestion des Locataires</h1>
            <p>Liste complète de vos locataires et leurs informations</p>
          </div>
          <div className="header-actions">
          {/*   <button 
              className="btn-refresh"
              onClick={loadTenants}
              title="Actualiser la liste"
            >
              <span className="btn-icon">🔄</span>
              Actualiser
            </button> */}
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="tenants-stats">
        <div className="stat-card">
          <div className="stat-icon total">👥</div>
          <div className="stat-content">
            <h3>{tenants.length}</h3>
            <p>Total Locataires</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">✅</div>
          <div className="stat-content">
            <h3>{tenants.filter(t => t.status === 'active').length}</h3>
            <p>Locataires Actifs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">⏳</div>
          <div className="stat-content">
            <h3>{tenants.filter(t => t.status === 'pending').length}</h3>
            <p>En Attente</p>
          </div>
        </div>

      </div>

      {/* Barre de recherche et filtres */}
      <div className="tenants-controls">
        <div className="search-container">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher un locataire, email ou appartement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <div className="filters-container">
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">✅ Actifs</option>
            <option value="pending">⏳ En attente</option>
            <option value="inactive">💤 Inactifs</option>
           
          </select>
        </div>
      </div>

      {/* Résultats */}
      <div className="results-info">
        <p>
          {filteredTenants.length} locataire(s) trouvé(s) 
          {searchTerm && ` pour "${searchTerm}"`}
          {statusFilter !== 'all' && ` (${statusFilter})`}
        </p>
      </div>

      {/* Tableau des locataires */}
      <div className="tenants-table-container">
        {filteredTenants.length > 0 ? (
          <table className="tenants-table">
            <thead>
              <tr>
                <th>Locataire</th>
                <th>Appartement</th>
                <th>Loyer</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Statut</th>
                <th>Paiement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map(tenant => (
                <tr key={`${tenant.id}-${tenant.reservation_id}`} className="tenant-row">
                  <td className="tenant-info-cell">
                    <div className="tenant-avatar">
                      {tenant.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="tenant-details">
                      <div className="tenant-name">{tenant.name || 'Locataire'}</div>
                      <div className="tenant-contact">
                        <div className="contact-email">{tenant.email || 'Email non disponible'}</div>
                        <div className="contact-phone">{tenant.phone || 'Téléphone non disponible'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="apartment-cell">
                    <div className="apartment-name">{tenant.apartment_title || '-'}</div>
                    <div className="apartment-location">{tenant.city || ''}</div>
                  </td>
                  <td className="rent-cell">
                    <span className="rent-amount">{formatCurrency(tenant.rent)}</span>
                    <span className="rent-period">/mois</span>
                  </td>
                  <td className="date-cell">
                    {formatDate(tenant.start_date)}
                  </td>
                  <td className="date-cell">
                    {formatDate(tenant.end_date)}
                  </td>
                  <td className="status-cell">
                    {getStatusBadge(tenant.status || 'active')}
                  </td>
                  <td className="payment-cell">
                    {getPaymentBadge(tenant.payment_status)}
                  </td>
                  <td className="actions-cell">
                    <div className="table-actions">
                      <button 
                        className="btn-contact-table"
                        onClick={() => handleContactTenant(tenant)}
                        title="Contacter le locataire"
                      >
                        <span className="btn-icon">✉️</span>
                      </button>
                      <button 
                        className="btn-terminate-table"
                        onClick={() => handleOpenDeleteModal(tenant)}
                        title="Résilier le contrat"
                        disabled={!tenant.reservation_id}
                      >
                        <span className="btn-icon">📝</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-tenants">
            <div className="no-tenants-icon">👥</div>
            <h3>Aucun locataire trouvé</h3>
            <p>
              {tenants.length === 0 
                ? 'Vous n\'avez aucun locataire dans votre portfolio pour le moment.' 
                : 'Aucun locataire ne correspond à votre recherche.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de confirmation de résiliation */}
      {showDeleteModal && selectedTenant && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Résilier le contrat</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="warning-icon">⚠️</div>
              <p>
                Êtes-vous sûr de vouloir résilier le contrat de <strong>{selectedTenant.name}</strong> ?
              </p>
              <div className="tenant-details-modal">
                <p><strong>Appartement:</strong> {selectedTenant.apartment_title}</p>
                <p><strong>Loyer:</strong> {formatCurrency(selectedTenant.rent)}/mois</p>
                <p><strong>Email:</strong> {selectedTenant.email}</p>
              </div>
              <p className="warning-text">
                Cette action est irréversible et libérera l'appartement.
              </p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button 
                className="btn-confirm-delete"
                onClick={handleDeleteTenant}
              >
                Confirmer la résiliation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantManagement;