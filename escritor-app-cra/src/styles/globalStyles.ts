import { createGlobalStyle } from 'styled-components';
import { Theme } from './theme';

const GlobalStyles = createGlobalStyle<{ theme: Theme }>`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html, body {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.colors.light};
    color: ${({ theme }) => theme.colors.dark};
    line-height: 1.6;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.heading};
    margin-bottom: ${({ theme }) => theme.space.md};
    font-weight: 600;
    line-height: 1.3;
  }
  
  h1 {
    font-size: ${({ theme }) => theme.fontSizes['4xl']};
  }
  
  h2 {
    font-size: ${({ theme }) => theme.fontSizes['3xl']};
  }
  
  h3 {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
  }
  
  h4 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
  
  p {
    margin-bottom: ${({ theme }) => theme.space.md};
  }
  
  a {
    color: ${({ theme }) => theme.colors.secondary};
    text-decoration: none;
    transition: ${({ theme }) => theme.transitions.normal};
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  button {
    cursor: pointer;
    font-family: ${({ theme }) => theme.fonts.body};
  }
  
  ul, ol {
    margin-left: ${({ theme }) => theme.space.xl};
    margin-bottom: ${({ theme }) => theme.space.md};
  }
`;

export default GlobalStyles;