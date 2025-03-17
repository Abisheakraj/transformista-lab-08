
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/App";
import SidebarLayout from "@/components/layout/SidebarLayout";
import CorsProxy from "@/components/connections/CorsProxy";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleClearLocalStorage = () => {
    // Preserve auth state
    const authState = localStorage.getItem('isAuthenticated');
    
    // Clear localStorage except for essential items
    localStorage.clear();
    
    // Restore auth state if it was set
    if (authState) {
      localStorage.setItem('isAuthenticated', authState);
    }
    
    toast({
      title: "Application Reset",
      description: "All application settings have been cleared.",
    });
  };

  return (
    <SidebarLayout title="Settings">
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and application settings
          </p>
        </div>

        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how the application looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Theme settings will be added in a future update
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Application</CardTitle>
                <CardDescription>
                  Manage application data and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-3">
                  <Button
                    variant="outline" 
                    className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50"
                    onClick={handleClearLocalStorage}
                  >
                    Reset Application Settings
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    This will clear all stored preferences and settings, but won't delete your projects or connections.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    You are currently signed in as a demo user.
                  </p>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Session</CardTitle>
                <CardDescription>
                  Manage your current session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="connections" className="space-y-4">
            <CorsProxy />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  );
};

export default SettingsPage;
