import React, { useState, useEffect } from 'react';
import '../../css/Scheduling.css';
import SearchableDropdown from '../../components/SearchableDropdown';
import studentService from '../../services/studentService';
import instructorService from '../../services/instructorService';
import subjectService from '../../services/subjectService';
import classSeriesService from '../../services/classSeriesService';

function Scheduling() {
  // Form state
  const [formData, setFormData] = useState({
    student: '',
    subjectGroup: '',
    subject: '',
    instructor: '',
    location: '',
    classType: 'one-time',
    date: '',
    startTime: '',
    endTime: '',
    recDays: {
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false
    },
    recStart: '',
    recEnd: '',
    recStartTime: '',
    recEndTime: '',
    notes: ''
  });

  // Data state
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState({
    students: false,
    instructors: false,
    subjects: false
  });

  // Error state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Replace the static pendingClasses state with:
  const [pendingClasses, setPendingClasses] = useState([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);

  // Add this useEffect to fetch pending classes
  useEffect(() => {
    fetchPendingClasses();
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchStudents();
    fetchInstructors();
    fetchSubjectGroups();
  }, []);

  // Fetch subjects when subject group changes
  useEffect(() => {
    if (formData.subjectGroup) {
      fetchSubjects(formData.subjectGroup);
    } else {
      setSubjects([]);
    }
  }, [formData.subjectGroup]);

  const fetchStudents = async () => {
    setIsLoading(prev => ({ ...prev, students: true }));
    try {
      const data = await studentService.getAllStudents();
      const formattedStudents = data.map(student => ({
        id: student.student_id,
        name: student.name,
        first_name: student.first_name,
        last_name: student.last_name
      }));
      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, students: false }));
    }
  };

  const fetchInstructors = async () => {
    setIsLoading(prev => ({ ...prev, instructors: true }));
    try {
      const data = await instructorService.getInstructorRoster();
      const formattedInstructors = data.map(instructor => ({
        id: instructor.id,
        name: instructor.name,
        first_name: instructor.name.split(' ')[0] || '',
        last_name: instructor.name.split(' ').slice(1).join(' ') || '',
        teachingSubjects: instructor.teachingSubjects || []
      }));
      setInstructors(formattedInstructors);
    } catch (error) {
      console.error('Error fetching instructors:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, instructors: false }));
    }
  };

  const fetchSubjectGroups = async () => {
    setIsLoading(prev => ({ ...prev, subjects: true }));
    try {
      const data = await subjectService.getAllSubjectGroups();
      const formattedGroups = data.map(group => ({
        id: group.group_id,
        name: group.name,
        description: group.description
      }));
      setSubjectGroups(formattedGroups);
    } catch (error) {
      console.error('Error fetching subject groups:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, subjects: false }));
    }
  };

  const fetchSubjects = async (groupId) => {
    setIsLoading(prev => ({ ...prev, subjects: true }));
    try {
      const data = await subjectService.getAllSubjects();
      const filteredSubjects = data
        .filter(subject => subject.group_id === parseInt(groupId))
        .map(subject => ({
          id: subject.subject_id,
          name: subject.name,
          group_id: subject.group_id
        }));
      setSubjects(filteredSubjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, subjects: false }));
    }
  };

  // Filter instructors based on selected subject
  const getFilteredInstructors = () => {
    if (!formData.subject) {
      return instructors;
    }
    
    return instructors.filter(instructor => 
      instructor.teachingSubjects && 
      instructor.teachingSubjects.length > 0 &&
      instructor.teachingSubjects.some(subject => 
        subjects.find(s => s.id === formData.subject)?.name === subject
      )
    );
  };

  const fetchPendingClasses = async () => {
    setIsLoadingPending(true);
    try {
      const data = await classSeriesService.getPendingClassSeries();
      setPendingClasses(data);
    } catch (error) {
      console.error('Error fetching pending classes:', error);
    } finally {
      setIsLoadingPending(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        recDays: {
          ...prev.recDays,
          [value]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.id
    }));

    // If subject group is selected, fetch subjects for that group
    if (field === 'subjectGroup') {
      fetchSubjects(value.id);
      // Clear the subject and instructor selection when subject group changes
      setFormData(prev => ({
        ...prev,
        subject: '',
        instructor: ''
      }));
    }

    // If subject is selected, clear instructor selection since available instructors will change
    if (field === 'subject') {
      setFormData(prev => ({
        ...prev,
        instructor: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.student) newErrors.student = 'Student is required';
    if (!formData.subjectGroup) newErrors.subjectGroup = 'Subject group is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.instructor) newErrors.instructor = 'Instructor is required';
    if (!formData.location) newErrors.location = 'Location is required';

    if (formData.classType === 'one-time') {
      if (!formData.date) newErrors.date = 'Date is required';
      if (!formData.startTime) newErrors.startTime = 'Start time is required';
      if (!formData.endTime) newErrors.endTime = 'End time is required';
    } else {
      if (!formData.recStart) newErrors.recStart = 'Start date is required';
      if (!formData.recEnd) newErrors.recEnd = 'End date is required';
      if (!formData.recStartTime) newErrors.recStartTime = 'Start time is required';
      if (!formData.recEndTime) newErrors.recEndTime = 'End time is required';
      if (!Object.values(formData.recDays).some(day => day)) {
        newErrors.recDays = 'Select at least one day';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        if (formData.classType === 'one-time') {
          // Create one-time class
          await classSeriesService.createOneTimeClass({
            instructor_id: formData.instructor,
            student_id: formData.student,
            subject_id: formData.subject,
            session_date: formData.date,
            start_time: formData.startTime,
            end_time: formData.endTime,
            location: formData.location,
            notes: formData.notes
          });
        } else {
          // Create recurring class series
          await classSeriesService.createClassSeries({
            subject_id: formData.subject,
            student_id: formData.student,
            instructor_id: formData.instructor,
            start_date: formData.recStart,
            end_date: formData.recEnd,
            days_of_week: Object.entries(formData.recDays)
              .filter(([_, checked]) => checked)
              .map(([day]) => day),
            start_time: formData.recStartTime,
            end_time: formData.recEndTime,
            location: formData.location,
            notes: formData.notes
          });
        }

        // Reset form
        setFormData({
          student: '',
          subjectGroup: '',
          subject: '',
          instructor: '',
          location: '',
          classType: 'one-time',
          date: '',
          startTime: '',
          endTime: '',
          recDays: {
            mon: false,
            tue: false,
            wed: false,
            thu: false,
            fri: false,
            sat: false,
            sun: false
          },
          recStart: '',
          recEnd: '',
          recStartTime: '',
          recEndTime: '',
          notes: ''
        });
        setErrors({});
        alert('Class scheduled successfully!');
      } catch (error) {
        console.error('Error scheduling class:', error);
        alert(error.response?.data?.error || 'Failed to schedule class. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleEdit = async (id) => {
    // TODO: Implement edit functionality
    console.log('Edit class:', id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class series?')) {
      try {
        await classSeriesService.deleteClassSeries(id);
        fetchPendingClasses(); // Refresh the list
        alert('Class series deleted successfully');
      } catch (error) {
        console.error('Error deleting class series:', error);
        alert(error.response?.data?.error || 'Failed to delete class series');
      }
    }
  };

  return (
    <div className="page-container">
      <div className="main">
        <section className="dashboard-main">
          <form className="create-class-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Student</label>
              <SearchableDropdown
                options={students}
                value={formData.student}
                onChange={(value) => handleSelect('student', value)}
                placeholder="Search student"
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                className={errors.student ? 'error' : ''}
              />
              {errors.student && <span className="error-message">{errors.student}</span>}
            </div>

            <div className="form-group">
              <label>Subject Group</label>
              <SearchableDropdown
                options={subjectGroups}
                value={formData.subjectGroup}
                onChange={(value) => handleSelect('subjectGroup', value)}
                placeholder="Select subject group"
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                className={errors.subjectGroup ? 'error' : ''}
              />
              {errors.subjectGroup && <span className="error-message">{errors.subjectGroup}</span>}
            </div>

            <div className="form-group">
              <label>Subject</label>
              <SearchableDropdown
                options={subjects}
                value={formData.subject}
                onChange={(value) => handleSelect('subject', value)}
                placeholder="Select subject"
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                className={errors.subject ? 'error' : ''}
                disabled={!formData.subjectGroup}
              />
              {errors.subject && <span className="error-message">{errors.subject}</span>}
            </div>

            <div className="form-group">
              <label>Instructor</label>
              <SearchableDropdown
                options={getFilteredInstructors()}
                value={formData.instructor}
                onChange={(value) => handleSelect('instructor', value)}
                placeholder={formData.subject ? "Select instructor for this subject" : "Search instructor"}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                className={errors.instructor ? 'error' : ''}
                disabled={!formData.subject}
              />
              {errors.instructor && <span className="error-message">{errors.instructor}</span>}
              {formData.subject && getFilteredInstructors().length === 0 && (
                <span className="info-message">No instructors available for this subject</span>
              )}
            </div>

            <div className="form-group">
              <label>
                Location
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Zoom, Room A"
                  className={errors.location ? 'error' : ''}
                />
                {errors.location && <span className="error-message">{errors.location}</span>}
              </label>
            </div>

            <div className="form-group">
              <label>
                Class Type
                <select
                  name="classType"
                  value={formData.classType}
                  onChange={handleInputChange}
                >
                  <option value="one-time">One-Time</option>
                  <option value="recurring">Recurring</option>
                </select>
              </label>
            </div>

            {formData.classType === 'one-time' ? (
              <>
                <div className="form-group">
                  <label>
                    Date
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={errors.date ? 'error' : ''}
                    />
                    {errors.date && <span className="error-message">{errors.date}</span>}
                  </label>
                </div>
                <div className="form-group time-group">
                  <label>
                    Start Time
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className={errors.startTime ? 'error' : ''}
                    />
                    {errors.startTime && <span className="error-message">{errors.startTime}</span>}
                  </label>
                  <label>
                    End Time
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className={errors.endTime ? 'error' : ''}
                    />
                    {errors.endTime && <span className="error-message">{errors.endTime}</span>}
                  </label>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>
                    Days of Week
                    <div className="checkbox-row">
                      {Object.entries(formData.recDays).map(([day, checked]) => (
                        <label key={day}>
                          <input
                            type="checkbox"
                            name="recDays"
                            value={day}
                            checked={checked}
                            onChange={handleInputChange}
                          />
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </label>
                      ))}
                    </div>
                    {errors.recDays && <span className="error-message">{errors.recDays}</span>}
                  </label>
                </div>
                <div className="form-group date-group">
                  <label>
                    Start Date
                    <input
                      type="date"
                      name="recStart"
                      value={formData.recStart}
                      onChange={handleInputChange}
                      className={errors.recStart ? 'error' : ''}
                    />
                    {errors.recStart && <span className="error-message">{errors.recStart}</span>}
                  </label>
                  <label>
                    End Date
                    <input
                      type="date"
                      name="recEnd"
                      value={formData.recEnd}
                      onChange={handleInputChange}
                      className={errors.recEnd ? 'error' : ''}
                    />
                    {errors.recEnd && <span className="error-message">{errors.recEnd}</span>}
                  </label>
                </div>
                <div className="form-group time-group">
                  <label>
                    Start Time
                    <input
                      type="time"
                      name="recStartTime"
                      value={formData.recStartTime}
                      onChange={handleInputChange}
                      className={errors.recStartTime ? 'error' : ''}
                    />
                    {errors.recStartTime && <span className="error-message">{errors.recStartTime}</span>}
                  </label>
                  <label>
                    End Time
                    <input
                      type="time"
                      name="recEndTime"
                      value={formData.recEndTime}
                      onChange={handleInputChange}
                      className={errors.recEndTime ? 'error' : ''}
                    />
                    {errors.recEndTime && <span className="error-message">{errors.recEndTime}</span>}
                  </label>
                </div>
              </>
            )}

            <div className="form-group">
              <label>
                Notes
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Additional details..."
                />
              </label>
            </div>

            <button
              type="submit"
              className="btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Class'}
            </button>
          </form>

          <hr className="divider" />

          <section className="pending-classes">
            <h2 className="title">Pending Instructor Confirmations</h2>
            <div className="table-container">
              {isLoadingPending ? (
                <div className="loading">Loading pending classes...</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Instructor</th>
                      <th>Subject</th>
                      <th>Start</th>
                      <th>Days</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingClasses.map(classItem => (
                      <tr key={classItem.series_id}>
                        <td>{classItem.student.name}</td>
                        <td>{classItem.instructor.name}</td>
                        <td>{classItem.subject_name}</td>
                        <td>{new Date(classItem.start_date).toLocaleDateString()}</td>
                        <td>{classItem.days_of_week.join(', ')}</td>
                        <td>
                          <span className={`status-badge ${classItem.status.toLowerCase()}`}>
                            {classItem.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-icon" 
                              onClick={() => handleEdit(classItem.series_id)}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn-icon delete" 
                              onClick={() => handleDelete(classItem.series_id)}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pendingClasses.length === 0 && (
                      <tr>
                        <td colSpan="7" className="no-data">
                          No pending classes found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

export default Scheduling;