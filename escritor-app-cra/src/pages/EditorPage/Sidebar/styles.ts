import styled, { keyframes } from 'styled-components';

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

export const SidebarContainer = styled.aside<{ $isOpen: boolean }>`
  width: ${({ $isOpen }) => $isOpen ? '320px' : '80px'};
  background: ${({ theme }) => theme.colors.background.glass};
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(255,255,255,0.1)"};
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

export const SidebarHeader = styled.div<{ $isOpen: boolean }>`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(255,255,255,0.1)"};
  display: flex;
  align-items: center;
  justify-content: ${({ $isOpen }) => $isOpen ? 'space-between' : 'center'};
`;

export const SidebarTitle = styled.h2<{ $isOpen: boolean }>`
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
  animation: ${fadeInUp} 0.3s ease;
`;

export const ToggleSidebarButton = styled.button`
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
    color: ${({ theme }) => theme.colors.white || "#ffffff"};
  }

  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
`;

export const ChapterSearch = styled.div<{ $isOpen: boolean }>`
  padding: ${({ $isOpen }) => $isOpen ? '1rem 1.5rem' : '1rem 0.5rem'};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(255,255,255,0.1)"};
  display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
  animation: ${fadeInUp} 0.3s ease;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(255,255,255,0.1)"};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.colors.shadow?.sm || "0 2px 8px rgba(0, 0, 0, 0.05)"};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

export const ChaptersContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  /* Garantir que ainda permaneça visível quando o sidebar estiver recolhido */
  overflow-x: hidden;
  max-width: 100%;

  /* Estilização da scrollbar para ambos os temas */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => 
      theme.isDarkMode 
        ? 'rgba(15, 23, 42, 0.3)' 
        : 'rgba(241, 245, 249, 0.6)'
    };
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => 
      theme.isDarkMode 
        ? 'rgba(100, 116, 139, 0.5)' 
        : 'rgba(148, 163, 184, 0.5)'
    };
    border-radius: 3px;
    
    &:hover {
      background: ${({ theme }) => 
        theme.isDarkMode 
          ? 'rgba(100, 116, 139, 0.7)' 
          : 'rgba(148, 163, 184, 0.7)'
      };
    }
  }
`;

export const ChapterCardContainer = styled.div<{ $active: boolean; $index: number }>`
  padding: 1rem;
  border-radius: 16px;
  background: ${({ theme, $active }) => 
    $active 
      ? theme.isDarkMode 
        ? 'rgba(79, 70, 229, 0.15)' 
        : 'rgba(137, 155, 255, 0.15)'
      : theme.colors.background.paper
  };
  border: 1px solid ${({ theme, $active }) => 
    $active 
      ? theme.isDarkMode 
        ? 'rgba(79, 70, 229, 0.3)' 
        : 'rgba(137, 155, 255, 0.3)'
      : theme.colors.border?.light || "rgba(255,255,255,0.1)"
  };
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${slideInFromRight} 0.4s ease;
  animation-delay: ${({ $index }) => $index * 0.05}s;
  animation-fill-mode: both;
  box-shadow: ${({ theme, $active }) => 
    $active 
      ? theme.isDarkMode
        ? '0 4px 12px rgba(79, 70, 229, 0.1)'
        : '0 4px 12px rgba(59, 130, 246, 0.1)'
      : 'none'
  };
  margin-bottom: 0.5rem;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.colors.shadow?.md || "0 8px 24px rgba(0, 0, 0, 0.1)"};
    background: ${({ theme, $active }) => 
      $active 
        ? theme.isDarkMode
          ? 'rgba(79, 70, 229, 0.2)'
          : 'rgba(137, 155, 255, 0.2)'
        : theme.colors.background.glass
    };
  }
`;

export const ChapterInfo = styled.div<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.text.primary
  };
`;

export const ChapterNumber = styled.div<{ $active: boolean }>`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme, $active }) => 
    $active 
      ? `${theme.colors.primary}` + (theme.isDarkMode ? 'dd' : '80')
      : theme.colors.text.tertiary
  };
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const ChapterTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

export const ChapterStats = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: ${({ theme, $active }) => 
    $active 
      ? theme.isDarkMode
        ? `${theme.colors.text.secondary}`
        : `${theme.colors.text.tertiary}`
      : theme.colors.text.tertiary
  };
`;

export const ChapterStat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  svg {
    width: 12px;
    height: 12px;
    opacity: 0.7;
  }
`;

export const ChapterProgress = styled.div<{ $active: boolean }>`
  margin-top: 0.75rem;
  height: 4px;
  background: ${({ theme, $active }) => 
    $active 
      ? theme.isDarkMode
        ? 'rgba(30, 41, 59, 0.5)'
        : 'rgba(255, 255, 255, 0.2)'
      : theme.isDarkMode 
        ? theme.colors.gray[200] 
        : theme.colors.gray[200]
  };
  border-radius: 2px;
  overflow: hidden;
`;

export const ChapterProgressBar = styled.div<{ $progress: number; $active: boolean }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: ${({ theme, $active }) => 
    $active 
      ? theme.isDarkMode
        ? theme.colors.primary
        : theme.colors.primary
      : theme.colors.primary
  };
  border-radius: 2px;
  transition: width 0.5s ease;
`;

export const NewChapterButton = styled.button`
  margin-top: auto;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px dashed ${({ theme }) => theme.colors.primary + (theme.isDarkMode ? '40' : '50')};
  background: ${({ theme }) => theme.colors.primary + (theme.isDarkMode ? '15' : '10')};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;

  &:hover {
    background: ${({ theme }) => theme.colors.primary + (theme.isDarkMode ? '25' : '20')};
    transform: translateY(-2px);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;