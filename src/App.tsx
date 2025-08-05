import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Auth Components
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import StaffPage from './pages/StaffPage';
import DepartmentPage from './pages/DepartmentPage';
import QualificationPage from './pages/QualificationPage';
import WorkingPeriodPage from './pages/WorkingPeriodPage';
import ShiftPage from './pages/ShiftPage';
import SquadWorkingPatternPage from './pages/SquadWorkingPatternPage';
import SquadPage from './pages/SquadPage';
import TaskPage from './pages/TaskPage';
import DayOffRulePage from './pages/DayOffRulePage';
import ConstraintPage from './pages/ConstraintPage';
import RosterPage from './pages/RosterPage';

// Development utilities  
import './utils/rosterTestUtils';
import Layout from './components/common/Layout';
import BulkExcelUploadModal from './components/excel/BulkExcelUploadModal';

import './App.css';

// Dashboard Page Component with Bulk Upload
const HomePage: React.FC = () => {
  const [isBulkUploadOpen, setBulkUploadOpen] = React.useState(false);

  const entityCards = [
    {
      title: 'Staff Management',
      description: 'Manage employee information, qualifications, and assignments',
      link: '/staff',
      icon: '👥',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800'
    },
    {
      title: 'Departments',
      description: 'Organize and manage different departments',
      link: '/departments',
      icon: '🏢',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800'
    },
    {
      title: 'Shifts & Tasks',
      description: 'Define work shifts and task assignments',
      link: '/shifts',
      icon: '⏰',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800'
    },
    {
      title: 'Roster Generation',
      description: 'Create optimized work schedules and rosters',
      link: '/roster',
      icon: '📅',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800'
    },
    {
      title: 'Squads & Patterns',
      description: 'Manage working squads and patterns',
      link: '/squads',
      icon: '⚡',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      textColor: 'text-indigo-800'
    },
    {
      title: 'Qualifications',
      description: 'Define required skills and qualifications',
      link: '/qualifications',
      icon: '🎯',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800'
    }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Roster Optimization Dashboard
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Manage your workforce efficiently with our advanced scheduling and optimization tools.
            Import data in bulk or manage individual entities to create optimized work schedules.
          </p>
        </div>

        {/* Bulk Import Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                📊 Bulk Data Import
              </h2>
              <p className="text-gray-600 mb-4">
                Import multiple entity types at once using our bulk Excel import feature. 
                Upload a single Excel file with multiple sheets for departments, staff, shifts, and more.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Color-coded validation
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Auto-correction suggestions
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Selective import
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => setBulkUploadOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Bulk Import</span>
              </button>
            </div>
          </div>
        </div>

        {/* Entity Management Cards */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Entity Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entityCards.map((card, index) => (
              <div
                key={index}
                className={`${card.bgColor} ${card.borderColor} border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer group`}
                onClick={() => window.location.href = card.link}
              >
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{card.icon}</span>
                  <h3 className={`text-lg font-semibold ${card.textColor}`}>
                    {card.title}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  {card.description}
                </p>
                <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-800">
                  <span>Manage</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium text-gray-900 mb-2">📋 Templates</h3>
              <p className="text-gray-600 text-sm mb-3">
                Download Excel templates for data import
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Download Templates →
              </button>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium text-gray-900 mb-2">🔧 System Setup</h3>
              <p className="text-gray-600 text-sm mb-3">
                Configure constraints and working patterns
              </p>
              <button 
                onClick={() => window.location.href = '/constraints'}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Setup System →
              </button>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium text-gray-900 mb-2">📊 Generate Roster</h3>
              <p className="text-gray-600 text-sm mb-3">
                Create optimized work schedules
              </p>
              <button 
                onClick={() => window.location.href = '/roster'}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Generate Now →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Upload Modal */}
      <BulkExcelUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        onSuccess={() => {
          setBulkUploadOpen(false);
          // Could add a success notification here
        }}
      />
    </Layout>
  );
};

// Temporary placeholder for other pages
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <Layout>
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600">This page is under development.</p>
    </div>
  </Layout>
);

function App() {
  const { loadUserFromStorage, isAuthenticated } = useAuthStore();

  // Load user from storage on app start
  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          
          {/* All Management Pages - Available to all authenticated users for viewing */}
          {/* ADMIN can create/edit/delete, USER can only view */}
          
          <Route path="/staff" element={
            <ProtectedRoute>
              <StaffPage />
            </ProtectedRoute>
          } />

          <Route path="/departments" element={
            <ProtectedRoute>
              <DepartmentPage />
            </ProtectedRoute>
          } />

          <Route path="/qualifications" element={
            <ProtectedRoute>
              <QualificationPage />
            </ProtectedRoute>
          } />

          <Route path="/working-periods" element={
            <ProtectedRoute>
              <WorkingPeriodPage />
            </ProtectedRoute>
          } />

          <Route path="/shifts" element={
            <ProtectedRoute>
              <ShiftPage />
            </ProtectedRoute>
          } />

          <Route path="/squad-working-patterns" element={
            <ProtectedRoute>
              <SquadWorkingPatternPage />
            </ProtectedRoute>
          } />

          <Route path="/squads" element={
            <ProtectedRoute>
              <SquadPage />
            </ProtectedRoute>
          } />

          <Route path="/tasks" element={
            <ProtectedRoute>
              <TaskPage />
            </ProtectedRoute>
          } />

          <Route path="/day-off-rules" element={
            <ProtectedRoute>
              <DayOffRulePage />
            </ProtectedRoute>
          } />

          {/* Constraint Management - Admin only */}
          <Route path="/constraints" element={
            <ProtectedRoute requiredRoles={['ADMIN']}>
              <ConstraintPage />
            </ProtectedRoute>
          } />

          {/* Roster Generation - Available to all users */}
          <Route path="/roster" element={
            <ProtectedRoute>
              <RosterPage />
            </ProtectedRoute>
          } />

          {/* Catch all - redirect to home if authenticated, login if not */}
          <Route path="*" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;