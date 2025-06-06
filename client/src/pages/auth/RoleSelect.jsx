import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaChalkboardTeacher, FaUserTie } from 'react-icons/fa';

function RoleSelect() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'student',
      name: 'Student',
      description: 'Join as a student to access courses and track your progress',
      icon: FaUserGraduate,
      path: '/auth/register/student'
    },
    {
      id: 'instructor',
      name: 'Instructor',
      description: 'Join as an instructor to teach and manage courses',
      icon: FaChalkboardTeacher,
      path: '/auth/register/instructor'
    },
    {
      id: 'staff',
      name: 'Staff',
      description: 'Join as staff to manage operations and scheduling',
      icon: FaUserTie,
      path: '/auth/register/staff'
    }
  ];

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Choose Your Role</h1>
          <p>Select how you'll be using Møbius Academy</p>
        </div>

        <div className="role-selection">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => navigate(role.path)}
              className="role-select-button"
            >
              <role.icon className="role-icon" aria-hidden="true" />
              <div className="role-text">
                <div className="role-name">{role.name}</div>
                <div className="role-description">{role.description}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="form-links">
          <div className="form-switch">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/auth/login')}
              className="switch-button"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .role-selection {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .role-select-button {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 20px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background-color: white;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .role-select-button:hover {
          border-color: #4299e1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(66, 153, 225, 0.15);
        }

        .role-icon {
          width: 32px;
          height: 32px;
          margin-right: 20px;
          color: #4299e1;
          flex-shrink: 0;
        }

        .role-text {
          flex: 1;
        }

        .role-name {
          font-weight: 600;
          font-size: 18px;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .role-description {
          font-size: 14px;
          color: #718096;
          line-height: 1.4;
        }

        .form-links {
          margin-top: 24px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

export default RoleSelect; 