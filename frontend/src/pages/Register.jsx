import { useState } from 'react'
import { registerUser } from '../services/api'
import '../styles/auth.css'

export default function Register({ role, onRegister, onSwitchToLogin, onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Effacer l'erreur quand l'utilisateur tape
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
if (role === 'admin') {
    setError('L\'inscription en tant qu\'administrateur n\'est pas autorisée.')
    return
  }
    // Validations côté client
    if (!formData.name.trim()) {
      setError('Le nom est requis')
      return
    }

    if (!formData.email.trim()) {
      setError('L\'email est requis')
      return
    }

    if (!formData.password) {
      setError('Le mot de passe est requis')
      return
    }

    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)
    try {
      console.log('📤 Données envoyées à l\'API:', {
        name: formData.name,
        email: formData.email,
        role: role
      })

      const response = await registerUser(
        formData.name,
        formData.email,
        formData.password,
        role
      )
      
      console.log('📥 Réponse API complète:', response)
      
      if (response.success) {
        console.log('✅ Inscription réussie!')
        console.log('✅ Compte créé pour:', response.user.email)
        
       
        localStorage.setItem('registrationSuccess', 'true')
        localStorage.setItem('registeredEmail', formData.email)
        
 
        onSwitchToLogin()
      } else {
        console.error('❌ Erreur d\'inscription:', response.message)
        setError(response.message || 'Erreur lors de l\'inscription')
      }
    } catch (err) {
      console.error('💥 Erreur complète dans handleSubmit:', err)
      setError(err.message || 'Erreur d\'inscription. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const roleTitle = role === 'owner' ? 'Propriétaire' : role === 'admin' ? 'Administrateur' : 'Locataire'

  return (
    <div className="auth-container">
      <div className="auth-box">
        <button className="back-btn" onClick={onBack} type="button">← Retour</button>

        <div className="auth-header">
          <h1>Inscription {roleTitle}</h1>
          <p>Créez votre compte {roleTitle.toLowerCase()}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Nom complet</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Jean Dupont"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="•••••••• (min. 6 caractères)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password_confirmation">Confirmer le mot de passe</label>
            <input
              id="password_confirmation"
              type="password"
              name="password_confirmation"
              placeholder="••••••••"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
              minLength="6"
              disabled={loading}
            />
          </div>

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
                Inscription en cours...
              </>
            ) : (
              'S\'inscrire'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Vous avez déjà un compte?{' '}
            <button
              onClick={onSwitchToLogin}
              className="link-btn"
              type="button"
              disabled={loading}
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}