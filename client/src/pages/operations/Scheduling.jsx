import React, { useState } from 'react';
import '../../css/Scheduling.css';

function Scheduling() {
  // Form state
  const [formData, setFormData] = useState({
    student: '',
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

  // Error state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample data for pending classes
  const [pendingClasses] = useState([
    {
      id: 1,
      student: 'John Doe',
      instructor: 'Jane Smith',
      subject: 'Mathematics',
      start: '2024-04-10 09:00 AM',
      days: 'Mon, Wed',
      status: 'Pending'
    }
  ]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.student.trim()) newErrors.student = 'Student is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.instructor.trim()) newErrors.instructor = 'Instructor is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';

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
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Class scheduled successfully!');
        // Reset form
        setFormData({
          student: '',
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
            fri: false
          },
          recStart: '',
          recEnd: '',
          recStartTime: '',
          recEndTime: '',
          notes: ''
        });
      } catch (error) {
        alert('Failed to schedule class. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="page-container">
      <div className="main">
        <section className="dashboard-main">
          <form className="create-class-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Student
                <input
                  type="text"
                  name="student"
                  value={formData.student}
                  onChange={handleInputChange}
                  placeholder="Search student"
                  className={errors.student ? 'error' : ''}
                />
                {errors.student && <span className="error-message">{errors.student}</span>}
              </label>
            </div>

            <div className="form-group">
              <label>
                Subject
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={errors.subject ? 'error' : ''}
                >
                  <option value="">Select subject</option>
                  <option value="math">Mathematics</option>
                  <option value="english">English</option>
                  <option value="science">Science</option>
                </select>
                {errors.subject && <span className="error-message">{errors.subject}</span>}
              </label>
            </div>
            <div className="form-group">
              <label>
                Class
                <select
                  name="class"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={errors.subject ? 'error' : ''}
                >
                  <option value="">Select subject</option>
                  <option value="math">Mathematics</option>
                  <option value="english">English</option>
                  <option value="science">Science</option>
                </select>
                {errors.subject && <span className="error-message">{errors.subject}</span>}
              </label>
            </div>

            <div className="form-group">
              <label>
                Instructor
                <input
                  type="text"
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleInputChange}
                  placeholder="Search instructor"
                  className={errors.instructor ? 'error' : ''}
                />
                {errors.instructor && <span className="error-message">{errors.instructor}</span>}
              </label>
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
                    <tr key={classItem.id}>
                      <td>{classItem.student}</td>
                      <td>{classItem.instructor}</td>
                      <td>{classItem.subject}</td>
                      <td>{classItem.start}</td>
                      <td>{classItem.days}</td>
                      <td>
                        <span className="status-badge pending">{classItem.status}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" onClick={() => handleEdit(classItem.id)}>
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="btn-icon delete" onClick={() => handleDelete(classItem.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

export default Scheduling;