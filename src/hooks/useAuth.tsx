
import { useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login functionality
    if (email && password) {
      // In a real app, this would call an API
      setUser({
        id: '1',
        email,
        name: email.split('@')[0],
      });
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    // Mock signup functionality
    if (email && password) {
      // In a real app, this would call an API
      setUser({
        id: '1',
        email,
        name,
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };
}

export default useAuth;
