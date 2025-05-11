import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes, css, ThemeProvider } from 'styled-components';
import EditorAvancado from '../components/EditorAvancado';
import { dbService, Capitulo } from '../services/dbService';
import { Button, Title, Text } from '../components/styled';

// =============== ANIMAÇÕES ===============
const pulse = keyframes`
  0% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0.6; transform: scale(1); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
  50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.8); }
  100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// =============== TEMA ===============
const editorTheme = {
  light: {
    colors: {
      background: {
        main: '#f5f7fa',
        paper: '#ffffff',
        sidebar: 'rgba(255, 255, 255, 0.9)',
        header: 'rgba(255, 255, 255, 0.85)',
        light: '#ffffff',
        dark: '#e0e7ff',
        gradient: 'linear-gradient(135deg, #f0f6ff 0%, #e0e7ff 100%)'
      },
      primary: '#8B5CF6',
      primaryLight: '#a78bfa',
      primaryDark: '#7c3aed',
      secondary: '#3B82F6',
      secondaryLight: '#60a5fa',
      secondaryDark: '#2563eb',
      accent: '#f72585',
      accentLight: '#ff758f',
      accentDark: '#b5179e',
      success: '#10b981',
      error: '#ef4444',
      danger: '#ef4444',
      warning: '#f59e0b',
      dark: '#1e293b',
      light: '#f8f9fa',
      text: {
        primary: '#1e293b',
        secondary: '#475569',
        tertiary: '#64748b',
        light: '#f8f9fa'
      },
      gray: {
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a'
      },
      white: '#ffffff',
      black: '#000000'
    },
    shadows: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
      secondary: 'linear-gradient(135deg, #3B82F6 0%, #4CC9F0 100%)',
      accent: 'linear-gradient(135deg, #f72585 0%, #b5179e 100%)',
      background: 'linear-gradient(135deg, #f0f6ff 0%, #e0e7ff 100%)',
      highlight: 'linear-gradient(90deg, #8B5CF6 0%, #3B82F6 100%)',
      subtle: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)'
    },
    fonts: {
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif",
      heading: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeights: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    space: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem',
    },
    radii: {
      none: '0',
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px',
    },
    breakpoints: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    transitions: {
      fast: '0.15s ease-in-out',
      normal: '0.3s ease-in-out',
      slow: '0.5s ease-in-out',
    },
    zIndices: {
      hide: -1,
      auto: 'auto',
      base: 0,
      docked: 10,
      dropdown: 1000,
      sticky: 1100,
      banner: 1200,
      overlay: 1300,
      modal: 1400,
      popover: 1500,
      toast: 1600,
      tooltip: 1700,
    }
  },
  dark: {
    colors: {
      background: {
        main: '#0f172a',
        paper: '#1e293b',
        sidebar: 'rgba(30, 41, 59, 0.95)',
        header: 'rgba(15, 23, 42, 0.9)',
        light: '#1e293b',
        dark: '#0f172a',
        gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      },
      primary: '#a78bfa',
      primaryLight: '#c4b5fd',
      primaryDark: '#7c3aed',
      secondary: '#60a5fa',
      secondaryLight: '#93c5fd',
      secondaryDark: '#2563eb',
      accent: '#f472b6',
      accentLight: '#f9a8d4',
      accentDark: '#db2777',
      success: '#34d399',
      error: '#f87171',
      danger: '#f87171',
      warning: '#fbbf24',
      dark: '#f8fafc',
      light: '#0f172a',
      text: {
        primary: '#f1f5f9',
        secondary: '#e2e8f0',
        tertiary: '#cbd5e1',
        light: '#f8fafc'
      },
      gray: {
        100: '#1e293b',
        200: '#334155',
        300: '#475569',
        400: '#64748b',
        500: '#94a3b8',
        600: '#cbd5e1',
        700: '#e2e8f0',
        800: '#f1f5f9',
        900: '#f8fafc'
      },
      white: '#f8fafc',
      black: '#000000'
    },
    shadows: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
      '2xl': '0 24px 48px -12px rgba(0, 0, 0, 0.25)',
      xs: '0 1px 2px rgba(0, 0, 0, 0.1)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)',
      secondary: 'linear-gradient(135deg, #60a5fa 0%, #38bdf8 100%)',
      accent: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      highlight: 'linear-gradient(90deg, #a78bfa 0%, #60a5fa 100%)',
      subtle: 'linear-gradient(180deg, rgba(30,41,59,0.5) 0%, rgba(30,41,59,0) 100%)'
    },
    fonts: {
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif",
      heading: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeights: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    space: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem',
    },
    radii: {
      none: '0',
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px',
    },
    breakpoints: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    transitions: {
      fast: '0.15s ease-in-out',
      normal: '0.3s ease-in-out',
      slow: '0.5s ease-in-out',
    },
    zIndices: {
      hide: -1,
      auto: 'auto',
      base: 0,
      docked: 10,
      dropdown: 1000,
      sticky: 1100,
      banner: 1200,
      overlay: 1300,
      modal: 1400,
      popover: 1500,
      toast: 1600,
      tooltip: 1700,
    }
  }
};

// =============== COMPONENTES ESTILIZADOS ===============
const EditorPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background.main};
  background-image: ${({ theme }) => 
    `radial-gradient(circle at 10% 20%, ${theme.colors.primary}15 0%, transparent 20%),
    radial-gradient(circle at 85% 60%, ${theme.colors.secondary}10 0%, transparent 30%)`};
  position: relative;
  overflow: hidden;
`;

const EditorHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.background.header};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  position: relative;
  z-index: 50;

  @media (min-width: 768px) {
    padding: 0.75rem 2rem;
  }
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
`;

const LogoText = styled.span`
  font-weight: 700;
  font-size: 1.25rem;
  background: ${({ theme }) => theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;

  &::before {
    content: "✏️";
    margin-right: 0.5rem;
    -webkit-text-fill-color: initial;
  }
`;

const BookTitle = styled.span`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-left: 1rem;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;

  &:before {
    content: '•';
    margin-right: 0.5rem;
    color: ${({ theme }) => theme.colors.gray[400]};
  }

  @media (min-width: 768px) {
    max-width: 300px;
    font-size: 1.125rem;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 50%;
    width: 0;
    height: 2px;
    background: ${({ theme }) => theme.gradients.primary};
    transform: translateX(-50%);
    transition: width 0.3s ease;
  }

  &:hover::after {
    width: 100%;
  }
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;

  @media (min-width: 768px) {
    gap: 1rem;
  }
`;

const EditorModeSwitch = styled.div`
  display: none;
  
  @media (min-width: 768px) {
    display: flex;
    background: ${({ theme }) => theme.colors.gray[100]};
    border-radius: 8px;
    padding: 0.25rem;
    box-shadow: ${({ theme }) => theme.shadows.inner};
    position: relative;
  }
`;

const ModeButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 2;
  background: transparent;
  color: ${({ active, theme }) => active ? theme.colors.text.primary : theme.colors.text.tertiary};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ModeSwitchBackground = styled.div<{ editMode: boolean }>`
  position: absolute;
  top: 0.25rem;
  left: ${({ editMode }) => editMode ? '0.25rem' : '50%'};
  width: calc(50% - 0.5rem);
  height: calc(100% - 0.5rem);
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: left 0.3s ease;
  z-index: 1;
`;

const StatusBadge = styled.div<{ online?: boolean }>`
  display: flex;
  align-items: center;
  background: ${({ online, theme }) =>
    online ? `${theme.colors.success}20` : `${theme.colors.error}20`};
  color: ${({ online, theme }) =>
    online ? theme.colors.success : theme.colors.error};
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 0.5rem;
  border: 1px solid ${({ online, theme }) =>
    online ? `${theme.colors.success}30` : `${theme.colors.error}30`};
  transition: all 0.3s ease;
  white-space: nowrap;

  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ online, theme }) =>
      online ? theme.colors.success : theme.colors.error};
    margin-right: 0.375rem;
    animation: ${({ online }) => online ? 'none' : css`${pulse} 2s infinite`};
  }

  @media (max-width: 768px) {
    padding: 0.25rem 0.5rem;
    span {
      display: none;
    }
  }
