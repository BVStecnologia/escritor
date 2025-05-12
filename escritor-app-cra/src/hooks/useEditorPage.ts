import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService, Capitulo, CapituloData } from '../services/dbService';
import debounce from 'lodash/debounce';

export interface UseEditorPageReturn {
  livro: any | null;
  capitulos: Capitulo[];
  loading: boolean;
  erro: string | null;
  isOnline: boolean;
  saveStatus: 'idle' | 'saving' | 'saved';
  titleSaveStatus: 'idle' | 'saving' | 'saved';
  wordCount: number;
  chapterTitle: string;
  chapterContent: string;
  handleChapterTitleChange: (value: string) => void;
  handleEditorChange: (content: string) => void;
  handleChapterSelect: (chapterId: string) => void;
  handleNewChapter: (title?: string) => void;
  handleDeleteChapter: (chapterId: string) => void;
  handleBookTitleChange: (value: string) => void;
  handleChaptersReorder: (reorderedChapters: Capitulo[]) => void;
  setSaveStatus: React.Dispatch<React.SetStateAction<'idle' | 'saving' | 'saved'>>;
  setCapitulos: React.Dispatch<React.SetStateAction<Capitulo[]>>;
  setWordCount: React.Dispatch<React.SetStateAction<number>>;
}

