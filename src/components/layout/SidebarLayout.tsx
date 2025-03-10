
import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/App";
import { Settings, CircleHelp, Database, Layers, PanelLeft, LayoutDashboard } from "lucide-react";

interface SidebarLayoutProps {
  children: ReactNode;
  title?: string;
  workspaceId?: string;
}

const SidebarLayout = ({ children, title, workspaceId }: SidebarLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`bg-gray-50 border-r border-gray-200 flex flex-col ${isSidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
        <div className="p-4 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center">
            <svg width={isSidebarCollapsed ? "28" : "24"} height={isSidebarCollapsed ? "28" : "24"} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" />
              <circle cx="20" cy="20" r="8" fill="currentColor" />
              <circle cx="12" cy="12" r="4" fill="#6366F1" />
            </svg>
            {!isSidebarCollapsed && (
              <span className="ml-2 text-xl font-bold">Quantum</span>
            )}
          </Link>
        </div>
        
        <div className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-1 px-2">
            <li>
              <Link
                to="/dashboard"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  isActive("/dashboard") ? "bg-indigo-100 text-indigo-600" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <LayoutDashboard size={20} className={`${isSidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                {!isSidebarCollapsed && <span>Explore</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/workspace"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  isActive("/workspace") ? "bg-indigo-100 text-indigo-600" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Layers size={20} className={`${isSidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                {!isSidebarCollapsed && <span>Workspace</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/connections"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  isActive("/connections") ? "bg-indigo-100 text-indigo-600" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Database size={20} className={`${isSidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                {!isSidebarCollapsed && <span>Discover</span>}
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <ul className="space-y-1">
            <li>
              <button
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100"
                onClick={() => navigate("/settings")}
              >
                <Settings size={20} className={`${isSidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                {!isSidebarCollapsed && <span>Settings</span>}
              </button>
            </li>
            <li>
              <button
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100"
                onClick={logout}
              >
                <CircleHelp size={20} className={`${isSidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                {!isSidebarCollapsed && <span>Help</span>}
              </button>
            </li>
          </ul>
        </div>
        
        <button
          className="absolute top-20 -right-3 bg-white border border-gray-200 rounded-full p-1 shadow-sm"
          onClick={toggleSidebar}
        >
          <PanelLeft size={16} className={`text-gray-500 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {title && (
          <header className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">{title}</h1>
              {workspaceId && (
                <div className="flex items-center text-sm text-gray-500">
                  <span>Workspace {workspaceId}</span>
                </div>
              )}
              <div className="flex items-center">
                <Button variant="outline" size="sm" className="ml-2" onClick={logout}>
                  Logout
                </Button>
              </div>
            </div>
          </header>
        )}
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
