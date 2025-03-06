
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h1>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>
      <p className="text-muted-foreground">
        Your dashboard is ready. Soon you'll be able to manage your projects, data sources, and more from here.
      </p>
    </div>
  );
}
