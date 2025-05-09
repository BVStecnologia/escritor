import React from 'react';
import { Link } from 'react-router-dom';

interface Book {
  id: number;
  title: string;
  chapters: number;
  lastEdited: string;
}

const DashboardPage: React.FC = () => {
  // Dados de exemplo para os livros
  const exampleBooks: Book[] = [
    { id: 1, title: 'O Segredo do Vale', chapters: 5, lastEdited: '09/05/2025' },
    { id: 2, title: 'Além do Horizonte', chapters: 3, lastEdited: '07/05/2025' },
    { id: 3, title: 'Memórias do Amanhã', chapters: 8, lastEdited: '03/05/2025' },
  ];

  return (
    <div className="dashboard-page" style={{ 
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '40px',
        padding: '10px 0',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <h1 style={{ margin: 0 }}>Escritor App</h1>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/profile" style={{ textDecoration: 'none', color: '#333' }}>Perfil</Link>
          <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>Sair</Link>
        </div>
      </nav>
      
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Meus Livros</h2>
          <button 
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Novo Livro
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {exampleBooks.map(book => (
            <div key={book.id} style={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ marginTop: 0 }}>{book.title}</h3>
              <div style={{ color: '#757575', fontSize: '14px', marginBottom: '15px' }}>
                <p>{book.chapters} capítulos</p>
                <p>Última edição: {book.lastEdited}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link
                  to={`/editor/${book.id}`}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    flex: 1,
                    textDecoration: 'none',
                    textAlign: 'center'
                  }}
                >
                  Editar
                </Link>
                <button 
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#f44336',
                    border: '1px solid #f44336',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      <section>
        <h2>Estatísticas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4CAF50' }}>{exampleBooks.length}</div>
            <div>Livros</div>
          </div>
          
          <div style={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2196F3' }}>16</div>
            <div>Capítulos</div>
          </div>
          
          <div style={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#FF9800' }}>12.458</div>
            <div>Palavras</div>
          </div>
          
          <div style={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#9C27B0' }}>42</div>
            <div>Sessões de escrita</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;