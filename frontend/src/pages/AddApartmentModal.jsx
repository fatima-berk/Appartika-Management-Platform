import React, { useState } from 'react';
import { createApartment } from '../services/api';

const AddApartmentModal = ({ onClose, onSuccess }) => {
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

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modal: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      borderRadius: '28px',
      padding: '40px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      animation: 'modalAppear 0.4s ease-out'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '2px solid rgba(226, 232, 240, 0.5)'
    },
    title: {
      fontSize: '2rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: 0
    },
    closeButton: {
      background: 'rgba(239, 68, 68, 0.1)',
      border: 'none',
      borderRadius: '12px',
      padding: '12px',
      cursor: 'pointer',
      fontSize: '1.2rem',
      transition: 'all 0.3s ease',
      color: '#ef4444'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '25px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    required: {
      color: '#ef4444'
    },
    input: {
      padding: '16px 20px',
      border: '2px solid rgba(226, 232, 240, 0.8)',
      borderRadius: '14px',
      fontSize: '1rem',
      background: 'rgba(255, 255, 255, 0.8)',
      transition: 'all 0.3s ease',
      fontFamily: 'inherit'
    },
    textarea: {
      padding: '16px 20px',
      border: '2px solid rgba(226, 232, 240, 0.8)',
      borderRadius: '14px',
      fontSize: '1rem',
      background: 'rgba(255, 255, 255, 0.8)',
      transition: 'all 0.3s ease',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '100px'
    },
    inputFocus: {
      borderColor: '#667eea',
      background: 'rgba(255, 255, 255, 1)',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
      transform: 'translateY(-2px)'
    },
    inputError: {
      borderColor: '#ef4444',
      background: 'rgba(254, 242, 242, 0.8)'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    },
    helpText: {
      fontSize: '0.8rem',
      color: '#6b7280',
      marginTop: '4px',
      fontStyle: 'italic'
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '15px',
      background: 'rgba(241, 245, 249, 0.6)',
      borderRadius: '14px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    checkbox: {
      width: '20px',
      height: '20px',
      borderRadius: '6px',
      border: '2px solid #cbd5e1',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease'
    },
    checkboxChecked: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderColor: '#667eea',
      color: 'white'
    },
    errorMessage: {
      color: '#ef4444',
      fontSize: '0.9rem',
      fontWeight: '500',
      marginTop: '5px'
    },
    actions: {
      display: 'flex',
      gap: '15px',
      justifyContent: 'flex-end',
      marginTop: '10px'
    },
    button: {
      padding: '16px 32px',
      border: 'none',
      borderRadius: '14px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      minWidth: '120px'
    },
    cancelButton: {
      background: 'rgba(107, 114, 128, 0.1)',
      color: '#6b7280'
    },
    submitButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)'
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '28px',
      flexDirection: 'column',
      gap: '15px'
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '3px solid rgba(102, 126, 234, 0.2)',
      borderTop: '3px solid #667eea',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
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
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('❌ Aucun token trouvé. Veuillez vous reconnecter.');
        setLoading(false);
        return;
      }
      
      if (!user || !user.id) {
        alert('❌ Utilisateur non connecté. Veuillez vous reconnecter.');
        setLoading(false);
        return;
      }
      
      const apartmentData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        price_per_month: parseFloat(formData.price_per_month),
        price_per_day: formData.price_per_day ? parseFloat(formData.price_per_day) : null, // NOUVEAU CHAMP
        surface: parseInt(formData.surface),
        rooms: parseInt(formData.rooms),
        available: formData.available ? 1 : 0
      };

      const response = await createApartment(apartmentData, user.id);
      
      if (response.success) {
        alert('✅ Appartement créé avec succès !');
        onSuccess();
      } else {
        alert('❌ Erreur lors de la création: ' + (response.message || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('💥 Erreur création:', error);
      alert('❌ Erreur lors de la création: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = '#667eea';
    e.target.style.background = 'rgba(255, 255, 255, 1)';
    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
    e.target.style.transform = 'translateY(-2px)';
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = formErrors[e.target.name] ? '#ef4444' : 'rgba(226, 232, 240, 0.8)';
    e.target.style.background = formErrors[e.target.name] ? 'rgba(254, 242, 242, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    e.target.style.boxShadow = 'none';
    e.target.style.transform = 'translateY(0)';
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {loading && (
          <div style={styles.loadingOverlay}>
            <div style={styles.loadingSpinner}></div>
            <p style={{color: '#667eea', fontWeight: '600', margin: 0}}>Création en cours...</p>
          </div>
        )}
        
        <div style={styles.header}>
          <h2 style={styles.title}>Nouvel Appartement</h2>
          <button
            onClick={onClose}
            disabled={loading}
            style={styles.closeButton}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              🏠 Titre de l'appartement <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              required
              disabled={loading}
              style={{
                ...styles.input,
                ...(formErrors.title ? styles.inputError : {})
              }}
              placeholder="Ex: Studio moderne centre-ville"
            />
            {formErrors.title && (
              <div style={styles.errorMessage}>{formErrors.title}</div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>📝 Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              rows="3"
              disabled={loading}
              style={styles.textarea}
              placeholder="Décrivez votre appartement..."
            />
          </div>

          <div style={styles.grid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                📍 Adresse <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                disabled={loading}
                style={{
                  ...styles.input,
                  ...(formErrors.address ? styles.inputError : {})
                }}
                placeholder="Ex: 15 Rue de la République"
              />
              {formErrors.address && (
                <div style={styles.errorMessage}>{formErrors.address}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                🏙️ Ville <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                disabled={loading}
                style={{
                  ...styles.input,
                  ...(formErrors.city ? styles.inputError : {})
                }}
                placeholder="Ex: Rabat"
              />
              {formErrors.city && (
                <div style={styles.errorMessage}>{formErrors.city}</div>
              )}
            </div>
          </div>

          {/* NOUVEAU : Section Prix */}
          <div style={styles.grid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                💰 Prix/mois (€) <span style={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="price_per_month"
                value={formData.price_per_month}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                min="0"
                step="0.01"
                disabled={loading}
                style={{
                  ...styles.input,
                  ...(formErrors.price_per_month ? styles.inputError : {})
                }}
                placeholder="Ex: 650"
              />
              {formErrors.price_per_month && (
                <div style={styles.errorMessage}>{formErrors.price_per_month}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                🌞 Prix/jour (€)
              </label>
              <input
                type="number"
                name="price_per_day"
                value={formData.price_per_day}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                min="0"
                step="0.01"
                disabled={loading}
                style={{
                  ...styles.input,
                  ...(formErrors.price_per_day ? styles.inputError : {})
                }}
                placeholder="Ex: 45"
              />
              {formErrors.price_per_day && (
                <div style={styles.errorMessage}>{formErrors.price_per_day}</div>
              )}
              <div style={styles.helpText}>
                Optionnel - Si vide, calculé automatiquement (≈ {formData.price_per_month ? (formData.price_per_month / 30).toFixed(2) : '0'}dh)
              </div>
            </div>
          </div>

          <div style={styles.grid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                📐 Surface (m²) <span style={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="surface"
                value={formData.surface}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                min="0"
                disabled={loading}
                style={{
                  ...styles.input,
                  ...(formErrors.surface ? styles.inputError : {})
                }}
                placeholder="Ex: 45"
              />
              {formErrors.surface && (
                <div style={styles.errorMessage}>{formErrors.surface}</div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                🚪 Nombre de pièces <span style={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="rooms"
                value={formData.rooms}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                required
                min="1"
                disabled={loading}
                style={{
                  ...styles.input,
                  ...(formErrors.rooms ? styles.inputError : {})
                }}
                placeholder="Ex: 2"
              />
              {formErrors.rooms && (
                <div style={styles.errorMessage}>{formErrors.rooms}</div>
              )}
            </div>
          </div>

          <div 
            style={styles.checkboxGroup}
            onClick={() => setFormData(prev => ({ ...prev, available: !prev.available }))}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(241, 245, 249, 0.8)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(241, 245, 249, 0.6)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div 
              style={{
                ...styles.checkbox,
                ...(formData.available ? styles.checkboxChecked : {})
              }}
            >
              {formData.available && '✓'}
            </div>
            <label style={{...styles.label, margin: 0, cursor: 'pointer'}}>
              ✅ Disponible immédiatement
            </label>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                ...styles.button,
                ...styles.cancelButton,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'rgba(107, 114, 128, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'rgba(107, 114, 128, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...styles.submitButton,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                }
              }}
            >
              {loading ? 'Création...' : '➕ Créer'}
            </button>
          </div>
        </form>
      </div>

      <style>
        {`
          @keyframes modalAppear {
            0% {
              opacity: 0;
              transform: scale(0.8) translateY(20px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AddApartmentModal;