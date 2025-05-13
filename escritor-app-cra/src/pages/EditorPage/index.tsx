import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { EditorHeader } from './EditorHeader';
import { Sidebar } from './Sidebar';
import { EditorContent } from './EditorContent';
import { AIAssistantFixed } from './AIAssistantFixed';
import { LoadingGlobal } from './LoadingGlobal';
import { ErrorState } from './ErrorState';
import { useEditorPage } from '../../hooks/useEditorPage';
import { useTheme } from '../../contexts/ThemeContext';
import { EditorPageContainer, MainLayout } from './styles';
import defaultTheme from '../../styles/theme';
import { LoadingChapter } from './LoadingChapter';
import CreateBookModal from '../../components/CreateBookModal';
import { dbService } from '../../services/dbService';
import DarkThemeStyles from '../../styles/darkTheme';

const lightTheme = {
  ...defaultTheme,
  colors: {
    ...defaultTheme.colors,
    background: {
      ...defaultTheme.colors.background,
      main: '#ffffff',
      gradient: 'linear-gradient(180deg, #f8fafc 0%, #f0f9ff 50%, #f8fafc 100%)',
      paper: '#ffffff',
      glass: 'rgba(255, 255, 255, 0.8)',
      overlay: 'rgba(0, 0, 0, 0.5)'
    },
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    primaryDark: '#2563eb',
    primaryGradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    secondary: '#8b5cf6',
    text: {
      ...defaultTheme.colors.text,
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#94a3b8',
      inverse: '#ffffff'
    },
    border: {
      light: 'rgba(0, 0, 0, 0.08)',
      medium: 'rgba(0, 0, 0, 0.12)',
      heavy: 'rgba(0, 0, 0, 0.2)'
    },
    shadow: {
      sm: '0 2px 8px rgba(0, 0, 0, 0.05)',
      md: '0 8px 24px rgba(0, 0, 0, 0.1)',
      lg: '0 16px 48px rgba(0, 0, 0, 0.15)',
      xl: '0 24px 64px rgba(0, 0, 0, 0.2)',
      glow: '0 0 20px rgba(59, 130, 246, 0.5)'
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  }
};

const darkTheme = {
  ...defaultTheme,
  isDarkMode: true,
  colors: {
    ...defaultTheme.colors,
    background: {
      ...defaultTheme.colors.background,
      main: '#0a0a0a',
      gradient: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
      paper: '#141414',
      glass: 'rgba(255, 255, 255, 0.06)',
      overlay: 'rgba(0, 0, 0, 0.8)'
    },
    primary: '#60a5fa',
    primaryLight: '#93c5fd',
    primaryDark: '#3b82f6',
    primaryGradient: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
    secondary: '#a78bfa',
    text: {
      ...defaultTheme.colors.text,
      primary: '#ffffff',
      secondary: '#e2e8f0',
      tertiary: '#94a3b8',
      inverse: '#0f172a'
    },
    border: {
      light: 'rgba(255, 255, 255, 0.12)',
      medium: 'rgba(255, 255, 255, 0.16)',
      heavy: 'rgba(255, 255, 255, 0.24)'
    },
    shadow: {
      sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
      md: '0 8px 24px rgba(0, 0, 0, 0.4)',
      lg: '0 16px 48px rgba(0, 0, 0, 0.5)',
      xl: '0 24px 64px rgba(0, 0, 0, 0.6)',
      glow: '0 0 20px rgba(96, 165, 250, 0.5)'
    },
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
  },
  cardBackground: '#1a1a1a',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8'
};

const editorThemes = {
  light: lightTheme,
  dark: darkTheme
};

const EditorPage: React.FC = () => {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId?: string }>();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
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
    handleChapterTitleUpdate,
    handleEditorChange,
    handleChapterSelect,
    handleNewChapter,
    handleDeleteChapter,
    handleBookTitleChange,
    handleChaptersReorder,
    setSaveStatus,
    loadingChapter,
    setCapitulos,
    setWordCount,
    setLivro
  } = useEditorPage(bookId, chapterId);

  // Função para atualizar a contagem de palavras em tempo real
  const handleWordCountChanged = React.useCallback((newWordCount: number) => {
    console.log('Contagem de palavras atualizada:', newWordCount);
    // Atualiza o estado local com a nova contagem
    setWordCount(newWordCount);
    
    // Também é possível atualizar o capítulo atual na lista de capítulos
    // com a nova contagem, para mostrar em tempo real na sidebar
    if (chapterId) {
      const updatedCapitulos = capitulos.map(cap => {
        if (String(cap.id) === String(chapterId)) {
          return {
            ...cap,
            palavras: newWordCount
          };
        }
        return cap;
      });
      
      // Atualiza a lista de capítulos com o valor atualizado
      setCapitulos(updatedCapitulos);
    }
  }, [chapterId, capitulos, setCapitulos, setWordCount]);

  // Função para abrir o modal de edição de livro
  const handleOpenEditModal = async () => {
    if (bookId) {
      try {
        // Buscar os dados mais recentes do livro no Supabase antes de abrir o modal
        const livroId = parseInt(bookId);
        const livroAtualizado = await dbService.getLivroPorId(livroId);
        
        if (livroAtualizado) {
          // Atualizar o estado do livro com os dados mais recentes
          setLivro(livroAtualizado);
          
          // Atualizar o documento com o título atual (se necessário)
          document.title = `${livroAtualizado.titulo || livroAtualizado["Nome do livro"]} | Editor`;
          
          // Abrir o modal com os dados mais recentes
          setIsEditModalOpen(true);
        } else {
          console.error('Erro: Não foi possível obter os dados atualizados do livro');
          
          // Mesmo em caso de erro, abrimos o modal com os dados em cache
          setIsEditModalOpen(true);
        }
      } catch (error) {
        console.error('Erro ao buscar dados atualizados do livro:', error);
        
        // Mesmo em caso de erro, abrimos o modal com os dados em cache
        setIsEditModalOpen(true);
      }
    } else {
      // Se não tiver ID, apenas abre o modal
      setIsEditModalOpen(true);
    }
  };

  // Função para fechar o modal de edição
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  // Função chamada após a edição bem-sucedida do livro
  const handleEditSuccess = async () => {
    // Recarregar os dados do livro após a edição
    if (bookId) {
      try {
        const livroId = parseInt(bookId);
        const livroAtualizado = await dbService.getLivroPorId(livroId);
        
        // Atualizar o livro no estado local - melhor do que recarregar a página inteira
        if (livroAtualizado) {
          // Usar uma abordagem mais elegante do que recarregar a página
          document.title = `${livroAtualizado.titulo || livroAtualizado["Nome do livro"]} | Editor`;
          
          // Fechar o modal
          setIsEditModalOpen(false);
          
          // Mostrar uma notificação de sucesso temporária
          const notification = document.createElement('div');
          notification.style.position = 'fixed';
          notification.style.bottom = '30px';
          notification.style.right = '30px';
          notification.style.padding = '15px 20px';
          notification.style.backgroundColor = '#10b981';
          notification.style.color = 'white';
          notification.style.borderRadius = '8px';
          notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          notification.style.zIndex = '9999';
          notification.style.transition = 'all 0.3s ease';
          notification.textContent = 'Livro atualizado com sucesso!';
          
          document.body.appendChild(notification);
          
          // Remover a notificação após 3 segundos
          setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
              document.body.removeChild(notification);
            }, 300);
          }, 3000);
        }
      } catch (error) {
        console.error('Erro ao recarregar livro após edição:', error);
      }
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={editorThemes[isDarkMode ? 'dark' : 'light']}>
        {isDarkMode && <DarkThemeStyles />}
        <LoadingGlobal />
      </ThemeProvider>
    );
  }

  if (erro || !livro) {
    return (
      <ThemeProvider theme={editorThemes[isDarkMode ? 'dark' : 'light']}>
        {isDarkMode && <DarkThemeStyles />}
        <ErrorState error={erro} onBack={() => navigate('/dashboard')} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={editorThemes[isDarkMode ? 'dark' : 'light']}>
      {isDarkMode && <DarkThemeStyles />}
      <EditorPageContainer>
        <EditorHeader
          bookTitle={livro.titulo || livro["Nome do livro"] || "Sem título"}
          saveStatus={saveStatus}
          titleSaveStatus={titleSaveStatus}
          isOnline={isOnline}
          isDarkMode={isDarkMode}
          onToggleTheme={() => {
            console.log('Toggle tema no EditorPage, estado atual:', isDarkMode ? 'escuro' : 'claro');
            toggleTheme();
          }}
          onBackToDashboard={() => navigate('/dashboard')}
          onBookTitleChange={handleBookTitleChange}
          onEditBookInfo={handleOpenEditModal}
        />

        <MainLayout>
          <Sidebar
            chapters={capitulos}
            activeChapterId={chapterId}
            onChapterSelect={handleChapterSelect}
            onNewChapter={handleNewChapter}
            onDeleteChapter={handleDeleteChapter}
            onChaptersReorder={handleChaptersReorder}
            onChapterTitleChange={handleChapterTitleUpdate}
          />

          <EditorContent
            chapterTitle={chapterTitle}
            wordCount={wordCount}
            onChapterTitleChange={handleChapterTitleChange}
            onEditorChange={handleEditorChange}
            onWordCountChanged={handleWordCountChanged}
            bookId={bookId}
            chapterId={chapterId}
            initialContent={chapterContent}
            saveStatus={saveStatus}
            isOnline={isOnline}
            setSaveStatus={setSaveStatus}
            loadingChapter={loadingChapter}
          />
          
          <AIAssistantFixed
            bookId={bookId}
            chapterId={chapterId}
          />
        </MainLayout>

        {/* Modal de Edição do Livro */}
        <CreateBookModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
          livro={livro}
          isEditMode={true}
        />
      </EditorPageContainer>
    </ThemeProvider>
  );
};

export default EditorPage;