import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { EditorHeader } from './EditorHeader';
import { Sidebar } from './Sidebar';
import { EditorContent } from './EditorContent';
import { AIAssistant } from './AIAssistant';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { useEditorPage } from '../../hooks/useEditorPage';
import { useTheme } from '../../contexts/ThemeContext';
import { EditorPageContainer, MainLayout } from './styles';
import defaultTheme from '../../styles/theme';

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
  }
};

const editorThemes = {
  light: lightTheme,
  dark: darkTheme
};

const EditorPage: React.FC = () => {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId?: string }>();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [aiAssistantActive, setAiAssistantActive] = useState(false);

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
    handleEditorChange,
    handleChapterSelect,
    handleNewChapter,
    handleBookTitleChange,
    setSaveStatus
  } = useEditorPage(bookId, chapterId);

  if (loading) {
    return (
      <ThemeProvider theme={editorThemes[isDarkMode ? 'dark' : 'light']}>
        <LoadingState />
      </ThemeProvider>
    );
  }

  if (erro || !livro) {
    return (
      <ThemeProvider theme={editorThemes[isDarkMode ? 'dark' : 'light']}>
        <ErrorState error={erro} onBack={() => navigate('/dashboard')} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={editorThemes[isDarkMode ? 'dark' : 'light']}>
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
        />

        <MainLayout>
          <Sidebar
            chapters={capitulos}
            activeChapterId={chapterId}
            onChapterSelect={handleChapterSelect}
            onNewChapter={handleNewChapter}
          />

          <EditorContent
            chapterTitle={chapterTitle}
            wordCount={wordCount}
            onChapterTitleChange={handleChapterTitleChange}
            onEditorChange={handleEditorChange}
            bookId={bookId}
            chapterId={chapterId}
            initialContent={chapterContent}
            saveStatus={saveStatus}
            isOnline={isOnline}
            setSaveStatus={setSaveStatus}
          />
        </MainLayout>

        <AIAssistant
          active={aiAssistantActive}
          onToggle={() => setAiAssistantActive(!aiAssistantActive)}
        />
      </EditorPageContainer>
    </ThemeProvider>
  );
};

export default EditorPage;