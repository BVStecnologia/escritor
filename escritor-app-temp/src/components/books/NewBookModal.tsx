import { useState, useEffect, useRef } from 'react';

interface NewBookModalProps {
  onClose: () => void;
  onCreate: (title: string, description: string) => void;
  isLoading: boolean;
}

export default function NewBookModal({ onClose, onCreate, isLoading }: NewBookModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus on the title input when the modal opens
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  // Handle clicking outside the modal to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle escape key to close modal
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('O título do livro é obrigatório.');
      return;
    }
    
    // Clear any previous error
    setError(null);
    
    // Call the onCreate function with the title and description
    onCreate(title, description);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" ref={modalRef}>
        <div className="modal-header">
          <h2 className="modal-title">Novo Livro</h2>
          <button 
            className="modal-close-button"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="book-title">Título do Livro *</label>
            <input
              id="book-title"
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: O Caminho do Herói"
              className="form-input"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="book-description">Descrição</label>
            <textarea
              id="book-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uma breve descrição sobre o seu livro (opcional)"
              className="form-textarea"
              rows={4}
              disabled={isLoading}
            />
            <p className="form-help-text">
              Esta descrição pode ser usada para gerar uma capa para o seu livro.
            </p>
          </div>
          
          {error && <div className="form-error">{error}</div>}
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="modal-button secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            
            <button 
              type="submit" 
              className="modal-button primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="button-spinner"></span>
                  Criando...
                </>
              ) : (
                'Criar Livro'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}