import React from 'react';
import { ToolbarPlugin } from './ToolbarPlugin';
import { AutoSavePlugin } from './AutoSavePlugin';
import ImagePlugin, { ImageNode } from './ImagePlugin';
import { editorTheme } from '../theme';
import { AIAutocompletePlugin } from './AIAutocompletePlugin';
import { AIToolsSelectionPlugin } from './AIToolsSelectionPlugin';
import { DOMSpellCheckPlugin } from './DOMSpellCheckPlugin';

type FloatingSaveStatusProps = {
  saveStatus: string;
  isOnline: boolean;
};

// Componente mínimo para evitar erro de compilação
export const FloatingSaveStatus = ({ saveStatus, isOnline }: FloatingSaveStatusProps) => {
  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div>Status: {saveStatus}</div>
      <div>Conexão: {isOnline ? 'Online' : 'Offline'}</div>
    </div>
  );
};
