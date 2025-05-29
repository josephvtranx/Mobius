import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import SideNav from './components/SideNav';
import Home from './pages/Home';

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

// Navigation wrapper component
function NavigationWrapper() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="side-nav-container">
      {isHome ? <Navbar variant="teal" /> : <SideNav />}
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        {/* Navigation */}
        <NavigationWrapper />

        {/* Main content routes */}
        <Routes>
          {/* Home route */}
          <Route path="/" element={<Home />} />
          
          {/* Academic routes */}
          <Route path="/instructor-home" element={<InstructorHome />} />
          <Route path="/academics/assignments" element={<Assignments />} />
          <Route path="/academics/red-pen-review" element={<RedPenReview />} />
          <Route path="/academics/testing" element={<Testing />} />
          <Route path="/academics/performance" element={<Performance />} />
          
          {/* Operations routes */}
          <Route path="/operations/scheduling" element={<Scheduling />} />
          <Route path="/operations/roster/students" element={<StudentRoster />} />
          <Route path="/operations/roster/instructors" element={<InstructorRoster />} />
          <Route path="/operations/roster/staff" element={<StaffRoster />} />
          
          {/* Financial Dashboard routes */}
          <Route path="/operations/finance/overview" element={<Overview />} />
          <Route path="/operations/finance/income" element={<IncomeBreakdown />} />
          <Route path="/operations/finance/costs" element={<CostBreakdown />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

