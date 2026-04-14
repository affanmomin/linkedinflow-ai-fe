import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CreatePostModal } from '@/components/posts/CreatePostModal';
import { useLinkedInStore } from '@/store/useLinkedInStore';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isCreatePostOpen, closeCreatePost } = useLinkedInStore();

  return (
    <div className="h-screen overflow-hidden dashboard-shell">
      <div className="flex h-screen w-full overflow-hidden bg-[#f3f3f1]">
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f3f3f1]">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            <div className="w-full p-4 lg:p-7">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <CreatePostModal open={isCreatePostOpen} onOpenChange={(o) => { if (!o) closeCreatePost(); }} />
    </div>
  );
}
