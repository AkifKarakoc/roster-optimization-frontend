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

import './App.css';

// Temporary Home Page Component
const HomePage: React.FC = () => (
  <Layout>
    <div className="text-center py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Welcome to Roster Optimization System
      </h1>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Manage your workforce efficiently with our advanced scheduling and optimization tools.
        Start by managing departments, staff, and creating optimized work schedules.
      </p>
    </div>
  </Layout>
);

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