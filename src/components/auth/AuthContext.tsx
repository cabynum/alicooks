/**
 * Auth Context
 *
 * React Context for sharing authentication state throughout the app.
 * Use the AuthProvider to wrap your app and useAuthContext to access auth state.
 *
 * @example
 * ```tsx
 * // In App.tsx
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <Router>...</Router>
 *     </AuthProvider>
 *   );
 * }
 *
 * // In any component
 * function UserMenu() {
 *   const { user, profile, signOut } = useAuthContext();
 *   // ...
 * }
 * ```
 */

import { createContext, useContext, type ReactNode } from 'react';
import { useAuth, type UseAuthReturn } from '@/hooks';

/**
 * The AuthContext value is the same as UseAuthReturn.
 */
type AuthContextValue = UseAuthReturn;

/**
 * React Context for auth state.
 * undefined when accessed outside of AuthProvider.
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Props for the AuthProvider component.
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider - Wraps the app to provide auth state via context.
 *
 * Must be placed high in the component tree, typically in App.tsx.
 * All child components can access auth state via useAuthContext().
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context.
 *
 * Must be used within an AuthProvider.
 *
 * @throws Error if used outside of AuthProvider
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}
