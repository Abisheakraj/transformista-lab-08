
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { FileType, Upload, BarChart, ArrowRight } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleStartDataTransformation = () => {
    navigate("/workspace");
  };

  return (
    <SidebarLayout title="Welcome to Data Transformation Agent.">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-500 mb-8">Empowering Your Journey Through Seamless Data Transformation.</p>

          <Card className="p-8 mb-8 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <Input 
                placeholder="Type or Select an Task to get started" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button variant="ghost" size="icon">
                <FileType size={18} />
              </Button>
              <Button variant="ghost" size="icon">
                <BarChart size={18} />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
              <Button 
                variant="outline" 
                className="bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200"
                onClick={() => navigate("/connections")}
              >
                DB Connection
              </Button>
              <Button 
                variant="outline" 
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
              >
                Upload Excel
              </Button>
              <Button 
                variant="outline" 
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              >
                Map LLM
              </Button>
              <Button 
                variant="outline" 
                className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
              >
                Discover Samples
              </Button>
              <Button 
                variant="outline" 
                className="bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
              >
                How it Works
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={handleStartDataTransformation}>
              <div className="h-12 w-12 bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center mb-4">
                <FileType size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create New Workspace</h3>
              <p className="text-gray-500 text-sm mb-4">Start a new data transformation project with a clean workspace.</p>
              <Button variant="ghost" size="sm" className="mt-auto">
                Get Started <ArrowRight size={16} className="ml-1" />
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="h-12 w-12 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center mb-4">
                <Upload size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Import Existing Data</h3>
              <p className="text-gray-500 text-sm mb-4">Upload your data from Excel, CSV, or connect to a database.</p>
              <Button variant="ghost" size="sm" className="mt-auto">
                Upload Data <ArrowRight size={16} className="ml-1" />
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4">
                <BarChart size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Interactive Tutorials</h3>
              <p className="text-gray-500 text-sm mb-4">Learn how to use the platform with guided walkthroughs.</p>
              <Button variant="ghost" size="sm" className="mt-auto">
                Start Learning <ArrowRight size={16} className="ml-1" />
              </Button>
            </Card>
          </div>

          <Card className="p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
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
