import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService, Capitulo } from '../services/dbService';
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
  handleBookTitleChange: (value: string) => void;
  setSaveStatus: React.Dispatch<React.SetStateAction<'idle' | 'saving' | 'saved'>>;
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
          const ultimoCapitulo = capitulosData[capitulosData.length - 1];
          console.log('Selecionando último capítulo:', ultimoCapitulo.titulo);

          const conteudoUltimoCapitulo = ultimoCapitulo.texto || ultimoCapitulo.conteudo || '';
          
          setChapterTitle(ultimoCapitulo.titulo || '');
          setChapterContent(conteudoUltimoCapitulo);

          if (conteudoUltimoCapitulo) {
            const words = conteudoUltimoCapitulo.split(/\s+/).filter(Boolean).length;
            setWordCount(words);
          }

          navigate(`/editor/${bookId}/${ultimoCapitulo.id}`);
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
      dbService.atualizarCapitulo(id, { titulo: title });
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
      const novoCapitulo = await dbService.criarCapitulo(livroId, { titulo: title || 'Novo Capítulo', conteudo: '' });
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
    handleBookTitleChange,
    setSaveStatus,
    loadingChapter,
    setLoadingChapter
  };
}