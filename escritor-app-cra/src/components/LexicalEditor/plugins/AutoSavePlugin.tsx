import { useEffect, useRef } from 'react';
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
  const lastSeenContent = useRef<string>('');
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
      return lastSeenContent.current;
    }
  };

  // Função para calcular e atualizar a contagem de palavras
  const updateWordCount = () => {
    try {
      // Extrair texto puro do editor
      const plainText = editor.getEditorState().read(() => $getRoot().getTextContent());
      
      // Calcular contagem de palavras
      const palavras = plainText.split(/\s+/).filter(Boolean).length;
      
      // Notificar sobre a mudança na contagem de palavras
      if (onWordCountChanged) {
        onWordCountChanged(palavras);
      }
      
      return palavras;
    } catch (error) {
      console.error('Erro ao calcular palavras:', error);
      return 0;
    }
  };

  // Função de salvamento corrigida para mapear corretamente para os campos do banco
  const saveContent = async (content: string) => {
    if (!bookId || !chapterId) return;
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
      const palavras = updateWordCount();
      // Enviar tanto para os campos do banco quanto para compatibilidade com CapituloData
      const updateData = {
        conteudo: content, // compatibilidade com CapituloData
        customData: { palavras },
        texto: content, // campo real do banco
        palavras: palavras, // campo real do banco
        last_edit: new Date().toISOString()
      };

      await dbService.atualizarCapitulo(chapterId, updateData);
      lastSavedContent.current = content;
      hasUnsavedChanges.current = false;
      console.log('Conteúdo salvo automaticamente:', new Date().toLocaleTimeString());
      if (onStatusChange) onStatusChange('saved');
    } catch (error) {
      console.error('Erro ao salvar automaticamente:', error);
      if (onStatusChange) onStatusChange('error');
    }
  };

  // Registra listener para atualizar a contagem de palavras em tempo real
  useEffect(() => {
    const removeUpdateListener = editor.registerUpdateListener(() => {
      // Atualizar imediatamente a contagem de palavras sempre que o editor é atualizado
      updateWordCount();
      // Atualizar o status para indicar que existem alterações não salvas
      if (onStatusChange) onStatusChange('unsaved');
    });
    
    return removeUpdateListener;
  }, [editor, onStatusChange]);

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
          
          // Programa salvamento com delay
          saveTimerRef.current = setTimeout(() => {
            saveContent(content);
          }, delay);
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
    };
  }, [bookId, chapterId, delay, editor]);

  // Configurar verificação periódica a cada 30 segundos para salvar alterações pendentes
  useEffect(() => {
    if (!bookId || !chapterId) return;
    
    // Verificar a cada 30 segundos se há alterações não salvas
    const periodicSaveInterval = setInterval(() => {
      if (hasUnsavedChanges.current) {
        console.log('Verificação periódica: encontradas alterações não salvas');
        const content = serializeEditorState();
        saveContent(content);
      }
    }, 30000);
    
    return () => {
      clearInterval(periodicSaveInterval);
    };
  }, [bookId, chapterId]);

  // Salvar quando a página for fechada
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        try {
          const content = serializeEditorState();
          const palavras = updateWordCount();
          // Usar o mesmo formato de dados para o salvamento de emergência
          const updateData = {
            conteudo: content,
            customData: { palavras },
            texto: content,
            palavras: palavras,
            last_edit: new Date().toISOString()
          };
          const savePromise = dbService.atualizarCapitulo(chapterId || '', updateData);
          const plainTextContent = editor.getEditorState().read(() => {
            return $getRoot().getTextContent();
          });
          try {
            localStorage.setItem(`emergency_save_text_${chapterId}`, plainTextContent);
            console.log('Backup de emergência salvo');
          } catch (storageError) {
            console.error('Erro ao salvar no localStorage:', storageError);
          }
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

  // Forçar uma atualização inicial da contagem de palavras para garantir
  useEffect(() => {
    // Executar uma vez após a inicialização
    setTimeout(() => {
      updateWordCount();
    }, 500);
  }, []);

  return null;
}