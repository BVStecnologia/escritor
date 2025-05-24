import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection } from 'lexical';

interface InsertContentPluginProps {
  pendingContent?: string;
  onContentInserted?: () => void;
}

export function InsertContentPlugin({ pendingContent, onContentInserted }: InsertContentPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (pendingContent) {
      editor.update(() => {
        const selection = $getSelection();
        
        if ($isRangeSelection(selection)) {
          // Inserir o conteúdo na posição atual do cursor
          selection.insertText(pendingContent);
          
          // Focar no editor após a inserção
          editor.focus();
        }
      });
      
      // Notificar que o conteúdo foi inserido
      onContentInserted?.();
    }
  }, [pendingContent, editor, onContentInserted]);

  return null;
}