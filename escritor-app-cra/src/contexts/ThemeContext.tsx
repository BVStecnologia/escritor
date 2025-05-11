import React, { createContext, useState, useEffect, useContext } from 'react';
import { userPreferencesService, Tema } from '../services/userPreferencesService';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const { user } = useAuth();

  // Carregar tema do usuário quando autenticado
  useEffect(() => {
    const loadUserTheme = async () => {
      if (user) {
        try {
          console.log('Carregando tema para usuário autenticado');
          const userTheme = await userPreferencesService.getUserTheme();
          const isDark = userTheme === Tema.ESCURO;
          console.log(`Tema carregado: ${userTheme}, isDarkMode: ${isDark}`);
          setIsDarkMode(isDark);
        } catch (error) {
          console.error('Erro ao carregar tema do usuário:', error);
        }
      } else {
        console.log('Usuário não autenticado, tema padrão será usado');
      }
    };

    loadUserTheme();
  }, [user]);

  const toggleTheme = async () => {
    console.log(`Toggle tema: atual=${isDarkMode ? 'escuro' : 'claro'}, novo=${!isDarkMode ? 'escuro' : 'claro'}`);
    
    // Atualiza o estado imediatamente para feedback visual rápido
    setIsDarkMode(!isDarkMode);
    
    if (user) {
      try {
        // Salva no banco de dados
        const newTheme = !isDarkMode ? Tema.ESCURO : Tema.CLARO;
        const success = await userPreferencesService.updateUserTheme(newTheme);
        console.log(`Tema salvo no banco: ${success ? 'sucesso' : 'falha'}`);
      } catch (error) {
        console.error('Erro ao salvar tema no banco:', error);
      }
    } else {
      console.log('Usuário não autenticado, tema não será persistido');
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};