
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { User, AuthState } from '@/types/types';
import { getMe } from '@/api/auth';
import { useToast } from '@/hooks/use-toast';

// Define the context type
interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

// Define the actions
type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: { user: User } }
  | { type: 'AUTH_ERROR'; payload: { error: string } }
  | { type: 'LOADING' }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Reducer function
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload.user,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        error: action.payload.error,
        isLoading: false,
      };
    case 'LOADING':
      return {
        ...state,
        isLoading: true,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { toast } = useToast();

  // Login function
  const login = (user: User, token: string) => {
    localStorage.setItem('token', token);
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  // Update user function
  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: { user } });
  };

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        dispatch({ type: 'LOGOUT' });
        return;
      }

      try {
        dispatch({ type: 'LOADING' });
        const response = await getMe();
        
        if (response.success) {
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { user: response.data } 
          });
        } else {
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        localStorage.removeItem('token');
        dispatch({ 
          type: 'AUTH_ERROR', 
          payload: { error: 'Authentication failed. Please login again.' } 
        });
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Your session has expired. Please login again.",
        });
      }
    };

    checkLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
