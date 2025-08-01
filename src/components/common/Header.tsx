import React, { useState, useRef, useEffect } from 'react';
import { 
  BellIcon, 
  UserCircleIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../stores/authStore';

const Header: React.FC = () => {
  const { user, logout, hasRole } = useAuthStore();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
  };

  const getUserDisplayName = () => {
    if (user?.username) return user.username;
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isAdmin = hasRole('ADMIN');
  const isUser = hasRole('USER');

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side - Title/Breadcrumb */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Roster Optimization System
          </h1>
        </div>

        {/* Right side - User menu and notifications */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
            <BellIcon className="w-5 h-5" />
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {/* User Avatar */}
              <div className="w-8 h-8 bg-rose-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {getUserInitials()}
              </div>
              
              {/* User Info */}
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium text-gray-900">
                  {getUserDisplayName()}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.role || user?.roles?.join(', ') || 'User'}
                </div>
              </div>

              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {/* User Info Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-rose-600 rounded-full flex items-center justify-center text-white font-medium">
                      {getUserInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {getUserDisplayName()}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        ID: {user?.id || 'N/A'}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {/* Backend'de tek role field'ı var */}
                        {user?.role && (
                          <span 
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              user.role === 'ADMIN' 
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {user.role}
                          </span>
                        )}
                        {/* Fallback: roles array varsa */}
                        {!user?.role && user?.roles?.map(role => (
                          <span 
                            key={role}
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              role === 'ADMIN' 
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <UserIcon className="w-4 h-4 mr-3 text-gray-400" />
                    View Profile
                  </button>

                  {isAdmin && (
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Cog6ToothIcon className="w-4 h-4 mr-3 text-gray-400" />
                      Settings
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <ShieldCheckIcon className="w-4 h-4 mr-3 text-gray-400" />
                      Admin Panel
                    </button>
                  )}

                  <div className="border-t border-gray-200 my-2"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3 text-red-500" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;