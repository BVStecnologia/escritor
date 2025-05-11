import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes, css, ThemeProvider, createGlobalStyle } from 'styled-components';
import EditorAvancado from '../components/EditorAvancado';
import { dbService, Capitulo } from '../services/dbService';
import { Button, Title, Text } from '../components/styled';
import defaultTheme from '../styles/theme';

// =============== GLOBAL STYLES ===============
const GlobalStyle = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.colors.background.gradient};
    color: ${({ theme }) => theme.colors.text.primary};
    transition: all 0.3s ease;
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }

  * {
    box-sizing: border-box;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary}40;
    border-radius: 4px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.primary}60;
  }
`;

// =============== ANIMAÇÕES REFINADAS ===============
const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
  50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.6); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(0.95); }
`;

// =============== TEMA APRIMORADO ===============
// Criando temas completos baseados no tema padrão
const editorTheme = {
  light: {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      background: {
        ...defaultTheme.colors.background,
        main: '#fafafa',
        gradient: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)',
        paper: 'rgba(255, 255, 255, 0.9)',
        glass: 'rgba(255, 255, 255, 0.7)',
        overlay: 'rgba(0, 0, 0, 0.5)'
      },
      primary: '#3b82f6',
      primaryLight: '#4895ef',
      primaryDark: '#3f37c9',
      primaryGradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      secondary: '#8b5cf6',
      secondaryLight: '#72efdd',
      secondaryDark: '#4ea8de',
      secondaryGradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      accent: '#f72585',
      accentLight: '#ff758f',
      accentDark: '#b5179e',
      accentGradient: 'linear-gradient(135deg, #f72585 0%, #b5179e 100%)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      dark: '#212529',
      light: '#f8f9fa',
      white: '#ffffff',
      black: '#000000',
      text: {
        ...defaultTheme.colors.text,
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#94a3b8',
        inverse: '#ffffff'
      },
      border: {
        light: 'rgba(0, 0, 0, 0.05)',
        medium: 'rgba(0, 0, 0, 0.1)',
        heavy: 'rgba(0, 0, 0, 0.2)'
      },
      shadow: {
        sm: '0 2px 8px rgba(0, 0, 0, 0.05)',
        md: '0 8px 24px rgba(0, 0, 0, 0.1)',
        lg: '0 16px 48px rgba(0, 0, 0, 0.15)',
        xl: '0 24px 64px rgba(0, 0, 0, 0.2)',
        glow: '0 0 20px rgba(59, 130, 246, 0.5)'
      },
      gray: {
        ...defaultTheme.colors.gray
      }
    },
    shadows: { ...defaultTheme.shadows },
    gradients: {
      ...defaultTheme.gradients,
      primary: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
    },
    fonts: {
      ...defaultTheme.fonts,
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace"
    },
    fontSizes: { ...defaultTheme.fontSizes },
    fontWeights: { ...defaultTheme.fontWeights },
    lineHeights: { ...defaultTheme.lineHeights },
    space: { ...defaultTheme.space },
    radii: { ...defaultTheme.radii },
    breakpoints: { ...defaultTheme.breakpoints },
    transitions: { ...defaultTheme.transitions },
    zIndices: { ...defaultTheme.zIndices }
  },
  dark: {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      background: {
        ...defaultTheme.colors.background,
        main: '#0a0a0a',
        gradient: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        paper: 'rgba(30, 41, 59, 0.9)',
        glass: 'rgba(15, 23, 42, 0.7)',
        overlay: 'rgba(0, 0, 0, 0.7)'
      },
      primary: '#60a5fa',
      primaryLight: '#4895ef',
      primaryDark: '#3f37c9',
      primaryGradient: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
      secondary: '#a78bfa',
      secondaryLight: '#72efdd',
      secondaryDark: '#4ea8de',
      secondaryGradient: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)',
      accent: '#f472b6',
      accentLight: '#ff758f',
      accentDark: '#b5179e',
      accentGradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      dark: '#212529',
      light: '#f8f9fa',
      white: '#ffffff',
      black: '#000000',
      text: {
        ...defaultTheme.colors.text,
        primary: '#f1f5f9',
        secondary: '#cbd5e1',
        tertiary: '#94a3b8',
        inverse: '#0f172a'
      },
      border: {
        light: 'rgba(255, 255, 255, 0.05)',
        medium: 'rgba(255, 255, 255, 0.1)',
        heavy: 'rgba(255, 255, 255, 0.2)'
      },
      shadow: {
        sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
        md: '0 8px 24px rgba(0, 0, 0, 0.4)',
        lg: '0 16px 48px rgba(0, 0, 0, 0.5)',
        xl: '0 24px 64px rgba(0, 0, 0, 0.6)',
        glow: '0 0 20px rgba(96, 165, 250, 0.5)'
      },
      gray: {
        ...defaultTheme.colors.gray
      }
    },
    shadows: { ...defaultTheme.shadows },
    gradients: {
      ...defaultTheme.gradients,
      primary: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)'
    },
    fonts: {
      ...defaultTheme.fonts,
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace"
    },
    fontSizes: { ...defaultTheme.fontSizes },
    fontWeights: { ...defaultTheme.fontWeights },
    lineHeights: { ...defaultTheme.lineHeights },
    space: { ...defaultTheme.space },
    radii: { ...defaultTheme.radii },
    breakpoints: { ...defaultTheme.breakpoints },
    transitions: { ...defaultTheme.transitions },
    zIndices: { ...defaultTheme.zIndices }
  }
};

