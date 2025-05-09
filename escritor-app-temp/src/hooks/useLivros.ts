import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { livrosAPI } from '../lib/supabase';
import type { Livro } from '../lib/supabase';

export function useLivros() {
  const { user } = useAuth();
  const [livros, setLivros] = useState<Livro[]>([]);
  const [activeLivroId, setActiveLivroId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get the active book object
  const activeLivro = livros.find(l => l.id === activeLivroId) || null;

  // Fetch books from Supabase when user changes
  useEffect(() => {
    if (!user) return;

    const fetchLivros = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await livrosAPI.getAll(user.email!);
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data) {
          setLivros(data);
          
          // Set first book as active if none is already active
          if (!activeLivroId && data.length > 0) {
            setActiveLivroId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Erro ao carregar livros. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLivros();
  }, [user]);

  // Add a new book
  const addLivro = useCallback(async (title: string, author?: string) => {
    if (!user) return null;
    
    try {
      const newLivro = {
        "Nome do livro": title,
        "Autor": author || user.user_metadata?.full_name || '',
        email_user: user.email
      };
      
      const { data, error } = await livrosAPI.create(newLivro);
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data) {
        setLivros(prev => [...prev, data]);
        setActiveLivroId(data.id);
        return data;
      }
      
      return null;
    } catch (err) {
      console.error('Error creating book:', err);
      setError('Erro ao criar livro. Tente novamente.');
      return null;
    }
  }, [user]);

  // Update a book
  const updateLivro = useCallback(async (id: number, title: string, author?: string) => {
    if (!user) return false;
    
    try {
      const updates = {
        "Nome do livro": title,
        "Autor": author
      };
      
      const { error } = await livrosAPI.update(id, updates);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      setLivros(prev => 
        prev.map(livro => 
          livro.id === id 
            ? { ...livro, "Nome do livro": title, "Autor": author || livro["Autor"] } 
            : livro
        )
      );
      
      return true;
    } catch (err) {
      console.error('Error updating book:', err);
      setError('Erro ao atualizar livro. Tente novamente.');
      return false;
    }
  }, [user]);

  // Delete a book
  const deleteLivro = useCallback(async (id: number) => {
    if (!user) return false;
    
    try {
      const { error } = await livrosAPI.delete(id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update local state
      setLivros(prev => prev.filter(livro => livro.id !== id));
      
      // If the active book was deleted, set another one as active
      if (activeLivroId === id) {
        const index = livros.findIndex(l => l.id === id);
        const newActiveId = index > 0 
          ? livros[index - 1].id 
          : livros.find(l => l.id !== id)?.id || null;
        
        setActiveLivroId(newActiveId);
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting book:', err);
      setError('Erro ao excluir livro. Tente novamente.');
      return false;
    }
  }, [user, livros, activeLivroId]);
  
  // Clear error message
  const clearError = () => setError(null);

  return {
    livros,
    activeLivroId,
    activeLivro,
    isLoading,
    error,
    setActiveLivroId,
    addLivro,
    updateLivro,
    deleteLivro,
    clearError
  };
}