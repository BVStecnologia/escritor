import styled from 'styled-components';

export const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 1rem;
`;

export const ToolbarLeft = styled.div`
  flex: 1;
`;

export const ChapterTitleInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  border: 1px solid ${({ theme }) => theme.colors.border?.light || "rgba(0,0,0,0.1)"};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.colors.shadow?.md || "0 8px 24px rgba(0, 0, 0, 0.1)"};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }
`;

export const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: 1rem;
`;

export const WordCountBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 24px;
  font-size: 0.875rem;
  background: transparent;
  color: ${({ theme }) => theme.isDarkMode ? '#aaaaaa' : '#555555'};
  transition: all 0.3s ease;
  
  svg {
    width: 16px;
    height: 16px;
    opacity: 0.8;
    color: ${({ theme }) => theme.isDarkMode ? '#aaaaaa' : '#555555'};
  }

  .count-label {
    color: ${({ theme }) => theme.isDarkMode ? '#aaaaaa' : '#555555'};
  }

  .count-value {
    font-weight: 600;
    color: ${({ theme }) => theme.isDarkMode ? '#cccccc' : theme.colors.primary};
  }
`;

export const EditorWrapper = styled.div`
  flex: 1;
  overflow: hidden;
  border-radius: 24px;
  box-shadow: ${({ theme }) => theme.colors.shadow?.lg || "0 16px 48px rgba(0, 0, 0, 0.15)"};
  background: ${({ theme }) => theme.colors.background.paper};
  display: flex;
  flex-direction: column;
  position: relative;
  
  .word-count-floating {
    position: absolute;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
  }
`;

export const EditorContainer = styled.div`
  flex: 1;
  overflow: hidden;
`;