import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import EditorAvancado from '../components/EditorAvancado';
import { dbService, Capitulo } from '../services/dbService';
import { Button, Title, Text } from '../components/styled';

const EditorPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background.main};
`;

const EditorHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.space.md} ${({ theme }) => theme.space.xl};
  background-color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  position: relative;
  z-index: 10;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
`;

const LogoText = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: -0.5px;
`;

const BookTitle = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-left: ${({ theme }) => theme.space.md};
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:before {
    content: '•';
    margin-right: ${({ theme }) => theme.space.md};
    color: ${({ theme }) => theme.colors.gray[400]};
  }
`;

const HeaderControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.space.sm};
  align-items: center;
`;

const StatusBadge = styled.div<{ online?: boolean }>`
  display: flex;
  align-items: center;
  background: ${({ online, theme }) =>
    online ? theme.colors.success + '20' : theme.colors.gray[200]};
  color: ${({ online, theme }) =>
    online ? theme.colors.success : theme.colors.text.secondary};
  padding: ${({ theme }) => theme.space.xs} ${({ theme }) => theme.space.sm};
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-right: ${({ theme }) => theme.space.md};

  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ online, theme }) =>
      online ? theme.colors.success : theme.colors.gray[400]};
    margin-right: ${({ theme }) => theme.space.xs};
  }
`;

const EditorLayout = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const SidebarWrapper = styled.div`
  width: 250px;
  background-color: ${({ theme }) => theme.colors.white};
  border-right: 1px solid ${({ theme }) => theme.colors.gray[200]};
  padding: ${({ theme }) => theme.space.md};
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.space.md};
  padding-bottom: ${({ theme }) => theme.space.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const SidebarTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin: 0 0 ${({ theme }) => theme.space.xs} 0;
`;

const ChapterListWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ChapterList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ChapterItem = styled.li<{ active?: boolean }>`
  padding: ${({ theme }) => theme.space.sm};
  margin-bottom: ${({ theme }) => theme.space.xs};
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ active, theme }) =>
    active ? theme.colors.primary + '15' : 'transparent'};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.normal};

  &:hover {
    background-color: ${({ active, theme }) =>
      active ? theme.colors.primary + '20' : theme.colors.gray[100]};
  }
`;

const ChapterTitle = styled.div<{ active?: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ active, theme }) =>
    active ? theme.fontWeights.semibold : theme.fontWeights.normal};
  color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NewChapterButton = styled(Button)`
  margin-top: ${({ theme }) => theme.space.md};
`;

const EditorContent = styled.div`
  flex: 1;
  overflow: hidden;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.lg};
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  border-top-color: ${({ theme }) => theme.colors.primary};
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const EditorPage: React.FC = () => {
  const { bookId, chapterId } = useParams<Record<string, string | undefined>>();
  const navigate = useNavigate();
  const [livro, setLivro] = useState<any>(null);
  const [capitulos, setCapitulos] = useState<Capitulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const carregarLivro = async () => {
      if (!bookId) return;

      try {
        // Carregar livro
        const livroId = parseInt(bookId);
        const livroData = await dbService.getLivroPorId(livroId);
        setLivro(livroData);

        // Carregar capítulos
        const capitulosData = await dbService.getCapitulosPorLivroId(livroId);
        if (capitulosData) {
          setCapitulos(capitulosData);
        }
      } catch (error) {
        console.error('Erro ao carregar livro:', error);
        setErro('Não foi possível carregar as informações do livro.');
        setIsOnline(false);
      } finally {
        setLoading(false);
      }
    };

    carregarLivro();

    // Verificar status de conexão
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, [bookId]);

  const handleVoltarDashboard = () => {
    navigate('/dashboard');
  };

  const handleNovoCapitulo = () => {
    if (bookId) {
      navigate(`/editor/${bookId}`);
    }
  };

  const handleSelectCapitulo = (capituloId: string) => {
    if (bookId) {
      navigate(`/editor/${bookId}/${capituloId}`);
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <Text>Carregando editor...</Text>
      </LoadingContainer>
    );
  }

  if (erro || !livro) {
    return (
      <LoadingContainer>
        <Title>Erro</Title>
        <Text>{erro || 'Livro não encontrado'}</Text>
        <Button variant="primary" onClick={handleVoltarDashboard}>
          Voltar para o Dashboard
        </Button>
      </LoadingContainer>
    );
  }

  return (
    <EditorPageContainer>
      <EditorHeader>
        <HeaderTitle>
          <LogoText>Escritor App</LogoText>
          <BookTitle title={livro["Nome do livro"]}>{livro["Nome do livro"]}</BookTitle>
        </HeaderTitle>

        <HeaderControls>
          <StatusBadge online={isOnline}>
            {isOnline ? 'Online' : 'Offline'}
          </StatusBadge>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleVoltarDashboard}
          >
            Voltar ao Dashboard
          </Button>
        </HeaderControls>
      </EditorHeader>

      <EditorLayout>
        <SidebarWrapper>
          <SidebarHeader>
            <SidebarTitle>Capítulos</SidebarTitle>
            <Text size="sm" style={{ color: '#495057' }}>
              {capitulos.length} {capitulos.length === 1 ? 'capítulo' : 'capítulos'}
            </Text>
          </SidebarHeader>

          <ChapterListWrapper>
            <ChapterList>
              {capitulos.map((capitulo) => (
                <ChapterItem
                  key={capitulo.id}
                  active={capitulo.id === chapterId}
                  onClick={() => handleSelectCapitulo(capitulo.id)}
                >
                  <ChapterTitle active={capitulo.id === chapterId}>
                    {capitulo.titulo || 'Sem título'}
                  </ChapterTitle>
                </ChapterItem>
              ))}

              {capitulos.length === 0 && (
                <Text size="sm" style={{ color: '#6c757d' }}>
                  Nenhum capítulo criado
                </Text>
              )}
            </ChapterList>
          </ChapterListWrapper>

          <NewChapterButton
            variant="primary"
            size="sm"
            onClick={handleNovoCapitulo}
          >
            Novo Capítulo
          </NewChapterButton>
        </SidebarWrapper>

        <EditorContent>
          <EditorAvancado
            livroId={parseInt(bookId!)}
            capituloId={chapterId}
          />
        </EditorContent>
      </EditorLayout>
    </EditorPageContainer>
  );
};

export default EditorPage;