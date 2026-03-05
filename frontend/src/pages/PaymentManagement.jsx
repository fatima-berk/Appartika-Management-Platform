import React, { useState, useEffect } from 'react';
import { getPayments, updatePayment } from '../services/api';
import './PaymentManagement.css';

const PaymentManagement = ({ onNavigate }) => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    method: 'all'
  });

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, filters]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) {
        setError('Utilisateur non connecté');
        setLoading(false);
        return;
      }

      console.log('🔄 Chargement des paiements depuis la BDD...');
      const response = await getPayments(user.id);
      
      console.log('📡 Réponse complète de l\'API:', response);
      
      if (response.success) {
        console.log('✅ Données reçues de la BDD:', response.data);
        setPayments(response.data || []);
        
        if (!response.data || response.data.length === 0) {
          setError('Aucun paiement trouvé dans la base de données. La table payments est vide.');
        }
      } else {
        setError('Erreur API: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (filters.status !== 'all') {
      filtered = filtered.filter(payment => payment.status === filters.status);
    }

    if (filters.method !== 'all') {
      filtered = filtered.filter(payment => payment.method === filters.method);
    }

    setFilteredPayments(filtered);
  };

  const calculateStats = () => {
    const totalRevenue = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const paidPayments = payments.filter(p => p.status === 'paid').length;
    const failedPayments = payments.filter(p => p.status === 'failed').length;

    return {
      totalRevenue,
      pendingPayments,
      paidPayments,
      failedPayments
    };
  };

  const stats = calculateStats();

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleStatusUpdate = async (paymentId, newStatus) => {
    try {
      const response = await updatePayment(paymentId, { status: newStatus });
      
      if (response.success) {
        await loadPayments();
      } else {
        setError('Erreur mise à jour: ' + response.message);
      }
    } catch (error) {
      setError('Erreur: ' + error.message);
    }
  };

  const getStatusConfig = (status) => {
    const config = {
      paid: { label: 'Payé', class: 'status-paid', icon: '✅' },
      pending: { label: 'En attente', class: 'status-pending', icon: '⏳' },
      failed: { label: 'Échoué', class: 'status-failed', icon: '❌' }
    };
    return config[status] || { label: status, class: 'status-default', icon: '❓' };
  };

  const getMethodConfig = (method) => {
    const config = {
      card: { label: 'Carte bancaire', icon: '💳' },
      cash: { label: 'Espèces', icon: '💵' },
      transfer: { label: 'Virement', icon: '🏦' }
    };
    return config[method] || { label: method, icon: '💰' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const formatAmount = (amount) => {
    const numAmount = parseFloat(amount || 0);
    return `${numAmount.toLocaleString('fr-FR')} dh`;
  };

  const PaymentCard = ({ payment }) => {
    const statusConfig = getStatusConfig(payment.status);
    const methodConfig = getMethodConfig(payment.method);

    return (
      <div className="payment-card">
        <div className="payment-card-header">
          <div className="payment-method">
            <span className="method-icon">{methodConfig.icon}</span>
            <span className="method-label">{methodConfig.label}</span>
          </div>
          <div className={`status-badge ${statusConfig.class}`}>
            <span className="status-icon">{statusConfig.icon}</span>
            {statusConfig.label}
          </div>
        </div>

        <div className="payment-card-body">
          <div className="payment-amount-section">
            <div className="amount">{formatAmount(payment.amount)}</div>
            {payment.reservation?.apartment && (
              <div className="apartment-info">
                {payment.reservation.apartment.title}
              </div>
            )}
          </div>

          <div className="payment-details">
            <div className="detail-row">
              <span className="detail-label">Date:</span>
              <span className="detail-value">{formatDate(payment.created_at)}</span>
            </div>
            
            {payment.reservation?.user && (
              <div className="detail-row">
                <span className="detail-label">Locataire:</span>
                <span className="detail-value">{payment.reservation.user.name}</span>
              </div>
            )}

            <div className="detail-row">
              <span className="detail-label">ID Paiement:</span>
              <span className="detail-value">#{payment.id}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">Réservation:</span>
              <span className="detail-value">#{payment.reservation_id}</span>
            </div>
          </div>
        </div>

        {/* Actions pour les paiements en attente ou échoués - EN-DESSOUS */}
        {(payment.status === 'pending' || payment.status === 'failed') && (
          <div className="payment-card-actions">
            {payment.status === 'pending' && (
              <>
                <button 
                  className="btn btn-success"
                  onClick={() => handleStatusUpdate(payment.id, 'paid')}
                >
                  <span className="btn-icon">✅</span>
                  <span className="btn-text">Marquer comme payé</span>
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleStatusUpdate(payment.id, 'failed')}
                >
                  <span className="btn-icon">❌</span>
                  <span className="btn-text">Annuler le paiement</span>
                </button>
              </>
            )}
            
            {payment.status === 'failed' && (
              <button 
                className="btn btn-success"
                onClick={() => handleStatusUpdate(payment.id, 'paid')}
              >
                <span className="btn-icon">✅</span>
                <span className="btn-text">Marquer comme payé</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const StatCard = ({ icon, title, value, subtitle, color }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
        <div className="stat-subtitle">{subtitle}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="payment-management">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>Chargement des paiements</h3>
          <p>Connexion à la base de données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Gestion des Paiements</h1>
            <p>Interface de gestion des transactions financières</p>
            <div className="data-source-info">
              <span className="source-badge">📊 Données en direct depuis la BDD</span>
              <span className="data-count">{payments.length} paiement(s)</span>
            </div>
          </div>
          <button 
            className="btn btn-outline"
            onClick={() => onNavigate('dashboard')}
          >
            <span className="btn-icon">←</span>
            Retour au dashboard
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <div className="error-details">
              <div className="error-title">Information</div>
              <div className="error-message">{error}</div>
            </div>
            <div className="error-actions">
              <button className="btn btn-primary" onClick={loadPayments}>
                <span className="btn-icon">🔄</span>
                Actualiser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="stats-overview">
        <StatCard
          icon="💰"
          title="Revenu Total"
          value={formatAmount(stats.totalRevenue)}
          subtitle="Cumul des paiements validés"
          color="primary"
        />
        <StatCard
          icon="⏳"
          title="En Attente"
          value={stats.pendingPayments}
          subtitle="Paiements à traiter"
          color="warning"
        />
        <StatCard
          icon="✅"
          title="Payés"
          value={stats.paidPayments}
          subtitle="Transactions complétées"
          color="success"
        />
        <StatCard
          icon="❌"
          title="Échoués"
          value={stats.failedPayments}
          subtitle="Paiements non aboutis"
          color="danger"
        />
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label className="filter-label">Statut</label>
          <select 
            className="filter-select"
            value={filters.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="paid">Payés</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoués</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Méthode</label>
          <select 
            className="filter-select"
            value={filters.method} 
            onChange={(e) => handleFilterChange('method', e.target.value)}
          >
            <option value="all">Toutes les méthodes</option>
            <option value="card">Carte bancaire</option>
            <option value="cash">Espèces</option>
            <option value="transfer">Virement</option>
          </select>
        </div>

        <div className="filter-results">
          <span className="results-count">
            {filteredPayments.length} / {payments.length} paiement(s)
          </span>
        </div>

        <div className="filter-actions">
        {/*   <button className="btn btn-secondary" onClick={loadPayments}>
            <span className="btn-icon">🔄</span>
            Actualiser
          </button> */}
        </div>
      </div>

      {/* Payments List */}
      <div className="payments-section">
        {filteredPayments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {payments.length === 0 ? '💸' : '🔍'}
            </div>
            <h3>
              {payments.length === 0 
                ? "Table des paiements vide" 
                : "Aucun résultat pour les filtres"
              }
            </h3>
            <p>
              {payments.length === 0 
                ? "La table 'payments' dans votre base de données ne contient aucune donnée. Insérez des paiements de test pour commencer."
                : "Aucun paiement ne correspond aux critères de filtrage sélectionnés."
              }
            </p>
            {payments.length === 0 && (
              <div className="empty-actions">
                <button className="btn btn-primary" onClick={() => onNavigate('reservations')}>
                  <span className="btn-icon">📅</span>
                  Vérifier les réservations
                </button>
                <div className="sql-help">
                  <p><strong>Solution :</strong> Exécutez ce SQL dans phpMyAdmin :</p>
                  <code>
                    INSERT INTO `payments` (`reservation_id`, `amount`, `method`, `status`) VALUES (2, 500.00, 'card', 'paid'), (3, 344.94, 'transfer', 'pending');
                  </code>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="payments-grid">
            {filteredPayments.map(payment => (
              <PaymentCard key={payment.id} payment={payment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManagement;