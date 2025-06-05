import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, AcademicCapIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

function RoleSelect() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'student',
      name: 'Student',
      description: 'Join as a student to access courses and track your progress',
      icon: UserIcon,
      path: '/auth/register/student'
    },
    {
      id: 'instructor',
      name: 'Instructor',
      description: 'Join as an instructor to teach and manage courses',
      icon: AcademicCapIcon,
      path: '/auth/register/instructor'
    },
    {
      id: 'staff',
      name: 'Staff',
      description: 'Join as staff to manage operations and scheduling',
      icon: BriefcaseIcon,
      path: '/auth/register/staff'
    }
  ];

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Choose Your Role</h1>
          <p>Select how you'll be using Mobius</p>
        </div>

        <div className="login-form">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => navigate(role.path)}
              className="role-select-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '16px',
                marginBottom: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: 'white',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#007bff';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <role.icon className="h-6 w-6 text-blue-600 mr-3" aria-hidden="true" />
              <div>
                <div className="font-medium text-gray-900">{role.name}</div>
                <div className="text-sm text-gray-500">{role.description}</div>
              </div>
            </button>
          ))}

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
    </div>
  );
}

export default RoleSelect; 