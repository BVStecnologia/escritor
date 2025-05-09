import { Link } from 'react-router-dom';
import { useEffect } from 'react';

export default function LandingPage() {
  // Adiciona a classe visible para ativar a animação de fade-in
  useEffect(() => {
    setTimeout(() => {
      const landingPage = document.querySelector('.landing-page');
      if (landingPage) {
        landingPage.classList.add('visible');
      }
    }, 100);
  }, []);
  
  return (
    <div className="landing-page">
      <header className="landing-header">
        <nav className="landing-nav">
          <div className="landing-logo">
            <img src="/vite.svg" alt="Escritor Logo" width="32" height="32" />
            <span>Escritor App</span>
          </div>
          <Link to="/dashboard" className="landing-button">
            Entrar
          </Link>
        </nav>
      </header>
      
      <section className="landing-hero">
        <h1 className="landing-title">
          Escreva com o poder da Inteligência Artificial
        </h1>
        <p className="landing-description">
          Crie histórias incríveis com a ajuda de IA que entende o contexto completo do seu livro.
          Organize capítulos, receba sugestões personalizadas e mantenha a coerência da sua narrativa.
        </p>
        <div className="landing-cta">
          <Link to="/dashboard" className="landing-button">
            Começar Agora
          </Link>
          <a href="#features" className="landing-button" style={{ backgroundColor: 'white', color: '#4f46e5', border: '1px solid #e5e7eb' }}>
            Saiba Mais
          </a>
        </div>
      </section>
      
      <section className="landing-features" id="features">
        <h2 className="features-title">
          Recursos Incríveis
        </h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3 className="feature-title">Organização Completa</h3>
            <p>
              Organize seus livros por capítulos, adicione notas e acompanhe seu progresso com estatísticas detalhadas.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3 className="feature-title">IA Contextual</h3>
            <p>
              Nossa IA entende todo o seu livro, oferecendo sugestões que mantêm a coerência da sua história.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💡</div>
            <h3 className="feature-title">Gerador de Ideias</h3>
            <p>
              Desbloqueie sua criatividade com sugestões para personagens, diálogos, cenários e pontos de enredo.
            </p>
          </div>
        </div>
      </section>
      
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} Escritor App. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}