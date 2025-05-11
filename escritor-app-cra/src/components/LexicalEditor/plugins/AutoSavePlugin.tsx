import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { dbService } from '../../../services/dbService';

interface AutoSavePluginProps {
  bookId?: string;
  chapterId?: string;
  delay?: number;
}

export function AutoSavePlugin({ bookId, chapterId, delay = 3000 }: AutoSavePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!bookId || !chapterId) return;

    let timeoutId: NodeJS.Timeout;
    
    // Function to save content to database
    const saveContent = async () => {
      const editorState = editor.getEditorState();
      const content = editorState.read(() => {
        const root = editor.getEditorState()._nodeMap.get('root');
        return root ? root.getTextContent() : '';
      });
      
      try {
        await dbService.atualizarCapitulo(chapterId, {
          conteudo: content
        });
        console.log('Conteúdo salvo automaticamente:', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Erro ao salvar automaticamente:', error);
      }
    };

    // Register listener for changes
    const removeListener = editor.registerUpdateListener(({ editorState, prevEditorState, tags }) => {
      // Clear previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Only trigger save if content actually changed
      if (
        ((): string => {
          const root = prevEditorState._nodeMap.get('root');
          return root ? root.getTextContent() : '';
        })() !==
        ((): string => {
          const root = editorState._nodeMap.get('root');
          return root ? root.getTextContent() : '';
        })()
      ) {
        // Set new timeout for delayed save
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