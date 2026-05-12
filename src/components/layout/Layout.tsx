import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CreatePostModal } from '@/components/posts/CreatePostModal';
import { useLinkedInStore } from '@/store/useLinkedInStore';
import { Lightbulb } from 'lucide-react';
import { QuickCaptureModal } from '@/components/posts/QuickCaptureModal';

function QuickCaptureButton({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <>
      <button
        onClick={() => onOpenChange(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-amber-400 hover:bg-amber-500 text-white px-4 py-2.5 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
        aria-label="Capture an idea"
      >
        <Lightbulb className="h-4 w-4" />
        <span className="hidden sm:inline">Capture</span>
      </button>
      <QuickCaptureModal open={open} onOpenChange={onOpenChange} />
    </>
  );
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const { isCreatePostOpen, closeCreatePost } = useLinkedInStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement).isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'n') navigate('/dashboard/create-post');
      if (e.key === 'c') setCaptureOpen(true);
      if (e.key === 'i') navigate('/dashboard/ideas');
      if (e.key === 'p') navigate('/dashboard/posts');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  return (
    <div className="h-screen overflow-hidden dashboard-shell">
      <div className="flex h-screen w-full overflow-hidden bg-transparent">
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-transparent transition-all duration-200 ease-in-out">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-transparent">
            <div className="w-full p-4 lg:p-7">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <CreatePostModal open={isCreatePostOpen} onOpenChange={(o) => { if (!o) closeCreatePost(); }} />

      {/* Floating quick-capture button */}
      <QuickCaptureButton open={captureOpen} onOpenChange={setCaptureOpen} />
    </div>
  );
}
