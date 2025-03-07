
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      login();
      navigate("/agent-selection");
      setIsLoading(false);
    }, 1000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* Left side - Branding */}
      <div className="flex-1 flex flex-col justify-center px-10 lg:px-20">
        <div className="mb-8">
          <div className="flex items-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" />
              <circle cx="20" cy="20" r="8" fill="currentColor" />
              <circle cx="12" cy="12" r="4" fill="#6366F1" />
            </svg>
            <span className="ml-2 text-2xl font-bold text-white">Quantum</span>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-white mb-2">AI That Thinks.</h1>
        <h1 className="text-5xl font-bold text-white mb-8">Data That Works.</h1>
        
        <p className="text-xl text-gray-300 mb-8">
          Building smarter systems for a connected world.<br />
          Transform your data infrastructure with AI-powered insights and seamless integration.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-start space-x-3">
            <div className="bg-indigo-600/20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-indigo-400">
                <path d="m18 7 4 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9l4-2" />
                <path d="M14 22v-4a2 2 0 0 0-4 0v4" />
                <path d="m18 22 4-11" />
                <path d="m2 22 4-11" />
                <path d="M6 5a3 3 0 0 1 12 0v2H6z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium">Lightning Fast</h3>
              <p className="text-gray-400 text-sm">Process data at unprecedented speeds</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-indigo-600/20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-indigo-400">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 7h.01" />
                <path d="M10 7h7" />
                <path d="M7 12h.01" />
                <path d="M10 12h7" />
                <path d="M7 17h.01" />
                <path d="M10 17h7" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium">Secure</h3>
              <p className="text-gray-400 text-sm">Enterprise-grade security built-in</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-indigo-600/20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-indigo-400">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium">Scalable</h3>
              <p className="text-gray-400 text-sm">Grows with your business needs</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-indigo-600/20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-indigo-400">
                <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                <path d="M8 12a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1zM7.5 12h9M16 12V8a4 4 0 0 0-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium">AI-Powered</h3>
              <p className="text-gray-400 text-sm">Smart insights and automation</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-400">
          © 2024 Quantum • <a href="#" className="hover:text-white">Privacy</a> • <a href="#" className="hover:text-white">Terms</a>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full max-w-md bg-white p-12 flex flex-col justify-center">
        <div className="w-full max-w-sm mx-auto">
          <h2 className="text-2xl font-bold mb-1">Sign in</h2>
          <p className="text-gray-500 mb-6">Smart Integration Starts with AI</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium">Password</label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="text-right">
              <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </a>
            </div>
            
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            
            <div className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                Create one now
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
