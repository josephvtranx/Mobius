import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../css/InstructorRoster.css';
import Modal from '../../../components/Modal';
import SearchableDropdown from '../../../components/SearchableDropdown';
import subjectService from '../../../services/subjectService';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import '../../../css/react-big-calendar-custom.scss';
import { addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import instructorService from '../../../services/instructorService';
import { useMemo } from 'react';
import moment from 'moment';
import { FaRegCalendarAlt } from 'react-icons/fa';

const localizer = momentLocalizer(moment);

function CalendarEvent({ event }) {
  return (
    <div className={`calendar-event ${event.type}`.trim()}>
      <span className="event-pill">{event.type === 'availability' ? 'Available' : 'Class'}</span>
      {event.type === 'class' && (
        <span className="event-title">{event.title}</span>
      )}
    </div>
  );
}

function CalendarHeader({ label, date }) {
  const today = new Date();
  const isToday = isSameDay(date, today);
  return (
    <span className={isToday ? 'day-pill today' : 'day-pill'}>{label}</span>
  );
}

function InstructorRoster() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'ascending'
  });
  const [editModal, setEditModal] = useState({ open: false, instructor: null });

  // Add state for subject data
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  // Add state for availability data
  const [availabilityData, setAvailabilityData] = useState({});
  const [showAddAvailability, setShowAddAvailability] = useState({});
  const [showAddUnavailability, setShowAddUnavailability] = useState({});
  const [editingAvailability, setEditingAvailability] = useState({});

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Add state for schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // Fetch availability data when row expands
  const fetchAvailabilityData = async (instructorId) => {
    try {
      // Find the instructor to get the instructorId
      const instructor = instructors.find(inst => inst.id === instructorId);
      if (!instructor || !instructor.instructorId) {
        console.error('Instructor not found or missing instructorId:', instructorId);
        return;
      }
      
      const [availabilityRes, unavailabilityRes] = await Promise.all([
        axios.get(`/api/instructors/${instructor.instructorId}/availability`),
        axios.get(`/api/instructors/${instructor.instructorId}/unavailability`)
      ]);
      
      setAvailabilityData(prev => ({
        ...prev,
        [instructorId]: {
          availability: availabilityRes.data,
          unavailability: unavailabilityRes.data
        }
      }));
    } catch (error) {
      console.error('Error fetching availability data:', error);
    }
  };

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/instructors/roster');
        console.log('Raw instructor data from backend:', response.data);
        
        const processedData = response.data.map((instructor, index) => {
          console.log('Processing instructor:', instructor.name, 'Raw salary:', instructor.salary, 'Raw hourlyRate:', instructor.hourlyRate);
          return {
            id: instructor.id || `temp-${index}`,
            instructorId: instructor.instructorId, // Add instructorId from backend
          name: instructor.name || '',
            email: instructor.email || '',
          phone: instructor.phone || '',
            employmentType: instructor.employmentType || 'part_time',
            salary: instructor.salary || 0,
          hourlyRate: instructor.hourlyRate || 0,
            age: instructor.age,
            gender: instructor.gender,
            college: instructor.college,
            major: instructor.major,
            activeClasses: instructor.activeClasses || 0,
            availabilitySlots: instructor.availabilitySlots || 0,
            teachingSubjects: instructor.teachingSubjects || [],
            activeClassNames: instructor.activeClassNames || []
          };
        });
        setInstructors(processedData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch instructor data. Please try again later.');
        console.error('Error fetching instructors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  // Fetch subject groups when modal opens
  useEffect(() => {
    if (editModal.open) {
      fetchSubjectGroups();
    }
  }, [editModal.open]);

  const fetchSubjectGroups = async () => {
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
    }
  };

  const fetchSubjects = async (groupId) => {
    setIsLoadingSubjects(true);
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
      setIsLoadingSubjects(false);
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!sortConfig.key) return instructors;

    return [...instructors].sort((a, b) => {
      const aValue = a[sortConfig.key] || 0;
      const bValue = b[sortConfig.key] || 0;
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  const formatCurrency = (amount) => {
    console.log('formatCurrency called with:', amount, 'type:', typeof amount);
    
    if (amount === null || amount === undefined) {
      return '$0';
    }
    
    const numAmount = parseFloat(amount);
    console.log('Parsed amount:', numAmount, 'isNaN:', isNaN(numAmount));
    
    if (isNaN(numAmount)) {
      return '$0';
    }
    
    const formatted = `$${numAmount.toLocaleString()}`;
    console.log('Formatted result:', formatted);
    return formatted;
  };

  const getEmploymentTypeClass = (type) => {
    return type === 'full_time' ? 'full-time' : 'part-time';
  };

  const getEmploymentTypeLabel = (type) => {
    return type === 'full_time' ? 'Full-Time' : 'Part-Time';
  };

  const getRateDisplay = (instructor) => {
    console.log('Rate display for instructor:', instructor.name, 'Employment type:', instructor.employmentType, 'Salary:', instructor.salary, 'Hourly rate:', instructor.hourlyRate);
    
    let displayValue;
    if (instructor.employmentType === 'full_time') {
      displayValue = formatCurrency(instructor.salary || 0);
    } else {
      displayValue = `${formatCurrency(instructor.hourlyRate || 0)}/hr`;
    }
    
    console.log('Display value for', instructor.name, ':', displayValue);
    return displayValue;
  };

  const handleEdit = (instructor) => {
    setEditModal({ open: true, instructor });
  };

  const handleSaveEdit = async (updatedData) => {
    try {
      await axios.put(`/api/instructors/${updatedData.id}`, updatedData);
      // Refresh the data
      const response = await axios.get('/api/instructors/roster');
      setInstructors(response.data);
      setEditModal({ open: false, instructor: null });
    } catch (error) {
      console.error('Error updating instructor:', error);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const newExpanded = {
        ...prev,
        [id]: !prev[id]
      };
      
      // Fetch availability data when expanding
      if (newExpanded[id]) {
        fetchAvailabilityData(id);
      }
      
      return newExpanded;
    });
  };

  // Availability management functions
  const addAvailability = async (instructorId, availabilityBlocks) => {
    try {
      // Find the instructor to get the instructorId
      const instructor = instructors.find(inst => inst.id === instructorId);
      if (!instructor || !instructor.instructorId) {
        console.error('Instructor not found or missing instructorId:', instructorId);
        return;
      }
      
      // If it's a single block (from edit form), wrap it in an array
      const blocks = Array.isArray(availabilityBlocks) ? availabilityBlocks : [availabilityBlocks];
      
      // Create all availability blocks in parallel
      const promises = blocks.map(block => 
        axios.post(`/api/instructors/${instructor.instructorId}/availability`, block)
      );
      
      await Promise.all(promises);
      await fetchAvailabilityData(instructorId);
      setShowAddAvailability(prev => ({ ...prev, [instructorId]: false }));
    } catch (error) {
      console.error('Error adding availability:', error);
    }
  };

  const updateAvailability = async (instructorId, availabilityId, availabilityData) => {
    try {
      // Find the instructor to get the instructorId
      const instructor = instructors.find(inst => inst.id === instructorId);
      if (!instructor || !instructor.instructorId) {
        console.error('Instructor not found or missing instructorId:', instructorId);
        return;
      }
      
      await axios.put(`/api/instructors/${instructor.instructorId}/availability/${availabilityId}`, availabilityData);
      await fetchAvailabilityData(instructorId);
      setEditingAvailability(prev => ({ ...prev, [availabilityId]: false }));
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const deleteAvailability = async (instructorId, availabilityId) => {
    try {
      // Find the instructor to get the instructorId
      const instructor = instructors.find(inst => inst.id === instructorId);
      if (!instructor || !instructor.instructorId) {
        console.error('Instructor not found or missing instructorId:', instructorId);
        return;
      }
      
      await axios.delete(`/api/instructors/${instructor.instructorId}/availability/${availabilityId}`);
      await fetchAvailabilityData(instructorId);
    } catch (error) {
      console.error('Error deleting availability:', error);
    }
  };

  const addUnavailability = async (instructorId, unavailabilityData) => {
    try {
      // Find the instructor to get the instructorId
      const instructor = instructors.find(inst => inst.id === instructorId);
      if (!instructor || !instructor.instructorId) {
        console.error('Instructor not found or missing instructorId:', instructorId);
        return;
      }
      
      await axios.post(`/api/instructors/${instructor.instructorId}/unavailability`, unavailabilityData);
      await fetchAvailabilityData(instructorId);
      setShowAddUnavailability(prev => ({ ...prev, [instructorId]: false }));
    } catch (error) {
      console.error('Error adding unavailability:', error);
    }
  };

  const deleteUnavailability = async (instructorId, unavailabilityId) => {
    try {
      // Find the instructor to get the instructorId
      const instructor = instructors.find(inst => inst.id === instructorId);
      if (!instructor || !instructor.instructorId) {
        console.error('Instructor not found or missing instructorId:', instructorId);
        return;
      }
      
      await axios.delete(`/api/instructors/${instructor.instructorId}/unavailability/${unavailabilityId}`);
      await fetchAvailabilityData(instructorId);
    } catch (error) {
      console.error('Error deleting unavailability:', error);
    }
  };

  const formatDayOfWeek = (day) => {
    const dayMap = {
      'mon': 'Mon', 'tue': 'Tue', 'wed': 'Wed', 'thu': 'Thu',
      'fri': 'Fri', 'sat': 'Sat', 'sun': 'Sun'
    };
    return dayMap[day] || day;
  };

  const formatTime = (time) => {
    return time.substring(0, 5); // Remove seconds if present
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Open schedule modal and fetch events
  const handleViewSchedule = async (instructor) => {
    setSelectedInstructor(instructor);
    setShowScheduleModal(true);
    setCalendarLoading(true);
    try {
      // Get current week (Mon-Sun)
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      
      // Fetch availability using instructorId
      const availability = await instructorService.getInstructorAvailability(instructor.instructorId);
      
      // Fetch class sessions using instructorId
      const sessions = await instructorService.getInstructorSchedule(
        instructor.instructorId,
        weekStart.toISOString().slice(0, 10),
        weekEnd.toISOString().slice(0, 10)
      );
      
      // Transform availability to events - create events for 6 months (26 weeks)
      const availabilityEvents = [];
      const dayMap = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
      
      (availability || []).forEach((slot) => {
        const dayIdx = dayMap[slot.day_of_week];
        if (dayIdx === undefined) {
          return;
        }
        
        // Create events for 26 weeks (6 months) starting from current week
        for (let weekOffset = 0; weekOffset < 26; weekOffset++) {
          const weekStartDate = addDays(weekStart, weekOffset * 7);
          const slotDate = addDays(weekStartDate, dayIdx);
          
          // Check if this date is within any date restrictions
          let shouldInclude = true;
          
          if (slot.start_date) {
            const startDate = new Date(slot.start_date);
            if (slotDate < startDate) {
              shouldInclude = false;
            }
          }
          
          if (slot.end_date) {
            const endDate = new Date(slot.end_date);
            if (slotDate > endDate) {
              shouldInclude = false;
            }
          }
          
          if (shouldInclude) {
            const [startHour, startMinute] = slot.start_time.split(':');
            const [endHour, endMinute] = slot.end_time.split(':');
            const start = new Date(slotDate);
            start.setHours(Number(startHour), Number(startMinute), 0, 0);
            const end = new Date(slotDate);
            end.setHours(Number(endHour), Number(endMinute), 0, 0);
            
            const event = {
              title: 'Available',
              start,
              end,
              allDay: false,
              type: 'availability',
            };
            availabilityEvents.push(event);
          }
        }
      });
      
      // Transform sessions to events
      const sessionEvents = (sessions || []).map((session) => {
        const [startHour, startMinute] = session.start_time.split(':');
        const [endHour, endMinute] = session.end_time.split(':');
        const date = new Date(session.session_date);
        const start = new Date(date);
        start.setHours(Number(startHour), Number(startMinute), 0, 0);
        const end = new Date(date);
        end.setHours(Number(endHour), Number(endMinute), 0, 0);
        const event = {
          title: `${session.student_name} – ${session.subject_name}`,
          start,
          end,
          allDay: false,
          type: 'class',
        };
        return event;
      });
      
      setCalendarEvents([...availabilityEvents, ...sessionEvents]);
    } catch (err) {
      console.error('Error fetching schedule data:', err);
      setCalendarEvents([]);
    } finally {
      setCalendarLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main">
        <div className="main-instructor-roster">
          <div className="loading">Loading instructor data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main">
        <div className="main-instructor-roster">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  const sortedInstructors = getSortedData();

  return (
    <div className="main">
      <div className="main-instructor-roster">
        <table className="roster-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('name')} className="sortable">
                Instructor {getSortIcon('name')}
              </th>
              <th>Contact</th>
              <th onClick={() => requestSort('employmentType')} className="sortable">
                Monthly/Hourly Rate {getSortIcon('employmentType')}
              </th>
              <th>Total Hours</th>
              <th>Currently Teaching</th>
              <th>Schedule</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {sortedInstructors.map((instructor) => (
              <React.Fragment key={instructor.id}>
                <tr 
                  className={`roster-row ${expandedRows[instructor.id] ? 'expanded' : ''}`}
                  onClick={() => toggleRow(instructor.id)}
                >
                <td>
                    <div className="instructor-name">
                      <span className={`name-pill ${getEmploymentTypeClass(instructor.employmentType)}`}>
                        {instructor.name}
                      </span>
                  </div>
                </td>
                  <td>
                    {instructor.email && (
                      <span className="email">{instructor.email}</span>
                    )}
                  </td>
                  <td className="rate-cell">
                    {(() => {
                      const rateDisplay = getRateDisplay(instructor);
                      return rateDisplay || '$0';
                    })()}
                  </td>
                  <td>--</td>
                  <td>
                    <div className="currently-teaching-container">
                      {instructor.activeClassNames && instructor.activeClassNames.length > 0 ? (
                        instructor.activeClassNames.map((className, idx) => (
                          <span key={`${instructor.id}-class-${idx}`} className="tag-pill active-class-tag">
                            {className}
                    </span>
                        ))
                      ) : (
                        <span className="no-tags">No active classes</span>
                      )}
                    </div>
                </td>
                <td>
                    <button 
                      className="view-schedule-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewSchedule(instructor);
                      }}
                    >
                      View
                    </button>
                </td>
                <td>
                    <button 
                      className="edit-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(instructor);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
                {expandedRows[instructor.id] && (
                  <React.Fragment key={`subrow-fragment-${instructor.id}`}>
                    <tr key={`subrow-${instructor.id}`} className="roster-subrow">
                      <td colSpan="7">
                        <div className="instructor-details-dropdown">
                          <div className="details-grid">
                            <div className="detail-item">
                              <span className="detail-label">Age:</span>
                              <span className="detail-value">{instructor.age || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">College:</span>
                              <span className="detail-value">{instructor.college || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Major:</span>
                              <span className="detail-value">{instructor.major || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Phone:</span>
                              <span className="detail-value">{instructor.phone || 'N/A'}</span>
                            </div>
                          </div>
                          
                          {/* Tags for Scheduling Section */}
                          <div className="scheduling-tags-section">
                            
                            {/* Teaching Subjects */}
                            <div className="tags-group">
                              <span className="tags-group-label">Teachable Subjects:</span>
                              <div className="tags-container">
                                {instructor.teachingSubjects && instructor.teachingSubjects.length > 0 ? (
                                  instructor.teachingSubjects.map((subject, idx) => (
                                    <span key={`${instructor.id}-subject-${idx}`} className="tag-pill teaching-subject-tag">
                                      {subject}
                      </span>
                                  ))
                                ) : (
                                  <span className="no-tags">No subjects assigned</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Availability Section */}
                          <div className="availability-section">
                            <h4 className="availability-section-title">Availability</h4>
                            
                            <div className="availability-layout">
                              {/* Recurring Weekly Availability */}
                              <div className="availability-column">
                                <div className="availability-header">
                                  <h5>Recurring Weekly Availability</h5>
                                  <button
                                    type="button"
                                    className="add-availability-btn"
                                    onClick={() => setShowAddAvailability(prev => ({ ...prev, [instructor.id]: true }))}
                                  >
                                    ➕ Add Availability
                                  </button>
                                </div>
                                
                                <div className="availability-list">
                                  {availabilityData[instructor.id]?.availability?.length > 0 ? (
                                    availabilityData[instructor.id].availability.map((slot) => (
                                      <div key={slot.availability_id} className="availability-item">
                                        {editingAvailability[slot.availability_id] ? (
                                          <AvailabilityEditForm
                                            slot={slot}
                                            onSave={(data) => updateAvailability(instructor.id, slot.availability_id, data)}
                                            onCancel={() => setEditingAvailability(prev => ({ ...prev, [slot.availability_id]: false }))}
                                          />
                                        ) : (
                                          <div className="availability-display">
                                            <div className="availability-info">
                                              <span className="availability-time">
                                                {formatDayOfWeek(slot.day_of_week)} {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                                              </span>
                                              {slot.type && (
                                                <span className={`availability-type ${slot.type}`}>
                                                  {slot.type === 'preferred' ? 'Preferred' : slot.type === 'emergency' ? 'Emergency' : slot.type}
                                                </span>
                                              )}
                                              <span className={`availability-status ${slot.status}`}>
                                                {slot.status}
                                              </span>
                                            </div>
                                            <div className="availability-actions">
                                              <button
                                                type="button"
                                                className="edit-availability-btn"
                                                onClick={() => setEditingAvailability(prev => ({ ...prev, [slot.availability_id]: true }))}
                                              >
                                                📝 Edit
                                              </button>
                                              <button
                                                type="button"
                                                className="delete-availability-btn"
                                                onClick={() => deleteAvailability(instructor.id, slot.availability_id)}
                                              >
                                                ❌ Delete
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="no-availability">No recurring availability set</div>
                                  )}
                                </div>

                                {/* Add Availability Form */}
                                {showAddAvailability[instructor.id] && (
                                  <AvailabilityAddForm
                                    onSave={(data) => addAvailability(instructor.id, data)}
                                    onCancel={() => setShowAddAvailability(prev => ({ ...prev, [instructor.id]: false }))}
                                  />
                                )}
                              </div>

                              {/* Unavailability Overrides */}
                              <div className="availability-column">
                                <div className="availability-header">
                                  <h5>Unavailability Overrides</h5>
                                  <button
                                    type="button"
                                    className="add-unavailability-btn"
                                    onClick={() => setShowAddUnavailability(prev => ({ ...prev, [instructor.id]: true }))}
                                  >
                                    ➕ Add Unavailability
                                  </button>
                                </div>
                                
                                <div className="unavailability-list">
                                  {availabilityData[instructor.id]?.unavailability?.length > 0 ? (
                                    availabilityData[instructor.id].unavailability.map((override) => (
                                      <div key={override.unavail_id} className="unavailability-item">
                                        <div className="unavailability-info">
                                          <span className="unavailability-time">
                                            {formatDate(override.start_datetime)} {formatTime(override.start_datetime.split('T')[1])} – {formatTime(override.end_datetime.split('T')[1])}
                      </span>
                                          {override.reason && (
                                            <span className="unavailability-reason">{override.reason}</span>
                                          )}
                                        </div>
                                        <div className="unavailability-actions">
                                          <button
                                            type="button"
                                            className="delete-unavailability-btn"
                                            onClick={() => deleteUnavailability(instructor.id, override.unavail_id)}
                                          >
                                            ❌ Delete
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="no-unavailability">No unavailability overrides</div>
                                  )}
                                </div>

                                {/* Add Unavailability Form */}
                                {showAddUnavailability[instructor.id] && (
                                  <UnavailabilityAddForm
                                    onSave={(data) => addUnavailability(instructor.id, data)}
                                    onCancel={() => setShowAddUnavailability(prev => ({ ...prev, [instructor.id]: false }))}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                  </div>
                </td>
              </tr>
                  </React.Fragment>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)}>
          <div className="modal-header schedule-modal-header">
            <FaRegCalendarAlt style={{ fontSize: 28, color: '#2563eb', marginRight: 12 }} />
            <div>
              <h2 style={{ margin: 0 }}>Weekly Schedule for {selectedInstructor?.name}</h2>
              <div className="modal-subtitle">Mon–Sun, 8 AM–10 PM</div>
            </div>
            <button className="close-button modern-close" onClick={() => setShowScheduleModal(false)}>&times;</button>
          </div>
          <div className="modal-body schedule-modal-body">
            {calendarLoading ? (
              <div>Loading schedule...</div>
            ) : (
              <div className="calendar-wrapper">
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  defaultView="week"
                  views={['week']}
                  min={new Date(1970, 1, 1, 8, 0)}
                  max={new Date(1970, 1, 1, 22, 0)}
                  style={{ height: 600, background: 'transparent' }}
                  eventPropGetter={(event) => {
                    if (event.type === 'availability') {
                      return {
                        className: 'calendar-availability-event',
                        style: {
                          backgroundColor: '#DCF4FF',
                          color: '#1a4b6e',
                          border: '1px solid #b6e0fe',
                          fontWeight: 600,
                          borderRadius: 10,
                          boxShadow: '0 1px 4px #b6e0fe33',
                        },
                      };
                    }
                    if (event.type === 'class') {
                      return {
                        className: 'calendar-class-event',
                        style: {
                          backgroundColor: '#FFEDD5',
                          color: '#7c3a00',
                          border: '1px solid #ffd6a0',
                          fontWeight: 600,
                          borderRadius: 10,
                          boxShadow: '0 1px 4px #ffd6a033',
                        },
                      };
                    }
                    return {};
                  }}
                  components={{ event: CalendarEvent, week: { header: CalendarHeader } }}
                  formats={{
                    dayHeaderFormat: 'EEE d',
                    timeGutterFormat: 'h:mm a',
                  }}
                />
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Edit Modal using Modal component */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, instructor: null })}
      >
        <div className="modal-header">
          <h2>Edit Instructor Details</h2>
        </div>
        <div className="modal-body">
          <EditInstructorForm 
            instructor={editModal.instructor}
            onSave={handleSaveEdit}
            onCancel={() => setEditModal({ open: false, instructor: null })}
            subjectGroups={subjectGroups}
            onSubjectGroupChange={fetchSubjects}
          />
        </div>
      </Modal>
    </div>
  );
}

// Edit Form Component
function EditInstructorForm({ 
  instructor, 
  onSave, 
  onCancel, 
  subjectGroups, 
  onSubjectGroupChange 
}) {
  const [formData, setFormData] = useState({
    id: instructor.id,
    name: instructor.name,
    email: instructor.email,
    phone: instructor.phone,
    employmentType: instructor.employmentType,
    salary: instructor.salary,
    hourlyRate: instructor.hourlyRate
  });

  const [subjectAssignments, setSubjectAssignments] = useState([
    { groupId: '', subjectIds: [], subjects: [] }
  ]);

  // Initialize form with existing subject assignments
  useEffect(() => {
    if (instructor && instructor.teachingSubjects && instructor.teachingSubjects.length > 0) {
      // For now, we'll create a single assignment with all subjects
      // In a more complex implementation, we'd need to fetch the actual group assignments
      setSubjectAssignments([
        { groupId: '', subjectIds: [], subjects: [] } // This will be populated when we have the actual data
      ]);
    }
  }, [instructor]);

  const handleSubjectGroupSelect = async (assignmentIndex, groupId) => {
    const newAssignments = [...subjectAssignments];
    newAssignments[assignmentIndex] = { 
      ...newAssignments[assignmentIndex], 
      groupId,
      subjectIds: [], // Clear subjects when group changes
      subjects: [] // Clear subjects list when group changes
    };
    
    // Fetch subjects for this specific assignment
    if (groupId) {
      try {
        const data = await subjectService.getAllSubjects();
        const filteredSubjects = data
          .filter(subject => subject.group_id === parseInt(groupId))
          .map(subject => ({
            id: subject.subject_id,
            name: subject.name,
            group_id: subject.group_id
          }));
        
        newAssignments[assignmentIndex].subjects = filteredSubjects;
      } catch (error) {
        console.error('Error fetching subjects for assignment:', error);
      }
    }
    
    setSubjectAssignments(newAssignments);
  };

  const handleSubjectSelect = (assignmentIndex, subjectId) => {
    const newAssignments = [...subjectAssignments];
    const currentSubjectIds = newAssignments[assignmentIndex].subjectIds;
    
    if (currentSubjectIds.includes(subjectId)) {
      // Remove subject if already selected
      newAssignments[assignmentIndex].subjectIds = currentSubjectIds.filter(id => id !== subjectId);
    } else {
      // Add subject if not selected
      newAssignments[assignmentIndex].subjectIds = [...currentSubjectIds, subjectId];
    }
    
    setSubjectAssignments(newAssignments);
  };

  const addSubjectAssignment = () => {
    setSubjectAssignments([...subjectAssignments, { groupId: '', subjectIds: [], subjects: [] }]);
  };

  const removeSubjectAssignment = (index) => {
    if (subjectAssignments.length > 1) {
      const newAssignments = subjectAssignments.filter((_, i) => i !== index);
      setSubjectAssignments(newAssignments);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare the data with subject assignments
    const updatedData = {
      ...formData,
      subjectAssignments: subjectAssignments.filter(assignment => 
        assignment.groupId && assignment.subjectIds.length > 0
      )
    };
    
    onSave(updatedData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-layout">
        {/* Left Column - Employment & Rate */}
        <div className="form-column">
          <h3>Employment Details</h3>
          
          <div className="form-group">
            <label>Employment Type:</label>
            <select
              value={formData.employmentType}
              onChange={(e) => setFormData({...formData, employmentType: e.target.value})}
            >
              <option value="full_time">Full-Time</option>
              <option value="part_time">Part-Time</option>
            </select>
          </div>

          {formData.employmentType === 'full_time' ? (
            <div className="form-group">
              <label>Monthly Salary:</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: parseFloat(e.target.value)})}
                placeholder="Enter monthly salary"
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Hourly Rate:</label>
              <input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({...formData, hourlyRate: parseFloat(e.target.value)})}
                placeholder="Enter hourly rate"
              />
            </div>
          )}
        </div>

        {/* Right Column - Subject Specialties */}
        <div className="form-column">
          <h3>Subject Specialties</h3>
          
          {subjectAssignments.map((assignment, index) => (
            <div key={index} className="subject-assignment">
              <div className="assignment-header">
                <span>Assignment {index + 1}</span>
                {subjectAssignments.length > 1 && (
                  <button
                    type="button"
                    className="remove-assignment-btn"
                    onClick={() => removeSubjectAssignment(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="form-group">
                <label>Subject Group:</label>
                <SearchableDropdown
                  options={subjectGroups}
                  value={assignment.groupId}
                  onChange={(value) => handleSubjectGroupSelect(index, value.id)}
                  placeholder="Select subject group"
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.id}
                />
              </div>

              {assignment.groupId && (
                <div className="form-group">
                  <label>Subjects (select multiple):</label>
                  <div className="subject-selection">
                    {assignment.subjects.map(subject => (
                      <label key={subject.id} className="subject-checkbox">
                        <input
                          type="checkbox"
                          checked={assignment.subjectIds.includes(subject.id)}
                          onChange={() => handleSubjectSelect(index, subject.id)}
                        />
                        {subject.name}
                      </label>
                    ))}
                    {assignment.subjects.length === 0 && (
                      <div className="no-subjects">No subjects found for this group</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <button
            type="button"
            className="add-assignment-btn"
            onClick={addSubjectAssignment}
          >
            + Add Another Subject Group
          </button>
        </div>
      </div>

      <div className="modal-footer">
        <button type="button" onClick={onCancel} className="cancel-button">
          Cancel
        </button>
        <button type="submit" className="save-button">
          Save Changes
        </button>
      </div>
    </form>
  );
}

// Availability Add Form Component
function AvailabilityAddForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    start_time: '09:00',
    end_time: '10:00',
    type: 'default',
    status: 'active',
    start_date: '',
    end_date: '',
    notes: ''
  });

  const [selectedDays, setSelectedDays] = useState({
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
    sun: false
  });

  const [previewBlocks, setPreviewBlocks] = useState([]);

  const dayLabels = {
    mon: 'Monday',
    tue: 'Tuesday', 
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday'
  };

  const handleDayToggle = (day) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleAddBlock = () => {
    // Validate time range
    if (formData.start_time >= formData.end_time) {
      alert('End time must be after start time');
      return;
    }

    // Check if at least one day is selected
    const selectedDayKeys = Object.keys(selectedDays).filter(day => selectedDays[day]);
    if (selectedDayKeys.length === 0) {
      alert('Please select at least one day');
      return;
    }

    // Validate date range if both dates are provided
    if (formData.start_date && formData.end_date && formData.start_date >= formData.end_date) {
      alert('End date must be after start date');
      return;
    }

    // Create availability blocks for each selected day
    const newBlocks = selectedDayKeys.map(day => ({
      id: Date.now() + Math.random(), // Temporary ID for preview
      day_of_week: day,
      day_label: dayLabels[day],
      start_time: formData.start_time,
      end_time: formData.end_time,
      type: formData.type,
      status: formData.status,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      notes: formData.notes
    }));

    setPreviewBlocks(prev => [...prev, ...newBlocks]);
    
    // Clear selected days after adding to preview
    setSelectedDays({
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false
    });
  };

  const handleRemoveBlock = (blockId) => {
    setPreviewBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (previewBlocks.length === 0) {
      alert('Please add at least one availability block');
      return;
    }

    // Remove temporary IDs and prepare data for backend
    // Convert empty strings to null for dates
    const blocksToSave = previewBlocks.map(({ id, day_label, ...block }) => ({
      ...block,
      start_date: block.start_date || null,
      end_date: block.end_date || null
    }));
    onSave(blocksToSave);
  };

  const getSelectedDaysCount = () => {
    return Object.values(selectedDays).filter(Boolean).length;
  };

  const getDateRangeText = () => {
    if (formData.start_date && formData.end_date) {
      return `Limited: ${formData.start_date} to ${formData.end_date}`;
    } else if (formData.start_date) {
      return `From: ${formData.start_date} (ongoing)`;
    } else if (formData.end_date) {
      return `Until: ${formData.end_date}`;
    } else {
      return 'Ongoing (no end date)';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="availability-form">
      <div className="form-section">
        <h6>Time Block</h6>
        <div className="form-row">
          <div className="form-group">
            <label>Start Time:</label>
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({...formData, start_time: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>End Time:</label>
            <input
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({...formData, end_time: e.target.value})}
              required
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h6>Days of the Week</h6>
        <div className="days-selection">
          {Object.entries(dayLabels).map(([dayKey, dayLabel]) => (
            <label key={dayKey} className="day-checkbox">
              <input
                type="checkbox"
                checked={selectedDays[dayKey]}
                onChange={() => handleDayToggle(dayKey)}
              />
              <span className="day-label">{dayLabel}</span>
            </label>
          ))}
        </div>
        <div className="selected-days-info">
          {getSelectedDaysCount() > 0 && (
            <span className="selected-count">
              {getSelectedDaysCount()} day{getSelectedDaysCount() !== 1 ? 's' : ''} selected
            </span>
          )}
        </div>
      </div>

      <div className="form-section">
        <h6>Optional Metadata</h6>
        <div className="form-row">
          <div className="form-group">
            <label>Type:</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="default">Default</option>
              <option value="preferred">Preferred</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Status:</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date (Optional):</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              placeholder="Leave empty for immediate start"
            />
          </div>
          
          <div className="form-group">
            <label>End Date (Optional):</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({...formData, end_date: e.target.value})}
              placeholder="Leave empty for ongoing availability"
            />
          </div>
        </div>

        {/* Date range indicator */}
        <div className="date-range-indicator">
          <small style={{ color: '#666', fontStyle: 'italic' }}>
            {getDateRangeText()}
          </small>
        </div>

        <div className="form-group">
          <label>Notes (Optional):</label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Optional notes"
          />
        </div>
      </div>

      <div className="add-block-section">
        <button
          type="button"
          className="add-block-btn"
          onClick={handleAddBlock}
          disabled={getSelectedDaysCount() === 0}
        >
          ➕ Add Block ({getSelectedDaysCount()} day{getSelectedDaysCount() !== 1 ? 's' : ''})
        </button>
      </div>

      {/* Preview List */}
      {previewBlocks.length > 0 && (
        <div className="preview-section">
          <h6>Preview - {previewBlocks.length} Block{previewBlocks.length !== 1 ? 's' : ''}</h6>
          <div className="preview-list">
            {previewBlocks.map((block) => (
              <div key={block.id} className="preview-item">
                <div className="preview-info">
                  <span className="preview-day">{block.day_label}</span>
                  <span className="preview-time">{block.start_time} – {block.end_time}</span>
                  <span className={`preview-type ${block.type}`}>
                    {block.type === 'preferred' ? 'Preferred' : block.type === 'emergency' ? 'Emergency' : 'Default'}
                  </span>
                  <span className={`preview-status ${block.status}`}>
                    {block.status}
                  </span>
                  {block.start_date || block.end_date ? (
                    <span className="preview-dates">
                      {block.start_date && block.end_date 
                        ? `${block.start_date} to ${block.end_date}`
                        : block.start_date 
                        ? `From ${block.start_date}`
                        : `Until ${block.end_date}`
                      }
                    </span>
                  ) : (
                    <span className="preview-dates ongoing">Ongoing</span>
                  )}
                </div>
                <button
                  type="button"
                  className="remove-preview-btn"
                  onClick={() => handleRemoveBlock(block.id)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
        <button 
          type="submit" 
          className="save-btn"
          disabled={previewBlocks.length === 0}
        >
          Save {previewBlocks.length > 0 ? `(${previewBlocks.length} block${previewBlocks.length !== 1 ? 's' : ''})` : ''}
        </button>
      </div>
    </form>
  );
}

// Availability Edit Form Component
function AvailabilityEditForm({ slot, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    day_of_week: slot.day_of_week,
    start_time: slot.start_time,
    end_time: slot.end_time,
    type: slot.type || 'default',
    status: slot.status || 'active',
    start_date: slot.start_date || '',
    end_date: slot.end_date || '',
    notes: slot.notes || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate date range if both dates are provided
    if (formData.start_date && formData.end_date && formData.start_date >= formData.end_date) {
      alert('End date must be after start date');
      return;
    }

    // Convert empty strings to null for dates
    const dataToSave = {
      ...formData,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null
    };
    
    onSave(dataToSave);
  };

  const getDateRangeText = () => {
    if (formData.start_date && formData.end_date) {
      return `Limited: ${formData.start_date} to ${formData.end_date}`;
    } else if (formData.start_date) {
      return `From: ${formData.start_date} (ongoing)`;
    } else if (formData.end_date) {
      return `Until: ${formData.end_date}`;
    } else {
      return 'Ongoing (no end date)';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="availability-form">
      <div className="form-row">
        <div className="form-group">
          <label>Day:</label>
          <select
            value={formData.day_of_week}
            onChange={(e) => setFormData({...formData, day_of_week: e.target.value})}
          >
            <option value="mon">Monday</option>
            <option value="tue">Tuesday</option>
            <option value="wed">Wednesday</option>
            <option value="thu">Thursday</option>
            <option value="fri">Friday</option>
            <option value="sat">Saturday</option>
            <option value="sun">Sunday</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Start Time:</label>
          <input
            type="time"
            value={formData.start_time}
            onChange={(e) => setFormData({...formData, start_time: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label>End Time:</label>
          <input
            type="time"
            value={formData.end_time}
            onChange={(e) => setFormData({...formData, end_time: e.target.value})}
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Type:</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
          >
            <option value="default">Default</option>
            <option value="preferred">Preferred</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Status:</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Start Date (Optional):</label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
            placeholder="Leave empty for immediate start"
          />
        </div>
        
        <div className="form-group">
          <label>End Date (Optional):</label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
            placeholder="Leave empty for ongoing availability"
          />
        </div>
      </div>

      {/* Date range indicator */}
      <div className="date-range-indicator">
        <small style={{ color: '#666', fontStyle: 'italic' }}>
          {getDateRangeText()}
        </small>
      </div>
      
      <div className="form-group">
        <label>Notes:</label>
        <input
          type="text"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Optional notes"
        />
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
        <button type="submit" className="save-btn">Save</button>
      </div>
    </form>
  );
}

// Unavailability Add Form Component
function UnavailabilityAddForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    start_datetime: '',
    end_datetime: '',
    reason: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="unavailability-form">
      <div className="form-row">
        <div className="form-group">
          <label>Start Date & Time:</label>
          <input
            type="datetime-local"
            value={formData.start_datetime}
            onChange={(e) => setFormData({...formData, start_datetime: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label>End Date & Time:</label>
          <input
            type="datetime-local"
            value={formData.end_datetime}
            onChange={(e) => setFormData({...formData, end_datetime: e.target.value})}
            required
          />
        </div>
      </div>
      
      <div className="form-group">
        <label>Reason:</label>
        <input
          type="text"
          value={formData.reason}
          onChange={(e) => setFormData({...formData, reason: e.target.value})}
          placeholder="Optional reason for unavailability"
        />
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
        <button type="submit" className="save-btn">Save</button>
      </div>
    </form>
  );
}

export default InstructorRoster;
