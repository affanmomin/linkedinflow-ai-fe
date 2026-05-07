import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LoginForm } from './components/auth/LoginForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreatePost } from './pages/CreatePost';
import { DataManagement } from './pages/DataManagement';
import { Analytics } from './pages/Analytics';
import { LinkedInVault } from './pages/LinkedInVault';
import { Settings } from './pages/Settings';
import { Automation } from './pages/Automation';
import { Posts } from './pages/Posts';
import { ContentCalendar } from './pages/ContentCalendar';
import { Landing } from './pages/Landing';
import { useAuthStore } from './store/useAuthStore';
import LinkedInCallback from './pages/LinkedInCallback';
import Signup from './pages/Signup';

function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  // Restore session from cookie on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Show full-page spinner while checking session
  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public landing page */}
            <Route
              path="/"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />}
            />

            {/* Public auth routes */}
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />}
            />
            <Route
              path="/signup"
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />}
            />

            {/* LinkedIn OAuth callback — LinkedIn redirects here with ?code=&state= */}
            <Route path="/api/oauth/linkedin/callback" element={<LinkedInCallback />} />

            {/* Protected app routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="create-post" element={<CreatePost />} />
              <Route path="data-management" element={<DataManagement />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="linkedin-vault" element={<LinkedInVault />} />
              <Route path="posts" element={<Posts />} />
              <Route path="content-calendar" element={<ContentCalendar />} />
              <Route path="automation" element={<Automation />} />
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
