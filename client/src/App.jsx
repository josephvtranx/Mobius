import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import SideNav from './components/SideNav';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import RoleSelect from './pages/auth/RoleSelect';
import StudentRegistration from './pages/auth/StudentRegistration';
import InstructorRegistration from './pages/auth/InstructorRegistration';
import StaffRegistration from './pages/auth/StaffRegistration';
import ProfileCard from './components/ProfileCard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './pages/auth/Unauthorized';

// Academic pages
import InstructorHome from './pages/academics/InstructorHome';
import Performance from './pages/academics/Performance';
import Assignments from './pages/academics/academic-hub/Assignments';
import RedPenReview from './pages/academics/academic-hub/Red-Pen-Review';
import Testing from './pages/academics/academic-hub/Testing';

// Operations pages
import Scheduling from './pages/operations/Scheduling';
import StudentRoster from './pages/operations/roster/StudentRoster';
import InstructorRoster from './pages/operations/roster/InstructorRoster';
import StaffRoster from './pages/operations/roster/StaffRoster';

// Financial Dashboard pages
import Overview from './pages/operations/Financial-Dashboard/Overview';
import IncomeBreakdown from './pages/operations/Financial-Dashboard/Income-Breakdown';
import CostBreakdown from './pages/operations/Financial-Dashboard/Cost-Breakdown';

import './css/index.css';
import './css/Login.css';

// Navigation wrapper component
function NavigationWrapper() {
  const location = useLocation();
  const isHome = location.pathname === '/home';
  const isAuthRoute = location.pathname.startsWith('/auth/');

  if (isAuthRoute) return null;

  return (
    <nav className="side-nav-container">
      {isHome ? <Navbar variant="teal" /> : <SideNav />}
    </nav>
  );
}

// App content wrapper component
function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/home';
  const isAuthRoute = location.pathname.startsWith('/auth/');

  return (
    <div className="app">
      {/* Header - Always show except on auth routes */}
      {!isAuthRoute && <Header />}
      
      {/* Navigation */}
      <NavigationWrapper />

      {/* Main content routes */}
      <Routes>
        {/* Auth routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/role-select" element={<RoleSelect />} />
        <Route path="/auth/register/student" element={<StudentRegistration />} />
        <Route path="/auth/register/instructor" element={<InstructorRegistration />} />
        <Route path="/auth/register/staff" element={<StaffRegistration />} />
        
        {/* Redirect from / to /auth/login or /home based on auth status */}
        <Route
          path="/"
          element={
            localStorage.getItem('token') ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />

        {/* Redirect old /login to /auth/login */}
        <Route
          path="/login"
          element={<Navigate to="/auth/login" replace />}
        />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        
        {/* Academic routes */}
        <Route
          path="/academics/InstructorHome"
          element={
            <ProtectedRoute>
              <InstructorHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/academics/assignments"
          element={
            <ProtectedRoute>
              <Assignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/academics/red-pen-review"
          element={
            <ProtectedRoute>
              <RedPenReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/academics/testing"
          element={
            <ProtectedRoute>
              <Testing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/academics/performance"
          element={
            <ProtectedRoute>
              <Performance />
            </ProtectedRoute>
          }
        />
        
        {/* Operations routes */}
        <Route
          path="/operations/scheduling"
          element={
            <ProtectedRoute>
              <Scheduling />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/roster/students"
          element={
            <ProtectedRoute>
              <StudentRoster />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/roster/instructors"
          element={
            <ProtectedRoute>
              <InstructorRoster />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/roster/staff"
          element={
            <ProtectedRoute>
              <StaffRoster />
            </ProtectedRoute>
          }
        />
        
        {/* Financial Dashboard routes */}
        <Route
          path="/operations/finance/overview"
          element={
            <ProtectedRoute>
              <Overview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/finance/income"
          element={
            <ProtectedRoute>
              <IncomeBreakdown />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations/finance/costs"
          element={
            <ProtectedRoute>
              <CostBreakdown />
            </ProtectedRoute>
          }
        />

        {/* Profile route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Unauthorized route */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Admin Dashboard</div>
            </ProtectedRoute>
          }
        />

        {/* Instructor routes */}
        <Route
          path="/instructor"
          element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <div>Instructor Dashboard</div>
            </ProtectedRoute>
          }
        />

        {/* Student routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <div>Student Dashboard</div>
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Profile Card - Only show on protected routes */}
      {!isAuthRoute && <ProfileCard />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

