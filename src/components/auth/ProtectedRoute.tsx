import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requireAll?: boolean; // If true, user must have ALL roles. If false, ANY role is sufficient
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requireAll = false
}) => {
  const { isAuthenticated, user, checkAuth, hasAnyRole, hasAllRoles } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();


  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Önce localStorage'dan kullanıcıyı yükle
        if (typeof window !== 'undefined' && useAuthStore.getState().loadUserFromStorage) {
          useAuthStore.getState().loadUserFromStorage();
        }
        await checkAuth();
      } finally {
        setIsChecking(false);
      }
    };
    verifyAuth();
  }, [checkAuth]);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRoles.length > 0) {
    const hasRequiredRoles = requireAll 
      ? hasAllRoles(requiredRoles)
      : hasAnyRole(requiredRoles);

    if (!hasRequiredRoles) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.876c1.36 0 2.615-.847 3.146-2.113.532-1.266.155-2.74-.946-3.702L12 4l-9.138 9.185c-1.1.962-1.478 2.436-.946 3.702C2.385 18.153 3.64 19 5 19z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page.
              {requiredRoles.length > 0 && (
                <span className="block mt-2 text-sm">
                  Required role{requiredRoles.length > 1 ? 's' : ''}: {requiredRoles.join(', ')}
                </span>
              )}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Current user: <span className="font-medium">{user.username}</span>
                {user.roles && user.roles.length > 0 && (
                  <div className="mt-1">
                    Roles: {user.roles.map(role => (
                      <span key={role} className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs mr-1">
                        {role}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has required roles
  return <>{children}</>;
};

export default ProtectedRoute;