// =============== COMPONENTES ESTILIZADOS ===============
const EditorPageContainer = styled.div`
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background.gradient};
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 500px;
    background: ${({ theme }) => theme.colors.primaryGradient};
    opacity: 0.1;
    border-radius: 0 0 50% 50%;
    pointer-events: none;
  }
`;

const EditorHeader = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${({ theme }) => theme.colors.background.glass};
  backdrop-filter: blur(20px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  padding: 1rem 2rem;
  
  @supports (-webkit-backdrop-filter: none) or (backdrop-filter: none) {
    -webkit-backdrop-filter: blur(20px);
  }
`;

const HeaderContent = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  background: ${({ theme }) => theme.colors.primaryGradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 28px;
    height: 28px;
    fill: url(#logoGradient);
  }
`;

const BookTitle = styled.span`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  padding-left: 1rem;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    background: ${({ theme }) => theme.colors.primaryGradient};
    border-radius: 2px;
  }
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatusIndicator = styled.div<{ $status: 'online' | 'offline' | 'saving' | 'saved' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${({ theme, $status }) => 
    $status === 'online' ? `${theme.colors.success}15` :
    $status === 'saving' ? `${theme.colors.warning}15` :
    $status === 'saved' ? `${theme.colors.success}15` :
    `${theme.colors.error}15`
  };
  color: ${({ theme, $status }) => 
    $status === 'online' ? theme.colors.success :
    $status === 'saving' ? theme.colors.warning :
    $status === 'saved' ? theme.colors.success :
    theme.colors.error
  };
  border: 1px solid ${({ theme, $status }) => 
    $status === 'online' ? `${theme.colors.success}30` :
    $status === 'saving' ? `${theme.colors.warning}30` :
    $status === 'saved' ? `${theme.colors.success}30` :
    `${theme.colors.error}30`
  };
  transition: all 0.3s ease;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    ${({ $status }) => $status === 'saving' && css`
      animation: ${pulse} 1.5s ease-in-out infinite;
    `}
  }
`;

const ThemeToggleButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1.25rem;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryGradient};
    color: ${({ theme }) => theme.colors.text.inverse};
    transform: rotate(180deg);
  }
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.colors.primaryGradient};
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.colors.shadow?.lg || "0 16px 48px rgba(0, 0, 0, 0.15)"};
  }

  svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }
