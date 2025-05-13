import { useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { dbService } from '../../../services/dbService';

interface AutoSavePluginProps {
  bookId?: string;
  chapterId?: string;
  delay?: number;
  onStatusChange?: (status: 'saving' | 'saved' | 'error' | 'unsaved') => void;
  onWordCountChanged?: (wordCount: number) => void;
}

export function AutoSavePlugin({ 
  bookId, 
  chapterId, 
  delay = 5000, 
  onStatusChange,
  onWordCountChanged 
}: AutoSavePluginProps) {
  const [editor] = useLexicalComposerContext();
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContent = useRef<string>('');

  // Função simples para calcular e atualizar a contagem de palavras
  const updateWordCount = () => {
    try {
      if (!onWordCountChanged) return;
      
      const plainText = editor.getEditorState().read(() => $getRoot().getTextContent());
      const palavras = plainText.split(/\s+/).filter(Boolean).length;
      
      console.log('Contagem de palavras:', palavras);
      onWordCountChanged(palavras);
    } catch (error) {
      console.error('Erro ao calcular palavras:', error);
    }
  };

  // Função de salvamento simplificada
  const saveContent = async (content: string) => {
    if (!bookId || !chapterId) return;
    if (!content || content === lastSavedContent.current) return;

    if (onStatusChange) onStatusChange('saving');
    
    try {
      // Calcular contagem de palavras
      const plainText = editor.getEditorState().read(() => $getRoot().getTextContent());
      const palavras = plainText.split(/\s+/).filter(Boolean).length;
      
      // Atualizar a contagem de palavras no componente pai
      if (onWordCountChanged) {
        onWordCountChanged(palavras);
      }
      
      // Salvar no banco de dados
      await dbService.atualizarCapitulo(chapterId, {
        conteudo: content,
        customData: { palavras }
      });
      
      lastSavedContent.current = content;
      console.log('Conteúdo salvo:', new Date().toLocaleTimeString());
      
      if (onStatusChange) onStatusChange('saved');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      if (onStatusChange) onStatusChange('error');
    }
  };

  // Calcular contagem de palavras na montagem do componente
  useEffect(() => {
    // Precisamos de um pequeno atraso para garantir que o editor esteja pronto
    const timer = setTimeout(() => {
      updateWordCount();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Registrar listener para mudanças no editor
  useEffect(() => {
    if (!bookId || !chapterId) return;

    console.log('Configurando listener de salvamento automático');
    
    const removeUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      // Cancelar temporizador existente
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      
      try {
        // Sempre atualiza a contagem de palavras ao editar
        updateWordCount();
        
        // Serializar estado e verificar se mudou
        const content = JSON.stringify(editorState.toJSON());
        
        if (content !== lastSavedContent.current) {
          // Sinalizar alterações não salvas
          if (onStatusChange) onStatusChange('unsaved');
          
          // Programar salvamento após delay
          saveTimerRef.current = setTimeout(() => {
            console.log('Executando salvamento programado');
            saveContent(content);
          }, delay);
        }
      } catch (error) {
        console.error('Erro ao processar atualização:', error);
      }
    });

    return () => {
      removeUpdateListener();
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [bookId, chapterId, delay, editor, onStatusChange]);

  // Salvar ao fechar a página
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      try {
        const content = JSON.stringify(editor.getEditorState().toJSON());
        
        if (content !== lastSavedContent.current) {
          console.log('Salvando antes de fechar a página');
          
          // Tentativa de salvamento síncrono
          dbService.atualizarCapitulo(chapterId || '', {
            conteudo: content
          });
          
          event.returnValue = 'Há alterações não salvas. Tem certeza que deseja sair?';
          return event.returnValue;
        }
      } catch (error) {
        console.error('Erro ao salvar antes de fechar:', error);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [chapterId, editor]);

  return null;
}