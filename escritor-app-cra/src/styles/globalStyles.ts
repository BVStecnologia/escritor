import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html, body {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.colors.background.main};
    color: ${({ theme }) => theme.colors.text.primary};
    line-height: ${({ theme }) => theme.lineHeights.normal};
  }
  
  #root {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.heading};
    margin-bottom: ${({ theme }) => theme.space.md};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    line-height: ${({ theme }) => theme.lineHeights.tight};
    color: ${({ theme }) => theme.colors.text.primary};
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
    line-height: ${({ theme }) => theme.lineHeights.relaxed};
  }
  
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: ${({ theme }) => theme.transitions.normal};
    
    &:hover {
      color: ${({ theme }) => theme.colors.primaryDark};
    }
  }
  
  button {
    cursor: pointer;
    font-family: ${({ theme }) => theme.fonts.body};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
  }
  
  ul, ol {
    margin-left: ${({ theme }) => theme.space.xl};
    margin-bottom: ${({ theme }) => theme.space.md};
  }

  input, textarea, select {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
  
  ::selection {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.white};
  }
  
  /* Estilo para palavras com erro ortográfico */
  .spelling-error {
    text-decoration: wavy underline #f44336;
    text-decoration-skip-ink: none;
    cursor: pointer;
    padding: 0 1px;
    border-radius: 2px;
    transition: background-color 0.15s ease;
  }
  
  .spelling-error:hover {
    background-color: rgba(244, 67, 54, 0.1);
  }
  
  /* Estilo para o menu de sugestões de correção */
  .autocomplete-container {
    z-index: 1000;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    border-radius: 6px;
    overflow: hidden;
  }
  
  .autocomplete-container .suggestion-item {
    transition: all 0.15s ease;
    padding: 6px 12px;
  }
  
  .autocomplete-container .suggestion-item:active {
    transform: scale(0.98);
  }
`;

export default GlobalStyles;