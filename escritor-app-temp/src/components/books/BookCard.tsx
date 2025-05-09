import { useState } from 'react';
import { Link } from 'react-router-dom';

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  coverImage?: string;
  onDelete: (id: number) => Promise<boolean>;
}

export default function BookCard({ id, title, author, coverImage, onDelete }: BookCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate a random gradient for books without cover images
  const getRandomGradient = () => {
    const gradients = [
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #6a11cb, #2575fc)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #fccb90, #d57eeb)',
      'linear-gradient(135deg, #0ba360, #3cba92)',
      'linear-gradient(135deg, #ff9a9e, #fad0c4)',
      'linear-gradient(135deg, #a18cd1, #fbc2eb)',
      'linear-gradient(135deg, #37ecba, #72afd3)'
    ];
    return gradients[id % gradients.length];
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDeleting) return;
    
    if (window.confirm(`Tem certeza que deseja excluir o livro "${title}"? Esta ação não pode ser desfeita.`)) {
      setIsDeleting(true);
      setError(null);
      
      try {
        const success = await onDelete(id);
        
        if (!success) {
          throw new Error('Não foi possível excluir o livro. Tente novamente.');
        }
      } catch (err) {
        console.error('Error deleting book:', err);
        setError('Erro ao excluir o livro. Tente novamente.');
        setIsDeleting(false);
      }
    }
    
    setIsMenuOpen(false);
  };

  return (
    <div className="book-card">
      <Link to={`/editor/${id}`} className="book-card-link">
        <div 
          className="book-cover" 
          style={{ 
            backgroundImage: coverImage 
              ? `url(${coverImage})` 
              : getRandomGradient() 
          }}
        >
          {!coverImage && (
            <div className="book-title-overlay">
              {title}
            </div>
          )}
        </div>
        
        <div className="book-info">
          <h3 className="book-title">{title}</h3>
          <p className="book-author">por {author}</p>
        </div>
      </Link>
      
      <div className="book-actions">
        <button 
          className="book-menu-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          aria-label="Menu do livro"
        >
          <span>⋮</span>
        </button>
        
        {isMenuOpen && (
          <div className="book-menu">
            <Link to={`/editor/${id}`} className="book-menu-item">
              Abrir Editor
            </Link>
            <button 
              className="book-menu-item delete"
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir Livro'}
            </button>
          </div>
        )}
      </div>
      
      {error && <div className="book-error">{error}</div>}
    </div>
  );
}