import api from './api';
import classSessionService from './classSessionService';
import instructorService from './instructorService';
import { toUtcIso, isoToLocal } from '../lib/time.js';

const eventService = {
    // Get events for the current user based on their role
    getUserEvents: async (userId, userRole, startDate = null, endDate = null) => {
        try {
            let events = [];
            
            switch (userRole) {
                case 'student':
                    // For students, get their class sessions
                    events = await classSessionService.getStudentSessions(userId, startDate, endDate);
                    break;
                    
                case 'instructor':
                    // For instructors, get their teaching sessions
                    events = await classSessionService.getInstructorSessions(userId);
                    break;
                    
                case 'staff':
                    // For staff, get all sessions they can see (admin view)
                    events = await classSessionService.getAllSessions();
                    break;
                    
                default:
                    console.warn('Unknown user role:', userRole);
                    return [];
            }
            
            // Format events for display
            return events.map(event => ({
                id: event.session_id,
                title: event.subject_name,
                start: toUtcIso(event.session_date, event.start_time),
                end: toUtcIso(event.session_date, event.end_time),
                date: event.session_date,
                startTime: event.start_time,
                endTime: event.end_time,
                location: event.location,
                status: event.status,
                // Include participant info based on role
                ...(userRole === 'student' && {
                    instructor: event.instructor,
                    instructorName: event.instructor?.name
                }),
                ...(userRole === 'instructor' && {
                    student: event.student,
                    studentName: event.student?.name
                }),
                ...(userRole === 'staff' && {
                    instructor: event.instructor,
                    student: event.student,
                    instructorName: event.instructor?.name,
                    studentName: event.student?.name
                })
            }));
            
        } catch (error) {
            console.error('Error fetching user events:', error);
            throw error;
        }
    },

    // Get today's events for the current user
    getTodayEvents: async (userId, userRole) => {
        try {
            const today = new Date();
            const startDate = toUtcIso(today.toISOString().split('T')[0], '00:00');
            const endDate = toUtcIso(today.toISOString().split('T')[0], '23:59');
            
            return await eventService.getUserEvents(userId, userRole, startDate, endDate);
        } catch (error) {
            console.error('Error fetching today\'s events:', error);
            throw error;
        }
    },

    // Get upcoming events for the current user (next 7 days)
    getUpcomingEvents: async (userId, userRole) => {
        try {
            const today = new Date();
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            
            const startDate = toUtcIso(today.toISOString().split('T')[0], '00:00');
            const endDate = toUtcIso(nextWeek.toISOString().split('T')[0], '23:59');
            
            return await eventService.getUserEvents(userId, userRole, startDate, endDate);
        } catch (error) {
            console.error('Error fetching upcoming events:', error);
            throw error;
        }
    }
};

export default eventService; 