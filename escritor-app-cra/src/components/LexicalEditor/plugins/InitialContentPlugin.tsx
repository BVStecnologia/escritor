import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';

interface InitialContentPluginProps {
  initialContent?: string;
}

export function InitialContentPlugin({ initialContent }: InitialContentPluginProps) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    // Se não houver conteúdo inicial, não fazer nada
    if (!initialContent) return;
    
    try {
      console.log('Tentando carregar conteúdo inicial no editor');
      const parsedContent = JSON.parse(initialContent);
      
      if (parsedContent && parsedContent.root) {
        console.log('Conteúdo JSON válido, importando no editor...');
        
        // Atualizar o editor com o conteúdo JSON importado
        editor.update(() => {
          const root = $getRoot();
          
          // Limpar o conteúdo atual do editor
          root.clear();
          
          // Apenas para garantir que tem um parágrafo inicial
          if (root.getChildrenSize() === 0) {
            const paragraph = $createParagraphNode();
            paragraph.append($createTextNode(''));
            root.append(paragraph);
          }
        });
        
        // Importar o estado serializado
        try {
          editor.setEditorState(editor.parseEditorState(initialContent));
          console.log('Estado do editor configurado com sucesso!');
        } catch (importError) {
          console.error('Erro ao importar estado do editor:', importError);
        }
      }
    } catch (error) {
      console.error('Erro ao processar conteúdo inicial:', error);
    }
  }, [editor, initialContent]);
  
  return null;
}