`;

const SaveStatus = styled.div<{ status: string }>`
  display: none;
  
  @media (min-width: 992px) {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    color: ${({ status, theme }) => 
      status === 'saving' ? theme.colors.warning :
      status === 'saved' ? theme.colors.success :
      theme.colors.gray[400]};
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    font-weight: 500;
    
    &::before {
      content: '';
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: ${({ status, theme }) => 
        status === 'saving' ? theme.colors.warning :
        status === 'saved' ? theme.colors.success :
        theme.colors.gray[400]};
      margin-right: 0.375rem;
      
      ${({ status }) => status === 'saving' && css`
        animation: ${pulse} 1s infinite;
      `}
    }
  }
`;

const ThemeToggle = styled.button<{ $isDark: boolean }>`
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &::before {
    content: ${({ $isDark }) => $isDark ? '"🌙"' : '"☀️"'};
    font-size: 1.25rem;
  }
`;

const EditorLayout = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const SidebarWrapper = styled.div<{ isOpen: boolean }>`
  width: ${({ isOpen }) => isOpen ? '280px' : '0'};
  background-color: ${({ theme }) => theme.colors.background.sidebar};
  backdrop-filter: blur(10px);
  border-right: 1px solid ${({ theme }) => theme.colors.gray[200]};
  overflow: hidden;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  z-index: 40;

  @media (min-width: 768px) {
    position: relative;
    width: ${({ isOpen }) => isOpen ? '280px' : '60px'};
  }
`;

const SidebarMobileOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 35;
  opacity: ${({ isOpen }) => isOpen ? 1 : 0};
  visibility: ${({ isOpen }) => isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;

  @media (min-width: 768px) {
    display: none;
  }
`;

const SidebarHeader = styled.div<{ collapsed?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ collapsed }) => collapsed ? '1rem 0.75rem' : '1rem 1.25rem'};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const SidebarTitle = styled.h3<{ collapsed?: boolean }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  opacity: ${({ collapsed }) => collapsed ? 0 : 1};
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  
  &::before {
    content: "📑";
    display: block;
    font-size: 1.125rem;
  }
`;

const CollapseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.gray[400]};
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[100]};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const MobileSidebarToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.gray[100]};
  color: ${({ theme }) => theme.colors.text.primary};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 0.75rem;
  
  &:hover {
    background: ${({ theme }) => theme.colors.gray[200]};
  }
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const SearchBar = styled.div<{ collapsed?: boolean }>`
  padding: ${({ collapsed }) => collapsed ? '0' : '0.75rem 1.25rem'};
  height: ${({ collapsed }) => collapsed ? '0' : 'auto'};
  opacity: ${({ collapsed }) => collapsed ? '0' : '1'};
  overflow: hidden;
  transition: all 0.3s ease;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.625rem 1rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background-color: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}30`};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
  }
`;

const ChapterListWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.gray[300]};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.gray[400]};
  }
`;

const ChapterList = styled.ul`
  list-style: none;
  padding: 0.75rem 0;
  margin: 0;
