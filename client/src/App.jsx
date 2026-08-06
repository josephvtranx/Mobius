import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import SideNav from './components/SideNav';
import Header from './components/Header';
import Home from './pages/Home';
import Messages from './pages/Messages';
import Landing from './pages/auth/Landing';
import Login from './pages/auth/login/Login';
import PasswordReset from './pages/auth/PasswordReset';
import InstitutionRegistration from './pages/auth/register/institution/InstitutionRegistration';
import RoleSelect from './pages/auth/register/user/RoleSelect';
import StudentRegistration from './pages/auth/register/user/StudentRegistration';
import InstructorRegistration from './pages/auth/register/user/InstructorRegistration';
import StaffRegistration from './pages/auth/register/user/StaffRegistration';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './pages/auth/Unauthorized';
import authService from './services/authService';
import { ROLE_THEME } from './config/shellNav';

// Operations pages
import Scheduling from './pages/operations/Scheduling';
import Attendance from './pages/operations/Attendance';
import Payroll from './pages/operations/Payroll';
import ClassesList from './pages/operations/classes/ClassesList';
import WalletView from './pages/operations/wallets/WalletView';
import ReportsDashboard from './pages/operations/ReportsDashboard';
import MembershipRequests from './pages/operations/MembershipRequests';
import GuardianPortal from './pages/family/GuardianPortal';
import GuardianBilling from './pages/family/GuardianBilling';
import GuardianRequests from './pages/family/GuardianRequests';
import StudentSchedule from './pages/family/StudentSchedule';
import StudentRecord from './pages/family/StudentRecord';
import Catalog from './pages/family/Catalog';
import BookSession from './pages/family/BookSession';
import StudentClasses from './pages/family/StudentClasses';
import InstructorInbox from './pages/instructor/InstructorInbox';
import InstructorAvailability from './pages/instructor/Availability';
import MyClasses from './pages/instructor/MyClasses';
import InstructorFeedback from './pages/instructor/Feedback';
import InstructorPay from './pages/instructor/Pay';
import CreateClass from './pages/operations/classes/CreateClass';
import ClassDetail from './pages/operations/classes/ClassDetail';
import SessionAttendance from './pages/operations/classes/SessionAttendance';
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
import './css/tokens.css';
import './css/shell.css';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
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
  const role = authService.getCurrentUser()?.role;
  const variant = isAuthRoute ? 'auth' : (ROLE_THEME[role] || 'teal');

  return (
    <div className={`app app-shell--${variant}`}>
      {/* Portal target for the shared Modal component. Lives inside the
          themed shell div (not a sibling of it) so modal content actually
          inherits the role's --shell-* custom properties instead of
          resolving them as unset. */}
      <div id="modal-root"></div>
      {/* Main content area: sidebar (full page height) beside a column that
          holds the topbar + routed page content. The topbar only spans the
          column next to the sidebar, never the sidebar itself. */}
      <div className={`main-content ${isAuthRoute ? 'auth-layout' : 'app-layout'}`}>
        {/* Shared shell sidebar - only on authenticated, non-landing routes */}
        {!isAuthRoute && !isLandingPage && <SideNav />}

        <div className="app-main-column">
          {!isLandingPage && <Header variant={variant} />}

          {/* Routes */}
          <div className="content-area">
          <Routes>
            {/* Entry: interact-to-continue landing → login (the old
                Toggle/Fork intermediaries are gone — registration links
                live on Login) */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/reset" element={<PasswordReset />} />
            <Route path="/auth/register/institution" element={<InstitutionRegistration />} />
            <Route path="/auth/register/user/role-select" element={<RoleSelect />} />
            <Route path="/auth/register/user/student" element={<StudentRegistration />} />
            <Route path="/auth/register/user/instructor" element={<InstructorRegistration />} />
            <Route path="/auth/register/user/staff" element={<StaffRegistration />} />

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
              path="/operations/attendance"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/payroll"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <Payroll />
                </ProtectedRoute>
              }
            />
            {/* v2 classes domain (template pages — staff-gated) */}
            <Route
              path="/operations/classes"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <ClassesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/classes/new"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <CreateClass />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/classes/:classId"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <ClassDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/classes/:classId/sessions/:sessionId/attendance"
              element={
                <ProtectedRoute allowedRoles={['staff', 'instructor']}>
                  <SessionAttendance />
                </ProtectedRoute>
              }
            />
            {/* v2 family surfaces (template pages) */}
            <Route path="/portal" element={
              <ProtectedRoute allowedRoles={['guardian']}><GuardianPortal /></ProtectedRoute>
            } />
            <Route path="/catalog" element={
              <ProtectedRoute><Catalog /></ProtectedRoute>
            } />
            <Route path="/family/students/:studentId/schedule" element={
              <ProtectedRoute allowedRoles={['guardian', 'student', 'staff']}><StudentSchedule /></ProtectedRoute>
            } />
            <Route path="/family/students/:studentId/record" element={
              <ProtectedRoute allowedRoles={['guardian', 'student', 'staff']}><StudentRecord /></ProtectedRoute>
            } />
            <Route path="/family/students/:studentId/book" element={
              <ProtectedRoute allowedRoles={['guardian', 'student', 'staff']}><BookSession /></ProtectedRoute>
            } />
            <Route path="/family/students/:studentId/classes" element={
              <ProtectedRoute allowedRoles={['guardian', 'student', 'staff']}><StudentClasses /></ProtectedRoute>
            } />
            <Route path="/family/students/:studentId/billing" element={
              <ProtectedRoute allowedRoles={['guardian', 'student', 'staff']}><GuardianBilling /></ProtectedRoute>
            } />
            <Route path="/family/students/:studentId/requests" element={
              <ProtectedRoute allowedRoles={['guardian', 'student', 'staff']}><GuardianRequests /></ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute><Messages /></ProtectedRoute>
            } />
            <Route path="/inbox" element={
              <ProtectedRoute allowedRoles={['instructor', 'staff']}><InstructorInbox /></ProtectedRoute>
            } />
            <Route path="/instructor/availability" element={
              <ProtectedRoute allowedRoles={['instructor']}><InstructorAvailability /></ProtectedRoute>
            } />
            <Route path="/instructor/classes" element={
              <ProtectedRoute allowedRoles={['instructor']}><MyClasses /></ProtectedRoute>
            } />
            <Route path="/instructor/feedback" element={
              <ProtectedRoute allowedRoles={['instructor']}><InstructorFeedback /></ProtectedRoute>
            } />
            <Route path="/instructor/pay" element={
              <ProtectedRoute allowedRoles={['instructor']}><InstructorPay /></ProtectedRoute>
            } />
            <Route path="/operations/requests" element={
              <ProtectedRoute allowedRoles={['staff']}><MembershipRequests /></ProtectedRoute>
            } />
            {/* v2 billing + reports (template pages — staff-gated) */}
            <Route
              path="/operations/wallets"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <WalletView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/reports"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <ReportsDashboard />
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

            {/* Catch-all: nav items pointing at routes the design integration
                hasn't built yet land here instead of a blank page. */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