`;

const MainLayout = styled.div`
  display: flex;
  flex: 1;
  gap: 2rem;
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 1;
`;

const Sidebar = styled.aside<{ $isOpen: boolean }>`
  width: ${({ $isOpen }) => $isOpen ? '320px' : '80px'};
  background: ${({ theme }) => theme.colors.background.glass};
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.colors.shadow?.md || "0 8px 24px rgba(0, 0, 0, 0.1)"};
  position: sticky;
  top: 100px;
  height: calc(100vh - 120px);

  @supports (-webkit-backdrop-filter: none) or (backdrop-filter: none) {
    -webkit-backdrop-filter: blur(20px);
  }
`;

const SidebarHeader = styled.div<{ $isOpen: boolean }>`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  display: flex;
  align-items: center;
  justify-content: ${({ $isOpen }) => $isOpen ? 'space-between' : 'center'};
`;

const SidebarTitle = styled.h2<{ $isOpen: boolean }>`
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
  animation: ${fadeInUp} 0.3s ease;
`;

const ToggleSidebarButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryGradient};
    color: white;
  }

  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
`;

const ChapterSearch = styled.div<{ $isOpen: boolean }>`
  padding: ${({ $isOpen }) => $isOpen ? '1rem 1.5rem' : '1rem 0.5rem'};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
  animation: ${fadeInUp} 0.3s ease;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border?.medium || "rgba(0,0,0,0.1)"};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const ChaptersContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary}40;
    border-radius: 3px;
  }
`;

const ChapterCard = styled.div<{ $active?: boolean; $index: number }>`
  position: relative;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 16px;
  background: ${({ theme, $active }) => 
    $active ? theme.colors.primaryGradient : theme.colors.background.paper};
  border: 1px solid ${({ theme, $active }) => 
    $active ? 'transparent' : theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${slideInFromRight} 0.3s ease;
  animation-delay: ${({ $index }) => $index * 0.05}s;
  animation-fill-mode: both;
  transform-style: preserve-3d;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
    background: linear-gradient(
      135deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  &:hover {
    transform: translateX(-5px) translateY(-2px) rotateY(-5deg);
    box-shadow: ${({ theme }) => theme.colors.shadow?.lg || "0 16px 48px rgba(0, 0, 0, 0.15)"};
    border-color: ${({ theme, $active }) => 
      $active ? 'transparent' : theme.colors.primary};
    
    &::before {
      opacity: 1;
    }
  }
`;

const ChapterInfo = styled.div<{ $active?: boolean }>`
  color: ${({ theme, $active }) =>
    $active ? 'white' : theme.colors.text.primary};
`;

const ChapterNumber = styled.div<{ $active?: boolean }>`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme, $active }) =>
    $active ? 'rgba(255, 255, 255, 0.8)' : theme.colors.text.tertiary};
  margin-bottom: 0.25rem;
`;

const ChapterTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: inherit;
`;

const ChapterStats = styled.div<{ $active?: boolean }>`
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: ${({ theme, $active }) =>
    $active ? 'rgba(255, 255, 255, 0.8)' : theme.colors.text.secondary};
`;

const ChapterStat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }
`;

const ChapterProgress = styled.div<{ $active?: boolean }>`
  margin-top: 0.75rem;
  height: 4px;
  background: ${({ theme, $active }) =>
    $active ? 'rgba(255, 255, 255, 0.2)' : theme.colors.border?.light || 'rgba(0,0,0,0.1)'};
  border-radius: 2px;
  overflow: hidden;
`;

const ChapterProgressBar = styled.div<{ $progress: number; $active?: boolean }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: ${({ theme, $active }) =>
    $active ? 'rgba(255, 255, 255, 0.9)' : theme.colors.primaryGradient};
  border-radius: 2px;
  transition: width 0.5s ease;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    animation: ${shimmer} 2s infinite;
  }
