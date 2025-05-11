import React from 'react';
import { PenIcon, ArrowBackIcon } from '../../components/icons';
import {
  Header,
  HeaderContent,
  LogoSection,
  Logo,
  BookTitle,
  HeaderControls,
  StatusIndicator,
  ThemeToggleButton,
  ActionButton
} from './styles';

interface EditorHeaderProps {
  bookTitle: string;
  saveStatus: 'idle' | 'saving' | 'saved';
  isOnline: boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onBackToDashboard: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  bookTitle,
  saveStatus,
  isOnline,
  isDarkMode,
  onToggleTheme,
  onBackToDashboard
}) => {
  return (
    <Header>
      <HeaderContent>
        <LogoSection>
          <Logo>
            <PenIcon />
            Escritor
          </Logo>
          <BookTitle>{bookTitle}</BookTitle>
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