`;

const ChapterItem = styled.li<{ active?: boolean; collapsed?: boolean }>`
  margin: 0 ${({ collapsed }) => collapsed ? '0.5rem' : '1rem'};
  margin-bottom: 0.5rem;
  border-radius: 8px;
  background-color: ${({ active, theme }) => 
    active ? `${theme.colors.primary}10` : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  align-items: center;
  padding: ${({ collapsed }) => collapsed ? '0.625rem 0.375rem' : '0.625rem 0.875rem'};
  animation: ${fadeIn} 0.3s ease forwards;
  
  ${({ active, theme }) => active && `
    border: 1px solid ${theme.colors.primary}30;
    box-shadow: ${theme.shadows.sm};
  `}

  &:hover {
    background-color: ${({ active, theme }) => 
      active ? `${theme.colors.primary}15` : theme.colors.gray[100]};
    transform: translateY(-1px);
  }
  
  &::before {
    content: '';
    position: absolute;
    left: -0.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: ${({ active }) => active ? '70%' : '0'};
    background: ${({ theme }) => theme.gradients.primary};
    border-radius: 0 3px 3px 0;
    transition: height 0.2s ease;
  }
  
  &:hover::before {
    height: ${({ active }) => active ? '70%' : '30%'};
  }
`;

const ChapterIcon = styled.div<{ active?: boolean }>`
  min-width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ active, theme }) => 
    active ? theme.gradients.primary : theme.colors.gray[100]};
  color: ${({ active, theme }) => 
    active ? theme.colors.white : theme.colors.text.secondary};
  font-size: 0.75rem;
  margin-right: 0.75rem;
  transition: all 0.2s ease;
  
  &::before {
    content: "📄";
  }
`;

const ChapterContent = styled.div<{ collapsed?: boolean }>`
  flex: 1;
  display: ${({ collapsed }) => collapsed ? 'none' : 'block'};
  overflow: hidden;
`;

const ChapterTitle = styled.div<{ active?: boolean }>`
  font-size: 0.875rem;
  font-weight: ${({ active }) => active ? '600' : '500'};
  color: ${({ active, theme }) => 
    active ? theme.colors.primary : theme.colors.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.25rem;
`;

const ChapterMeta = styled.div`
  display: flex;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.gray[400]};
  
  span {
    display: flex;
    align-items: center;
    margin-right: 0.75rem;
  }
  
  span::before {
    content: attr(data-icon);
    margin-right: 0.25rem;
  }
`;

const ChapterProgress = styled.div`
  width: 100%;
  height: 3px;
  background-color: ${({ theme }) => theme.colors.gray[100]};
  border-radius: 1.5px;
  margin-top: 0.5rem;
  overflow: hidden;
`;

const ChapterProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  width: ${({ progress }) => `${progress}%`};
  background: ${({ theme }) => theme.gradients.primary};
  border-radius: 1.5px;
  transition: width 0.5s ease;
`;

const EmptyChaptersMessage = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: ${({ theme }) => theme.colors.gray[400]};
  font-size: 0.875rem;
  
  &::before {
    content: "📝";
    display: block;
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
`;

const SidebarFooter = styled.div<{ collapsed?: boolean }>`
  padding: ${({ collapsed }) => collapsed ? '0.75rem 0.5rem' : '0.75rem 1.25rem'};
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const NewChapterButton = styled(Button)<{ collapsed?: boolean }>`
  width: 100%;
  font-weight: 600;
  font-size: 0.875rem;
  background: ${({ theme }) => theme.gradients.primary};
  border: none;
  border-radius: 8px;
  padding: ${({ collapsed }) => collapsed ? '0.625rem' : '0.625rem 1rem'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: ${({ collapsed }) => collapsed ? 'center' : 'flex-start'};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px ${({ theme }) => `${theme.colors.primary}40`};
  text-align: left;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px ${({ theme }) => `${theme.colors.primary}50`};
  }
  
  &::before {
    content: "➕";
    font-size: 0.875rem;
    margin-right: ${({ collapsed }) => collapsed ? '0' : '0.5rem'};
  }
  
  span {
    display: ${({ collapsed }) => collapsed ? 'none' : 'inline'};
  }
`;

const EditorContent = styled.div<{ $sidebarWidth: number }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: 0;
  width: 100%;
  transition: margin-left 0.3s ease, width 0.3s ease;
  position: relative;

  @media (min-width: 768px) {
    margin-left: ${({ $sidebarWidth }) => `${$sidebarWidth}px`};
    width: ${({ $sidebarWidth }) => `calc(100% - ${$sidebarWidth}px)`};
  }
`;

const EditorToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background-color: ${({ theme }) => theme.colors.background.paper};
  
  @media (min-width: 768px) {
    padding: 0.75rem 1.5rem;
  }
`;

const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

const ChapterTitleInput = styled.input`
  flex: 1;
  max-width: 400px;
  background-color: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: 6px;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}30`};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
  }
