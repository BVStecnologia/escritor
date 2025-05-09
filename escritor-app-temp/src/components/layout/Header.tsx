import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="app-header" style={{
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      color: 'white',
      padding: '1rem 2rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          textDecoration: 'none',
          color: 'white'
        }}>
          <img src="/vite.svg" alt="Escritor App" style={{ width: '2rem', height: '2rem' }} />
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #ffffff, #e2e8f0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Escritor App</span>
        </Link>

        <nav style={{
          display: 'flex',
          gap: '2rem'
        }}>
          <Link to="/dashboard" style={{
            color: 'white',
            textDecoration: 'none',
            fontWeight: '500',
            position: 'relative',
            padding: '0.5rem 0'
          }}>Dashboard</Link>
          <Link to="/books" style={{
            color: 'white',
            textDecoration: 'none',
            fontWeight: '500',
            position: 'relative',
            padding: '0.5rem 0'
          }}>Meus Livros</Link>
        </nav>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <button
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '2.5rem',
              height: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            aria-label="Toggle theme"
          >
            <span style={{ fontSize: '1.25rem' }}>🌙</span>
          </button>

          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #a78bfa 0%, #c084fc 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}>
            <span style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: 'white'
            }}>U</span>
          </div>
        </div>
      </div>
    </header>
  );
}