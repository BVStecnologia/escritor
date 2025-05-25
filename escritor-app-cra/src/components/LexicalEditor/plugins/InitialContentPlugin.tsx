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
          // Verificar se tem imagens no conteúdo
          if (initialContent.includes('"type":"image"')) {
            console.log('Conteúdo contém imagens!');
          }
          
          const editorState = editor.parseEditorState(initialContent);
          editor.setEditorState(editorState);
          
          console.log('Estado do editor configurado com sucesso!');
          
          // Verificar se as imagens foram carregadas
          setTimeout(() => {
            editor.getEditorState().read(() => {
              const root = $getRoot();
              const textContent = root.getTextContent();
              console.log('Conteúdo de texto carregado:', textContent.substring(0, 100) + '...');
              
              // Verificar a estrutura completa
              const jsonState = editor.getEditorState().toJSON();
              console.log('Estado completo do editor após carregar:', JSON.stringify(jsonState));
              
              // Verificar especificamente se tem nós de imagem
              if (JSON.stringify(jsonState).includes('"type":"image"')) {
                console.log('✅ Imagens foram carregadas no editor!');
              } else {
                console.log('❌ Imagens NÃO foram carregadas no editor!');
              }
            });
          }, 1000);
        } catch (importError) {
          console.error('Erro ao importar estado do editor:', importError);
          console.error('Conteúdo que falhou:', initialContent);
        }
      }
    } catch (error) {
      console.error('Erro ao processar conteúdo inicial:', error);
    }
  }, [editor, initialContent]);
  
  return null;
}