// pages/ProfilePage.jsx - CORRIGÉ
import React, { useState, useEffect } from 'react';
import { getCurrentUser, getUserProfile, updateUserProfile, changePassword } from '../services/api';
import './ProfilePage.css';

const ProfilePage = ({ onNavigate, onProfileUpdate }) => { // Ajoutez onProfileUpdate
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) return;

      let response = await getUserProfile(user.id);
      
      if (!response.success) {
        response = await getCurrentUser();
      }

      if (response.success) {
        setUserProfile(response.user);
        setFormData({
          name: response.user.name || '',
          email: response.user.email || '',
          phone: response.user.phone || '',
          address: response.user.address || ''
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        setUserProfile(user);
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || ''
        });
      }
      showMessage('Chargement du profil depuis le cache', 'info');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) return;

      const response = await updateUserProfile(user.id, formData);
      if (response.success) {
        setUserProfile(response.user);
        setEditing(false);
        showMessage(response.message || 'Profil mis à jour avec succès', 'success');
        
        // 🔥 NOTIFIER App.js DE LA MISE À JOUR
        if (onProfileUpdate) {
          onProfileUpdate(response.user);
        }
        
        // Déclencher un événement global
        window.dispatchEvent(new Event('userProfileUpdated'));
        
      } else {
        showMessage(response.message || 'Erreur lors de la mise à jour', 'error');
      }
    } catch (error) {
      console.error('Erreur sauvegarde profil:', error);
      showMessage('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.new_password !== passwordData.new_password_confirmation) {
        showMessage('Les mots de passe ne correspondent pas', 'error');
        return;
      }

      if (passwordData.new_password.length < 6) {
        showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
      }

      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) return;

      const response = await changePassword(user.id, passwordData);
      if (response.success) {
        setChangingPassword(false);
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
        showMessage(response.message || 'Mot de passe changé avec succès', 'success');
      } else {
        showMessage(response.message || 'Erreur lors du changement de mot de passe', 'error');
      }
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      showMessage('Erreur lors du changement de mot de passe', 'error');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedUser = {
          ...userProfile,
          profile_photo: e.target.result
        };
        setUserProfile(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // 🔥 NOTIFIER App.js DE LA MISE À JOUR
        if (onProfileUpdate) {
          onProfileUpdate(updatedUser);
        }
        
        showMessage('Photo de profil mise à jour avec succès (simulation)', 'success');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erreur upload photo:', error);
      showMessage('Erreur lors de l\'upload de la photo', 'error');
    }
  };

  const getUserStats = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return {
      apartments_count: user?.apartments_count || 0,
      reservations_count: user?.reservations_count || 0,
      total_revenue: user?.total_revenue || 0,
      member_since: user?.created_at ? new Date(user.created_at).getFullYear() : '2024'
    };
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  const userStats = getUserStats();

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-button" onClick={() => onNavigate('dashboard')}>
          ← Retour au tableau de bord
        </button>
        <h1>Mon Profil</h1>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="profile-content">
        {/* Section Photo de Profil */}
        <div className="profile-photo-section">
          <div className="photo-container">
            <div className="profile-avatar-large">
              {userProfile?.profile_photo ? (
                <img src={userProfile.profile_photo} alt="Profile" />
              ) : (
                userProfile?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <label htmlFor="photo-upload" className="upload-button">
              📷 Changer la photo
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Section Informations Personnelles */}
        <div className="profile-info-section">
          <div className="section-header">
            <h2>Informations Personnelles</h2>
            {!editing ? (
              <button className="edit-button" onClick={() => setEditing(true)}>
                ✏️ Modifier
              </button>
            ) : (
              <div className="action-buttons">
                <button className="save-button" onClick={handleSaveProfile}>
                  💾 Sauvegarder
                </button>
                <button className="cancel-button" onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: userProfile?.name || '',
                    email: userProfile?.email || '',
                    phone: userProfile?.phone || '',
                    address: userProfile?.address || ''
                  });
                }}>
                  ❌ Annuler
                </button>
              </div>
            )}
          </div>

          <div className="info-grid">
            <div className="info-field">
              <label>Nom Complet</label>
              {editing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Votre nom complet"
                />
              ) : (
                <div className="info-value">{userProfile?.name || 'Non renseigné'}</div>
              )}
            </div>

            <div className="info-field">
              <label>Email</label>
              {editing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Votre email"
                />
              ) : (
                <div className="info-value">{userProfile?.email || 'Non renseigné'}</div>
              )}
            </div>

            <div className="info-field">
              <label>Téléphone</label>
              {editing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Votre numéro de téléphone"
                />
              ) : (
                <div className="info-value">{userProfile?.phone || 'Non renseigné'}</div>
              )}
            </div>

            <div className="info-field">
              <label>Adresse</label>
              {editing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Votre adresse"
                  rows="3"
                />
              ) : (
                <div className="info-value">{userProfile?.address || 'Non renseigné'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Section Sécurité */}
        <div className="security-section">
          <div className="section-header">
            <h2>Sécurité</h2>
            {!changingPassword ? (
              <button 
                className="change-password-button"
                onClick={() => setChangingPassword(true)}
              >
                🔒 Changer le mot de passe
              </button>
            ) : (
              <div className="action-buttons">
                <button className="save-button" onClick={handleChangePassword}>
                  💾 Sauvegarder
                </button>
                <button 
                  className="cancel-button" 
                  onClick={() => {
                    setChangingPassword(false);
                    setPasswordData({
                      current_password: '',
                      new_password: '',
                      new_password_confirmation: ''
                    });
                  }}
                >
                  ❌ Annuler
                </button>
              </div>
            )}
          </div>

          {changingPassword && (
            <div className="password-form">
              <div className="info-field">
                <label>Mot de passe actuel</label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  placeholder="Votre mot de passe actuel"
                />
              </div>

              <div className="info-field">
                <label>Nouveau mot de passe</label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  placeholder="Nouveau mot de passe (min. 6 caractères)"
                />
              </div>

              <div className="info-field">
                <label>Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  name="new_password_confirmation"
                  value={passwordData.new_password_confirmation}
                  onChange={handlePasswordChange}
                  placeholder="Confirmer le nouveau mot de passe"
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;