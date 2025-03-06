
import { useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (email && password) {
      // Mock login functionality
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
    if (email && password && name) {
      // Mock signup functionality
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
