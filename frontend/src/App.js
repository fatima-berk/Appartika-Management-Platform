import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ApartmentManagement from './pages/ApartmentManagement';
import ReservationManagement from './pages/ReservationManagement';
import TenantManagement from './pages/TenantManagement';
import PaymentManagement from './pages/PaymentManagement';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('role-selection');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedRole, setSelectedRole] = useState('owner');

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      console.log('🔍 Vérification authentification...');
      console.log('🔑 Token présent:', !!token);
      console.log('👤 User présent:', !!userData);
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('✅ Utilisateur trouvé:', parsedUser);
          setUser(parsedUser);
          if (parsedUser.role === 'admin') {
            setCurrentView('admin-dashboard');
          } else if (parsedUser.role === 'client') {
            setCurrentView('client-dashboard');
          } else {
            setCurrentView('owner-dashboard');
          }
        } catch (error) {
          console.error('❌ Erreur parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        console.log('ℹ️ Aucun utilisateur connecté');
      }
      setLoading(false);
    };

    checkAuth();
    const handleStorageChange = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error('Erreur parsing user data:', error);
        }
      }
    };
    const handleProfileUpdate = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log('✅ Profil mis à jour dans App.js:', parsedUser);
        } catch (error) {
          console.error('Erreur parsing user data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userProfileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleLogin = (userData) => {
    console.log('✅ Connexion réussie dans App.js:', userData);
    setUser(userData);
    if (userData.role === 'admin') {
      setCurrentView('admin-dashboard');
    } else if (userData.role === 'client') {
      setCurrentView('client-dashboard');
    } else {
      setCurrentView('owner-dashboard');
    }
    setCurrentPage('dashboard');
  };

const handleRegister = (userData) => {
  console.log('✅ Inscription réussie dans App.js:', userData);
  
  setCurrentView('login');
  
  console.log('🔄 Redirection vers la page de connexion...');
  setSelectedRole(userData.role);
};

  const handleLogout = () => {
    console.log('🚪 Déconnexion');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('role-selection');
    setCurrentPage('dashboard');
  };

  const handleBackToRoleSelection = () => {
    console.log('↩️ Retour à la sélection de rôle');
    setCurrentView('role-selection');
  };

  const handleRoleSelect = (role) => {
    console.log('🎯 Rôle sélectionné:', role);
    setSelectedRole(role);
    setCurrentView('login');
  };

  const handleSwitchToRegister = () => {
    console.log('🔄 Aller vers inscription');
    setCurrentView('register');
  };

  const handleSwitchToLogin = () => {
    console.log('🔄 Aller vers connexion');
    setCurrentView('login');
  };

  const [navigationParams, setNavigationParams] = useState({});

  const handleNavigation = (page, params = {}) => {
    console.log('🔄 Navigation vers:', page, 'avec params:', params);
    
    if (page === 'dashboard') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error('Erreur parsing user data:', error);
        }
      }
    }
    
    setNavigationParams(params);
    setCurrentPage(page);
  };

  const renderContent = () => {
    console.log('🎯 Rendu de la page:', currentPage);
    
    switch (currentPage) {
      case 'dashboard':
        return <OwnerDashboard onNavigate={handleNavigation} />;
      case 'apartments':
        return <ApartmentManagement 
          onStatsUpdate={(stats) => console.log('Stats:', stats)} 
          selectedApartmentId={navigationParams.selectedApartmentId}
        />;
      case 'tenants':
        return <TenantManagement  onNavigate={handleNavigation}/>;
      case 'reservations':
        return <ReservationManagement onNavigate={handleNavigation} />;
      case 'payments':
        return <PaymentManagement onNavigate={handleNavigation} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigation} onProfileUpdate={(updatedUser) => {
          setUser(updatedUser);
        }} />;
      default:
        return <OwnerDashboard onNavigate={handleNavigation} />;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Chargement...</p>
      </div>
    );
  }


  if (currentView === 'role-selection') {
    return (
      <div className="role-selection-container">
        <div className="background-animation"></div>
        <div className="role-selection-card">
          <div className="logo-section">
           <div className="logo-section">
            <img src="/images/appartika-logo.png" alt="Appartika Logo" className="logo-image-round" />
           <p className="subtitle">Réunir Locataires, Propriétaires et Admins dans une gestion moderne et fluide </p>
           </div>
          </div>
          
          <div className="role-selection-grid">
            <div className="role-card owner-card" onClick={() => handleRoleSelect('owner')}>
              <div className="role-icon">👑</div>
              <h3 className="role-title">Propriétaire</h3>
              <p className="role-description">
                Gérez votre portfolio, optimisez vos revenus et simplifiez la location
              </p>
              <div className="feature-list">
                <span>📊 Tableau de bord avancé</span>
                <span>👥 Gestion des locataires</span>
                <span>💰 Gestion des loyers</span>
              </div>
              <button className="role-button owner-button">
                Accéder au Dashboard
              </button>
            </div>

            <div className="role-card tenant-card" onClick={() => handleRoleSelect('client')}>
              <div className="role-icon">🏠</div>
              <h3 className="role-title">Locataire</h3>
              <p className="role-description">
                Trouvez votre logement idéal et gérez votre location en toute simplicité
              </p>
              <div className="feature-list">
                <span>🔍 Recherche avancée</span>
                <span>📝 Réservation en ligne</span>
                <span>💬 Communication directe</span>
              </div>
              <button className="role-button tenant-button">
                Trouver un logement
              </button>
            </div>

            <div className="role-card admin-card" onClick={() => handleRoleSelect('admin')}>
              <div className="role-icon">🔐</div>
              <h3 className="role-title">Administrateur</h3>
              <p className="role-description">
                Gérez l'ensemble de la plateforme, les utilisateurs, réservations et appartements
              </p>
              <div className="feature-list">
                <span>👥 Gestion des utilisateurs</span>
                <span>🏢 Gestion des appartements</span>
                <span>📅 Gestion des réservations</span>
              </div>
              <button className="role-button admin-button">
             Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (currentView === 'login') {
    return (
      <Login 
        role={selectedRole}
        onLogin={handleLogin}
        onSwitchToRegister={handleSwitchToRegister}
        onBack={handleBackToRoleSelection}
      />
    );
  }

  
  if (currentView === 'register') {
    return (
      <Register 
        role={selectedRole}
        onRegister={handleRegister}
        onSwitchToLogin={handleSwitchToLogin}
        onBack={handleBackToRoleSelection}
      />
    );
  }

  
  if (currentView === 'admin-dashboard' && user) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="brand-section">
              <img src="/images/appartika-logo.png" alt="Logo Admin" className="logo-image-round-small" />
            
              <div>
                <p className="brand-subtitle">Panel Administrateur</p>
              </div>
            </div>
            
            <div className="user-section">
              <div className="user-info">
                <div className="user-avatar">
                  {user.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="user-details">
                  <span className="user-name">Bonjour, {user.name}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="logout-button"
              >
                <span>🚪</span>
                Déconnexion
              </button>
            </div>
          </div>

          {/* NAVIGATION */}
          <nav className="main-navigation">
            <div className="nav-container">
              <button 
                className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavigation('dashboard')}
              >
                 Tableau de Bord
              </button>
              <button 
                className={`nav-item ${currentPage === 'users' ? 'active' : ''}`}
                onClick={() => handleNavigation('users')}
              >
                 Utilisateurs
              </button>
              <button 
                className={`nav-item ${currentPage === 'apartments' ? 'active' : ''}`}
                onClick={() => handleNavigation('apartments')}
              >
                 Appartements
              </button>
              <button 
                className={`nav-item ${currentPage === 'reservations' ? 'active' : ''}`}
                onClick={() => handleNavigation('reservations')}
              >
                 Réservations
              </button>
              <button 
                className={`nav-item ${currentPage === 'reviews' ? 'active' : ''}`}
                onClick={() => handleNavigation('reviews')}
              >
                 Avis
              </button>
            </div>
          </nav>
        </header>

        <main className="dashboard-main">
          <AdminDashboard 
            currentPage={currentPage}
            onNavigate={handleNavigation}
          />
        </main>
      </div>
    );
  }

  // Vue dashboard propriétaire
  if (currentView === 'owner-dashboard' && user) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="brand-section">
                <img src="/images/appartika-logo.png" alt="Logo Admin" className="logo-image-round-small" />
              <div>
            
                <p className="brand-subtitle">Dashboard Propriétaire</p>
              </div>
            </div>
            
            <div className="user-section">
              <div className="user-info">
                <div className="user-avatar">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="user-details">
                  <span className="user-name">Bonjour, {user.name}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="logout-button"
              >
                <span></span>
                Déconnexion
              </button>
            </div>
          </div>

          {/* NAVIGATION */}
          <nav className="main-navigation">
            <div className="nav-container">
              <button 
                className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavigation('dashboard')}
              >
                📊 Tableau de Bord
              </button>
              <button 
                className={`nav-item ${currentPage === 'apartments' ? 'active' : ''}`}
                onClick={() => handleNavigation('apartments')}
              >
                🏢 Mes Appartements
              </button>
              <button 
                className={`nav-item ${currentPage === 'tenants' ? 'active' : ''}`}
                onClick={() => handleNavigation('tenants')}
              >
                👥 Gestion des Locataires
              </button>
              <button 
                className={`nav-item ${currentPage === 'reservations' ? 'active' : ''}`}
                onClick={() => handleNavigation('reservations')}
              >
                📅 Réservations
              </button>
              <button 
                className={`nav-item ${currentPage === 'payments' ? 'active' : ''}`}
                onClick={() => handleNavigation('payments')}
              >
                💰 Paiements
              </button>
            </div>
          </nav>
        </header>

        <main className="dashboard-main">
          {renderContent()}
        </main>
      </div>
    );
  }

  // Vue dashboard client
  if (currentView === 'client-dashboard' && user) {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="brand-section">
              <img src="/images/appartika-logo.png" alt="Logo Admin" className="logo-image-round-small" />
              <div>
               
                <p className="brand-subtitle">Dashboard Locataire</p>
              </div>
            </div>
            
            <div className="user-section">
              <div className="user-info">
                <div className="user-avatar">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="user-details">
                  <span className="user-name">Bonjour, {user.name}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="logout-button"
              >
                <span></span>
                Déconnexion
              </button>
            </div>
          </div>

          {/* NAVIGATION */}
          <nav className="main-navigation">
            <div className="nav-container">
              <button 
                className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavigation('dashboard')}
              >
                Rechercher
              </button>
              <button 
                className={`nav-item ${currentPage === 'reservations' ? 'active' : ''}`}
                onClick={() => handleNavigation('reservations')}
              >
                 Mes Réservations
              </button>
              <button 
                className={`nav-item ${currentPage === 'payments' ? 'active' : ''}`}
                onClick={() => handleNavigation('payments')}
              >
                 Mes Paiements
              </button>
              <button 
      className={`nav-item ${currentPage === 'reviews' ? 'active' : ''}`}
      onClick={() => handleNavigation('reviews')}
    >
       Mes Avis
    </button>
              
              <button 
                className={`nav-item ${currentPage === 'profile' ? 'active' : ''}`}
                onClick={() => handleNavigation('profile')}
              >
                 Mon Profil
              </button>
            </div>
          </nav>
        </header>

        <main className="dashboard-main">
          <ClientDashboard 
            currentPage={currentPage}
            onNavigate={handleNavigation}
          />
        </main>
      </div>
    );
  }

  // Vue par défaut
  return (
    <div className="error-container">
      <h1>Erreur de navigation</h1>
      <p>Une erreur est survenue. Veuillez rafraîchir la page.</p>
      <button onClick={() => window.location.reload()} className="btn-primary">
        🔄 Rafraîchir
      </button>
    </div>
  );
}

export default App;