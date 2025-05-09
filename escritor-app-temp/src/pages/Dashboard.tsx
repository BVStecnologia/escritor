import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useState } from 'react';

export default function Dashboard() {
  const [books, setBooks] = useState<Array<{id: number, title: string, author: string, chapters: number}>>([
    { id: 1, title: "O Segredo do Vale", author: "Você", chapters: 12 },
    { id: 2, title: "Além do Horizonte", author: "Você", chapters: 8 },
    { id: 3, title: "Memórias do Amanhã", author: "Você", chapters: 15 }
  ]);

  return (
    <div className="dashboard-page">
      <Header />
      
      <div className="dashboard-container">
        <h1 className="dashboard-title">Bem-vindo ao seu Dashboard</h1>
        <p className="dashboard-subtitle">Acompanhe seu progresso e gerencie seus livros</p>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{books.length}</div>
            <div className="stat-label">Livros</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">{books.reduce((acc, book) => acc + book.chapters, 0)}</div>
            <div className="stat-label">Capítulos</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">42</div>
            <div className="stat-label">Páginas escritas</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value">3</div>
            <div className="stat-label">Ideias salvas</div>
          </div>
        </div>
        
        <section className="books-section">
          <div className="books-header">
            <h2 className="books-title">Meus Livros</h2>
            <button className="add-book-button">
              + Novo Livro
            </button>
          </div>
          
          {books.length > 0 ? (
            <div className="books-grid">
              {books.map(book => (
                <div key={book.id} className="book-card">
                  <div className="book-cover">📖</div>
                  <div className="book-info">
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">por {book.author}</p>
                    <div className="book-stats">
                      <span>{book.chapters} capítulos</span>
                      <span>Última edição: hoje</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <h3 className="empty-state-title">Nenhum livro ainda</h3>
              <p className="empty-state-message">
                Comece seu primeiro projeto literário e deixe sua criatividade fluir!
              </p>
              <button className="empty-state-button">
                + Criar meu primeiro livro
              </button>
            </div>
          )}
        </section>
        
        <section className="books-section">
          <div className="books-header">
            <h2 className="books-title">Atividade Recente</h2>
          </div>
          
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3 className="empty-state-title">Nenhuma atividade recente</h3>
            <p className="empty-state-message">
              Aqui aparecerão suas atividades de escrita mais recentes.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}