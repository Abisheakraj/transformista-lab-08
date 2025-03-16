
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { ArrowRight, Database, Upload, FileSpreadsheet, BrainCircuit, Sparkles, BookOpenCheck } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleStartDataTransformation = () => {
    navigate("/workspace");
  };

  return (
    <SidebarLayout>
      <div className="container mx-auto px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
              Transform Data. Reinvent Code. Elevate UI.
            </h1>
            <p className="text-gray-600 text-lg">
              Click on the button to get things started.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="p-6 hover:shadow-md transition-all border-indigo-100 hover:border-indigo-300 cursor-pointer overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-all duration-300 group-hover:scale-110"></div>
              <div className="relative">
                <div className="h-12 w-12 mb-5 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 6L15.7071 11.2929C15.3166 11.6834 14.6834 11.6834 14.2929 11.2929L12.7071 9.70711C12.3166 9.31658 11.6834 9.31658 11.2929 9.70711L3 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 13L3 18L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">Data Transformation Agent</h3>
                <p className="text-gray-600 mb-5 text-sm">
                  Connect databases, transform data, and create pipelines effortlessly
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="px-0 text-indigo-600 hover:text-indigo-800 hover:bg-transparent"
                  onClick={() => navigate("/workspace")}
                >
                  Get Started <ArrowRight size={16} className="ml-1" />
                </Button>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-md transition-all border-purple-100 hover:border-purple-300 cursor-pointer overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-50 rounded-bl-full -mr-8 -mt-8 transition-all duration-300 group-hover:scale-110"></div>
              <div className="relative">
                <div className="h-12 w-12 mb-5 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 18L18 20L22 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15H8C6.93913 15 5.92172 14.5786 5.17157 13.8284C4.42143 13.0783 4 12.0609 4 11C4 9.93913 4.42143 8.92172 5.17157 8.17157C5.92172 7.42143 6.93913 7 8 7H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 11H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">Code Migration Agent</h3>
                <p className="text-gray-600 mb-5 text-sm">
                  Migrate legacy SQL code to modern databases or frameworks
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="px-0 text-purple-600 hover:text-purple-800 hover:bg-transparent"
                >
                  Get Started <ArrowRight size={16} className="ml-1" />
                </Button>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-md transition-all border-blue-100 hover:border-blue-300 cursor-pointer overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-bl-full -mr-8 -mt-8 transition-all duration-300 group-hover:scale-110"></div>
              <div className="relative">
                <div className="h-12 w-12 mb-5 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="2" y="13" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="13" y="2" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="13" y="13" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">UI Creation Agent</h3>
                <p className="text-gray-600 mb-5 text-sm">
                  Generate dynamic UIs from database schemas and business rules
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="px-0 text-blue-600 hover:text-blue-800 hover:bg-transparent"
                >
                  Get Started <ArrowRight size={16} className="ml-1" />
                </Button>
              </div>
            </Card>
          </div>

          <Card className="p-8 mb-10 border-none shadow-lg relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-full opacity-70"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-3 mb-6">
                <Input 
                  placeholder="Type or Select a Task to get started" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-indigo-100 focus:border-indigo-300 focus:ring-indigo-200"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                <Button 
                  variant="outline" 
                  className="bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200 flex items-center"
                  onClick={() => navigate("/connections")}
                >
                  <Database className="h-4 w-4 mr-1" /> DB Connection
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 flex items-center"
                >
                  <Upload className="h-4 w-4 mr-1" /> Upload Excel
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 flex items-center"
                >
                  <BrainCircuit className="h-4 w-4 mr-1" /> Map LLM
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 flex items-center"
                >
                  <Sparkles className="h-4 w-4 mr-1" /> Discover Samples
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 flex items-center"
                >
                  <BookOpenCheck className="h-4 w-4 mr-1" /> How it Works
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="p-6 hover:shadow-lg transition-shadow border-indigo-100 hover:border-indigo-200 cursor-pointer" onClick={handleStartDataTransformation}>
              <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg flex items-center justify-center mb-4">
                <FileSpreadsheet size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create New Workspace</h3>
              <p className="text-gray-500 text-sm mb-4">Start a new data transformation project with a clean workspace.</p>
              <Button variant="ghost" size="sm" className="mt-auto text-indigo-600 hover:text-indigo-800 p-0 hover:bg-transparent">
                Get Started <ArrowRight size={16} className="ml-1" />
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-cyan-100 hover:border-cyan-200 cursor-pointer">
              <div className="h-12 w-12 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-lg flex items-center justify-center mb-4">
                <Upload size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Import Existing Data</h3>
              <p className="text-gray-500 text-sm mb-4">Upload your data from Excel, CSV, or connect to a database.</p>
              <Button variant="ghost" size="sm" className="mt-auto text-cyan-600 hover:text-cyan-800 p-0 hover:bg-transparent">
                Upload Data <ArrowRight size={16} className="ml-1" />
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-amber-100 hover:border-amber-200 cursor-pointer">
              <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg flex items-center justify-center mb-4">
                <BookOpenCheck size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Interactive Tutorials</h3>
              <p className="text-gray-500 text-sm mb-4">Learn how to use the platform with guided walkthroughs.</p>
              <Button variant="ghost" size="sm" className="mt-auto text-amber-600 hover:text-amber-800 p-0 hover:bg-transparent">
                Start Learning <ArrowRight size={16} className="ml-1" />
              </Button>
            </Card>
          </div>

          <Card className="p-6 border border-gray-200 bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                <span className="text-indigo-600 text-xs">!</span>
              </span>
              Recent Activity
            </h3>
            <div className="text-center py-8 text-gray-500">
              <p>You haven't created any projects yet.</p>
              <p>Start by creating a workspace or importing data.</p>
            </div>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;
