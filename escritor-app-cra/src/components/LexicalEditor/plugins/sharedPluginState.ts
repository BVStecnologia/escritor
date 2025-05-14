// sharedPluginState.ts
// Este arquivo contém estado compartilhado entre diferentes plugins do editor

// Armazena o estado dos diferentes popups/menus ativos no editor
interface EditorPopupState {
  autocompleteVisible: boolean;
  selectionToolsVisible: boolean;
}

// Estado global inicial
export const editorPopupState: EditorPopupState = {
  autocompleteVisible: false,
  selectionToolsVisible: false,
};

// Funções para gerenciar o estado dos popups
export const setAutocompleteVisible = (visible: boolean) => {
  editorPopupState.autocompleteVisible = visible;
  // Se autocomplete está visível, forçar fechamento do menu de seleção
  if (visible) {
    editorPopupState.selectionToolsVisible = false;
  }
};

export const setSelectionToolsVisible = (visible: boolean) => {
  editorPopupState.selectionToolsVisible = visible;
  // Se menu de seleção está visível, forçar fechamento do autocomplete
  if (visible) {
    editorPopupState.autocompleteVisible = false;
  }
};

// Verifica se existem outros popups visíveis que bloqueiam este
export const canShowAutocomplete = (): boolean => {
  return !editorPopupState.selectionToolsVisible;
};

export const canShowSelectionTools = (): boolean => {
  return !editorPopupState.autocompleteVisible;
};