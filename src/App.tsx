import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LoginForm } from './components/auth/LoginForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { CreatePost } from './pages/CreatePost';
import { Analytics } from './pages/Analytics';
import { LinkedInVault } from './pages/LinkedInVault';
import { Settings } from './pages/Settings';
import { Automation } from './pages/Automation';
import { Posts } from './pages/Posts';
import { ContentCalendar } from './pages/ContentCalendar';
import { Ideas } from './pages/Ideas';
import { AIInterview } from './pages/AIInterview';
import { WeeklyWorkflow } from './pages/WeeklyWorkflow';
import Landing from './pages/Landing';
import { useAuthStore } from './store/useAuthStore';
import { useLinkedInStore } from './store/useLinkedInStore';
import LinkedInCallback from './pages/LinkedInCallback';
import Signup from './pages/Signup';
import useLinkedInOAuth from '@/hooks/useLinkedInOAuth';
import { postsAPI } from '@/lib/api';

function AppContent() {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();
  const { setPosts } = useLinkedInStore();
  const { fetchStatus } = useLinkedInOAuth();

  // Restore session and load data on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch LinkedIn status and posts when authenticated
  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    // Fetch LinkedIn status
    fetchStatus();

    // Fetch posts
    postsAPI.getPosts()
      .then((data) => setPosts(data.posts ?? []))
      .catch((err) => console.error('Failed to load posts:', err));
  }, [isAuthenticated, isLoading, user?.id]);

  // Show full-page spinner while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
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
            <Route path="data-management" element={<Navigate to="/dashboard" replace />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="linkedin-vault" element={<LinkedInVault />} />
            <Route path="posts" element={<Posts />} />
            <Route path="content-calendar" element={<ContentCalendar />} />
            <Route path="automation" element={<Automation />} />
            <Route path="settings" element={<Settings />} />
            <Route path="ideas" element={<Ideas />} />
            <Route path="ai-interview" element={<AIInterview />} />
            <Route path="weekly" element={<WeeklyWorkflow />} />
          </Route>
        </Routes>
        <Toaster position="top-right" richColors />
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
