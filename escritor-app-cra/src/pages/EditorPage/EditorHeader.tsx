import React, { useState } from 'react';
import { Logo, BookTitle, BookTitleInput, HeaderContent, HeaderControls, ThemeToggleButton, StatusIndicator, ActionButton, Header, LogoSection } from './styles';
import { PenIcon, ArrowBackIcon } from '../../components/icons';

interface EditorHeaderProps {
  bookTitle: string;
  saveStatus: string;
  titleSaveStatus: string;
  isOnline: boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onBackToDashboard: () => void;
  onBookTitleChange: (title: string) => void;
  onEditBookInfo: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  bookTitle,
  saveStatus,
  titleSaveStatus,
  isOnline,
  isDarkMode,
  onToggleTheme,
  onBackToDashboard,
  onBookTitleChange,
  onEditBookInfo
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(bookTitle);

  const handleEditBookInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditBookInfo();
  };

  const renderStatus = () => {
    if (!isOnline) {
      return (
        <StatusIndicator $status="offline">
          Offline
        </StatusIndicator>
      );
    }

    if (saveStatus === 'saving') {
      return (
        <StatusIndicator $status="saving">
          Salvando...
        </StatusIndicator>
      );
    }

    if (saveStatus === 'saved') {
      return (
        <StatusIndicator $status="saved">
          Salvo
        </StatusIndicator>
      );
    }

    return (
      <StatusIndicator $status="online">
        Online
      </StatusIndicator>
    );
  };

  return (
    <Header>
      <HeaderContent>
        <LogoSection>
          <Logo>
            Bookwriter
            <svg width="0" height="0">
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </svg>
          </Logo>

          <BookTitle onClick={handleEditBookInfo}>
            {bookTitle || "Sem título"}
            <button 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                padding: '0', 
                marginLeft: '8px', 
                display: 'inline-flex', 
                alignItems: 'center' 
              }}
              onClick={handleEditBookInfo}
              title="Editar informações do livro"
            >
              <PenIcon />
            </button>
          </BookTitle>
        </LogoSection>

        <HeaderControls>
          {renderStatus()}
          
          <ThemeToggleButton onClick={onToggleTheme}>
            {isDarkMode ? '☀️' : '🌙'}
          </ThemeToggleButton>
          
          <ActionButton onClick={onBackToDashboard}>
            <ArrowBackIcon />
            Voltar
          </ActionButton>
        </HeaderControls>
      </HeaderContent>
    </Header>
  );
};