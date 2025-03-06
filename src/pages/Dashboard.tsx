
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, FileText, GitBranch, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      title: "Database Connections",
      description: "Connect and manage your data sources",
      icon: <Database className="h-6 w-6" />,
      path: "/database-connection"
    },
    {
      title: "File Upload",
      description: "Upload and transform your data files",
      icon: <FileText className="h-6 w-6" />,
      path: "/file-upload"
    },
    {
      title: "Pipeline",
      description: "Create and manage data pipelines",
      icon: <GitBranch className="h-6 w-6" />,
      path: "/pipeline"
    },
    {
      title: "Settings",
      description: "Configure your workspace settings",
      icon: <Settings className="h-6 w-6" />,
      path: "/settings"
    }
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground mt-2">
          Get started by exploring one of our core features below.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(feature.path)}
              >
                Explore
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
