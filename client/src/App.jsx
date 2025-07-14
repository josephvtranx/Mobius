import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import SideNav from './components/SideNav';
import Header from './components/Header';
import Home from './pages/Home';
import Landing from './pages/auth/user-sign-up/Landing';
import Login from './pages/auth/sign in/Login';
import RoleSelect from './pages/auth/user-sign-up/RoleSelect';
import StudentRegistration from './pages/auth/user-sign-up/StudentRegistration';
import InstructorRegistration from './pages/auth/user-sign-up/InstructorRegistration';
import StaffRegistration from './pages/auth/user-sign-up/StaffRegistration';
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
import ClassRoster from './pages/operations/roster/ClassRoster';
import Schedule from './pages/operations/Schedule';

// Financial Dashboard pages
import Overview from './pages/operations/Financial-Dashboard/Overview';
import IncomeBreakdown from './pages/operations/Financial-Dashboard/Income-Breakdown';
import CostBreakdown from './pages/operations/Financial-Dashboard/Cost-Breakdown';
import Payments from './pages/operations/Financial-Dashboard/Payments';

import './css/index.css';
import './css/login.css';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <div id="modal-root"></div>
        <AppContent />
      </Router>
    </DndProvider>
  );
}

// App content wrapper component
function AppContent() {
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith('/auth/');
  const isLandingPage = location.pathname === '/';
  const variant = isAuthRoute ? 'auth' : (location.pathname === '/home' || location.pathname.startsWith('/operations') ? 'orange' : 'teal');

  return (
    <div className="app">
      {/* Header - Show on all pages except home and landing */}
      {location.pathname !== '/home' && !isLandingPage && <Header variant={variant} />}
      
      {/* Main content area */}
      <div className={`main-content ${isAuthRoute ? 'auth-layout' : 'app-layout'}`}>
        {/* Navigation and Profile - Only show on non-auth routes and not landing */}
        {!isAuthRoute && !isLandingPage && (
          <>
            <nav className="side-nav-container">
              <SideNav />
              <ProfileCard />
            </nav>
          </>
        )}

        {/* Routes */}
        <div className="content-area">
          <Routes>
            {/* Landing page */}
            <Route path="/" element={<Landing />} />
            
            {/* Auth routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/role-select" element={<RoleSelect />} />
            <Route path="/auth/register/student" element={<StudentRegistration />} />
            <Route path="/auth/register/instructor" element={<InstructorRegistration />} />
            <Route path="/auth/register/staff" element={<StaffRegistration />} />

            {/* Redirect /login to /auth/login */}
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
              path="/academics/performance"
              element={
                <ProtectedRoute>
                  <Performance />
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
              path="/operations/schedule"
              element={
                <ProtectedRoute>
                  <Schedule />
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
            <Route
              path="/operations/roster/classes"
              element={
                <ProtectedRoute>
                  <ClassRoster />
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
            <Route
              path="/operations/finance/payments"
              element={
                <ProtectedRoute>
                  <Payments />
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
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;

