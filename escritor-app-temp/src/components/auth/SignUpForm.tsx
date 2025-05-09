import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    // Validate password match
    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }
    
    // Validate password strength
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    setIsLoading(true);

    try {
      const { data, error } = await signUp(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (e) {
      setError('Ocorreu um erro ao criar a conta. Tente novamente.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form signup-form">
      <h2 className="auth-title">Criar Conta</h2>
      
      {success ? (
        <div className="success-message">
          <p>Conta criada com sucesso! Verifique seu email para confirmar seu cadastro.</p>
          <button 
            onClick={() => setSuccess(false)}
            className="auth-button"
          >
            Voltar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Seu email"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="signup-password">Senha</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Crie uma senha"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm-password">Confirmar Senha</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirme sua senha"
              className="form-input"
            />
          </div>
          
          {error && <div className="form-error">{error}</div>}
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>
      )}
    </div>
  );
}