export function useEditorPage(bookId?: string, chapterId?: string): UseEditorPageReturn & { loadingChapter: boolean; setLoadingChapter: React.Dispatch<React.SetStateAction<boolean>> } {
  const navigate = useNavigate();
  const [livro, setLivro] = useState<any>(null);
  const [capitulos, setCapitulos] = useState<Capitulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [titleSaveStatus, setTitleSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [wordCount, setWordCount] = useState(0);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [loadingChapter, setLoadingChapter] = useState(false);

  // Carrega dados do livro e capítulos
  useEffect(() => {
    const carregarLivro = async () => {
      if (!bookId) return;
      setLoadingChapter(true);
      try {
        const livroId = parseInt(bookId);
        const livroData = await dbService.getLivroPorId(livroId);
        setLivro(livroData);

        const capitulosData = await dbService.getCapitulosPorLivroId(livroId);
        if (capitulosData) {
          setCapitulos(capitulosData);
        }

        console.log('Capítulos carregados:', capitulosData ? capitulosData.length : 0);
        console.log('chapterId da URL:', chapterId);

        if (chapterId) {
          const capituloAtual = capitulosData?.find(cap => String(cap.id) === String(chapterId));
          console.log('Capítulo encontrado:', capituloAtual ? capituloAtual.titulo : 'Nenhum');

          if (capituloAtual) {
            console.log('Carregando título:', capituloAtual.titulo);

            const conteudoCapitulo = capituloAtual.texto || capituloAtual.conteudo || '';
            console.log('Carregando conteúdo:', conteudoCapitulo ? `${conteudoCapitulo.substring(0, 50)}...` : 'vazio');

            setChapterTitle(capituloAtual.titulo || '');
            setChapterContent(conteudoCapitulo);

            if (conteudoCapitulo) {
              const words = conteudoCapitulo.split(/\s+/).filter(Boolean).length;
              setWordCount(words);
            }
          } else {
            console.warn('Capítulo não encontrado com ID:', chapterId);
          }
        } else if (capitulosData && capitulosData.length > 0) {
          // Buscar o último capítulo editado ao invés do último da lista
          const ultimoCapituloEditado = await dbService.getUltimoCapituloEditado(livroId);
          console.log('Selecionando último capítulo editado:', ultimoCapituloEditado?.titulo);

          if (ultimoCapituloEditado) {
            const conteudoCapitulo = ultimoCapituloEditado.texto || ultimoCapituloEditado.conteudo || '';
            
            setChapterTitle(ultimoCapituloEditado.titulo || '');
            setChapterContent(conteudoCapitulo);

            if (conteudoCapitulo) {
              const words = conteudoCapitulo.split(/\s+/).filter(Boolean).length;
              setWordCount(words);
            }

            navigate(`/editor/${bookId}/${ultimoCapituloEditado.id}`);
          } else {
            // Caso não encontre o último editado, usa o primeiro da lista
            const primeiroCapitulo = capitulosData[0];
            setChapterTitle(primeiroCapitulo.titulo || '');
            setChapterContent(primeiroCapitulo.texto || primeiroCapitulo.conteudo || '');
            navigate(`/editor/${bookId}/${primeiroCapitulo.id}`);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar livro:', error);
        setErro('Não foi possível carregar as informações do livro.');
      } finally {
        setTimeout(() => {
          setLoading(false);
          setLoadingChapter(false);
        }, 1000);
      }
    };

    carregarLivro();
  }, [bookId, chapterId]);

  // Monitora status online/offline
  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, []);

  // Salvar título do capítulo com debounce
  const saveChapterTitleDebounced = useRef(
    debounce((id, title) => {
      const capituloData: CapituloData = { titulo: title };
      dbService.atualizarCapitulo(id, capituloData);
    }, 500)
  ).current;

  const handleChapterTitleChange = useCallback((value: string) => {
    setChapterTitle(value);
    if (chapterId) {
      saveChapterTitleDebounced(chapterId, value);
    }
  }, [chapterId, saveChapterTitleDebounced]);

  // Função com debounce para mudança no editor
  const updateContent = useCallback((content: string) => {
    setChapterContent(content);

    if (content) {
      const words = content.split(/\s+/).filter(Boolean).length;
      setWordCount(words);
    } else {
      setWordCount(0);
    }
  }, []);

  // Limpar debounce quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (debouncedFnRef.current) {
        debouncedFnRef.current.cancel();
      }
    };
  }, []);

  // Referência para o debounce
  const debouncedFnRef = useRef<any>(null);

  // Versão corrigida que gerencia corretamente o ciclo de vida do debounce
  const handleEditorChange = useCallback((content: string) => {
    // Cancelar debounce anterior se existir
    if (debouncedFnRef.current) {
      debouncedFnRef.current.cancel();
    }

    // Criar novo debounce
    const debouncedFn = debounce(() => {
      updateContent(content);
    }, 100);

    // Armazenar referência
    debouncedFnRef.current = debouncedFn;

    // Executar
    debouncedFn();
  }, [updateContent]);

  const handleChapterSelect = useCallback((selectedChapterId: string) => {
    setLoadingChapter(true);
    navigate(`/editor/${bookId}/${selectedChapterId}`);
  }, [bookId, navigate]);

  const handleNewChapter = useCallback(async (title?: string) => {
    if (!bookId) return;
    try {
      const livroId = parseInt(bookId);
      // Sempre criar capítulo com conteúdo vazio
      const capituloData: CapituloData = {
        titulo: title || 'Novo Capítulo',
        conteudo: ''
      };
      const novoCapitulo = await dbService.criarCapitulo(livroId, capituloData);
      // Atualiza a lista de capítulos
      const capitulosAtualizados = await dbService.getCapitulosPorLivroId(livroId);
      setCapitulos(capitulosAtualizados);
      // Navega para o novo capítulo
      navigate(`/editor/${bookId}/${novoCapitulo.id}`);
    } catch (error: any) {
      console.error('Erro detalhado ao criar capítulo:', error);
      let msg = 'Erro ao criar novo capítulo.';
      if (typeof error === 'object') {
        msg = JSON.stringify(error, null, 2);
      } else if (error?.message) {
        msg = error.message;
      } else if (error?.error_description) {
        msg = error.error_description;
      } else if (error?.toString) {
        msg = error.toString();
      }
      setErro(msg);
    }
  }, [bookId, navigate]);

  const handleDeleteChapter = useCallback(async (chapterIdToDelete: string) => {
    if (!bookId) return;
    try {
      const livroId = parseInt(bookId);
      
      // Exclui o capítulo
      await dbService.excluirCapitulo(chapterIdToDelete);
      
      // Atualiza a lista de capítulos
      const capitulosAtualizados = await dbService.getCapitulosPorLivroId(livroId);
      setCapitulos(capitulosAtualizados);
      
      // Se o capítulo excluído é o atual, navegue para o último capítulo restante
      if (String(chapterId) === String(chapterIdToDelete)) {
        if (capitulosAtualizados && capitulosAtualizados.length > 0) {
          // Navega para o último capítulo 
          const ultimoCapitulo = capitulosAtualizados[capitulosAtualizados.length - 1];
          navigate(`/editor/${bookId}/${ultimoCapitulo.id}`);
        } else {
          // Se não houver mais capítulos, cria um novo
          handleNewChapter('Capítulo 1');
        }
      }
    } catch (error) {
      console.error('Erro ao excluir capítulo:', error);
      setErro('Não foi possível excluir o capítulo.');
    }
  }, [bookId, chapterId, navigate, handleNewChapter]);

  // Salvar título do livro com debounce
  const saveBookTitleDebounced = useRef(
    debounce(async (id, title) => {
      try {
        setTitleSaveStatus('saving');
        await dbService.atualizarLivro(parseInt(id), { titulo: title });
        setTitleSaveStatus('saved');

        // Atualiza o objeto livro no estado local
        setLivro((prevLivro: any) => ({
          ...prevLivro,
          titulo: title,
          "Nome do livro": title // Garante que ambas as propriedades são atualizadas
        }));

        // Reset status após um tempo
        setTimeout(() => {
          setTitleSaveStatus('idle');
        }, 2000);
      } catch (error) {
        console.error('Erro ao salvar título do livro:', error);
        setTitleSaveStatus('idle');
        setErro('Erro ao salvar o título do livro');
      }
    }, 800)
  ).current;

  const handleBookTitleChange = useCallback((value: string) => {
    if (!bookId) return;
    saveBookTitleDebounced(bookId, value);
  }, [bookId, saveBookTitleDebounced]);

  // Manipulador para reordenação de capítulos
  const handleChaptersReorder = useCallback(async (reorderedChapters: Capitulo[]) => {
    // Atualiza o estado local
    setCapitulos(reorderedChapters);
    
    // Salvar no banco de dados
    try {
      await dbService.atualizarOrdemCapitulos(
        reorderedChapters.map(c => ({ id: c.id, ordem: c.ordem || 0 }))
      );
      console.log('Ordem dos capítulos atualizada com sucesso no banco de dados');
    } catch (error) {
      console.error('Erro ao atualizar ordem dos capítulos no banco:', error);
      setErro('Não foi possível salvar a nova ordem dos capítulos.');
    }
  }, []);

  return {
    livro,
    capitulos,
    loading,
    erro,
    isOnline,
    saveStatus,
    titleSaveStatus,
    wordCount,
    chapterTitle,
    chapterContent,
    handleChapterTitleChange,
    handleEditorChange,
    handleChapterSelect,
    handleNewChapter,
    handleDeleteChapter,
    handleBookTitleChange,
    handleChaptersReorder,
    setSaveStatus,
    loadingChapter,
    setLoadingChapter,
    setCapitulos,
    setWordCount
  };
}