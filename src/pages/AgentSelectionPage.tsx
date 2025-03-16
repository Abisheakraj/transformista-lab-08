
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/App";
import { ChevronLeft } from "lucide-react";

const AgentSelectionPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const handleAgentSelect = (agent: string) => {
    setSelectedAgent(agent);
    
    // Navigate to appropriate page based on agent selection
    if (agent === "data-transformation") {
      navigate("/dashboard");
    } else {
      // For future implementation of other agents
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="container mx-auto py-6 flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack} 
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" />
            <circle cx="20" cy="20" r="8" fill="currentColor" />
            <circle cx="12" cy="12" r="4" fill="#6366F1" />
          </svg>
          <span className="ml-2 text-2xl font-bold">Quantum</span>
        </div>
        <Button variant="ghost" onClick={logout}>Logout</Button>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Transform Data. Reinvent Code. Elevate UI.</h1>
          <p className="text-gray-500">Click on the button to get things started.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card 
            className={`p-8 cursor-pointer transition-all border-2 ${selectedAgent === 'data-transformation' ? 'border-green-500 bg-green-50' : 'hover:border-gray-300'}`}
            onClick={() => handleAgentSelect('data-transformation')}
          >
            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 16h5v5" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Data Transformation Agent</h3>
            <p className="text-sm text-gray-500">Connect databases, transform data, and create pipelines effortlessly</p>
          </Card>
          
          <Card className="p-8 cursor-pointer transition-all hover:border-gray-300">
            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m18 16 4-4-4-4" />
                <path d="m6 8-4 4 4 4" />
                <path d="m14.5 4-5 16" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Code Migration Agent</h3>
            <p className="text-sm text-gray-500">Migrate legacy SQL code to modern databases or frameworks</p>
          </Card>
          
          <Card className="p-8 cursor-pointer transition-all hover:border-gray-300">
            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">UI Creation Agent</h3>
            <p className="text-sm text-gray-500">Generate dynamic UIs from database schemas and business rules</p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AgentSelectionPage;
