import React, { useState, useEffect } from 'react';
import { updateApartment } from '../services/api';

const EditApartmentModal = ({ apartment, onClose, onSuccess, priceDisplay }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    price_per_month: '',
    price_per_day: '',
    surface: '',
    rooms: '',
    available: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (apartment) {
      setFormData({
        title: apartment.title || '',
        description: apartment.description || '',
        address: apartment.address || '',
        city: apartment.city || '',
        price_per_month: apartment.price_per_month || '',
        price_per_day: apartment.price_per_day || '',
        surface: apartment.surface || '',
        rooms: apartment.rooms || '',
     
        available: apartment.available === true || 
                  apartment.available === 1 || 
                  apartment.available === "1" || 
                  apartment.available === "true"
      });
    }
  }, [apartment]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = 'Le titre est obligatoire';
    if (!formData.address.trim()) errors.address = 'L\'adresse est obligatoire';
    if (!formData.city.trim()) errors.city = 'La ville est obligatoire';
    if (!formData.price_per_month || formData.price_per_month <= 0) 
      errors.price_per_month = 'Le prix mensuel doit être supérieur à 0';
    if (formData.price_per_day && formData.price_per_day <= 0) 
      errors.price_per_day = 'Le prix journalier doit être supérieur à 0';
    if (!formData.surface || formData.surface <= 0) 
      errors.surface = 'La surface doit être supérieure à 0';
    if (!formData.rooms || formData.rooms <= 0) 
      errors.rooms = 'Le nombre de pièces doit être supérieur à 0';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('❌ Veuillez corriger les erreurs dans le formulaire', 'error');
      return;
    }

    setLoading(true);
    try {
      const apartmentData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        price_per_month: parseFloat(formData.price_per_month),
        price_per_day: formData.price_per_day ? parseFloat(formData.price_per_day) : null,
        surface: parseInt(formData.surface),
        rooms: parseInt(formData.rooms),
        available: Boolean(formData.available)
      };

      const response = await updateApartment(apartment.id, apartmentData);
      
      if (response.success) {
        showNotification('✅ Appartement modifié avec succès !', 'success');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        showNotification('❌ ' + (response.message || 'Erreur lors de la modification'), 'error');
      }
    } catch (error) {
      showNotification('❌ Erreur lors de la modification: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '20px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Header du modal */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          paddingBottom: '15px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            margin: 0, 
            color: '#1a1a1a',
            fontSize: '1.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            ✏️ Modifier l'appartement
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '5px',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '20px', marginBottom: '30px' }}>
            {/* Titre */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                fontSize: '14px',
                color: '#374151'
              }}>
                Titre *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="Ex: Bel appartement avec vue mer"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `2px solid ${formErrors.title ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '10px',
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  background: loading ? '#f9fafb' : 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = formErrors.title ? '#ef4444' : '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {formErrors.title && (
                <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ⚠️ {formErrors.title}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                fontSize: '14px',
                color: '#374151'
              }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                disabled={loading}
                placeholder="Décrivez votre appartement..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '15px',
                  resize: 'vertical',
                  transition: 'all 0.3s ease',
                  background: loading ? '#f9fafb' : 'white',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Adresse et Ville */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  Adresse *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  placeholder="Ex: 123 Rue de la Paix"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${formErrors.address ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '10px',
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    background: loading ? '#f9fafb' : 'white'
                  }}
                />
                {formErrors.address && (
                  <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>
                    ⚠️ {formErrors.address}
                  </div>
                )}
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  Ville *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  placeholder="Ex: Paris"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${formErrors.city ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '10px',
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    background: loading ? '#f9fafb' : 'white'
                  }}
                />
                {formErrors.city && (
                  <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>
                    ⚠️ {formErrors.city}
                  </div>
                )}
              </div>
            </div>

            {/* Prix */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  Prix/mois (DH) *
                </label>
                <input
                  type="number"
                  name="price_per_month"
                  value={formData.price_per_month}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  disabled={loading}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${formErrors.price_per_month ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '10px',
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    background: loading ? '#f9fafb' : 'white'
                  }}
                />
                {formErrors.price_per_month && (
                  <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>
                    ⚠️ {formErrors.price_per_month}
                  </div>
                )}
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  Prix/jour (DH)
                </label>
                <input
                  type="number"
                  name="price_per_day"
                  value={formData.price_per_day}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  disabled={loading}
                  placeholder="Optionnel"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${formErrors.price_per_day ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '10px',
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    background: loading ? '#f9fafb' : 'white'
                  }}
                />
                {formErrors.price_per_day && (
                  <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>
                    ⚠️ {formErrors.price_per_day}
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px', fontStyle: 'italic' }}>
                  Optionnel - Sera calculé automatiquement si vide
                </div>
              </div>
            </div>

            {/* Surface et Pièces */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  Surface (m²) *
                </label>
                <input
                  type="number"
                  name="surface"
                  value={formData.surface}
                  onChange={handleInputChange}
                  required
                  min="0"
                  disabled={loading}
                  placeholder="Ex: 75"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${formErrors.surface ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '10px',
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    background: loading ? '#f9fafb' : 'white'
                  }}
                />
                {formErrors.surface && (
                  <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>
                    ⚠️ {formErrors.surface}
                  </div>
                )}
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#374151'
                }}>
                  Nombre de pièces *
                </label>
                <input
                  type="number"
                  name="rooms"
                  value={formData.rooms}
                  onChange={handleInputChange}
                  required
                  min="1"
                  disabled={loading}
                  placeholder="Ex: 3"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${formErrors.rooms ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '10px',
                    fontSize: '15px',
                    transition: 'all 0.3s ease',
                    background: loading ? '#f9fafb' : 'white'
                  }}
                />
                {formErrors.rooms && (
                  <div style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px' }}>
                    ⚠️ {formErrors.rooms}
                  </div>
                )}
              </div>
            </div>

            {/* Disponibilité - BOUTONS DE TOGGLE */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '12px', 
                fontWeight: '600',
                fontSize: '14px',
                color: '#374151'
              }}>
                Statut de disponibilité
              </label>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '8px'
              }}>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, available: true }))}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '15px',
                    background: formData.available 
                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                      : '#f3f4f6',
                    color: formData.available ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: formData.available ? '0 4px 15px rgba(16, 185, 129, 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && !formData.available) {
                      e.currentTarget.style.background = '#e5e7eb';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && !formData.available) {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <span style={{ fontSize: '18px' }}>🟢</span>
                  Disponible
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, available: false }))}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '15px',
                    background: !formData.available 
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                      : '#f3f4f6',
                    color: !formData.available ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: !formData.available ? '0 4px 15px rgba(239, 68, 68, 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && formData.available) {
                      e.currentTarget.style.background = '#e5e7eb';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && formData.available) {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <span style={{ fontSize: '18px' }}>🔴</span>
                  Occupé
                </button>
              </div>
              
              <div style={{
                fontSize: '13px',
                color: '#6b7280',
                marginTop: '8px',
                padding: '8px 12px',
                background: formData.available ? '#f0fdf4' : '#fef2f2',
                borderRadius: '8px',
                border: `1px solid ${formData.available ? '#bbf7d0' : '#fecaca'}`
              }}>
                {formData.available 
                  ? '✅ L\'appartement sera marqué comme disponible à la location' 
                  : '❌ L\'appartement sera marqué comme occupé/non disponible'
                }
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div style={{ 
            display: 'flex', 
            gap: '15px', 
            justifyContent: 'flex-end',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1,
                minWidth: '100px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(107, 114, 128, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1,
                minWidth: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? (
                <>
                  <span style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid rgba(255,255,255,0.3)', 
                    borderTop: '2px solid white', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite'
                  }}></span>
                  Enregistrement...
                </>
              ) : (
                <>
                  <span style={{ fontSize: '16px' }}>💾</span>
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Notification */}
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
          zIndex: 1001,
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
              borderRadius: '4px',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            ×
          </button>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
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
        `}
      </style>
    </div>
  );
};

export default EditApartmentModal;