`;

const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const WordCount = styled.div`
  background-color: ${({ theme }) => theme.colors.gray[100]};
  border-radius: 6px;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  font-weight: 500;
  
  &::before {
    content: "📊";
    margin-right: 0.375rem;
  }
  
  span {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-left: 0.25rem;
  }
`;

const EditorWrapper = styled.div`
  flex: 1;
  overflow: auto;
  padding: 1rem;
  display: flex;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background.main};
  position: relative;
  
  @media (min-width: 768px) {
    padding: 1.5rem;
  }
  
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.gray[300]};
    border-radius: 3px;
  }
`;

const EditorContainer = styled.div`
  width: 100%;
  max-width: 900px;
  min-height: 100%;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  
  &:focus-within {
    box-shadow: ${({ theme }) => theme.shadows.xl}, 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
  }
`;

const AIAssistantToggle = styled.button<{ active: boolean }>`
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${({ theme, active }) => active 
    ? theme.gradients.primary
    : theme.colors.background.paper};
  color: ${({ theme, active }) => active 
    ? theme.colors.white 
    : theme.colors.primary};
  border: 1px solid ${({ theme, active }) => active 
    ? 'transparent' 
    : theme.colors.gray[200]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 100;
  
  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }
  
  &::before {
    content: "🧠";
  }
  
  ${({ active }) => active && css`
    animation: ${pulse} 2s infinite;
  `}
`;

const AIAssistantPanel = styled.div<{ active: boolean }>`
  position: fixed;
  bottom: ${({ active }) => active ? '1.5rem' : '-100%'};
  right: 1.5rem;
  width: 320px;
  max-width: calc(100vw - 3rem);
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  transition: bottom 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  max-height: 60vh;
  z-index: 90;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  opacity: ${({ active }) => active ? 1 : 0};
`;

const AIAssistantHeader = styled.div`
  background: ${({ theme }) => theme.gradients.primary};
  padding: 0.75rem 1rem;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    
    &::before {
      content: "🧠";
      margin-right: 0.5rem;
    }
  }
  
  button {
    background: transparent;
    border: none;
    color: white;
    width: 24px;
    height: 24px;
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 1;
    }
    
    &::before {
      content: "✖";
      font-size: 0.875rem;
    }
  }
`;

const AIAssistantContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.gray[300]};
    border-radius: 2px;
  }
  
  h4 {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    font-weight: 500;
  }
`;

const AISuggestion = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  background-color: ${({ theme }) => `${theme.colors.primary}10`};
  border: 1px solid ${({ theme }) => `${theme.colors.primary}20`};
  border-radius: 8px;
  text-align: left;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}15`};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &::before {
    content: "💡";
    margin-right: 0.5rem;
  }
`;

const AIAssistantActions = styled.div`
  padding: 0.5rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
`;

const AIActionButton = styled.button`
  padding: 0.625rem;
  background-color: ${({ theme }) => theme.colors.gray[100]};
  border: none;
  border-radius: 8px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}15`};
    color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }
  
  &::before {
    content: attr(data-icon);
    font-size: 1.25rem;
  }
`;

const AIAssistantFooter = styled.div`
  padding: 0.75rem;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const AIPromptForm = styled.form`
  display: flex;
  gap: 0.5rem;
`;

const AIPromptInput = styled.input`
  flex: 1;
  padding: 0.625rem 0.875rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background-color: ${({ theme }) => theme.colors.background.main};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}20`};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
  }
`;

const AIPromptButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${({ theme }) => theme.gradients.primary};
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 8px ${({ theme }) => `${theme.colors.primary}40`};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  &::before {
    content: "📤";
    font-size: 1rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
  gap: 2rem;
  background-color: ${({ theme }) => theme.colors.background.main};
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${({ theme }) => `${theme.colors.primary}20`};
  border-radius: 50%;
  border-top-color: ${({ theme }) => theme.colors.primary};
  animation: ${rotate} 1s ease-in-out infinite;
`;

