
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header with Logo */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Quantum</div>
          <Button variant="ghost" onClick={() => navigate("/")} className="flex items-center">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </div>
      </header>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="mb-6">
            <div className="text-9xl font-bold text-gray-200">404</div>
            <div className="text-xl md:text-2xl font-bold text-gray-800 mt-4">Page Not Found</div>
          </div>
          
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            We couldn't find the page you're looking for. The page might have been moved or deleted.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            
            <Button 
              onClick={() => navigate("/dashboard")} 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
