import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <header className="App-header">
        <h1>Escritor App</h1>
        <p>Sua plataforma de escrita com assistência de IA</p>
        
        <div className="button-container" style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
          <Link 
            to="/login"
            style={{
              padding: '12px 24px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            Login
          </Link>
          
          <Link 
            to="/signup"
            style={{
              padding: '12px 24px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            Cadastrar
          </Link>
        </div>
        
        <div style={{ marginTop: '60px', maxWidth: '600px', textAlign: 'center' }}>
          <h2>Recursos:</h2>
          <ul style={{ textAlign: 'left', lineHeight: '1.6' }}>
            <li>Escreva seus livros capítulo a capítulo</li>
            <li>Receba assistência da IA Claude para melhorar seu texto</li>
            <li>Geração de ideias criativas para sua história</li>
            <li>Verificação ortográfica e gramatical automatizada</li>
          </ul>
        </div>
      </header>
    </div>
  );
};

export default LandingPage;