`;

const NewChapterButton = styled.button`
  width: 100%;
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 16px;
  border: 2px dashed ${({ theme }) => theme.colors.primary};
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}10`};
    border-style: solid;
    transform: translateY(-2px);
  }

  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
`;

const EditorContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
`;

const EditorToolbar = styled.div`
  background: ${({ theme }) => theme.colors.background.glass};
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  box-shadow: ${({ theme }) => theme.colors.shadow?.sm || "0 2px 8px rgba(0, 0, 0, 0.05)"};

  @supports (-webkit-backdrop-filter: none) or (backdrop-filter: none) {
    -webkit-backdrop-filter: blur(20px);
  }
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const ChapterTitleInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border?.medium || "rgba(0,0,0,0.1)"};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const WordCountBadge = styled.div`
  padding: 0.5rem 1rem;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 700;
  }

  svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }
`;

const EditorWrapper = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.colors.background.glass};
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.colors.shadow?.lg || "0 16px 48px rgba(0, 0, 0, 0.15)"};
  position: relative;

  @supports (-webkit-backdrop-filter: none) or (backdrop-filter: none) {
    -webkit-backdrop-filter: blur(20px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: ${({ theme }) => theme.colors.primaryGradient};
    opacity: 0.05;
    pointer-events: none;
  }
`;

const EditorContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 24px;
  margin: 1px;
`;

const AIAssistantButton = styled.button<{ $active: boolean }>`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ theme, $active }) => 
    $active ? theme.colors.primaryGradient : theme.colors.background.paper};
  border: none;
  color: ${({ theme, $active }) => 
    $active ? 'white' : theme.colors.primary};
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.colors.shadow?.xl || "0 24px 64px rgba(0, 0, 0, 0.2)"};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ $active }) => $active && css`
    animation: ${glow} 2s ease-in-out infinite;
  `}

  &:hover {
    transform: scale(1.1) translateY(-4px);
    box-shadow: ${({ theme }) => theme.colors.shadow?.xl || "0 24px 64px rgba(0, 0, 0, 0.2)"}, 
                ${({ theme }) => theme.colors.shadow?.glow || "0 0 20px rgba(59, 130, 246, 0.5)"};
  }

  svg {
    width: 28px;
    height: 28px;
    fill: currentColor;
  }
`;

const AIAssistantPanel = styled.div<{ $active: boolean }>`
  position: fixed;
  bottom: ${({ $active }) => $active ? '2rem' : '-100%'};
  right: 2rem;
  width: 400px;
  max-width: calc(100vw - 4rem);
  max-height: 600px;
  background: ${({ theme }) => theme.colors.background.glass};
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  box-shadow: ${({ theme }) => theme.colors.shadow?.xl || "0 24px 64px rgba(0, 0, 0, 0.2)"};
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${({ $active }) => $active ? 1 : 0};
  transform: ${({ $active }) => $active ? 'scale(1)' : 'scale(0.9)'};
  z-index: 40;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @supports (-webkit-backdrop-filter: none) or (backdrop-filter: none) {
    -webkit-backdrop-filter: blur(20px);
  }
`;

const AIHeader = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.primaryGradient};
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AITitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
  }
`;

const AICloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
`;

const AIContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
`;

const AISuggestionsGrid = styled.div`
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const AISuggestion = styled.button`
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}10`};
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }

  svg {
    width: 20px;
    height: 20px;
    fill: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
  }
`;

const AIActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const AIActionButton = styled.button`
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryGradient};
    color: white;
    border-color: transparent;
    transform: translateY(-2px);
  }

  svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
  }
`;

const AIFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  background: ${({ theme }) => theme.colors.background.paper};
`;

const AIInputForm = styled.form`
  display: flex;
  gap: 0.75rem;
`;

const AIInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border?.medium || "rgba(0,0,0,0.1)"};
  background: ${({ theme }) => theme.colors.background.main};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

const AISubmitButton = styled.button`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.colors.primaryGradient};
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.colors.shadow?.md || "0 8px 24px rgba(0, 0, 0, 0.1)"};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
`;

// Loading State
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.gradient};
`;

const LoadingAnimation = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  margin-bottom: 2rem;
  animation: ${float} 3s ease-in-out infinite;
`;

const LoadingBook = styled.div`
  width: 120px;
  height: 160px;
  background: ${({ theme }) => theme.colors.primaryGradient};
  border-radius: 8px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: ${({ theme }) => theme.colors.shadow?.xl || "0 24px 64px rgba(0, 0, 0, 0.2)"};
  
  &::before {
    content: '';
    position: absolute;
    inset: 10px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: translateX(-50%) rotate(0deg); }
    100% { transform: translateX(-50%) rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

// Error State
const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.gradient};
  padding: 2rem;
`;

const ErrorCard = styled.div`
  background: ${({ theme }) => theme.colors.background.glass};
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: ${({ theme }) => theme.colors.shadow?.xl || "0 24px 64px rgba(0, 0, 0, 0.2)"};
`;

const ErrorIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  background: ${({ theme }) => `${theme.colors.error}15`};
  color: ${({ theme }) => theme.colors.error};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
`;

const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.75rem 0;
`;

const ErrorMessage = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 2rem 0;
  line-height: 1.6;
