import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
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

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Home route */}
          <Route path="/" element={<><Navbar variant="teal" /><Home /></>} />
          
          {/* Academic routes */}
          <Route path="/instructor-home" element={<><Navbar variant="teal" /><InstructorHome /></>} />
          <Route path="/academics/assignments" element={<><Navbar variant="teal" /><Assignments /></>} />
          <Route path="/academics/red-pen-review" element={<><Navbar variant="teal" /><RedPenReview /></>} />
          <Route path="/academics/testing" element={<><Navbar variant="teal" /><Testing /></>} />
          <Route path="/academics/performance" element={<><Navbar variant="teal" /><Performance /></>} />
          
          {/* Operations routes */}
          <Route path="/operations/scheduling" element={<><Navbar variant="orange" /><Scheduling /></>} />
          <Route path="/operations/roster/students" element={<><Navbar variant="orange" /><StudentRoster /></>} />
          <Route path="/operations/roster/instructors" element={<><Navbar variant="orange" /><InstructorRoster /></>} />
          <Route path="/operations/roster/staff" element={<><Navbar variant="orange" /><StaffRoster /></>} />
          
          {/* Financial Dashboard routes */}
          <Route path="/operations/finance/overview" element={<><Navbar variant="orange" /><Overview /></>} />
          <Route path="/operations/finance/income" element={<><Navbar variant="orange" /><IncomeBreakdown /></>} />
          <Route path="/operations/finance/costs" element={<><Navbar variant="orange" /><CostBreakdown /></>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

