import React, { createContext, useState, useEffect, useContext } from 'react';
import { userPreferencesService } from '../services/userPreferencesService';
import { useAuth } from './AuthContext';

interface AutocompleteContextType {
  isAutocompleteEnabled: boolean;
  toggleAutocomplete: () => void;
}

const AutocompleteContext = createContext<AutocompleteContextType | undefined>(undefined);

export const AutocompleteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAutocompleteEnabled, setIsAutocompleteEnabled] = useState<boolean>(true);
  const { user } = useAuth();

  // Carregar preferência do usuário quando autenticado
  useEffect(() => {
    const loadAutocompletePreference = async () => {
      if (user) {
        try {
          console.log('Carregando preferência de autocomplete para usuário autenticado');
          const autocompleteEnabled = await userPreferencesService.getUserAutocompletePreference();
          console.log(`Preferência de autocomplete carregada: ${autocompleteEnabled ? 'ativado' : 'desativado'}`);
          setIsAutocompleteEnabled(autocompleteEnabled);
        } catch (error) {
          console.error('Erro ao carregar preferência de autocomplete do usuário:', error);
        }
      } else {
        console.log('Usuário não autenticado, preferência de autocomplete padrão será usada');
      }
    };

    loadAutocompletePreference();
  }, [user]);

  const toggleAutocomplete = async () => {
    console.log(`Toggle autocomplete: atual=${isAutocompleteEnabled ? 'ativado' : 'desativado'}, novo=${!isAutocompleteEnabled ? 'ativado' : 'desativado'}`);
    
    // Atualiza o estado imediatamente para feedback visual rápido
    setIsAutocompleteEnabled(!isAutocompleteEnabled);
    
    if (user) {
      try {
        // Salva no banco de dados
        const success = await userPreferencesService.updateUserAutocompletePreference(!isAutocompleteEnabled);
        console.log(`Preferência de autocomplete salva no banco: ${success ? 'sucesso' : 'falha'}`);
      } catch (error) {
        console.error('Erro ao salvar preferência de autocomplete no banco:', error);
      }
    } else {
      console.log('Usuário não autenticado, preferência de autocomplete não será persistida');
    }
  };

  return (
    <AutocompleteContext.Provider value={{ isAutocompleteEnabled, toggleAutocomplete }}>
      {children}
    </AutocompleteContext.Provider>
  );
};

export const useAutocomplete = () => {
  const context = useContext(AutocompleteContext);
  if (context === undefined) {
    throw new Error('useAutocomplete deve ser usado dentro de um AutocompleteProvider');
  }
  return context;
};