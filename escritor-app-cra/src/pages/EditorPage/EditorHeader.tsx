import React, { useState, useEffect, useRef } from 'react';
import { PenIcon, ArrowBackIcon } from '../../components/icons';
import {
  Header,
  HeaderContent,
  LogoSection,
  Logo,
  BookTitle,
  BookTitleInput,
  HeaderControls,
  StatusIndicator,
  ThemeToggleButton,
  ActionButton
} from './styles';

interface EditorHeaderProps {
  bookTitle: string;
  saveStatus: 'idle' | 'saving' | 'saved';
  titleSaveStatus?: 'idle' | 'saving' | 'saved';
  isOnline: boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onBackToDashboard: () => void;
  onBookTitleChange?: (newTitle: string) => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  bookTitle,
  saveStatus,
  titleSaveStatus = 'idle',
  isOnline,
  isDarkMode,
  onToggleTheme,
  onBackToDashboard,
  onBookTitleChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(bookTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  // Atualiza o título editável quando o prop bookTitle muda
  useEffect(() => {
    setEditedTitle(bookTitle);
  }, [bookTitle]);

  // Foca no input quando entra no modo de edição
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleTitleClick = () => {
    if (onBookTitleChange) {
      setIsEditing(true);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditing(false);
    if (editedTitle.trim() !== bookTitle && onBookTitleChange) {
      onBookTitleChange(editedTitle.trim() || "Sem título");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setEditedTitle(bookTitle);
      setIsEditing(false);
    }
  };

  return (
    <Header>
      <HeaderContent>
        <LogoSection>
          <Logo>
            <PenIcon />
            Bookwriter
          </Logo>
          {isEditing ? (
            <BookTitleInput
              ref={inputRef}
              value={editedTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Título do livro"
            />
          ) : (
            <BookTitle
              onClick={handleTitleClick}
              style={{ cursor: onBookTitleChange ? 'pointer' : 'default' }}
              title={onBookTitleChange ? "Clique para editar o título" : ""}
            >
              {bookTitle}
              {titleSaveStatus === 'saving' && ' (Salvando...)'}
            </BookTitle>
          )}
        </LogoSection>

        <HeaderControls>
          <StatusIndicator
            $status={saveStatus === 'saving' ? 'saving' : saveStatus === 'saved' ? 'saved' : isOnline ? 'online' : 'offline'}
          >
            {saveStatus === 'saving' ? 'Salvando...' :
             saveStatus === 'saved' ? 'Salvo' :
             isOnline ? 'Online' : 'Offline'}
          </StatusIndicator>

          <ThemeToggleButton onClick={onToggleTheme}>
            {isDarkMode ? '☀️' : '🌙'}
          </ThemeToggleButton>

          <ActionButton onClick={onBackToDashboard}>
            <ArrowBackIcon />
            Dashboard
          </ActionButton>
        </HeaderControls>
      </HeaderContent>
    </Header>
  );
};