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

        console.log('Capítulos carregados:', capitulosData ? capitulosData.length : 0);
        console.log('chapterId da URL:', chapterId);

        if (chapterId) {
          // Importante: Converter ambos os IDs para string para garantir uma comparação consistente
          const capituloAtual = capitulosData?.find(cap => String(cap.id) === String(chapterId));
          console.log('Capítulo encontrado:', capituloAtual ? capituloAtual.titulo : 'Nenhum');

          if (capituloAtual) {
            console.log('Carregando título:', capituloAtual.titulo);

            // Usar o campo texto em vez de conteudo (para compatibilidade, verificar os dois campos)
            const conteudoCapitulo = capituloAtual.texto || capituloAtual.conteudo || '';
            console.log('Carregando conteúdo:', conteudoCapitulo ? `${conteudoCapitulo.substring(0, 50)}...` : 'vazio');
            console.log('Campo texto:', capituloAtual.texto ? 'presente' : 'ausente');
            console.log('Campo conteudo:', capituloAtual.conteudo ? 'presente' : 'ausente');

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
          // Se não tiver um capítulo específico, seleciona o último capítulo do livro
          const ultimoCapitulo = capitulosData[capitulosData.length - 1];
          console.log('Selecionando último capítulo:', ultimoCapitulo.titulo);

          // Usar o campo texto em vez de conteudo (para compatibilidade, verificar os dois campos)
          const conteudoUltimoCapitulo = ultimoCapitulo.texto || ultimoCapitulo.conteudo || '';
          console.log('Conteúdo do último capítulo:', conteudoUltimoCapitulo ? `${conteudoUltimoCapitulo.substring(0, 50)}...` : 'vazio');
          console.log('Campo texto (último):', ultimoCapitulo.texto ? 'presente' : 'ausente');
          console.log('Campo conteudo (último):', ultimoCapitulo.conteudo ? 'presente' : 'ausente');

          setChapterTitle(ultimoCapitulo.titulo || '');
          setChapterContent(conteudoUltimoCapitulo);

          if (conteudoUltimoCapitulo) {
            const words = conteudoUltimoCapitulo.split(/\s+/).filter(Boolean).length;
            setWordCount(words);
          }

          // Redireciona para o último capítulo
          navigate(`/editor/${bookId}/${ultimoCapitulo.id}`);
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

  // Auto-save real para o banco de dados
  const saveChapter = useCallback(async () => {
    if (!chapterId) return;

    try {
      setSaveStatus('saving');

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      saveTimerRef.current = setTimeout(async () => {
        console.log('Salvando capítulo:', chapterId);
        console.log('Título:', chapterTitle);
        console.log('Conteúdo:', chapterContent ? `${chapterContent.substring(0, 50)}...` : 'vazio');

        try {
          // Salvar no banco de dados
          await dbService.atualizarCapitulo(chapterId, {
            titulo: chapterTitle,
            conteudo: chapterContent
          });

          console.log('Capítulo salvo com sucesso');
          setSaveStatus('saved');

          setTimeout(() => {
            setSaveStatus('idle');
          }, 2000);
        } catch (error) {
          console.error('Erro ao salvar capítulo:', error);
          setSaveStatus('idle');
        }
      }, 1000);
    } catch (error) {
      console.error('Erro no processo de auto-save:', error);
      setSaveStatus('idle');
    }
  }, [chapterId, chapterTitle, chapterContent]);

  const handleEditorChange = useCallback((content: string) => {
    setChapterContent(content);

    if (content) {
      const words = content.split(/\s+/).filter(Boolean).length;
      setWordCount(words);
    } else {
      setWordCount(0);
    }

    // Usar o saveChapter real em vez da simulação
    saveChapter();
  }, [saveChapter]);

  const handleChapterTitleChange = useCallback((value: string) => {
    setChapterTitle(value);
    // Usar o saveChapter real em vez da simulação
    saveChapter();
  }, [saveChapter]);

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