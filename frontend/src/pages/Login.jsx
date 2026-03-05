import { useState, useEffect } from 'react'
import { loginUser } from '../services/api'
import '../styles/auth.css'

export default function Login({ role, onLogin, onSwitchToRegister, onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)
/* 
  // Vérifier si l'utilisateur vient de s'inscrire
  useEffect(() => {
    const registrationSuccess = localStorage.getItem('registrationSuccess')
    const registeredEmail = localStorage.getItem('registeredEmail')
    
    if (registrationSuccess === 'true') {
      setSuccessMessage('✅ Inscription réussie ! Veuillez vous connecter avec vos identifiants.')
      if (registeredEmail) {
        setEmail(registeredEmail)
      }
      // Nettoyer le message après 5 secondes
      setTimeout(() => {
        setSuccessMessage('')
        localStorage.removeItem('registrationSuccess')
        localStorage.removeItem('registeredEmail')
      }, 5000)
    }
  }, []) */
  // Dans Login.jsx, améliorer le message de succès
useEffect(() => {
  const registrationSuccess = localStorage.getItem('registrationSuccess');
  const registeredEmail = localStorage.getItem('registeredEmail');
  
  if (registrationSuccess === 'true') {
    setSuccessMessage(`✅ Inscription réussie ! Votre compte ${registeredEmail} a été créé. Veuillez vous connecter.`);
    
    // Pré-remplir l'email
    if (registeredEmail) {
      setEmail(registeredEmail);
    }
    
    // Nettoyer après 10 secondes (au lieu de 5)
    setTimeout(() => {
      setSuccessMessage('');
      localStorage.removeItem('registrationSuccess');
      localStorage.removeItem('registeredEmail');
    }, 10000);
  }
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validation côté client
    if (!email.trim()) {
      setError('L\'email est requis')
      return
    }

    if (!password) {
      setError('Le mot de passe est requis')
      return
    }

    setLoading(true)

    try {
      console.log('📤 Tentative de connexion:', { email, role })
      
      const response = await loginUser(email, password, role)
      
      console.log('📥 Réponse connexion:', response)
      
      if (response.success) {
        console.log('✅ Connexion réussie!')
        console.log('✅ Token reçu:', response.token)
        console.log('✅ User reçu:', response.user)
        
        // Nettoyer les messages d'inscription si présents
        localStorage.removeItem('registrationSuccess')
        localStorage.removeItem('registeredEmail')
        
        // Stocker le token et les données utilisateur
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        
        // Vérifier que le stockage a fonctionné
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')
        console.log('✅ Token stocké vérifié:', storedToken)
        console.log('✅ User stocké vérifié:', storedUser)
        
        onLogin(response.user)
      } else {
        console.error('❌ Erreur connexion:', response.message)
        setError(response.message || 'Erreur de connexion')
      }
    } catch (err) {
      console.error('💥 Erreur complète connexion:', err)
      setError(err.message || 'Erreur de connexion. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const roleTitle = role === 'owner' ? 'Propriétaire' : role === 'admin' ? 'Administrateur' : 'Locataire'

  return (
    <div className="auth-container">
      <div className="auth-box">
        <button 
          className="back-btn" 
          onClick={onBack}
          type="button"
          disabled={loading}
        >
          ← Retour
        </button>

        <div className="auth-header">
          <h1>Connexion {roleTitle}</h1>
          <p>Accédez à votre compte {roleTitle.toLowerCase()}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError('')
              }}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError('')
              }}
              required
              disabled={loading}
            />
          </div>

          {successMessage && (
            <div className="success-message" style={{
              background: '#ecfdf5',
              color: '#10b981',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid #10b981',
              fontSize: '14px'
            }}>
              {successMessage}
            </div>
          )}

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Connexion en cours...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

       <div className="auth-footer">
  {role !== 'admin' && (  // NE PAS AFFICHER LE LIEN D'INSCRIPTION POUR ADMIN
    <p>
      Pas encore de compte?{' '}
      <button
        onClick={onSwitchToRegister}
        className="link-btn"
        type="button"
        disabled={loading}
      >
        S'inscrire
      </button>
    </p>
  )}
  {role === 'admin' && (  // MESSAGE SPÉCIAL POUR ADMIN
    <p className="admin-note">
      ⚠️ <strong>Accès restreint :</strong> Les comptes administrateur sont créés manuellement.
      Contactez le support technique pour obtenir des accès.
    </p>
  )}
</div>
      </div>
    </div>
  )
}