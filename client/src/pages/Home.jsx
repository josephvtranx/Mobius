import React from 'react';
import Navbar from '../components/Navbar';
import ProfileCard from '../components/ProfileCard';

function Home() {
  return (
    <div className="page-container">
      {/* Sidebar Nav */}
      <Navbar />

      {/* Profile card (bottom-left) */}
      <ProfileCard />

      {/* Main dashboard content */}
      <main className="main-dashboard">
        <div className="dashboard-container">
          <div className="dashboard-main">
            {/* Header */}
            <div className="dashboard-header">
              <h1>Welcome back, Yvonne</h1>
              <div className="search-bar-home">
                <input type="text" placeholder="Find a Page" />
              </div>
            </div>

            {/* Dashboard content */}
            <div className="dashboard-content">
              {/* Recently Visited */}
              <div className="recently-visited">
                <h2>Recently Visited</h2>
                <div className="card">
                  <p>TEXT subject</p>
                  <span className="timestamp">2 hours ago</span>
                </div>
                <div className="card">
                  <p>
                    10/12 Test Results
                    <br />
                    <small>SAT Mock Test</small>
                  </p>
                  <span className="timestamp">28 mins ago</span>
                </div>
              </div>

              {/* Upcoming */}
              <div className="upcoming">
                <h2>Upcoming</h2>
                <div className="card">
                  <p>Assignment 3 Problemsets</p>
                  <span className="timestamp">2 hours ago</span>
                </div>
                <div className="card">
                  <p>
                    10/12 Test Results
                    <br />
                    <small>SAT Mock Test</small>
                  </p>
                  <span className="timestamp">27 hours ago</span>
                </div>
              </div>

              {/* Calendar Widget */}
              <div className="calendar-widget">
                <div className="calendar-header">
                  <span>January 2025</span>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Sun</th>
                      <th>Mon</th>
                      <th>Tue</th>
                      <th>Wed</th>
                      <th>Thu</th>
                      <th>Fri</th>
                      <th>Sat</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td>
                    </tr>
                    <tr>
                      <td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td><td>13</td>
                    </tr>
                    <tr>
                      <td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td><td>20</td>
                    </tr>
                    <tr>
                      <td>21</td><td>22</td><td>23</td><td>24</td><td>25</td><td>26</td><td>27</td>
                    </tr>
                    <tr>
                      <td>28</td><td>29</td><td>30</td><td>31</td><td></td><td></td><td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
