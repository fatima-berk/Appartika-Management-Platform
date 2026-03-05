import React, { useState, useEffect, useRef } from 'react';
import { apartmentImageService } from '../services/api';

const ApartmentImageModal = ({ apartment, onClose, onSuccess }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (apartment) {
      loadImages();
    }
  }, [apartment]);

  const loadImages = async () => {
    if (!apartment?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await apartmentImageService.getApartmentImages(apartment.id);
      if (response.success) {
        setImages(response.data || []);
      } else {
        setError(response.message || 'Erreur lors du chargement des images');
      }
    } catch (err) {
      setError('Erreur lors du chargement des images');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image valide');
      return;
    }

    // Vérifier la taille (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await apartmentImageService.uploadApartmentImage(apartment.id, file);
      if (response.success) {
        setSuccessMessage('Image ajoutée avec succès !');
        await loadImages(); // Recharger les images
        if (onSuccess) {
          onSuccess();
        }
        // Réinitialiser l'input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(response.message || 'Erreur lors de l\'upload de l\'image');
      }
    } catch (err) {
      setError('Erreur lors de l\'upload de l\'image');
      console.error('Erreur:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      const response = await apartmentImageService.deleteApartmentImage(imageId);
      if (response.success) {
        setSuccessMessage('Image supprimée avec succès !');
        await loadImages(); // Recharger les images
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(response.message || 'Erreur lors de la suppression de l\'image');
      }
    } catch (err) {
      setError('Erreur lors de la suppression de l\'image');
      console.error('Erreur:', err);
    }
  };

  const getImageUrl = (image) => {
    if (image.image_url) {
      // Si l'URL est relative, ajouter l'URL de base
      if (image.image_url.startsWith('/')) {
        return `http://127.0.0.1:8000${image.image_url}`;
      }
      // Si l'URL est déjà complète, la retourner telle quelle
      if (image.image_url.startsWith('http://') || image.image_url.startsWith('https://')) {
        return image.image_url;
      }
      // Sinon, traiter comme une URL relative
      return `http://127.0.0.1:8000/${image.image_url}`;
    }
    return null;
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)',
    },
    modal: {
      background: 'white',
      borderRadius: '20px',
      padding: '30px',
      maxWidth: '900px',
      width: '90%',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      position: 'relative',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '25px',
      paddingBottom: '20px',
      borderBottom: '2px solid #e5e7eb',
    },
    title: {
      fontSize: '1.8rem',
      fontWeight: '700',
      color: '#1e293b',
      margin: 0,
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '2rem',
      cursor: 'pointer',
      color: '#64748b',
      padding: '0',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      transition: 'all 0.3s ease',
    },
    apartmentInfo: {
      marginBottom: '25px',
      padding: '15px',
      background: '#f8fafc',
      borderRadius: '12px',
    },
    uploadSection: {
      marginBottom: '30px',
      padding: '20px',
      background: '#f8fafc',
      borderRadius: '12px',
      border: '2px dashed #cbd5e1',
      textAlign: 'center',
    },
    uploadButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      marginTop: '10px',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
    },
    fileInput: {
      display: 'none',
    },
    imagesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '20px',
      marginTop: '20px',
    },
    imageCard: {
      position: 'relative',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      aspectRatio: '1',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    deleteButton: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'rgba(239, 68, 68, 0.9)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '35px',
      height: '35px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.2rem',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#64748b',
    },
    errorMessage: {
      background: '#fee2e2',
      color: '#dc2626',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '0.9rem',
    },
    successMessage: {
      background: '#d1fae5',
      color: '#059669',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '20px',
      fontSize: '0.9rem',
    },
    loadingSpinner: {
      width: '40px',
      height: '40px',
      border: '4px solid rgba(102, 126, 234, 0.2)',
      borderTop: '4px solid #667eea',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '20px auto',
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            📸 Gérer les images - {apartment?.title || 'Appartement'}
          </h2>
          <button
            style={styles.closeButton}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#1e293b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            ×
          </button>
        </div>

        {apartment && (
          <div style={styles.apartmentInfo}>
            <strong>📍 {apartment.address}, {apartment.city}</strong>
          </div>
        )}

        {error && (
          <div style={styles.errorMessage}>
            ⚠️ {error}
          </div>
        )}

        {successMessage && (
          <div style={styles.successMessage}>
            ✅ {successMessage}
          </div>
        )}

        <div style={styles.uploadSection}>
          <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#1e293b' }}>
            Ajouter une nouvelle image
          </h3>
          <p style={{ color: '#64748b', marginBottom: '15px', fontSize: '0.9rem' }}>
            Formats acceptés: JPG, PNG, GIF, WEBP (max 5MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={styles.fileInput}
            id="image-upload"
            disabled={uploading}
          />
          <div
            onClick={() => {
              if (!uploading && fileInputRef.current) {
                console.log('🖼️ Clic sur le bouton, ouverture du sélecteur de fichier');
                fileInputRef.current.click();
              }
            }}
            style={{
              ...styles.uploadButton,
              opacity: uploading ? 0.6 : 1,
              cursor: uploading ? 'not-allowed' : 'pointer',
              display: 'inline-block',
            }}
            onMouseEnter={(e) => {
              if (!uploading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!uploading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {uploading ? '⏳ Upload en cours...' : '📤 Choisir une image'}
          </div>
        </div>

        {loading ? (
          <div>
            <div style={styles.loadingSpinner}></div>
            <p style={{ textAlign: 'center', color: '#64748b' }}>Chargement des images...</p>
          </div>
        ) : images.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🖼️</div>
            <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Aucune image pour cet appartement</p>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              Ajoutez votre première image en utilisant le bouton ci-dessus
            </p>
          </div>
        ) : (
          <div>
            <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>
              Images ({images.length})
            </h3>
            <div style={styles.imagesGrid}>
              {images.map((image) => {
                const imageUrl = getImageUrl(image);
                return (
                  <div
                    key={image.id}
                    style={styles.imageCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`Image ${image.id}`}
                        style={styles.image}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200?text=Image+non+disponible';
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                      }}>
                        Image non disponible
                      </div>
                    )}
                    <button
                      style={styles.deleteButton}
                      onClick={() => handleDeleteImage(image.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(220, 38, 38, 0.95)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      title="Supprimer cette image"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
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
    </div>
  );
};

export default ApartmentImageModal;

