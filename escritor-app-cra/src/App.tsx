import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import theme from './styles/theme';
import GlobalStyles from './styles/globalStyles';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AutocompleteProvider } from './contexts/AutocompleteContext';
import ProtectedRoute from './components/ProtectedRoute';
import SubscriptionRoute from './components/SubscriptionRoute';
import './App.css';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import ProfilePage from './pages/ProfilePage';
import DebugPage from './pages/DebugPage';
import DiagnosticoPage from './pages/DiagnosticoPage';
import PricingPage from './pages/PricingPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import AuthCallback from './pages/AuthCallback';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyles />
      <ToastContainer position="top-center" autoClose={4000} />
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <AutocompleteProvider>
              <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/dashboard" element={
                <SubscriptionRoute requireSubscription={true}>
                  <DashboardPage />
                </SubscriptionRoute>
              } />
              <Route path="/editor/:bookId/:chapterId" element={
                <SubscriptionRoute requireSubscription={true}>
                  <EditorPage />
                </SubscriptionRoute>
              } />
              <Route path="/editor/:bookId" element={
                <SubscriptionRoute requireSubscription={true}>
                  <EditorPage />
                </SubscriptionRoute>
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
              <Route path="/pricing" element={
                <ProtectedRoute>
                  <PricingPage />
                </ProtectedRoute>
              } />
              <Route path="/sucesso" element={
                <ProtectedRoute>
                  <PaymentSuccessPage />
                </ProtectedRoute>
              } />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
            </AutocompleteProvider>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </StyledThemeProvider>
  );
};

export default App;