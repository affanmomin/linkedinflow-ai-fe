import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LoginForm } from './components/auth/LoginForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreatePost } from './pages/CreatePost';
import { BatchProcessing } from './pages/BatchProcessing';
import { DataManagement } from './pages/DataManagement';
import { Analytics } from './pages/Analytics';
import { LinkedInVault } from './pages/LinkedInVault';
import { Settings } from './pages/Settings';
import { useAuthStore } from './store/useAuthStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route
              path="/login"
              element={
                !isAuthenticated ? <LoginForm /> : <Navigate to="/\" replace />
              }
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="create-post" element={<CreatePost />} />
              <Route path="batch-processing" element={<BatchProcessing />} />
              <Route path="data-management" element={<DataManagement />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="linkedin-vault" element={<LinkedInVault />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
          <Toaster position="top-right" richColors />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;