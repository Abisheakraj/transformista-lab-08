import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthSheet from "@/components/auth/AuthSheet";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false);
  const [authType, setAuthType] = useState<"login" | "signup">("login");
  const { isAuthenticated } = useAuth();

  const openLogin = () => {
    setAuthType("login");
    setIsAuthSheetOpen(true);
  };

  const openSignup = () => {
    setAuthType("signup");
    setIsAuthSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="container mx-auto py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-900">DataGenieAI</div>
        <div className="flex gap-4 items-center">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          ) : (
            <>
              <Button variant="outline" onClick={openLogin}>Log in</Button>
              <Button onClick={openSignup}>Sign up</Button>
            </>
          )}
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-24">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
            Transform Your Data Effortlessly
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Build powerful ETL workflows with an intuitive visual interface. Connect databases, transform data, and deploy with confidence.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="text-lg px-8" onClick={openSignup}>Get Started</Button>
            <Button size="lg" variant="outline" className="text-lg px-8">View Demo</Button>
          </div>
        </div>

        {/* Features section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="p-8 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
                <polyline points="14 9 9 4 4 9" />
                <path d="M20 20h-7a4 4 0 0 1-4-4V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Visual ETL Workflows</h3>
            <p className="text-gray-600">Design complex data transformations with our intuitive drag-and-drop interface.</p>
          </div>
          
          <div className="p-8 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Multiple Data Sources</h3>
            <p className="text-gray-600">Connect to various databases and data storage systems with pre-built connectors.</p>
          </div>
          
          <div className="p-8 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m7 15 5-5 5 5" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Apache NiFi Integration</h3>
            <p className="text-gray-600">Leverage the power of Apache NiFi for robust data processing capabilities.</p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-24">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Data Sources</h3>
              <p className="text-gray-600">Easily connect to databases, APIs, and file systems.</p>
            </div>

            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Build Transformations</h3>
              <p className="text-gray-600">Design your data flow with our visual editor.</p>
            </div>

            <div className="flex-1 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Deploy & Monitor</h3>
              <p className="text-gray-600">Run your workflows and track performance in real-time.</p>
            </div>
          </div>
        </div>
      </main>

      <AuthSheet 
        isOpen={isAuthSheetOpen}
        onOpenChange={setIsAuthSheetOpen}
        defaultTab={authType}
      />
    </div>
  );
}
