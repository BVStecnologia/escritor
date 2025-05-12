import { useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { dbService } from '../../../services/dbService';

interface AutoSavePluginProps {
  bookId?: string;
  chapterId?: string;
  delay?: number;
  onStatusChange?: (status: 'saving' | 'saved' | 'idle') => void;
}

export function AutoSavePlugin({ bookId, chapterId, delay = 5000, onStatusChange }: AutoSavePluginProps) {
  const [editor] = useLexicalComposerContext();
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContent = useRef<string>('');
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');

  // Carregar título do capítulo quando o componente for montado
  useEffect(() => {
    const fetchChapterTitle = async () => {
      if (!chapterId) return;
      
      try {
        const capitulo = await dbService.getCapituloPorId(chapterId);
        if (capitulo && capitulo.titulo) {
          setChapterTitle(capitulo.titulo);
        }
      } catch (error) {
        console.error('Erro ao obter título do capítulo:', error);
      }
    };
    
    fetchChapterTitle();
  }, [chapterId]);

  useEffect(() => {
    // Adiciona listeners globais para saber se o último clique foi dentro do editor
    const editorRoot = editor.getRootElement();
    if (!editorRoot) return;

    const handleDocumentClick = (e: MouseEvent) => {
      if (editorRoot.contains(e.target as Node)) {
        setIsEditorActive(true);
      } else {
        setIsEditorActive(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [editor]);

  useEffect(() => {
    if (!bookId || !chapterId) return;

    const saveContent = async (content: string) => {
      if (content === lastSavedContent.current) {
        return; // Não salva se o conteúdo não mudou
      }

      if (onStatusChange) onStatusChange('saving');
      try {
        // Extrair o texto limpo do estado do editor para calcular contagem de palavras
        const plainText = editor.getEditorState().read(() => $getRoot().getTextContent());
        
        // Calcular contagem de palavras
        const palavras = plainText.split(/\s+/).filter(Boolean).length;
        
        // Atualizar o capítulo com o conteúdo e a contagem de palavras explicitamente
        const updateData = {
          titulo: chapterTitle, // Usar o título atual do capítulo
          conteudo: content, 
          customData: {
            palavras
          }
        };
        
        await dbService.atualizarCapitulo(chapterId, updateData);
        
        lastSavedContent.current = content;
        console.log('Conteúdo salvo automaticamente:', new Date().toLocaleTimeString());
        console.log('Contagem de palavras:', palavras);
        
        if (onStatusChange) onStatusChange('saved');
      } catch (error) {
        console.error('Erro ao salvar automaticamente:', error);
        if (onStatusChange) onStatusChange('idle');
      }
    };

    const removeListener = editor.registerUpdateListener(({ editorState }) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      // Use o editorState fornecido no callback em vez de chamar editor.getEditorState()
      const content = JSON.stringify(editorState.toJSON());
      // Só salva se o último clique foi dentro do editor
      if (isEditorActive) {
        saveTimerRef.current = setTimeout(() => {
          saveContent(content);
        }, delay);
      }
    });

    return () => {
      removeListener();
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [bookId, chapterId, delay, editor, onStatusChange, isEditorActive, chapterTitle]);

  return null;
}