`;

// SVG Icons
const PenIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
    <path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75L3 17.25z"/>
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

const ArrowBackIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
  </svg>
);

const WordCountIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);

const AIBrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 9v6c0 1.1-.9 2-2 2h-1c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2H4c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h1c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2h1c1.1 0 2 .9 2 2zm-5-2c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V7zm3 2c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1v-4c0-.55-.45-1-1-1zM5 10c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1v-4zm4 0v2h2v3h2v-3h2v-2H9zm3 6c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
  </svg>
);

const LightbulbIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);

interface StatsData {
  livros: number;
  capitulos: number;
  palavras: number;
  progresso: number;
}

const EditorPage: React.FC = () => {
  const { bookId, chapterId } = useParams<Record<string, string | undefined>>();
  const navigate = useNavigate();
  const [livro, setLivro] = useState<any>(null);
  const [capitulos, setCapitulos] = useState<Capitulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [wordCount, setWordCount] = useState(0);
  const [chapterTitle, setChapterTitle] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [aiAssistantActive, setAiAssistantActive] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize dark mode preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'true');
    } else {
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDarkMode);
    }
  }, []);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  // Load book and chapters data
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
            
            if (capituloAtual.conteudo) {
              const words = capituloAtual.conteudo.split(/\s+/).filter(Boolean).length;
              setWordCount(words);
            }
          } else if (capitulosData && capitulosData.length > 0) {
            navigate(`/editor/${bookId}/${capitulosData[0].id}`, { replace: true });
          }
        } else if (capitulosData && capitulosData.length > 0) {
          navigate(`/editor/${bookId}/${capitulosData[0].id}`, { replace: true });
        }
      } catch (error) {
        console.error('Erro ao carregar livro:', error);
        setErro('Não foi possível carregar as informações do livro.');
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };

    carregarLivro();

    // Check online status
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [bookId, chapterId, navigate]);

  // Auto-save with debounce
  const simulateAutoSave = useCallback(() => {
    if (chapterId) {
      setSaveStatus('saving');
      
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      
      saveTimerRef.current = setTimeout(() => {
        // Here you would actually save to database
        setSaveStatus('saved');
        
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      }, 1000);
    }
  }, [chapterId]);

  const handleEditorChange = (content: string) => {
    if (content) {
      const words = content.split(/\s+/).filter(Boolean).length;
      setWordCount(words);
    } else {
      setWordCount(0);
    }
    
    simulateAutoSave();
  };

  const handleChapterTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChapterTitle(e.target.value);
    simulateAutoSave();
  };

  const filteredCapitulos = capitulos.filter(capitulo =>
    capitulo.titulo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const aiSuggestions = [
    { icon: <LightbulbIcon />, text: "Melhorar a descrição desta cena" },
    { icon: <LightbulbIcon />, text: "Adicionar mais diálogo entre os personagens" },
    { icon: <LightbulbIcon />, text: "Desenvolver melhor o conflito" },
    { icon: <LightbulbIcon />, text: "Expandir a caracterização do protagonista" },
    { icon: <LightbulbIcon />, text: "Revisar ritmo e pacing da narrativa" }
  ];

  const aiActions = [
    { icon: <LightbulbIcon />, name: "Aprimorar" },
    { icon: <LightbulbIcon />, name: "Resumir" },
    { icon: <LightbulbIcon />, name: "Expandir" },
    { icon: <LightbulbIcon />, name: "Corrigir" },
    { icon: <LightbulbIcon />, name: "Reescrever" },
    { icon: <LightbulbIcon />, name: "Sugerir" }
  ];

  if (loading) {
    return (
      <ThemeProvider theme={isDarkMode ? editorTheme.dark : editorTheme.light}>
        <GlobalStyle />
        <LoadingContainer>
          <LoadingAnimation>
            <LoadingBook />
          </LoadingAnimation>
          <LoadingText>Preparando seu ambiente de escrita...</LoadingText>
        </LoadingContainer>
      </ThemeProvider>
    );
  }

  if (erro || !livro) {
    return (
      <ThemeProvider theme={isDarkMode ? editorTheme.dark : editorTheme.light}>
        <GlobalStyle />
        <ErrorContainer>
          <ErrorCard>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorTitle>Ops, algo deu errado!</ErrorTitle>
            <ErrorMessage>
              {erro || 'Não foi possível carregar as informações do livro. Por favor, tente novamente.'}
            </ErrorMessage>
            <ActionButton onClick={() => navigate('/dashboard')}>
              <ArrowBackIcon />
              Voltar para Dashboard
            </ActionButton>
          </ErrorCard>
        </ErrorContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={isDarkMode ? editorTheme.dark : editorTheme.light}>
      <GlobalStyle />
      <EditorPageContainer>
        <EditorHeader>
          <HeaderContent>
            <LogoSection>
              <Logo>
                <PenIcon />
                Escritor
              </Logo>
              <BookTitle>{livro["Nome do livro"] || livro.titulo || "Sem título"}</BookTitle>
            </LogoSection>
            
            <HeaderControls>
              <StatusIndicator $status={saveStatus === 'saving' ? 'saving' : saveStatus === 'saved' ? 'saved' : isOnline ? 'online' : 'offline'}>
                {saveStatus === 'saving' ? 'Salvando...' : 
                 saveStatus === 'saved' ? 'Salvo' :
                 isOnline ? 'Online' : 'Offline'}
              </StatusIndicator>
              
              <ThemeToggleButton onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? '☀️' : '🌙'}
              </ThemeToggleButton>
              
              <ActionButton onClick={() => navigate('/dashboard')}>
                <ArrowBackIcon />
                Dashboard
              </ActionButton>
            </HeaderControls>
          </HeaderContent>
        </EditorHeader>

        <MainLayout>
          <Sidebar $isOpen={sidebarOpen}>
            <SidebarHeader $isOpen={sidebarOpen}>
              {sidebarOpen && <SidebarTitle $isOpen={sidebarOpen}>Capítulos</SidebarTitle>}
              <ToggleSidebarButton onClick={() => setSidebarOpen(!sidebarOpen)}>
                <MenuIcon />
              </ToggleSidebarButton>
            </SidebarHeader>

            {sidebarOpen && (
              <ChapterSearch $isOpen={sidebarOpen}>
                <SearchInput
                  placeholder="Buscar capítulos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </ChapterSearch>
            )}

            <ChaptersContainer>
              {filteredCapitulos.map((capitulo, index) => (
                <ChapterCard
                  key={capitulo.id}
                  $active={capitulo.id === chapterId}
                  $index={index}
                  onClick={() => navigate(`/editor/${bookId}/${capitulo.id}`)}
                >
                  <ChapterInfo $active={capitulo.id === chapterId}>
                    <ChapterNumber $active={capitulo.id === chapterId}>
                      Capítulo {index + 1}
                    </ChapterNumber>
                    <ChapterTitle>{capitulo.titulo || 'Sem título'}</ChapterTitle>
                    <ChapterStats $active={capitulo.id === chapterId}>
                      <ChapterStat>
                        <WordCountIcon />
                        {capitulo.conteudo ? capitulo.conteudo.split(/\s+/).filter(Boolean).length : 0} palavras
                      </ChapterStat>
                    </ChapterStats>
                  </ChapterInfo>
                  <ChapterProgress $active={capitulo.id === chapterId}>
                    <ChapterProgressBar 
                      $progress={Math.floor(Math.random() * 100)} 
                      $active={capitulo.id === chapterId}
                    />
                  </ChapterProgress>
                </ChapterCard>
              ))}

              <NewChapterButton onClick={() => navigate(`/editor/${bookId}`)}>
                <PlusIcon />
                Novo Capítulo
              </NewChapterButton>
            </ChaptersContainer>
          </Sidebar>

          <EditorContent>
            <EditorToolbar>
              <ToolbarLeft>
                <ChapterTitleInput
                  placeholder="Título do capítulo"
                  value={chapterTitle}
                  onChange={handleChapterTitleChange}
                />
              </ToolbarLeft>
              <ToolbarRight>
                <WordCountBadge>
                  <WordCountIcon />
                  Palavras: <span>{wordCount}</span>
                </WordCountBadge>
              </ToolbarRight>
            </EditorToolbar>

            <EditorWrapper>
              <EditorContainer>
                <EditorAvancado
                  livroId={parseInt(bookId!)}
                  capituloId={chapterId}
                  onContentChange={handleEditorChange}
                />
              </EditorContainer>
            </EditorWrapper>
          </EditorContent>
        </MainLayout>

        <AIAssistantButton
          $active={aiAssistantActive}
          onClick={() => setAiAssistantActive(!aiAssistantActive)}
        >
          <AIBrainIcon />
        </AIAssistantButton>

        <AIAssistantPanel $active={aiAssistantActive}>
          <AIHeader>
            <AITitle>
              <AIBrainIcon />
              Assistente de Escrita
            </AITitle>
            <AICloseButton onClick={() => setAiAssistantActive(false)}>
              <CloseIcon />
            </AICloseButton>
          </AIHeader>

          <AIContent>
            <AISuggestionsGrid>
              {aiSuggestions.map((suggestion, index) => (
                <AISuggestion key={index}>
                  {suggestion.icon}
                  {suggestion.text}
                </AISuggestion>
              ))}
            </AISuggestionsGrid>

            <AIActionsGrid>
              {aiActions.map((action) => (
                <AIActionButton key={action.name}>
                  {action.icon}
                  {action.name}
                </AIActionButton>
              ))}
            </AIActionsGrid>
          </AIContent>

          <AIFooter>
            <AIInputForm onSubmit={(e) => { e.preventDefault(); setAiPrompt(''); }}>
              <AIInput
                placeholder="Peça ajuda para melhorar seu texto..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <AISubmitButton type="submit" disabled={!aiPrompt.trim()}>
                <SendIcon />
              </AISubmitButton>
            </AIInputForm>
          </AIFooter>
        </AIAssistantPanel>
      </EditorPageContainer>
    </ThemeProvider>
  );
};

export default EditorPage;