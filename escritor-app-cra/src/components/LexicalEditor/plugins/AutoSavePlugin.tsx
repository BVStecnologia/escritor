import { useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
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
  const periodicSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContent = useRef<string>('');
  const lastSeenContent = useRef<string>('');
  const [isEditorActive, setIsEditorActive] = useState(false);
  const hasUnsavedChanges = useRef<boolean>(false);

  // Função segura para serializar o estado do editor
  const serializeEditorState = (ignoreCache = false) => {
    try {
      const editorState = editor.getEditorState();
      const jsonState = editorState.toJSON();
      const serialized = JSON.stringify(jsonState);
      
      // Atualiza o lastSeenContent sempre que serializamos
      lastSeenContent.current = serialized;
      
      // Se houver diferença entre o que foi salvo e o estado atual, marca como não salvo
      if (serialized !== lastSavedContent.current && !ignoreCache) {
        hasUnsavedChanges.current = true;
        if (onStatusChange) onStatusChange('unsaved');
      }
      
      return serialized;
    } catch (error) {
      console.error('Erro ao serializar estado do editor:', error);
      return lastSeenContent.current; // Retorna o último estado conhecido em caso de erro
    }
  };

  // Função de salvamento que pode ser chamada por diferentes gatilhos
  const saveContent = async (content: string) => {
    // Não faz nada se não houver IDs ou se o conteúdo já foi salvo
    if (!bookId || !chapterId) return;
    
    // Verificar se o conteúdo é válido - evitando salvar conteúdo vazio ou malformado
    if (!content || content.trim() === '' || content === '{}' || content === '[]') {
      console.log('Conteúdo vazio ou inválido, pulando salvamento.');
      return;
    }
    
    if (content === lastSavedContent.current) {
      console.log('Conteúdo já salvo, pulando salvamento.');
      return;
    }

    if (onStatusChange) onStatusChange('saving');
    try {
      // Extrair o texto limpo do estado do editor para calcular contagem de palavras
      const plainText = editor.getEditorState().read(() => $getRoot().getTextContent());
      
      // Calcular contagem de palavras
      const palavras = plainText.split(/\s+/).filter(Boolean).length;
      
      // Notificar sobre a mudança na contagem de palavras, se o callback existir
      if (onWordCountChanged) {
        onWordCountChanged(palavras);
      }
      
      // Atualizar o capítulo com o conteúdo e a contagem de palavras explicitamente
      // IMPORTANTE: Não incluímos o título aqui para evitar sobrescrever o título durante o salvamento automático
      const updateData = {
        conteudo: content, 
        customData: {
          palavras
        }
      };
      
      console.log('Salvando capítulo com dados:', {
        id: chapterId,
        palavras,
        conteudo: 'texto do editor (não exibido para economia de espaço)'
      });
      
      await dbService.atualizarCapitulo(chapterId, updateData);
      
      lastSavedContent.current = content;
      hasUnsavedChanges.current = false;
      console.log('Conteúdo salvo automaticamente:', new Date().toLocaleTimeString());
      console.log('Contagem de palavras:', palavras);
      
      if (onStatusChange) onStatusChange('saved');
    } catch (error) {
      console.error('Erro ao salvar automaticamente:', error);
      if (onStatusChange) onStatusChange('error');
    }
  };

  // Adiciona listeners globais para verificar o foco no editor
  useEffect(() => {
    const editorRoot = editor.getRootElement();
    if (!editorRoot) return;

    const handleDocumentClick = (e: MouseEvent) => {
      if (editorRoot.contains(e.target as Node)) {
        setIsEditorActive(true);
      } else {
        setIsEditorActive(false);
        
        // Se sair do editor (blur) e houver mudanças, salva imediatamente
        if (hasUnsavedChanges.current) {
          console.log('Editor perdeu foco com alterações não salvas, salvando...');
          const content = serializeEditorState();
          saveContent(content);
        }
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [editor]);

  // Adiciona listener para eventos de atualização do editor
  useEffect(() => {
    if (!bookId || !chapterId) return;

    const removeUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      try {
        // Serializa o estado do editor
        const content = JSON.stringify(editorState.toJSON());
        
        // Verifica se o conteúdo mudou desde o último salvamento
        if (content !== lastSavedContent.current) {
          hasUnsavedChanges.current = true;
          if (onStatusChange) onStatusChange('unsaved');
          
          // Programa salvamento com delay, mas apenas se o editor estiver ativo
          if (isEditorActive) {
            saveTimerRef.current = setTimeout(() => {
              saveContent(content);
            }, delay);
          }
        }
      } catch (error) {
        console.error('Erro ao processar atualização do editor:', error);
      }
    });

    return () => {
      removeUpdateListener();
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      if (periodicSaveTimerRef.current) {
        clearInterval(periodicSaveTimerRef.current);
      }
    };
  }, [bookId, chapterId, delay, editor, onStatusChange, isEditorActive, onWordCountChanged]);

  // Configura verificação periódica a cada 30 segundos para salvar alterações pendentes
  useEffect(() => {
    if (!bookId || !chapterId) return;
    
    // Verifica a cada 30 segundos se há alterações não salvas
    periodicSaveTimerRef.current = setInterval(() => {
      if (hasUnsavedChanges.current) {
        console.log('Verificação periódica: encontradas alterações não salvas');
        const content = serializeEditorState();
        saveContent(content);
      }
    }, 30000); // 30 segundos
    
    return () => {
      if (periodicSaveTimerRef.current) {
        clearInterval(periodicSaveTimerRef.current);
      }
    };
  }, [bookId, chapterId]);

  // Salvar quando a página for fechada/navegada para outro lugar
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        // Tentativa de salvamento síncrono antes de sair
        try {
          // Obter conteúdo serializado para enviar ao servidor
          const content = serializeEditorState();
          
          // Tentar fazer salvamento síncrono com a API existente
          const savePromise = dbService.atualizarCapitulo(chapterId || '', {
            conteudo: content
          });
          
          // Extrair o texto puro do editor para armazenar no localStorage
          // Isso é mais seguro do que armazenar a estrutura JSON completa
          const plainTextContent = editor.getEditorState().read(() => {
            return $getRoot().getTextContent();
          });
          
          // Forçar salvamento no localStorage como backup (apenas texto)
          try {
            localStorage.setItem(`emergency_save_text_${chapterId}`, plainTextContent);
            console.log('Backup de emergência (texto) salvo no localStorage');
          } catch (storageError) {
            console.error('Erro ao salvar no localStorage:', storageError);
          }
          
          console.log('Salvamento de emergência iniciado antes de sair da página');
          
          // Mensagem de confirmação para o usuário (pode não aparecer em alguns navegadores)
          event.returnValue = 'Há alterações não salvas. Tem certeza que deseja sair?';
          return event.returnValue;
        } catch (error) {
          console.error('Erro ao tentar salvar antes de fechar:', error);
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [chapterId, editor]);

  // Verifica se existe um salvamento de emergência no localStorage
  useEffect(() => {
    if (!bookId || !chapterId) return;
    
    try {
      // Verificar salvamento de emergência em formato de texto
      const emergencySaveText = localStorage.getItem(`emergency_save_text_${chapterId}`);
      
      if (emergencySaveText) {
        console.log('Encontrado salvamento de emergência (texto) no localStorage');
        
        // Perguntar ao usuário se deseja restaurar o conteúdo de emergência
        const shouldRestore = window.confirm(
          'Encontramos um texto que pode não ter sido salvo na sua última sessão. Deseja restaurá-lo?'
        );
        
        if (shouldRestore) {
          try {
            // Simplesmente atualizar o editor com o texto puro, sem tentar manipular estrutura complexa
            editor.update(() => {
              const root = $getRoot();
              root.clear();
              root.append($createParagraphNode().append($createTextNode(emergencySaveText)));
            });
            
            console.log('Texto de emergência restaurado com sucesso');
            
            // Forçar salvamento imediato para persistir no servidor
            setTimeout(() => {
              const currentState = serializeEditorState();
              saveContent(currentState);
            }, 500);
          } catch (parseError) {
            console.error('Erro ao restaurar texto de emergência:', parseError);
          }
        }
        
        // Limpar o salvamento de emergência após processá-lo
        localStorage.removeItem(`emergency_save_text_${chapterId}`);
      }
    } catch (error) {
      console.error('Erro ao verificar salvamento de emergência:', error);
    }
  }, [bookId, chapterId, editor]);

  return null;
}