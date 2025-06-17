import React, { useState, useEffect } from 'react';
import '../../../css/ClassRoster.css';
import Modal from '../../../components/Modal';

// Define API URL
const API_URL = 'http://localhost:5001';

function ClassRoster() {
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [showSubjectGroupModal, setShowSubjectGroupModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubjectGroup, setNewSubjectGroup] = useState({ name: '', description: '' });
  const [newSubject, setNewSubject] = useState({ name: '', group_id: '' });

  // Fetch subject groups when component mounts
  useEffect(() => {
    fetchSubjectGroups();
  }, []);

  const fetchSubjectGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/api/subjects/subject-groups`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch subject groups');
      }

      const data = await response.json();
      console.log('Raw API response:', data);
      
      // Verify the structure of each group
      data.forEach(group => {
        console.log(`Group ${group.name}:`, {
          group_id: group.group_id,
          name: group.name,
          description: group.description,
          subjects: group.subjects,
          subjectsLength: group.subjects?.length
        });
      });

      setSubjectGroups(data);
    } catch (error) {
      console.error('Error fetching subject groups:', error);
      alert('Failed to fetch subject groups. Please try again.');
    }
  };

  const handleSubjectGroupSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to create a subject group');
      return;
    }

    try {
      const response = await fetch('/api/subject-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSubjectGroup)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subject group');
      }

      // Close modal and reset form
      setShowSubjectGroupModal(false);
      setNewSubjectGroup({ name: '', description: '' });

      // Refresh the data
      await fetchSubjectGroups();
      
      alert('Subject group created successfully!');
    } catch (error) {
      console.error('Error creating subject group:', error);
      alert(error.message || 'Failed to create subject group');
    }
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to create a subject');
      return;
    }

    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSubject)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subject');
      }

      // Close modal and reset form
      setShowSubjectModal(false);
      setNewSubject({ name: '', group_id: '' });

      // Refresh the data
      await fetchSubjectGroups();
      
      alert('Subject created successfully!');
    } catch (error) {
      console.error('Error creating subject:', error);
      alert(error.message || 'Failed to create subject');
    }
  };

  return (
    <div className="main">
      <div className="main-class-roster">
        <div className="roster-header">
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={() => setShowSubjectGroupModal(true)}>
              <i className="fas fa-plus"></i> New Subject Group
            </button>
          </div>
        </div>
        <div className="roster-table-container">
          <table className="roster-table">
            <thead>
              <tr>
                <th>Subject Group</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjectGroups.map((group) => {
                console.log('Rendering group:', group); // Debug log
                return (
                  <React.Fragment key={group.group_id}>
                    <tr 
                      className={`subject-group-row ${expandedSubject === group.group_id ? 'expanded' : ''}`}
                      onClick={() => setExpandedSubject(expandedSubject === group.group_id ? null : group.group_id)}
                    >
                      <td>{group.name}</td>
                      <td>{group.description}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewSubject({ name: '', group_id: group.group_id });
                            setShowSubjectModal(true);
                          }}
                        >
                          <i className="fas fa-plus"></i> Add class
                        </button>
                      </td>
                    </tr>
                    {expandedSubject === group.group_id && (
                      <tr>
                        <td colSpan="4" className="expanded-content">
                          {console.log('Rendering expanded group:', group)}
                          {console.log('Subjects for this group:', group.subjects)}
                          {group.subjects && group.subjects.length > 0 ? (
                            <div className="subjects-table-container">
                              <table className="subjects-table">
                                <thead>
                                  <tr>
                                    <th>Subject Name</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {group.subjects.map(subject => {
                                    console.log('Rendering subject:', subject);
                                    return (
                                      <tr key={subject.subject_id}>
                                        <td>{subject.name}</td>
                                        <td>
                                          <button className="edit-button">Edit</button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="no-subjects">
                              <p>No subjects exist in this group yet.</p>
                              <button 
                                className="add-subject-button"
                                onClick={() => {
                                  setNewSubject({ name: '', group_id: group.group_id });
                                  setShowSubjectModal(true);
                                }}
                              >
                                Add New Subject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject Group Modal */}
      <Modal 
        isOpen={showSubjectGroupModal} 
        onClose={() => setShowSubjectGroupModal(false)}
      >
        <div className="modal-header">
          <h3>Create New Subject Group</h3>
          <button className="close-button" onClick={() => setShowSubjectGroupModal(false)}>×</button>
        </div>
        <form onSubmit={handleSubjectGroupSubmit}>
          <div className="form-group">
            <label htmlFor="groupName">Name</label>
            <input
              type="text"
              id="groupName"
              value={newSubjectGroup.name}
              onChange={(e) => setNewSubjectGroup({ ...newSubjectGroup, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="groupDescription">Description</label>
            <textarea
              id="groupDescription"
              value={newSubjectGroup.description}
              onChange={(e) => setNewSubjectGroup({ ...newSubjectGroup, description: e.target.value })}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowSubjectGroupModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </Modal>

      {/* Subject Modal */}
      <Modal 
        isOpen={showSubjectModal} 
        onClose={() => setShowSubjectModal(false)}
      >
        <div className="modal-header">
          <h3>Create New Subject</h3>
          <button className="close-button" onClick={() => setShowSubjectModal(false)}>×</button>
        </div>
        <form onSubmit={handleSubjectSubmit}>
          <div className="form-group">
            <label htmlFor="subjectName">Name</label>
            <input
              type="text"
              id="subjectName"
              value={newSubject.name}
              onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowSubjectModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ClassRoster; 