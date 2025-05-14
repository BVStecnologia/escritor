import React from 'react';

interface DOMSpellCheckPluginProps {
  checkInterval?: number;
}

// Este plugin está completamente desativado para evitar sublinhados vermelhos intermitentes
export const DOMSpellCheckPlugin: React.FC<DOMSpellCheckPluginProps> = ({ checkInterval = 3000 }) => {
  // Retornamos null imediatamente para desativar o plugin completamente
  return null;
}

// Plugin foi desativado para remover sublinhados vermelhos intermitentes
// Código original foi removido para evitar erros de compilação