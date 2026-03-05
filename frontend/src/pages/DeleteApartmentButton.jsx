import React, { useState } from 'react';
import { deleteApartment } from '../services/api';

const DeleteApartmentButton = ({ apartmentId, apartmentTitle, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDelete = async () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'appartement "${apartmentTitle}" ?\n\nCette action est irréversible.`)) {
      setLoading(true);
      try {
        const response = await deleteApartment(apartmentId);
        
        if (response.success) {
          showNotification('🏠 Appartement supprimé avec succès !', 'success');
          // Appeler onDelete pour mettre à jour l'état parent SANS rechargement
          setTimeout(() => {
            onDelete(apartmentId); // Passer l'ID pour suppression locale
          }, 500);
        } else {
          showNotification('❌ ' + (response.message || 'Erreur lors de la suppression'), 'error');
        }
      } catch (error) {
        console.error('Erreur suppression:', error);
        showNotification('❌ Erreur lors de la suppression: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={loading}
        style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          border: 'none',
          padding: '12px 16px',
          borderRadius: '12px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem',
          fontWeight: '600',
          opacity: loading ? 0.6 : 1,
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flex: 1
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = 'none';
          }
        }}
      >
        {loading ? (
          <>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Suppression...
          </>
        ) : (
          <>
            🗑️ Supprimer
          </>
        )}
      </button>

      {/* Notification intégrée */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: notification.type === 'success' 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          border: notification.type === 'success' ? '1px solid #047857' : '1px solid #b91c1c',
          zIndex: 9999,
          minWidth: '300px',
          animation: 'slideIn 0.3s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ fontSize: '20px' }}>
            {notification.type === 'success' ? '✅' : '❌'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '14px' }}>
              {notification.type === 'success' ? 'Succès' : 'Erreur'}
            </div>
            <div style={{ fontSize: '13px' }}>{notification.message}</div>
          </div>
          <button
            onClick={() => setNotification(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '0',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px'
            }}
          >
            ×
          </button>

          <style>
            {`
              @keyframes slideIn {
                from {
                  transform: translateX(100%);
                  opacity: 0;
                }
                to {
                  transform: translateX(0);
                  opacity: 1;
                }
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      )}
    </>
  );
};

export default DeleteApartmentButton;