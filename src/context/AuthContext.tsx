import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;  // ✅ true if user logged in
  hasSkippedLogin: boolean;  // ✅ true if user skipped login
  login: (token: string, userId: string) => Promise<void>;
  logout: () => Promise<void>;
  skipLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasSkippedLogin, setHasSkippedLogin] = useState<boolean>(false);

  // Load stored auth data when app starts
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedUserId = await AsyncStorage.getItem('userId');
        const skippedLogin = await AsyncStorage.getItem('skippedLogin');

        if (storedToken) {
          setToken(storedToken);
          setUserId(storedUserId);
          setIsAuthenticated(true);
          setHasSkippedLogin(false);
        } else if (skippedLogin === 'true') {
          setHasSkippedLogin(true);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to load auth data:', error);
      }
    };
    loadAuthData();
  }, []);

  // ✅ Login function
  const login = async (newToken: string, newUserId: string) => {
    try {
      setToken(newToken);
      setUserId(newUserId);
      setIsAuthenticated(true);
      setHasSkippedLogin(false);
      await AsyncStorage.setItem('authToken', newToken);
      await AsyncStorage.setItem('userId', newUserId);
      await AsyncStorage.removeItem('skippedLogin');
    } catch (error) {
      console.error('Failed to save auth data:', error);
    }
  };

  // ✅ Logout function
  const logout = async () => {
    try {
      setToken(null);
      setUserId(null);
      setIsAuthenticated(false);
      setHasSkippedLogin(false);
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('skippedLogin');
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  };

  // ✅ Skip login function
  const skipLogin = async () => {
    try {
      setHasSkippedLogin(true);
      setIsAuthenticated(false);
      await AsyncStorage.setItem('skippedLogin', 'true');
    } catch (error) {
      console.error('Failed to save skipLogin state:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        isAuthenticated,
        hasSkippedLogin,
        login,
        logout,
        skipLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
