import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserById, loginUser, logoutUser, User } from '../api/userApi';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          const user = await getUserById(userId);
          if (user) {
            setCurrentUser(user);
          } else {
            // Clear invalid userId from localStorage
            localStorage.removeItem('userId');
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          localStorage.removeItem('userId');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const user = await loginUser(username, password);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('userId', user.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    logoutUser();
    setCurrentUser(null);
    localStorage.removeItem('userId');
  };

  const value = {
    isAuthenticated: !!currentUser,
    currentUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 