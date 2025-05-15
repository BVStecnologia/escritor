import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import theme from './styles/theme';
import GlobalStyles from './styles/globalStyles';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AutocompleteProvider } from './contexts/AutocompleteContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import ProfilePage from './pages/ProfilePage';
import DebugPage from './pages/DebugPage';
import DiagnosticoPage from './pages/DiagnosticoPage';

const App: React.FC = () => {
  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyles />
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <AutocompleteProvider>
              <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/editor/:bookId/:chapterId" element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              } />
              <Route path="/editor/:bookId" element={
                <ProtectedRoute>
                  <EditorPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/debug" element={
                <ProtectedRoute>
                  <DebugPage />
                </ProtectedRoute>
              } />
              <Route path="/diagnostico" element={
                <DiagnosticoPage />
              } />
            </Routes>
            </AutocompleteProvider>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </StyledThemeProvider>
  );
};

export default App;