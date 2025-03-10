
import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/App";
import { Settings, CircleHelp, Database, Layers, PanelLeft, LayoutDashboard, LogOut } from "lucide-react";

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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 flex flex-col ${isSidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 shadow-sm`}>
        <div className="p-4 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center">
            <div className="flex-shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full p-1 flex items-center justify-center">
              <svg width={isSidebarCollapsed ? "24" : "20"} height={isSidebarCollapsed ? "24" : "20"} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" />
                <circle cx="20" cy="20" r="8" fill="currentColor" />
                <circle cx="12" cy="12" r="4" fill="#FFFFFF" />
              </svg>
            </div>
            {!isSidebarCollapsed && (
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Quantum
              </span>
            )}
          </Link>
        </div>
        
        <div className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-1 px-2">
            <li>
              <Link
                to="/dashboard"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  isActive("/dashboard") 
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <LayoutDashboard size={20} className={`${isSidebarCollapsed ? 'mx-auto' : 'mr-3'} ${isActive("/dashboard") ? "text-indigo-600" : "text-gray-500"}`} />
                {!isSidebarCollapsed && <span>Explore</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/workspace"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  isActive("/workspace") 
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Layers size={20} className={`${isSidebarCollapsed ? 'mx-auto' : 'mr-3'} ${isActive("/workspace") ? "text-indigo-600" : "text-gray-500"}`} />
                {!isSidebarCollapsed && <span>Workspace</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/connections"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  isActive("/connections") 
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Database size={20} className={`${isSidebarCollapsed ? 'mx-auto' : 'mr-3'} ${isActive("/connections") ? "text-indigo-600" : "text-gray-500"}`} />
                {!isSidebarCollapsed && <span>Discover</span>}
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <ul className="space-y-1">
            <li>
              <button
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  isActive("/settings") 
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => navigate("/settings")}
              >
                <Settings size={20} className={`${isSidebarCollapsed ? 'mx-auto' : 'mr-3'} ${isActive("/settings") ? "text-indigo-600" : "text-gray-500"}`} />
                {!isSidebarCollapsed && <span>Settings</span>}
              </button>
            </li>
            <li>
              <button
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  isActive("/help") 
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => {}}
              >
                <CircleHelp size={20} className={`${isSidebarCollapsed ? 'mx-auto' : 'mr-3'} ${isActive("/help") ? "text-indigo-600" : "text-gray-500"}`} />
                {!isSidebarCollapsed && <span>Help</span>}
              </button>
            </li>
            <li>
              <button
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50"
                onClick={logout}
              >
                <LogOut size={20} className={`${isSidebarCollapsed ? 'mx-auto' : 'mr-3'} text-red-500`} />
                {!isSidebarCollapsed && <span>Logout</span>}
              </button>
            </li>
          </ul>
        </div>
        
        <button
          className="absolute top-20 -right-3 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50"
          onClick={toggleSidebar}
        >
          <PanelLeft size={16} className={`text-gray-500 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {title && (
          <header className="bg-white border-b border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">{title}</h1>
                {workspaceId && (
                  <div className="ml-4 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-sm">
                    Workspace ID: {workspaceId}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </header>
        )}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
