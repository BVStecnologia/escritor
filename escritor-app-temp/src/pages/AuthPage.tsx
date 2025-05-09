import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import SignUpForm from '../components/auth/SignUpForm';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <img src="/vite.svg" alt="Escritor App Logo" className="auth-logo" />
          <h1 className="auth-brand">Escritor App</h1>
        </div>
        
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Cadastro
          </button>
        </div>
        
        <div className="auth-content">
          {activeTab === 'login' ? <LoginForm /> : <SignUpForm />}
        </div>
        
        <div className="auth-footer">
          <p>
            Escritor App é uma plataforma para escrever livros com assistência de IA.
          </p>
        </div>
      </div>
      
      <div className="auth-features">
        <div className="feature">
          <h3>📝 Escreva Sem Limites</h3>
          <p>Crie quantos livros e capítulos quiser, tudo organizado em um só lugar.</p>
        </div>
        
        <div className="feature">
          <h3>🤖 Assistência de IA</h3>
          <p>Obtenha sugestões, ideias e correções em tempo real com nossa IA integrada.</p>
        </div>
        
        <div className="feature">
          <h3>📚 Contexto Inteligente</h3>
          <p>Nossa IA conhece todo o seu livro, garantindo continuidade e coerência.</p>
        </div>
        
        <div className="feature">
          <h3>🔍 RAG Avançado</h3>
          <p>Tecnologia de Retrieval Augmented Generation para sugestões mais precisas.</p>
        </div>
      </div>
    </div>
  );
}