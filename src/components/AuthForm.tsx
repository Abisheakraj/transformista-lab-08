
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface AuthFormProps {
  type: 'signin' | 'signup';
}

export const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (type === 'signin') {
        const success = await login(email, password);
        if (success) {
          toast({
            title: "Success",
            description: "You've been signed in successfully.",
            type: "default"
          });
          navigate('/dashboard');
        } else {
          toast({
            title: "Authentication failed",
            description: "Please check your credentials and try again.",
            type: "destructive"
          });
        }
      } else {
        const success = await signup(email, password, name);
        if (success) {
          toast({
            title: "Account created",
            description: "Your account has been created successfully.",
            type: "default"
          });
          navigate('/signin', { state: { message: "Account created successfully. Please sign in." } });
        } else {
          toast({
            title: "Registration failed",
            description: "Please check your information and try again.",
            type: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        type: "destructive"
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          {type === 'signin' && (
            <a
              href="/reset-password"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Forgot password?
            </a>
          )}
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Processing...' : (type === 'signin' ? 'Sign In' : 'Create Account')}
      </Button>
    </form>
  );
};
