import '../styles/auth.css'

export default function RoleSelection({ onRoleSelect }) {
  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h1>Bienvenue</h1>
          <p>Sélectionnez votre rôle pour continuer</p>
        </div>

        <div className="role-selection">
          <button
            className="role-btn owner-role"
            onClick={() => onRoleSelect('owner')}
          >
            <div className="role-icon">🏠</div>
            <h2>Propriétaire</h2>
            <p>Gérez vos appartements</p>
          </button>

          <button
            className="role-btn tenant-role"
            onClick={() => onRoleSelect('tenant')}
          >
            <div className="role-icon">🔑</div>
            <h2>Locataire</h2>
            <p>Cherchez un appartement</p>
          </button>
        </div>
      </div>
    </div>
  )
}