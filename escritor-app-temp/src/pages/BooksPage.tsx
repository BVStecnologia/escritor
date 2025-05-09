import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLivros } from '../hooks/useLivros';
import Header from '../components/layout/Header';
import BookCard from '../components/books/BookCard';
import NewBookModal from '../components/books/NewBookModal';
import { generateImage } from '../components/ClaudeAIService';

export default function BooksPage() {
  const { user } = useAuth();
  const { livros, addLivro, deleteLivro, isLoading } = useLivros();
  const [isNewBookModalOpen, setIsNewBookModalOpen] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Handle creating a new book
  const handleCreateBook = async (title: string, description: string) => {
    setIsGeneratingCover(true);
    
    try {
      // Generate a cover image for the book
      let imageUrl = '/default-cover.jpg'; // Default fallback image
      
      try {
        const promptForAI = `A book cover for "${title}". ${description}`;
        const result = await generateImage(promptForAI);
        
        if (result.success && result.image_url) {
          imageUrl = result.image_url;
        }
      } catch (error) {
        console.error('Error generating cover image:', error);
        // Continue with default image if generation fails
      }
      
      // Create the book
      const newBook = await addLivro(title, user?.user_metadata?.full_name || 'Unknown Author');
      
      if (newBook) {
        // Redirect to the editor for the new book
        navigate(`/editor/${newBook.id}`);
      }
    } catch (error) {
      console.error('Error creating book:', error);
    } finally {
      setIsGeneratingCover(false);
      setIsNewBookModalOpen(false);
    }
  };

  // Filter books based on search term
  const filteredBooks = livros.filter(book => {
    const title = book["Nome do livro"] || '';
    const author = book["Autor"] || '';
    const term = searchTerm.toLowerCase();
    return title.toLowerCase().includes(term) || author.toLowerCase().includes(term);
  });

  return (
    <div className="books-page">
      <Header />
      
      <main className="books-content container">
        <section className="books-header">
          <h1 className="books-title">Biblioteca</h1>
          
          <div className="books-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Pesquisar livros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button className="search-button" aria-label="Pesquisar">
                🔍
              </button>
            </div>
            
            <div className="view-toggle">
              <button 
                className={`view-toggle-btn ${view === 'grid' ? 'active' : ''}`}
                onClick={() => setView('grid')}
                aria-label="Visualização em grade"
              >
                ▤
              </button>
              <button 
                className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`}
                onClick={() => setView('list')}
                aria-label="Visualização em lista"
              >
                ☰
              </button>
            </div>
            
            <button 
              className="new-book-button"
              onClick={() => setIsNewBookModalOpen(true)}
            >
              Novo Livro
            </button>
          </div>
        </section>
        
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando livros...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? (
              <>
                <div className="empty-illustration">
                  <img src="/no-results.svg" alt="Nenhum resultado encontrado" />
                </div>
                <h2>Nenhum livro encontrado</h2>
                <p>Sua pesquisa por "{searchTerm}" não retornou resultados.</p>
                <button 
                  className="cta-button"
                  onClick={() => setSearchTerm('')}
                >
                  Limpar pesquisa
                </button>
              </>
            ) : (
              <>
                <div className="empty-illustration">
                  <img src="/empty-books.svg" alt="Nenhum livro encontrado" />
                </div>
                <h2>Você ainda não tem livros</h2>
                <p>Comece criando seu primeiro livro para começar a escrever.</p>
                <button 
                  className="cta-button"
                  onClick={() => setIsNewBookModalOpen(true)}
                >
                  Criar Meu Primeiro Livro
                </button>
              </>
            )}
          </div>
        ) : (
          <div className={`books-${view}`}>
            {filteredBooks.map(livro => (
              <BookCard 
                key={livro.id}
                id={livro.id}
                title={livro["Nome do livro"] || 'Sem título'}
                author={livro["Autor"] || 'Desconhecido'}
                onDelete={deleteLivro}
              />
            ))}
          </div>
        )}
      </main>
      
      {isNewBookModalOpen && (
        <NewBookModal 
          onClose={() => setIsNewBookModalOpen(false)}
          onCreate={handleCreateBook}
          isLoading={isGeneratingCover}
        />
      )}
    </div>
  );
}