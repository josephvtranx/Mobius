import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import '../../css/Scheduling.css';
import SearchableDropdown from '../../components/SearchableDropdown';
import SmartSchedulingCalendar from '../../components/SmartSchedulingCalendar';
import studentService from '../../services/studentService';
import instructorService from '../../services/instructorService';
import subjectService from '../../services/subjectService';
import classSeriesService from '../../services/classSeriesService';
import timePackageService from '../../services/timePackageService';

function Scheduling() {
  // Form state
  const [formData, setFormData] = useState({
    student: '',
    subjectGroup: '',
    subject: '',
    location: '',
    selectedTimeSlot: null,
    notes: '',
    numSessions: 1,
    endDate: '',
    timePackageId: null
  });

  // Student preferences for the calendar
  const [preferences, setPreferences] = useState({
    preferredDays: {
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false
    },
    preferredStartTime: '09:00',
    duration: 60
  });
  const [selectedInstructorId, setSelectedInstructorId] = useState(null);

  // Selected block values (for display in dropdowns)
  const [selectedBlockValues, setSelectedBlockValues] = useState({
    startTime: '09:00',
    duration: 60
  });

  // Data state
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState({
    students: false,
    instructors: false,
    subjects: false,
  });

  // Time info state
  const [timeInfo, setTimeInfo] = useState({
    studentTime: 0,
    timeNeeded: 0
  });

  // Error state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pending classes state
  const [pendingClasses, setPendingClasses] = useState([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);

  // Time packages state
  const [timePackages, setTimePackages] = useState([]);
  const [studentTimePackages, setStudentTimePackages] = useState([]);
  const [selectedTimePackage, setSelectedTimePackage] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchPendingClasses();
    fetchStudents();
    fetchInstructors();
    fetchSubjectGroups();
    fetchTimePackages();
  }, []);

  // Fetch student time packages when student changes
  useEffect(() => {
    if (formData.student) {
      fetchStudentTimePackages(formData.student);
    } else {
      setStudentTimePackages([]);
      setSelectedTimePackage(null);
    }
  }, [formData.student]);

  // Fetch subjects when subject group changes
  useEffect(() => {
    if (formData.subjectGroup) {
      fetchSubjects(formData.subjectGroup);
    } else {
      setSubjects([]);
    }
  }, [formData.subjectGroup]);

  // Reset selected instructor when subject changes
  useEffect(() => {
    setSelectedInstructorId(null);
  }, [formData.subject]);

  // Data fetching functions
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

  const fetchTimePackages = async () => {
    setIsLoading(prev => ({ ...prev, timePackages: true }));
    try {
      const data = await timePackageService.getAllTimePackages();
      setTimePackages(data);
    } catch (error) {
      console.error('Error fetching time packages:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, timePackages: false }));
    }
  };

  const fetchStudentTimePackages = async (studentId) => {
    setIsLoading(prev => ({ ...prev, studentTimePackages: true }));
    try {
      const data = await timePackageService.getStudentTimePackages(studentId);
      setStudentTimePackages(data);
    } catch (error) {
      console.error('Error fetching student time packages:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, studentTimePackages: false }));
    }
  };

  // Event handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferencesChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setPreferences(prev => ({
        ...prev,
        preferredDays: { ...prev.preferredDays, [value]: checked }
      }));
      
      // Reset selected block values to current preferences when day preferences change
      setSelectedBlockValues({
        startTime: preferences.preferredStartTime,
        duration: preferences.duration
      });
    } else {
      setPreferences(prev => ({ ...prev, [name]: value }));
      
      // Reset selected block values to current preferences when time/duration preferences change
      if (name === 'preferredStartTime' || name === 'duration') {
        setSelectedBlockValues(prev => ({
          ...prev,
          [name === 'preferredStartTime' ? 'startTime' : 'duration']: value
        }));
      }
    }
  };

  const handleSelectedBlockChange = (e) => {
    const { name, value } = e.target;
    
    // Update the selected block values
    setSelectedBlockValues(prev => ({
      ...prev,
      [name === 'preferredStartTime' ? 'startTime' : 'duration']: value
    }));

    // If there's a selected time slot, update it with the new values
    if (formData.selectedTimeSlot) {
      const newStartTime = name === 'preferredStartTime' ? value : selectedBlockValues.startTime;
      const newDuration = name === 'duration' ? parseInt(value) : selectedBlockValues.duration;
      
      // Calculate new end time based on new start time and duration
      const [startHour, startMinute] = newStartTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(startHour, startMinute, 0, 0);
      const endDate = new Date(startDate.getTime() + newDuration * 60000);
      const newEndTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

      // Update the selected time slot
      setFormData(prev => ({
        ...prev,
        selectedTimeSlot: {
          ...prev.selectedTimeSlot,
          startTime: newStartTime,
          endTime: newEndTime,
          duration: newDuration
        }
      }));
    }
  };

  const handleSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value.id }));

    if (field === 'subjectGroup') {
      fetchSubjects(value.id);
      setFormData(prev => ({ ...prev, subject: '' }));
    }
    
    if (field === 'subject') {
      setSelectedInstructorId(null);
    }
  };

  const handleTimeSlotSelect = (timeSlot) => {
    console.log('Time slot selected:', timeSlot);
    
    setFormData(prev => ({
      ...prev,
      selectedTimeSlot: timeSlot,
    }));

    // Extract start time and duration from the selected time slot
    if (timeSlot && timeSlot.startTime && timeSlot.duration) {
      setSelectedBlockValues({
        startTime: timeSlot.startTime,
        duration: timeSlot.duration
      });
    }
  };

  // Filter instructors based on selected subject
  const getFilteredInstructors = () => {
    if (!formData.subject) {
      return [];
    }
    return instructors.filter(instructor => 
      instructor.teachingSubjects?.some(subject => 
        subjects.find(s => s.id === formData.subject)?.name === subject
      )
    );
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.student) newErrors.student = 'Student is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!selectedInstructorId) newErrors.instructor = 'Please select a qualified instructor.';
    if (!formData.selectedTimeSlot) newErrors.selectedTimeSlot = 'Please select an available time slot from the calendar.';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.numSessions || formData.numSessions < 1) newErrors.numSessions = 'Number of sessions must be at least 1';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    
    // Check time availability
    const timeCheck = checkTimeAvailability();
    if (!timeCheck.hasSufficientTime) {
      newErrors.timeAvailability = `Insufficient time. Need ${timeCheck.totalNeeded} minutes, but only ${timeCheck.availableTime} minutes available.`;
    }
    
    // Check if at least one day is selected
    const selectedDays = Object.values(preferences.preferredDays).filter(day => day).length;
    if (selectedDays === 0) newErrors.preferredDays = 'Please select at least one preferred day';
    
    return newErrors;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await classSeriesService.createOneTimeClass({
        instructor_id: selectedInstructorId,
        student_id: formData.student,
        subject_id: formData.subject,
        session_date: formData.selectedTimeSlot.date,
        start_time: formData.selectedTimeSlot.startTime,
        end_time: formData.selectedTimeSlot.endTime,
        location: formData.location,
        notes: formData.notes
      });

      alert('Class created successfully!');
      
      // Reset form and state
      setFormData({ student: '', subjectGroup: '', subject: '', location: '', selectedTimeSlot: null, notes: '', numSessions: 1, endDate: '', timePackageId: null });
      setPreferences({
        preferredDays: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
        preferredStartTime: '09:00',
        duration: 60
      });
      setSelectedBlockValues({
        startTime: '09:00',
        duration: 60
      });
      setSelectedInstructorId(null);
      setErrors({});
      await fetchPendingClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      alert(error.response?.data?.error || 'Failed to create class');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pending class actions
  const handleEdit = (id) => console.log('Edit class:', id);
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class series?')) {
      try {
        await classSeriesService.deleteClassSeries(id);
        fetchPendingClasses();
        alert('Class series deleted successfully');
      } catch (error) {
        console.error('Error deleting class series:', error);
        alert(error.response?.data?.error || 'Failed to delete class series');
      }
    }
  };

  // Calculate total time needed for the series
  const calculateTotalTimeNeeded = () => {
    const selectedDays = Object.values(preferences.preferredDays).filter(day => day).length;
    const totalSessions = selectedDays * formData.numSessions;
    const totalMinutes = totalSessions * selectedBlockValues.duration;
    return totalMinutes;
  };

  // Check if student has sufficient time
  const checkTimeAvailability = () => {
    const totalNeeded = calculateTotalTimeNeeded();
    const availableTime = studentTimePackages.reduce((total, pkg) => {
      return total + pkg.minutes_remaining;
    }, 0);
    
    return {
      hasSufficientTime: availableTime >= totalNeeded,
      totalNeeded,
      availableTime,
      deficit: Math.max(0, totalNeeded - availableTime)
    };
  };

  return (
    <div className="page-container">
      <div className="main">
        <section className="dashboard-main">
          
          <form className="create-class-form" onSubmit={handleSubmit}>
            {/* Student & Subject Selection - Horizontal Layout */}
            <div className="form-row">
              <div className="form-group compact">
                <label>
                  Student
                  <SearchableDropdown
                    options={students}
                    value={formData.student}
                    onChange={(student) => handleSelect('student', student)}
                    placeholder="Select student..."
                    isLoading={isLoading.students}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.id}
                  />
                  {errors.student && <span className="error-message">{errors.student}</span>}
                </label>
              </div>
              
              <div className="form-group compact">
                <label>Subject Group</label>
                <SearchableDropdown
                  options={subjectGroups}
                  value={formData.subjectGroup}
                  onChange={(value) => handleSelect('subjectGroup', value)}
                  placeholder="Select group"
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.id}
                  className={errors.subjectGroup ? 'error' : ''}
                />
                {errors.subjectGroup && <span className="error-message">{errors.subjectGroup}</span>}
              </div>

              <div className="form-group compact">
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
            </div>
            
            {/* Main Scheduling Interface */}
            <div className="smart-scheduling-interface">
              <div className="instructor-list-container">
                <h3 className="instructor-list-title">Student Preferences</h3>
                <div className="preferences-container">
                  <div className="form-group">
                    <label>Preferred Days</label>
                    <div className="day-checkboxes">
                      {Object.entries(preferences.preferredDays).map(([day, checked]) => {
                        const dayLabels = {
                          mon: 'M',
                          tue: 'T', 
                          wed: 'W',
                          thu: 'Th',
                          fri: 'F',
                          sat: 'Sa',
                          sun: 'Su'
                        };
                        return (
                          <label key={day} className={`day-checkbox ${checked ? 'selected' : ''}`}>
                            <input 
                              type="checkbox" 
                              name="preferredDays" 
                              value={day} 
                              checked={checked} 
                              onChange={handlePreferencesChange}
                            />
                            <span className="day-label">{dayLabels[day]}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="form-group time-group">
                    <label>
                      Start Time
                      <input 
                        type="time" 
                        name="preferredStartTime" 
                        value={selectedBlockValues.startTime} 
                        onChange={handleSelectedBlockChange} 
                        className={`${formData.selectedTimeSlot ? 'selected-block' : ''} ${formData.selectedTimeSlot ? 'editable-block' : ''}`}
                      />
                    </label>
                    <label>
                      Duration
                      <select 
                        name="duration" 
                        value={selectedBlockValues.duration} 
                        onChange={handleSelectedBlockChange}
                        className={`${formData.selectedTimeSlot ? 'selected-block' : ''} ${formData.selectedTimeSlot ? 'editable-block' : ''}`}
                      >
                        <option value="60">60 min</option>
                        <option value="90">90 min</option>
                        <option value="120">120 min</option>
                      </select>
                    </label>
                  </div>
                </div>

                <h3 className="instructor-list-title">Qualified Instructors</h3>
                {errors.instructor && <span className="error-message">{errors.instructor}</span>}
                <div className="instructor-list">
                  {getFilteredInstructors().map(instructor => (
                    <div key={instructor.id}
                      className={`instructor-list-item ${selectedInstructorId === instructor.id ? 'selected' : ''}`}
                      onClick={() => setSelectedInstructorId(instructor.id)}>
                      <span className="instructor-name">{instructor.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="calendar-view-container">
                <DndProvider backend={HTML5Backend}>
                  <SmartSchedulingCalendar
                    studentPreferences={preferences}
                    selectedInstructorId={selectedInstructorId}
                    onTimeSlotSelect={handleTimeSlotSelect}
                    selectedTimeSlot={formData.selectedTimeSlot}
                    studentId={formData.student}
                    subjectId={formData.subject}
                    selectedStudent={students.find(s => s.id === formData.student)}
                  />
                </DndProvider>
                {errors.selectedTimeSlot && <span className="error-message">{errors.selectedTimeSlot}</span>}
              </div>
            </div>

            {/* Bottom Form Fields */}
            <div className="form-group">
              <label>Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. Zoom, Room A" className={errors.location ? 'error' : ''} />
              {errors.location && <span className="error-message">{errors.location}</span>}
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3" placeholder="Additional details..." />
            </div>

            <button type="submit" className="btn" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Class'}
            </button>
          </form>

          <hr className="divider" />

          <section className="pending-classes">
            <h2 className="title">Pending Instructor Confirmations</h2>
            <div className="table-container">
              {isLoadingPending ? <div className="loading">Loading...</div> : (
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
                          <span className={`status-badge ${classItem.status.toLowerCase()}`}>{classItem.status}</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-icon" onClick={() => handleEdit(classItem.series_id)} title="Edit">
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="btn-icon delete" onClick={() => handleDelete(classItem.series_id)} title="Delete">
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pendingClasses.length === 0 && (
                      <tr>
                        <td colSpan="7" className="no-data">No pending classes found</td>
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