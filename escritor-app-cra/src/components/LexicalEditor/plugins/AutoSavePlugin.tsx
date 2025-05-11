import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { dbService } from '../../../services/dbService';

interface AutoSavePluginProps {
  bookId?: string;
  chapterId?: string;
  delay?: number;
}

export function AutoSavePlugin({ bookId, chapterId, delay = 15000 }: AutoSavePluginProps) {
  const [editor] = useLexicalComposerContext();
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContent = useRef<string>('');

  useEffect(() => {
    if (!bookId || !chapterId) return;

    const saveContent = async (content: string) => {
      if (content === lastSavedContent.current) {
        return; // Não salva se o conteúdo não mudou
      }

      try {
        await dbService.atualizarCapitulo(chapterId, {
          conteudo: content
        });
        lastSavedContent.current = content;
        console.log('Conteúdo salvo automaticamente:', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Erro ao salvar automaticamente:', error);
      }
    };

    const removeListener = editor.registerUpdateListener(({ editorState }) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      editorState.read(() => {
        const root = $getRoot();
        const content = root.getTextContent();

        saveTimerRef.current = setTimeout(() => {
          saveContent(content);
        }, delay);
      });
    });

    return () => {
      removeListener();
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [bookId, chapterId, delay, editor]);

  return null;
}