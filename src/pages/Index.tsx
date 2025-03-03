
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthSheet from "@/components/auth/AuthSheet";

export default function Index() {
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false);
  const [authType, setAuthType] = useState<"login" | "signup">("login");

  const openLogin = () => {
    setAuthType("login");
    setIsAuthSheetOpen(true);
  };

  const openSignup = () => {
    setAuthType("signup");
    setIsAuthSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">DataGenieAI</div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={openLogin}>Log in</Button>
          <Button onClick={openSignup}>Sign up</Button>
        </div>
      </header>

      <main className="container mx-auto py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
          Visual Data Pipeline Designer
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          Build, test, and deploy data pipelines with an intuitive drag-and-drop interface. Connect to any data source and transform your data without writing code.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" className="text-lg px-8" onClick={openSignup}>Get Started</Button>
          <Button size="lg" variant="outline" className="text-lg px-8">View Demo</Button>
        </div>

        {/* Features section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-center">Fast Integration</h3>
            <p className="text-gray-600 text-center">Connect to databases, APIs, and files in minutes, not days.</p>
          </div>
          
          <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-center">No-Code Transforms</h3>
            <p className="text-gray-600 text-center">Transform, filter, and aggregate your data without writing code.</p>
          </div>
          
          <div className="p-6 rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-center">Real-time Monitoring</h3>
            <p className="text-gray-600 text-center">Monitor your data pipelines in real-time with detailed logging and alerts.</p>
          </div>
        </div>
      </main>

      <AuthSheet 
        open={isAuthSheetOpen}
        onOpenChange={setIsAuthSheetOpen}
        defaultTab={authType}
      />
    </div>
  );
}
