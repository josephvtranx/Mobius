import React, { Suspense, lazy } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import SideNav from './components/SideNav';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import authService from './services/authService';
import { ROLE_THEME } from './config/shellNav';

// Entry pages stay eager so the very first paint (landing/login) has no
// Suspense flash. Everything else is code-split via React.lazy so a
// student never downloads staff/finance code and vice versa — the whole
// app used to ship as one ~800KB bundle regardless of role.
import Landing from './pages/auth/Landing';
import Login from './pages/auth/login/Login';

const Home = lazy(() => import('./pages/Home'));
const Messages = lazy(() => import('./pages/Messages'));
const PasswordReset = lazy(() => import('./pages/auth/PasswordReset'));
const InstitutionRegistration = lazy(() => import('./pages/auth/register/institution/InstitutionRegistration'));
const RoleSelect = lazy(() => import('./pages/auth/register/user/RoleSelect'));
const StudentRegistration = lazy(() => import('./pages/auth/register/user/StudentRegistration'));
const InstructorRegistration = lazy(() => import('./pages/auth/register/user/InstructorRegistration'));
const StaffRegistration = lazy(() => import('./pages/auth/register/user/StaffRegistration'));
const Profile = lazy(() => import('./pages/Profile'));
const Unauthorized = lazy(() => import('./pages/auth/Unauthorized'));

// Operations pages
const Scheduling = lazy(() => import('./pages/operations/Scheduling'));
const Attendance = lazy(() => import('./pages/operations/Attendance'));
const Payroll = lazy(() => import('./pages/operations/Payroll'));
const ClassesList = lazy(() => import('./pages/operations/classes/ClassesList'));
const WalletView = lazy(() => import('./pages/operations/wallets/WalletView'));
const ReportsDashboard = lazy(() => import('./pages/operations/ReportsDashboard'));
const MembershipRequests = lazy(() => import('./pages/operations/MembershipRequests'));
const TaskInbox = lazy(() => import('./pages/operations/TaskInbox'));
const GuardianPortal = lazy(() => import('./pages/family/GuardianPortal'));
const GuardianBilling = lazy(() => import('./pages/family/GuardianBilling'));
const GuardianRequests = lazy(() => import('./pages/family/GuardianRequests'));
const StudentSchedule = lazy(() => import('./pages/family/StudentSchedule'));
const StudentRecord = lazy(() => import('./pages/family/StudentRecord'));
const Catalog = lazy(() => import('./pages/family/Catalog'));
const BookSession = lazy(() => import('./pages/family/BookSession'));
const StudentClasses = lazy(() => import('./pages/family/StudentClasses'));
const InstructorInbox = lazy(() => import('./pages/instructor/InstructorInbox'));
const InstructorAvailability = lazy(() => import('./pages/instructor/Availability'));
const MyClasses = lazy(() => import('./pages/instructor/MyClasses'));
const InstructorFeedback = lazy(() => import('./pages/instructor/Feedback'));
const InstructorPay = lazy(() => import('./pages/instructor/Pay'));
const CreateClass = lazy(() => import('./pages/operations/classes/CreateClass'));
const ClassDetail = lazy(() => import('./pages/operations/classes/ClassDetail'));
const SessionAttendance = lazy(() => import('./pages/operations/classes/SessionAttendance'));
const StudentRoster = lazy(() => import('./pages/operations/roster/StudentRoster'));
const InstructorRoster = lazy(() => import('./pages/operations/roster/InstructorRoster'));
const StaffRoster = lazy(() => import('./pages/operations/roster/StaffRoster'));
const ClassRoster = lazy(() => import('./pages/operations/roster/ClassRoster'));
const Schedule = lazy(() => import('./pages/operations/Schedule'));

// Financial Dashboard pages
const Overview = lazy(() => import('./pages/operations/Financial-Dashboard/Overview'));
const IncomeBreakdown = lazy(() => import('./pages/operations/Financial-Dashboard/Income-Breakdown'));
const CostBreakdown = lazy(() => import('./pages/operations/Financial-Dashboard/Cost-Breakdown'));
const Payments = lazy(() => import('./pages/operations/Financial-Dashboard/Payments'));

import './css/index.css';
import './css/login.css';
import './css/tokens.css';
import './css/shell.css';
// home.css defines the shared hm-* design-system vocabulary (cards,
// buttons, page layout, tables) used across many pages — not just Home.
// It must load globally: with route-level code-splitting, a lazy page that
// uses hm-* classes but doesn't itself import home.css would otherwise
// render unstyled (only its own chunk's CSS loads).
import './css/home.css';

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
          <Suspense fallback={<div className="hm-loading" style={{ padding: 40 }}>Loading…</div>}>
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
                <ProtectedRoute allowedRoles={['staff']}>
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
            <Route path="/operations/tasks" element={
              <ProtectedRoute allowedRoles={['staff']}><TaskInbox /></ProtectedRoute>
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
                <ProtectedRoute allowedRoles={['instructor', 'staff']}>
                  <Schedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/roster/students"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StudentRoster />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/roster/instructors"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <InstructorRoster />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/roster/staff"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <StaffRoster />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/roster/classes"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <ClassRoster />
                </ProtectedRoute>
              }
            />

            {/* Financial Dashboard routes */}
            <Route
              path="/operations/finance/overview"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <Overview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/finance/income"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <IncomeBreakdown />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/finance/costs"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <CostBreakdown />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/finance/payments"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
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
          </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

