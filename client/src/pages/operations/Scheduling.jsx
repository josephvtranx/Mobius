import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import '../../css/Scheduling.css';
import SearchableDropdown from '../../components/SearchableDropdown';
import SmartSchedulingCalendar from '../../components/SmartSchedulingCalendar';
import studentService from '../../services/studentService';
import instructorService from '../../services/instructorService';
import subjectService from '../../services/subjectService';
import classSeriesService from '../../services/classSeriesService';
import classSessionService from '../../services/classSessionService';
import timePackageService from '../../services/timePackageService';
import { startOfWeek, endOfWeek, format, addDays, subDays } from 'date-fns';
import { createSessionTimestamps } from '../../utils/timeUtils';

function Scheduling() {
  // Tab state
  const [activeTab, setActiveTab] = useState('scheduling');
  // Form state
  const [formData, setFormData] = useState({
    student: '',
    subjectGroup: '',
    subject: '',
    location: '',
    notes: '',
    numSessions: 1,
    endDate: '',
    timePackageId: null,
    sessionType: 'one-time'
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

  // Track number of student blocks on calendar
  const [studentBlockCount, setStudentBlockCount] = useState(0);

  // Selected block values (for display in dropdowns)
  const [selectedBlockValues, setSelectedBlockValues] = useState({
    startTime: '09:00',
    duration: 60
  });

  // Track multiple time slots for multiple sessions
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);

  // Track the visible range for the calendar
  const [calendarRange, setCalendarRange] = useState({
    start: startOfWeek(new Date(), { weekStartsOn: 0 }),
    end: endOfWeek(new Date(), { weekStartsOn: 0 })
  });

  // Track the anchor start date for session generation
  const [anchorStartDate, setAnchorStartDate] = useState(calendarRange.start);

  // Track selected student sessions for display
  const [selectedStudentSessions, setSelectedStudentSessions] = useState([]);

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
      console.log('[DEBUG] Pending classes data received:', data);
      console.log('[DEBUG] Number of pending classes:', data.length);
      data.forEach((item, index) => {
        console.log(`[DEBUG] Item ${index}:`, {
          series_id: item.series_id,
          session_id: item.session_id,
          student: item.student?.name,
          instructor: item.instructor?.name,
          subject: item.subject_name,
          status: item.status
        });
      });
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
      console.log('Student time packages data:', data); // Debug log
      setStudentTimePackages(data);
    } catch (error) {
      console.error('Error fetching student time packages:', error);
      setStudentTimePackages(null);
    } finally {
      setIsLoading(prev => ({ ...prev, studentTimePackages: false }));
    }
  };

  const fetchStudentSessions = async (studentId) => {
    console.log('fetchStudentSessions called with studentId:', studentId);
    if (!studentId) {
      console.log('No studentId provided, clearing sessions');
      setSelectedStudentSessions([]);
      return;
    }
    
    try {
      // Get date range for the visible calendar
      const startDate = format(calendarRange.start, 'yyyy-MM-dd');
      const endDate = format(calendarRange.end, 'yyyy-MM-dd');
      
      console.log('Fetching sessions for date range:', startDate, 'to', endDate);
      console.log('Calendar range object:', calendarRange);
      
      // First, let's try fetching all sessions for this student without date range to see what they have
      const allSessions = await classSessionService.getStudentSessions(studentId);
      console.log('All sessions for student (no date filter):', allSessions);
      
      // Log the dates of all sessions to see what date range we should be using
      if (allSessions && allSessions.length > 0) {
        console.log('Session dates:');
        allSessions.forEach((session, index) => {
          console.log(`Session ${index + 1}: ${session.session_date} (${session.start_time} - ${session.end_time})`);
        });
      }
      
      // For scheduling purposes, show sessions from a broader date range (4 weeks before + 4 weeks after current week)
      // This helps users see upcoming sessions when scheduling new ones, regardless of which direction they navigate
      const extendedStartDate = format(subDays(calendarRange.start, 28), 'yyyy-MM-dd'); // 4 weeks before
      const extendedEndDate = format(addDays(calendarRange.end, 28), 'yyyy-MM-dd'); // 4 weeks after
      
      console.log('Fetching sessions for extended date range:', extendedStartDate, 'to', extendedEndDate);
      const sessions = await classSessionService.getStudentSessions(studentId, extendedStartDate, extendedEndDate);
      console.log('Selected student sessions received (with extended date filter):', sessions);
      setSelectedStudentSessions(sessions);
    } catch (error) {
      console.error('Error fetching student sessions:', error);
      setSelectedStudentSessions([]);
    }
  };

  // Event handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferencesChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'preferredDays') {
      const newPreferences = { ...preferences };
      
      // If session type is one-time, only allow one day to be selected
      if (formData.sessionType === 'one-time') {
        if (checked) {
          // If selecting a day, unselect all other days first
          Object.keys(newPreferences.preferredDays).forEach(day => {
            newPreferences.preferredDays[day] = false;
          });
          newPreferences.preferredDays[value] = true;
        } else {
          // If deselecting the only selected day, don't allow it
          const currentSelectedCount = Object.values(newPreferences.preferredDays).filter(Boolean).length;
          if (currentSelectedCount <= 1) {
            return; // Don't allow deselecting the last day for one-time sessions
          }
          newPreferences.preferredDays[value] = false;
        }
      } else {
        // For multiple sessions, allow normal selection/deselection
        newPreferences.preferredDays[value] = checked;
        
        // Immediately update session count based on new selection
        const newSelectedDays = Object.values(newPreferences.preferredDays).filter(Boolean).length;
        if (newSelectedDays > 0) {
          const currentSessions = formData.numSessions || 1;
          if (currentSessions < newSelectedDays) {
            // Update session count to match new selection
            setFormData(prev => ({
              ...prev,
              numSessions: newSelectedDays
            }));
          }
        }
        
        // If deselecting a day and we have more sessions than available days, reduce sessions
        if (!checked && formData.sessionType === 'multiple') {
          if (newSelectedDays > 0 && formData.numSessions > newSelectedDays) {
            handleSessionCountChange(newSelectedDays);
          }
        }
      }
      
      setPreferences(newPreferences);
      
      // Update student block count after preferences change
      updateStudentBlockCount();
      
      // Preserve current start time and duration when day preferences change
      // Only reset if there's no current selection (not just if it's the default)
      if (!selectedBlockValues.startTime) {
        setSelectedBlockValues({
          startTime: preferences.preferredStartTime,
          duration: preferences.duration
        });
      }
      // Otherwise, keep the current selectedBlockValues unchanged
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
    console.log('handleSelect called with field:', field, 'value:', value);
    setFormData(prev => ({ ...prev, [field]: value.id }));

    if (field === 'student') {
      console.log('Student selected, fetching sessions for studentId:', value.id);
      fetchStudentSessions(value.id);
    }

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
    
    // For both one-time and multiple sessions, just update the display values to show the clicked time slot
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
    const allTimeBlocks = selectedTimeSlots;
    if (allTimeBlocks.length === 0) {
      newErrors.selectedTimeSlot = 'No student time blocks found on the calendar. Please ensure sessions are configured.';
    }
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.numSessions || formData.numSessions < 1) newErrors.numSessions = 'Number of sessions must be at least 1';

    // Prevent scheduling in the past - simplified local time approach
    const now = new Date();
    
    for (const block of allTimeBlocks) {
      // Create datetime string in local timezone
      const blockDateTimeString = `${block.date}T${block.startTime}`;
      const blockDateTime = new Date(blockDateTimeString);
      
      console.log('Simple date validation:', {
        blockDateTimeString,
        blockDateTime,
        now,
        isPast: blockDateTime < now
      });
      
      if (blockDateTime < now) {
        newErrors.pastDate = 'Cannot schedule a class in the past.';
        break;
      }
    }

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

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
  };

  // Get selected days as array
  const getSelectedDays = () => {
    return Object.entries(preferences.preferredDays)
      .filter(([_, isSelected]) => isSelected)
      .map(([day, _]) => day);
  };

  // Calculate end date based on start date, selected days, and number of sessions
  const calculateEndDate = (startDate, selectedDays, numSessions) => {
    if (!startDate || selectedDays.length === 0 || numSessions <= 0) {
      return null;
    }

    const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    const start = new Date(startDate);
    
    // Calculate how many weeks we need
    const weeksNeeded = Math.ceil(numSessions / selectedDays.length);
    
    // Calculate the end date
    let currentDate = new Date(start);
    let sessionsCreated = 0;
    let weekCount = 0;
    
    while (sessionsCreated < numSessions && weekCount < weeksNeeded) {
      for (const day of selectedDays) {
        if (sessionsCreated >= numSessions) break;
        
        const dayOfWeek = dayMap[day];
        const targetDate = new Date(start);
        targetDate.setDate(start.getDate() + (weekCount * 7) + (dayOfWeek - start.getDay() + 7) % 7);
        
        if (targetDate >= start) {
          currentDate = targetDate;
          sessionsCreated++;
        }
      }
      weekCount++;
    }
    
    return currentDate.toISOString().split('T')[0];
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit: selectedTimeSlots:', selectedTimeSlots);
    const newErrors = validateForm();
    console.log('handleSubmit: errors:', newErrors);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedDays = getSelectedDays();
      const allTimeBlocks = selectedTimeSlots;
      console.log('All time blocks found:', allTimeBlocks);
      console.log('Selected time slots state:', selectedTimeSlots);
      if (allTimeBlocks.length === 0) {
        throw new Error('No student time blocks found on the calendar');
      }
      // Sort time blocks by session number if available, otherwise by date
      const sortedTimeBlocks = allTimeBlocks.sort((a, b) => {
        if (a.sessionNumber && b.sessionNumber) {
          return a.sessionNumber - b.sessionNumber;
        }
        return new Date(a.date) - new Date(b.date);
      });
      
      if (formData.sessionType === 'multiple') {
        // Create a class series and all sessions
        // Gather info for the series
        const daysOfWeek = Array.from(new Set(sortedTimeBlocks.map(b => b.dayOfWeek)));
        const start_date = sortedTimeBlocks[0].date;
        const end_date = sortedTimeBlocks[sortedTimeBlocks.length - 1].date;
        const num_sessions = sortedTimeBlocks.length;
        // Use the first block's start/end time for the series
        const firstBlock = sortedTimeBlocks[0];
        
        // Create sessions array from the selected time blocks
        const sessions = sortedTimeBlocks.map(timeBlock => ({
          session_date: timeBlock.date,
          start_time: timeBlock.startTime,
          end_time: calculateEndTime(timeBlock.startTime, timeBlock.duration)
        }));
        
        const seriesData = {
          subject_id: formData.subject,
          student_id: formData.student,
          instructor_id: selectedInstructorId, // Add instructor assignment
          start_date,
          end_date,
          days_of_week: daysOfWeek,
          start_time: firstBlock.startTime,
          end_time: calculateEndTime(firstBlock.startTime, firstBlock.duration),
          location: formData.location,
          notes: formData.notes,
          num_sessions,
          sessions // Add the sessions array
        };
        console.log('Sending series data:', seriesData);
        await classSeriesService.createClassSeries(seriesData);
      } else {
        // One-time session: create individual class session using classSessionService
        const sessionPromises = sortedTimeBlocks.map(async (timeBlock, index) => {
          const sessionEndTime = calculateEndTime(timeBlock.startTime, timeBlock.duration);
          
          // Use utility function to create TIMESTAMPTZ timestamps
          const timestamps = createSessionTimestamps(
            timeBlock.date, 
            timeBlock.startTime, 
            timeBlock.duration
          );
          
          const sessionData = {
            instructor_id: parseInt(selectedInstructorId),
            student_id: parseInt(formData.student),
            subject_id: parseInt(formData.subject),
            ...timestamps,
            location: formData.location
          };
          console.log('Creating session with TIMESTAMPTZ data:', sessionData);
          return classSessionService.createSession(sessionData);
        });
        await Promise.all(sessionPromises);
      }
      // Refresh calendar data to show updated availability
      if (window.refreshCalendarData) {
        window.refreshCalendarData();
      }
      alert(formData.sessionType === 'one-time' ? 'Class created successfully!' : 'Class series created successfully!');
      // Reset form and state
      setFormData({ 
        student: '', 
        subjectGroup: '', 
        subject: '', 
        location: '', 
        selectedTimeSlot: null, 
        notes: '', 
        numSessions: 1, 
        endDate: '', 
        timePackageId: null, 
        sessionType: 'one-time' 
      });
      setPreferences({
        preferredDays: { sun: false, mon: false, tue: false, wed: false, thu: false, fri: false, sat: false },
        preferredStartTime: '09:00',
        duration: 60
      });
      setSelectedBlockValues({
        startTime: '09:00',
        duration: 60
      });
      setSelectedInstructorId(null);
      setSelectedTimeSlots([]);
      setErrors({});
      await fetchPendingClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      // Show detailed conflict information if available
      if (error.response?.data?.conflicts) {
        const conflicts = error.response.data.conflicts;
        let conflictMessage = 'Time slot conflicts with existing sessions:\n\n';
        conflicts.forEach(conflict => {
          conflictMessage += `- ${conflict.conflict_type} conflict: ${conflict.session_date} ${conflict.start_time}-${conflict.end_time} (${conflict.status})\n`;
        });
        alert(conflictMessage);
      } else {
        alert(error.response?.data?.error || 'Failed to create class');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pending class actions
  const handleEdit = (id) => console.log('Edit class:', id);
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        // Check if it's a single session or class series by looking at the pending classes
        const classItem = pendingClasses.find(item => (item.session_id || item.series_id) === id);
        const isSingleSession = classItem?.session_id !== undefined;
        
        if (isSingleSession) {
          // Delete single session
          await classSessionService.deleteSession(id);
        } else {
          // Delete class series
          await classSeriesService.deleteClassSeries(id);
        }
        
        fetchPendingClasses();
        
        // Refresh calendar data to show updated availability
        if (window.refreshCalendarData) {
          window.refreshCalendarData();
        }
        
        alert('Class deleted successfully');
      } catch (error) {
        console.error('Error deleting class:', error);
        alert(error.response?.data?.error || 'Failed to delete class');
      }
    }
  };

  // Calculate total time needed for all sessions
  const calculateTotalTimeNeeded = () => {
    // Use the actual selected time slots from the calendar instead of theoretical calculation
    if (selectedTimeSlots.length > 0) {
      return selectedTimeSlots.reduce((total, slot) => total + (slot.duration || preferences.duration), 0);
    }
    
    // Fallback to theoretical calculation if no slots are selected yet
    const selectedDays = Object.values(preferences.preferredDays).filter(Boolean).length;
    const totalSessions = formData.numSessions || 1;
    return totalSessions * preferences.duration;
  };

  // Calculate student block count and update session count
  const updateStudentBlockCount = () => {
    const selectedDays = Object.values(preferences.preferredDays).filter(Boolean).length;
    setStudentBlockCount(selectedDays);
    
    // For one-time sessions, always set to 1
    if (formData.sessionType === 'one-time') {
      if (formData.numSessions !== 1) {
        setFormData(prev => ({
          ...prev,
          numSessions: 1
        }));
      }
    } else {
      // For multiple sessions, ensure numSessions is at least equal to selected days
      if (selectedDays > 0) {
        const currentSessions = formData.numSessions || 1;
        if (currentSessions < selectedDays) {
          setFormData(prev => ({
            ...prev,
            numSessions: selectedDays
          }));
        }
      }
    }
  };

  // Expand preferred days when session count increases
  const expandPreferredDays = (newSessionCount) => {
    const currentSelectedDays = Object.entries(preferences.preferredDays)
      .filter(([_, isSelected]) => isSelected)
      .map(([day, _]) => day);
    
    if (currentSelectedDays.length === 0) return;

    // Calculate how many weeks we need
    const weeksNeeded = Math.ceil(newSessionCount / currentSelectedDays.length);
    
    // Create a new preferences object with expanded days
    const newPreferences = { ...preferences };
    
    // Reset all days to false first
    Object.keys(newPreferences.preferredDays).forEach(day => {
      newPreferences.preferredDays[day] = false;
    });
    
    // Add days in repeating pattern
    let sessionIndex = 0;
    for (let week = 0; week < weeksNeeded && sessionIndex < newSessionCount; week++) {
      for (const day of currentSelectedDays) {
        if (sessionIndex < newSessionCount) {
          newPreferences.preferredDays[day] = true;
          sessionIndex++;
        }
      }
    }
    
    setPreferences(newPreferences);
  };

  // Handle session count change with day expansion
  const handleSessionCountChange = (newCount) => {
    const currentCount = formData.numSessions || 1;
    const selectedDays = Object.values(preferences.preferredDays).filter(Boolean).length;
    
    // For multiple sessions, ensure minimum is the number of selected days
    if (formData.sessionType === 'multiple' && selectedDays > 0) {
      const minSessions = Math.max(selectedDays, 1);
      newCount = Math.max(newCount, minSessions);
    }
    
    // If increasing sessions, expand the days
    if (newCount > currentCount) {
      expandPreferredDays(newCount);
    }
    
    // Update the form data
    setFormData(prev => ({
      ...prev,
      numSessions: newCount
    }));
  };

  // Update block count when preferences change - removed to prevent infinite loop
  // The updateStudentBlockCount function is called directly in handlePreferencesChange

  // Additional effect to ensure session count is always correct
  useEffect(() => {
    if (formData.sessionType === 'multiple') {
      const selectedDays = Object.values(preferences.preferredDays).filter(Boolean).length;
      const currentSessions = formData.numSessions || 1;
      
      if (selectedDays > 0 && currentSessions < selectedDays) {
        setFormData(prev => ({
          ...prev,
          numSessions: selectedDays
        }));
      }
    }
  }, [preferences.preferredDays, formData.sessionType]);

  // Check if student has sufficient time
  const checkTimeAvailability = () => {
    const totalNeeded = calculateTotalTimeNeeded();
    
    // Handle both old array format and new object format
    let availableTime = 0;
    if (!studentTimePackages) {
      // No data available
      availableTime = 0;
    } else if (Array.isArray(studentTimePackages)) {
      // Old format: array of packages
      availableTime = studentTimePackages.reduce((total, pkg) => {
        return total + (pkg.minutes_remaining || 0);
      }, 0);
    } else if (studentTimePackages && studentTimePackages.packages && Array.isArray(studentTimePackages.packages)) {
      // New format: object with packages array
      availableTime = studentTimePackages.packages.reduce((total, pkg) => {
        return total + (pkg.remaining * 60 || 0); // Convert hours to minutes
      }, 0);
    } else {
      // Fallback: try to use currentBalance if available
      availableTime = (studentTimePackages.currentBalance || 0) * 60; // Convert hours to minutes
    }
    
    return {
      hasSufficientTime: availableTime >= totalNeeded,
      totalNeeded,
      availableTime,
      deficit: Math.max(0, totalNeeded - availableTime)
    };
  };

  // Pass a handler to update the visible range from the calendar
  const handleCalendarRangeChange = (range) => {
    let newStart;
    if (Array.isArray(range)) {
      newStart = range[0];
      setCalendarRange({ start: range[0], end: range[range.length - 1] });
    } else if (range.start && range.end) {
      newStart = range.start;
      setCalendarRange({ start: range.start, end: range.end });
    }
    // Only set anchorStartDate the first time
    setAnchorStartDate(prev => prev || newStart);
    
    // Fetch student sessions for the new range if a student is selected
    if (formData.student) {
      fetchStudentSessions(formData.student);
    }
  };

  // Move this to the top level
  const handleEventsUpdate = useCallback((events) => {
    // Extract all student preference events (purple/colored blocks) from the calendar
    // This excludes instructor availability (green) and existing sessions (yellow)
    const preferenceEvents = events.filter(event => event.type === 'preference');
    console.log('Preference events:', preferenceEvents);
    
    // Debug: Log the first event to see its structure
    if (preferenceEvents.length > 0) {
      console.log('First preference event details:', {
        event: preferenceEvents[0],
        startTime: preferenceEvents[0].startTime,
        startTimeString: preferenceEvents[0].start.toTimeString(),
        startTimeStringSlice: preferenceEvents[0].start.toTimeString().slice(0, 5),
        start: preferenceEvents[0].start,
        end: preferenceEvents[0].end
      });
    }
    
    const timeBlocks = preferenceEvents.map(event => ({
      instructor: { id: selectedInstructorId },
      date: event.start.toISOString().split('T')[0],
      startTime: event.startTime || event.start.toTimeString().slice(0, 5),
      endTime: event.endTime || event.end.toTimeString().slice(0, 5),
      dayOfWeek: event.dayOfWeek || event.start.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(),
      duration: event.duration,
      sessionNumber: event.sessionNumber
    }));
    console.log('Setting selectedTimeSlots:', timeBlocks);
    setSelectedTimeSlots(timeBlocks);
  }, [selectedInstructorId]);

  return (
    <div className="page-container">
      <div className="main">
        <section className="dashboard-main">
          {/* Tab Switcher */}
          <div className="scheduling-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button
              className={`tab${activeTab === 'scheduling' ? ' active' : ''}`}
              onClick={() => setActiveTab('scheduling')}
              style={{
                padding: '8px 20px',
                borderRadius: '6px 6px 0 0',
                border: 'none',
                background: activeTab === 'scheduling' ? '#f3f4f6' : '#e5e7eb',
                fontWeight: 600,
                color: activeTab === 'scheduling' ? '#1e293b' : '#6b7280',
                borderBottom: activeTab === 'scheduling' ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer',
                outline: 'none',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              Scheduling
            </button>
            <button
              className={`tab${activeTab === 'confirmations' ? ' active' : ''}`}
              onClick={() => setActiveTab('confirmations')}
              style={{
                padding: '8px 20px',
                borderRadius: '6px 6px 0 0',
                border: 'none',
                background: activeTab === 'confirmations' ? '#f3f4f6' : '#e5e7eb',
                fontWeight: 600,
                color: activeTab === 'confirmations' ? '#1e293b' : '#6b7280',
                borderBottom: activeTab === 'confirmations' ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer',
                outline: 'none',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              Pending Instructor Confirmations
            </button>
          </div>

          {/* Scheduling Tab Content */}
          {activeTab === 'scheduling' && (
            <>
              <form className="create-class-form" onSubmit={handleSubmit}>
                {/* Student & Subject Selection - Horizontal Layout */}
                <div className="form-row">
                  <div className="form-group compact">
                    <label>Student</label>
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
                    <label>Class</label>
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
                      
                      <div className="form-group">
                        <label>Session Type</label>
                        <div className="session-type-container">
                          <div className="toggle-switch-container">
                            <span className={`toggle-label ${formData.sessionType === 'one-time' ? 'active' : ''}`}>
                              One-time
                            </span>
                            <label className="toggle-switch">
                              <input 
                                type="checkbox" 
                                name="sessionType" 
                                checked={formData.sessionType === 'multiple'} 
                                onChange={(e) => {
                                  const newSessionType = e.target.checked ? 'multiple' : 'one-time';
                                  const newNumSessions = e.target.checked ? Math.max(1, studentBlockCount) : 1;
                                  
                                  // For one-time sessions, just ensure we have at least one day selected
                                  if (newSessionType === 'one-time') {
                                    const selectedDays = Object.values(preferences.preferredDays).filter(Boolean).length;
                                    if (selectedDays === 0) {
                                      // If no days are selected, default to Monday
                                      const newPreferences = { ...preferences };
                                      Object.keys(newPreferences.preferredDays).forEach(day => {
                                        newPreferences.preferredDays[day] = false;
                                      });
                                      newPreferences.preferredDays['mon'] = true;
                                      setPreferences(newPreferences);
                                    }
                                  }
                                  // For multiple sessions, keep all currently selected days
                                  
                                  handleInputChange({
                                    target: {
                                      name: 'sessionType',
                                      value: newSessionType
                                    }
                                  });
                                  handleSessionCountChange(newNumSessions);
                                }}
                              />
                              <span className="toggle-slider"></span>
                            </label>
                            <span className={`toggle-label ${formData.sessionType === 'multiple' ? 'active' : ''}`}>
                              Multiple
                            </span>
                          </div>
                          
                          {formData.sessionType === 'multiple' && (
                            <div className="session-count-container">
                              <label className="session-count-label">Number of Sessions:</label>
                              <div className="session-count-controls">
                                <button 
                                  type="button" 
                                  className="session-count-btn minus"
                                  disabled={formData.sessionType === 'one-time'}
                                  onClick={() => {
                                    const selectedDays = Object.values(preferences.preferredDays).filter(Boolean).length;
                                    const minSessions = formData.sessionType === 'multiple' ? Math.max(selectedDays, 1) : 1;
                                    const newValue = Math.max(minSessions, (formData.numSessions || 1) - 1);
                                    handleSessionCountChange(newValue);
                                  }}
                                >
                                  −
                                </button>
                                <span className="session-count-display">{formData.numSessions || 1}</span>
                                <button 
                                  type="button" 
                                  className="session-count-btn plus"
                                  disabled={formData.sessionType === 'one-time'}
                                  onClick={() => {
                                    const newValue = Math.min(50, (formData.numSessions || 1) + 1);
                                    handleSessionCountChange(newValue);
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          )}
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
                          <div 
                            className={`duration-display ${formData.selectedTimeSlot ? 'selected-block' : ''}`}
                          >
                            {selectedBlockValues.duration} min
                          </div>
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
                        sessionCount={formData.numSessions}
                        sessionType={formData.sessionType}
                        calendarRange={calendarRange}
                        anchorStartDate={anchorStartDate}
                        onRangeChange={handleCalendarRangeChange}
                        height={670}
                        viewMode="scheduling"
                        selectedStudentSessions={selectedStudentSessions}
                        onResetBlocks={() => {
                          setAnchorStartDate(calendarRange.start);
                          setSelectedTimeSlots([]);
                        }}
                        onEventsUpdate={handleEventsUpdate}
                      />
                    </DndProvider>
                    {errors.selectedTimeSlot && <span className="error-message">{errors.selectedTimeSlot}</span>}
                  </div>
                </div>

                {/* Time Availability Warning */}
                {formData.student && selectedTimeSlots.length > 0 && (() => {
                  const timeCheck = checkTimeAvailability();
                  if (!timeCheck.hasSufficientTime) {
                    return (
                      <div className="time-warning-container" style={{
                        backgroundColor: '#fef3c7',
                        border: '1px solid #f59e0b',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          color: '#d97706',
                          fontSize: '18px'
                        }}>
                          
                        </div>
                        <div>
                          <div style={{
                            fontWeight: '600',
                            color: '#92400e',
                            marginBottom: '4px'
                          }}>
                            Insufficient Hours
                          </div>
                          <div style={{
                            color: '#92400e',
                            fontSize: '14px'
                          }}>
                            Student needs {Math.ceil(timeCheck.totalNeeded / 60)} hours but only has {Math.ceil(timeCheck.availableTime / 60)} hours available.
                            {timeCheck.deficit > 0 && (
                              <span style={{ fontWeight: '500' }}>
                                {' '}Additional {Math.ceil(timeCheck.deficit / 60)} hours required.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

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

                <button type="submit" className="btn" disabled={isSubmitting || selectedTimeSlots.length === 0}>
                  {isSubmitting ? 'Creating...' : 'Create Class'}
                </button>
              </form>
            </>
          )}

          {/* Confirmations Tab Content */}
          {activeTab === 'confirmations' && (
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
                      {pendingClasses.map(classItem => {
                        // Use session_id for single sessions, series_id for class series
                        const itemId = classItem.session_id || classItem.series_id;
                        const isSingleSession = classItem.session_id !== undefined;
                        
                        return (
                          <tr key={itemId}>
                            <td>{classItem.student?.name || 'Unknown'}</td>
                            <td>{classItem.instructor?.name || 'Unknown'}</td>
                            <td>{classItem.subject_name}</td>
                            <td>{new Date(classItem.start_date).toLocaleDateString()}</td>
                            <td>
                              {isSingleSession ? 
                                // For single sessions, show the day of the week
                                new Date(classItem.start_date).toLocaleDateString('en-US', { weekday: 'short' }) :
                                // For class series, show the days array
                                (Array.isArray(classItem.days_of_week) ? classItem.days_of_week.join(', ') : classItem.days_of_week || 'N/A')
                              }
                            </td>
                            <td>
                              <span className={`status-badge ${classItem.status?.toLowerCase() || 'unknown'}`}>
                                {classItem.status || 'Unknown'}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button className="btn-icon" onClick={() => handleEdit(itemId)} title="Edit">
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button className="btn-icon delete" onClick={() => handleDelete(itemId)} title="Delete">
                                  <i className="fas fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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
          )}
        </section>
      </div>
    </div>
  );
}

export default Scheduling;