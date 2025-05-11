import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { dbService } from '../../../services/dbService';

interface AutoSavePluginProps {
  bookId?: string;
  chapterId?: string;
  delay?: number;
}

export function AutoSavePlugin({ bookId, chapterId, delay = 3000 }: AutoSavePluginProps) {
  const [editor] = useLexicalComposerContext();
  const isSaving = useRef(false);

  useEffect(() => {
    if (!bookId || !chapterId) return;

    let timeoutId: NodeJS.Timeout;
    
    // Function to save content to database
    const saveContent = async () => {
      if (isSaving.current) return;

      isSaving.current = true;

      let content = '';
      // Usa read() dentro do contexto do editor para obter o conteúdo de forma segura
      editor.getEditorState().read(() => {
        const root = $getRoot();
        content = root.getTextContent();
      });

      try {
        // Atualizar usando conteudo que será mapeado para texto na função atualizarCapitulo
        await dbService.atualizarCapitulo(chapterId, {
          conteudo: content
        });
        console.log('Conteúdo salvo automaticamente pelo plugin:', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Erro ao salvar automaticamente pelo plugin:', error);
      } finally {
        isSaving.current = false;
      }
    };

    // Register listener for changes
    const removeListener = editor.registerUpdateListener(({ editorState, prevEditorState, tags }) => {
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Obtenha o texto atual e anterior usando read() de forma segura
      let prevText = '';
      let currentText = '';

      prevEditorState.read(() => {
        const root = $getRoot();
        prevText = root.getTextContent();
      });

      editorState.read(() => {
        const root = $getRoot();
        currentText = root.getTextContent();
      });

      // Só salva se o conteúdo realmente mudou
      if (prevText !== currentText) {
        // Define timeout para salvar com delay
        timeoutId = setTimeout(saveContent, delay);
      }
    });

    // Cleanup
    return () => {
      removeListener();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [bookId, chapterId, delay, editor]);

  return null;
}