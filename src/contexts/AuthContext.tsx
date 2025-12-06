import { createContext, useContext, createSignal, ParentComponent, onMount } from 'solid-js';
import { authService, type User } from '../services/auth';

interface AuthContextType {
  user: () => User | null;
  isAuthenticated: () => boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string, locationData?: { country?: string; region?: string; city?: string; postalCode?: string }) => Promise<void>;
  updateUser: (user: User) => void;
  logout: () => void;
  loading: () => boolean;
}

const AuthContext = createContext<AuthContextType>();

export const AuthProvider: ParentComponent = (props) => {
  const [user, setUser] = createSignal<User | null>(null);
  const [loading, setLoading] = createSignal(true);

  onMount(() => {
    // Restaurer l'utilisateur depuis localStorage
    const savedUser = authService.getUser();
    if (savedUser && authService.isAuthenticated()) {
      setUser(savedUser);
    }
    setLoading(false);
  });

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    authService.setAuth(response.token, response.user);
    setUser(response.user);
  };

  const signup = async (email: string, username: string, password: string, locationData?: { country?: string; region?: string; city?: string; postalCode?: string }) => {
    const response = await authService.signup({ email, username, password, ...locationData });
    authService.setAuth(response.token, response.user);
    setUser(response.user);
  };

  const updateUser = (updatedUser: User) => {
    authService.setAuth(authService.getToken()!, updatedUser);
    setUser(updatedUser);
  };

  const logout = () => {
    authService.clearAuth();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: () => user() !== null,
    login,
    signup,
    updateUser,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

