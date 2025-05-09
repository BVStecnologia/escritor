import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import Header from '../components/layout/Header';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // Format the user's creation date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Handle saving profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    
    try {
      // In a real implementation, this would call an API to update the user's profile
      console.log('Updating profile with:', { fullName });
      
      // Simulate successful update
      setTimeout(() => {
        setIsSaving(false);
        setIsEditing(false);
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setIsSaving(false);
    }
  };

  return (
    <div className={`profile-page theme-${theme}`}>
      <Header />
      
      <main className="profile-content container">
        <div className="profile-container">
          <div className="profile-header">
            <h1 className="profile-title">Perfil do Usuário</h1>
            
            {!isEditing && (
              <button 
                className="profile-edit-button"
                onClick={() => setIsEditing(true)}
              >
                Editar Perfil
              </button>
            )}
          </div>
          
          <div className="profile-card">
            <div className="profile-section">
              <div className="profile-avatar">
                {user?.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Avatar" 
                    className="avatar-image"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {(user?.user_metadata?.full_name || user?.email || '')
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                )}
              </div>
              
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="profile-form">
                  <div className="form-group">
                    <label htmlFor="fullName">Nome Completo</label>
                    <input 
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="form-input disabled"
                    />
                    <p className="form-help-text">
                      O email não pode ser alterado.
                    </p>
                  </div>
                  
                  <div className="profile-form-actions">
                    <button 
                      type="button" 
                      className="button secondary"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                    >
                      Cancelar
                    </button>
                    
                    <button 
                      type="submit" 
                      className="button primary"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info">
                  <div className="profile-info-item">
                    <span className="profile-info-label">Nome:</span>
                    <span className="profile-info-value">{user?.user_metadata?.full_name || 'Não definido'}</span>
                  </div>
                  
                  <div className="profile-info-item">
                    <span className="profile-info-label">Email:</span>
                    <span className="profile-info-value">{user?.email}</span>
                  </div>
                  
                  <div className="profile-info-item">
                    <span className="profile-info-label">Membro desde:</span>
                    <span className="profile-info-value">{formatDate(user?.created_at)}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="profile-section">
              <h2 className="profile-section-title">Preferências</h2>
              
              <div className="preferences-list">
                <div className="preference-item">
                  <span className="preference-label">Tema:</span>
                  <div className="preference-control">
                    <button 
                      className="theme-toggle-button"
                      onClick={toggleTheme}
                    >
                      {theme === 'dark' ? 'Escuro' : 'Claro'}
                      <span className="toggle-icon">
                        {theme === 'dark' ? '🌙' : '☀️'}
                      </span>
                    </button>
                  </div>
                </div>
                
                {/* Other preferences could be added here */}
              </div>
            </div>
            
            <div className="profile-section">
              <h2 className="profile-section-title">Conta</h2>
              
              <div className="account-actions">
                <button 
                  className="button danger"
                  onClick={handleSignOut}
                >
                  Sair da Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}