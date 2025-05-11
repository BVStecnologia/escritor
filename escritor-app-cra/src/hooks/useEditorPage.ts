import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService, Capitulo } from '../services/dbService';

export interface UseEditorPageReturn {
  livro: any | null;
  capitulos: Capitulo[];
  loading: boolean;
  erro: string | null;
  isOnline: boolean;
  saveStatus: 'idle' | 'saving' | 'saved';
  wordCount: number;
  chapterTitle: string;
  chapterContent: string;
  handleChapterTitleChange: (value: string) => void;
  handleEditorChange: (content: string) => void;
  handleChapterSelect: (chapterId: string) => void;
  handleNewChapter: () => void;
}

export function useEditorPage(bookId?: string, chapterId?: string): UseEditorPageReturn {
  const navigate = useNavigate();
  const [livro, setLivro] = useState<any>(null);
  const [capitulos, setCapitulos] = useState<Capitulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [wordCount, setWordCount] = useState(0);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Carrega dados do livro e capítulos
  useEffect(() => {
    const carregarLivro = async () => {
      if (!bookId) return;

      try {
        const livroId = parseInt(bookId);
        const livroData = await dbService.getLivroPorId(livroId);
        setLivro(livroData);

        const capitulosData = await dbService.getCapitulosPorLivroId(livroId);
        if (capitulosData) {
          setCapitulos(capitulosData);
        }

        if (chapterId) {
          const capituloAtual = capitulosData?.find(cap => cap.id === chapterId);
          if (capituloAtual) {
            setChapterTitle(capituloAtual.titulo || '');
            setChapterContent(capituloAtual.conteudo || '');

            if (capituloAtual.conteudo) {
              const words = capituloAtual.conteudo.split(/\s+/).filter(Boolean).length;
              setWordCount(words);
            }
          }
        } else if (capitulosData && capitulosData.length > 0) {
          // Se não tiver um capítulo específico, seleciona o primeiro capítulo do livro
          const primeiroCapitulo = capitulosData[0];
          setChapterTitle(primeiroCapitulo.titulo || '');
          setChapterContent(primeiroCapitulo.conteudo || '');

          if (primeiroCapitulo.conteudo) {
            const words = primeiroCapitulo.conteudo.split(/\s+/).filter(Boolean).length;
            setWordCount(words);
          }

          // Redireciona para o primeiro capítulo
          navigate(`/editor/${bookId}/${primeiroCapitulo.id}`);
        }
      } catch (error) {
        console.error('Erro ao carregar livro:', error);
        setErro('Não foi possível carregar as informações do livro.');
      } finally {
        setTimeout(() => setLoading(false), 1000);
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

  // Auto-save
  const simulateAutoSave = useCallback(() => {
    if (chapterId) {
      setSaveStatus('saving');
      
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      
      saveTimerRef.current = setTimeout(() => {
        // Aqui você faria o save real no banco
        setSaveStatus('saved');
        
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      }, 1000);
    }
  }, [chapterId]);

  const handleEditorChange = useCallback((content: string) => {
    setChapterContent(content);

    if (content) {
      const words = content.split(/\s+/).filter(Boolean).length;
      setWordCount(words);
    } else {
      setWordCount(0);
    }

    simulateAutoSave();
  }, [simulateAutoSave]);

  const handleChapterTitleChange = useCallback((value: string) => {
    setChapterTitle(value);
    simulateAutoSave();
  }, [simulateAutoSave]);

  const handleChapterSelect = useCallback((selectedChapterId: string) => {
    navigate(`/editor/${bookId}/${selectedChapterId}`);
  }, [bookId, navigate]);

  const handleNewChapter = useCallback(() => {
    navigate(`/editor/${bookId}`);
  }, [bookId, navigate]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return {
    livro,
    capitulos,
    loading,
    erro,
    isOnline,
    saveStatus,
    wordCount,
    chapterTitle,
    chapterContent,
    handleChapterTitleChange,
    handleEditorChange,
    handleChapterSelect,
    handleNewChapter
  };
}