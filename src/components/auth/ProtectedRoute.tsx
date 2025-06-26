import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from './LoginPage';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedTypes?: ('school' | 'seller')[];
}

export const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  allowedTypes = ['school', 'seller']
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <LoginPage />;
  }

  // If user is logged in but doesn't have the required type
  if (user && !allowedTypes.includes(user.type)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-slate-400">
            Você não tem permissão para acessar esta área.
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated and has permission
  return <>{children}</>;
}; 