import { createGlobalStyle } from 'styled-components';

const DarkThemeStyles = createGlobalStyle`
  /* Estilos para os headings do editor Lexical no tema escuro */
  .editor-heading-h1, 
  .editor-heading-h2, 
  .editor-heading-h3, 
  .editor-heading-h4, 
  .editor-heading-h5, 
  .editor-heading-h6 {
    color: #ffffff !important;
  }
  
  /* Garantir que todo o texto no editor seja branco no tema escuro */
  .editor-input {
    color: #ffffff !important;
  }
`;

export default DarkThemeStyles;