const LoadingText = styled(Text)`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  font-weight: 500;
`;

const LoadingBook = styled.div`
  width: 160px;
  height: 220px;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  position: relative;
  overflow: hidden;
  animation: ${float} 3s ease-in-out infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 30px;
    background: ${({ theme }) => theme.gradients.primary};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 60px;
    left: 20px;
    right: 20px;
    height: 10px;
    background: ${({ theme }) => theme.colors.gray[200]};
    box-shadow: 0 30px 0 ${({ theme }) => theme.colors.gray[200]},
                0 60px 0 ${({ theme }) => theme.colors.gray[200]},
                0 90px 0 ${({ theme }) => theme.colors.gray[200]};
  }
`;

const ErrorContainer = styled.div`
  max-width: 500px;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: 12px;
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: 1rem;
  
  &::before {
    content: "⚠️";
  }
`;

// =============== COMPONENTE PRINCIPAL ===============
const EditorPage: React.FC = () => {
  const { bookId, chapterId } = useParams<Record<string, string | undefined>>();
  const navigate = useNavigate();
  const [livro, setLivro] = useState<any>(null);
  const [capitulos, setCapitulos] = useState<Capitulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [wordCount, setWordCount] = useState(0);
  const [chapterTitle, setChapterTitle] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [aiAssistantActive, setAiAssistantActive] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const saveTimerRef = useRef<any>(null);

  // Simular sugestões do assistente de IA
  const aiSuggestions = [
    "Melhorar a descrição desta cena",
    "Adicionar mais diálogo entre os personagens",
    "Revisar erros gramaticais",
    "Desenvolver melhor este personagem",
    "Adicionar mais detalhes sensoriais"
  ];

  // Ações rápidas de IA
  const aiActions = [
    { name: "Revisar", icon: "🔍" },
    { name: "Resumir", icon: "📝" },
    { name: "Expandir", icon: "📈" },
    { name: "Corrigir", icon: "✅" },
    { name: "Reescrever", icon: "♻️" },
    { name: "Ideias", icon: "💡" }
  ];

  // Carregar dados do livro e capítulos
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

        // Se tiver chapterId na URL, verificar se é válido
        if (chapterId) {
          const capituloAtual = capitulosData?.find(cap => cap.id === chapterId);
          if (capituloAtual) {
            setChapterTitle(capituloAtual.titulo || '');
            
            // Contar palavras
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
        // Simulação de carregamento para mostrar o estado de loading
        setTimeout(() => setLoading(false), 1500);
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
      clearTimeout(saveTimerRef.current);
    };
  }, [bookId, chapterId, navigate]);

  // Simular salvamento automático
  const simulateAutoSave = () => {
    if (chapterId) {
      setSaveStatus('saving');
      
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        setSaveStatus('saved');
        
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      }, 1000);
    }
  };

  // Manipuladores de eventos
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
      // Em dispositivos móveis, fechar o sidebar
      if (window.innerWidth < 768) {
        setSidebarMobileOpen(false);
      }
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setSidebarMobileOpen(!sidebarMobileOpen);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleAiAssistant = () => {
    setAiAssistantActive(!aiAssistantActive);
  };

  const handleChapterTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChapterTitle(e.target.value);
    simulateAutoSave();
  };

  const handleAiPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Processando prompt IA:", aiPrompt);
    setAiPrompt('');
  };

  const handleEditorChange = (content: string) => {
    // Contar palavras
    if (content) {
      const words = content.split(/\s+/).filter(Boolean).length;
      setWordCount(words);
    } else {
      setWordCount(0);
    }
    
    // Simular auto-save
    simulateAutoSave();
  };

  // Filtrar capítulos com base na pesquisa
  const filterCapitulos = () => {
    if (!searchTerm.trim()) return capitulos;
    
    return capitulos.filter(capitulo => 
      capitulo.titulo?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Calcular a largura efetiva da sidebar para o layout responsivo
  const getSidebarWidth = () => {
    if (window.innerWidth < 768) return 0;
    return sidebarOpen ? 280 : 60;
  };

  // Obter status de salvamento
  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving': return 'Salvando...';
      case 'saved': return 'Salvo com sucesso';
      default: return 'Todas alterações salvas';
    }
  };

  // Tela de carregamento
  if (loading) {
    return (
      <ThemeProvider theme={isDarkMode ? editorTheme.dark : editorTheme.light}>
        <LoadingContainer>
          <LoadingBook />
          <LoadingText>Preparando o editor...</LoadingText>
        </LoadingContainer>
      </ThemeProvider>
    );
  }

  // Tela de erro
  if (erro || !livro) {
    return (
      <ThemeProvider theme={isDarkMode ? editorTheme.dark : editorTheme.light}>
        <LoadingContainer>
          <ErrorContainer>
            <ErrorIcon />
            <Title style={{ marginBottom: '1rem' }}>
              Ops, algo deu errado!
            </Title>
            <Text style={{ marginBottom: '2rem' }}>
              {erro || 'Não foi possível carregar este livro. Verifique a conexão e tente novamente.'}
            </Text>
            <Button 
              variant="primary" 
              onClick={handleVoltarDashboard}
              style={{
                background: isDarkMode ? editorTheme.dark.gradients.primary : editorTheme.light.gradients.primary,
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                boxShadow: isDarkMode ? editorTheme.dark.shadows.md : editorTheme.light.shadows.md
              }}
            >
              Voltar para o Dashboard
            </Button>
          </ErrorContainer>
        </LoadingContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={isDarkMode ? editorTheme.dark : editorTheme.light}>
      <EditorPageContainer>
        <EditorHeader>
          <HeaderTitle>
            <MobileSidebarToggle onClick={toggleMobileSidebar}>
              ☰
            </MobileSidebarToggle>
            <LogoText>Escritor</LogoText>
            <BookTitle title={livro["Nome do livro"] || livro.titulo}>
              {livro["Nome do livro"] || livro.titulo}
            </BookTitle>
          </HeaderTitle>

          <HeaderControls>
            <EditorModeSwitch>
              <ModeButton 
                active={editMode} 
                onClick={() => setEditMode(true)}
              >
                Editar
              </ModeButton>
              <ModeButton 
                active={!editMode} 
                onClick={() => setEditMode(false)}
              >
                Visualizar
              </ModeButton>
              <ModeSwitchBackground editMode={editMode} />
            </EditorModeSwitch>
            
            <SaveStatus status={saveStatus}>
              {getSaveStatusText()}
            </SaveStatus>
            
            <StatusBadge online={isOnline}>
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </StatusBadge>
            
            <ThemeToggle
              $isDark={isDarkMode}
              onClick={toggleTheme}
              title={isDarkMode ? "Mudar para tema claro" : "Mudar para tema escuro"}
            />
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleVoltarDashboard}
              style={{
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.875rem',
                padding: '0.5rem 0.75rem'
              }}
            >
              Dashboard
            </Button>
          </HeaderControls>
        </EditorHeader>

        <EditorLayout>
          {/* Sidebar mobile overlay */}
          <SidebarMobileOverlay 
            isOpen={sidebarMobileOpen} 
            onClick={() => setSidebarMobileOpen(false)} 
          />
          
          {/* Sidebar */}
          <SidebarWrapper isOpen={window.innerWidth >= 768 ? true : sidebarMobileOpen}>
            <SidebarHeader collapsed={!sidebarOpen && window.innerWidth >= 768}>
              <SidebarTitle collapsed={!sidebarOpen && window.innerWidth >= 768}>
                Capítulos
              </SidebarTitle>
              {window.innerWidth >= 768 && (
                <CollapseButton onClick={toggleSidebar}>
                  {sidebarOpen ? '◀' : '▶'}
                </CollapseButton>
              )}
            </SidebarHeader>

            {(sidebarOpen || window.innerWidth < 768) && (
              <SearchBar>
                <SearchInput 
                  placeholder="Buscar capítulos..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchBar>
            )}

            <ChapterListWrapper>
              <ChapterList>
                {filterCapitulos().length > 0 ? (
                  filterCapitulos().map((capitulo) => (
                    <ChapterItem
                      key={capitulo.id}
                      active={capitulo.id === chapterId}
                      collapsed={!sidebarOpen && window.innerWidth >= 768}
                      onClick={() => handleSelectCapitulo(capitulo.id)}
                    >
                      <ChapterIcon active={capitulo.id === chapterId} />
                      <ChapterContent collapsed={!sidebarOpen && window.innerWidth >= 768}>
                        <ChapterTitle active={capitulo.id === chapterId}>
                          {capitulo.titulo || 'Sem título'}
                        </ChapterTitle>
                        
                        {(sidebarOpen || window.innerWidth < 768) && (
                          <>
                            <ChapterMeta>
                              <span data-icon="🔤">
                                {capitulo.conteudo ? capitulo.conteudo.split(/\s+/).filter(Boolean).length : 0} palavras
                              </span>
                              <span data-icon="⏱️">
                                {Math.floor(Math.random() * 60)} min atrás
                              </span>
                            </ChapterMeta>
                            <ChapterProgress>
                              <ChapterProgressFill progress={Math.floor(Math.random() * 100)} />
                            </ChapterProgress>
                          </>
                        )}
                      </ChapterContent>
                    </ChapterItem>
                  ))
                ) : (
                  <EmptyChaptersMessage>
                    {searchTerm ? 'Nenhum capítulo encontrado' : 'Nenhum capítulo criado ainda'}
                  </EmptyChaptersMessage>
                )}
              </ChapterList>
            </ChapterListWrapper>

            <SidebarFooter collapsed={!sidebarOpen && window.innerWidth >= 768}>
              <NewChapterButton
                collapsed={!sidebarOpen && window.innerWidth >= 768}
                onClick={handleNovoCapitulo}
              >
                <span>Novo Capítulo</span>
              </NewChapterButton>
            </SidebarFooter>
          </SidebarWrapper>

          {/* Conteúdo do Editor */}
          <EditorContent $sidebarWidth={getSidebarWidth()}>
            <EditorToolbar>
              <ToolbarLeft>
                <ChapterTitleInput
                  placeholder="Título do capítulo"
                  value={chapterTitle}
                  onChange={handleChapterTitleChange}
                />
              </ToolbarLeft>
              <ToolbarRight>
                <WordCount>
                  Palavras: <span>{wordCount}</span>
                </WordCount>
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
            
            {/* Assistente de IA */}
            <AIAssistantToggle 
              active={aiAssistantActive}
              onClick={toggleAiAssistant}
              title="Assistente de IA"
            />
            
            <AIAssistantPanel active={aiAssistantActive}>
              <AIAssistantHeader>
                <h3>Assistente de Escrita</h3>
                <button onClick={() => setAiAssistantActive(false)} />
              </AIAssistantHeader>
              
              <AIAssistantContent>
                <h4>Sugestões para melhorar seu texto:</h4>
                {aiSuggestions.map((suggestion, index) => (
                  <AISuggestion key={index}>
                    {suggestion}
                  </AISuggestion>
                ))}
              </AIAssistantContent>
              
              <AIAssistantActions>
                {aiActions.map((action) => (
                  <AIActionButton 
                    key={action.name}
                    data-icon={action.icon}
                    title={`IA: ${action.name}`}
                  >
                    {action.name}
                  </AIActionButton>
                ))}
              </AIAssistantActions>
              
              <AIAssistantFooter>
                <AIPromptForm onSubmit={handleAiPromptSubmit}>
                  <AIPromptInput 
                    placeholder="O que você precisa?" 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                  <AIPromptButton 
                    type="submit"
                    disabled={!aiPrompt.trim()}
                  />
                </AIPromptForm>
              </AIAssistantFooter>
            </AIAssistantPanel>
          </EditorContent>
        </EditorLayout>
      </EditorPageContainer>
    </ThemeProvider>
  );
};

export default EditorPage;