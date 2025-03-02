
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { ArrowRight, Database, GitBranch, GitMerge } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthSheet from "@/components/auth/AuthSheet";

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header with Logo */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary">DataGenieAI</div>
        <Button variant="ghost" onClick={() => navigate("/dashboard")}>Dashboard</Button>
      </header>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Transform Your Data <span className="text-primary">Effortlessly</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mb-10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Build powerful ETL workflows with an intuitive visual interface.
            Connect databases, transform data, and deploy with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Button size="lg" onClick={() => setIsAuthOpen(true)}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/demo")}>
              View Demo
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={feature.title} className="hover-scale">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* How it Works Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 z-10 relative">
                    <span className="text-2xl font-bold text-primary">{index + 1}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute h-1 w-full bg-gray-200 top-8 left-full -ml-4"></div>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auth Sheet */}
      <AuthSheet isOpen={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </div>
  );
};

const features = [
  {
    title: "Visual ETL Workflows",
    description: "Design complex data transformations with our intuitive drag-and-drop interface.",
    icon: GitBranch,
  },
  {
    title: "Multiple Data Sources",
    description: "Connect to various databases and data storage systems with pre-built connectors.",
    icon: Database,
  },
  {
    title: "Apache NiFi Integration",
    description: "Leverage the power of Apache NiFi for robust data processing capabilities.",
    icon: GitMerge,
  },
];

const steps = [
  {
    title: "Connect Data Sources",
    description: "Select and connect your source and target databases with a few clicks.",
  },
  {
    title: "Build Transformations",
    description: "Design your data flow with our visual editor and apply transformations.",
  },
  {
    title: "Deploy & Monitor",
    description: "Deploy your flows and monitor their performance in real-time.",
  },
];

export default Index;
