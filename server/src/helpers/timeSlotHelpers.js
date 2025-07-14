import pool from '../config/db.js';
import { toUtcIso, assertUtcIso } from '../lib/time.js';

// Convert day abbreviation to day number (sun=0, mon=1, tue=2, etc.)
const dayToNumber = (dayAbbr) => {
    const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    return dayMap[dayAbbr] || 0;
};

// Get next occurrence of a day of the week
const getNextDayOccurrence = (dayAbbr, baseDate = toUtcIso()) => {
    const targetDay = dayToNumber(dayAbbr);
    const currentDay = assertUtcIso(baseDate).getDay();
    let daysToAdd = (targetDay - currentDay + 7) % 7;
    
    // If it's today but the time has passed, move to next week
    if (daysToAdd === 0) {
        const currentTime = assertUtcIso(baseDate).getHours() * 60 + assertUtcIso(baseDate).getMinutes();
        // If it's past 6 PM, move to next week
        if (currentTime >= 18 * 60) {
            daysToAdd = 7;
        }
    }
    
    const nextDate = assertUtcIso(baseDate).getTime() + (daysToAdd * 24 * 60 * 60 * 1000);
    return toUtcIso(nextDate);
};

// Add minutes to a time string (HH:MM format)
const addMinutesToTimeString = (timeStr, minutes) => {
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

// Check if a time is within an availability slot
const isTimeInAvailabilitySlot = (time, availabilitySlot) => {
    return time >= availabilitySlot.start_time && time <= availabilitySlot.end_time;
};

// Check for scheduling conflicts
const checkSchedulingConflicts = async (client, instructorId, studentId, date, startTime, endTime) => {
    // Check for existing class sessions
    const sessionConflict = await client.query(`
        SELECT session_id FROM class_sessions 
        WHERE (instructor_id = $1 OR student_id = $2)
        AND session_date = $3
        AND status NOT IN ('canceled', 'completed')
        AND (
            ($4::time, $5::time) OVERLAPS (start_time, end_time)
        )
    `, [instructorId, studentId, date, startTime, endTime]);

    // Check for instructor unavailability
    const unavailabilityConflict = await client.query(`
        SELECT unavail_id FROM instructor_unavailability
        WHERE instructor_id = $1
        AND $2::date BETWEEN DATE(start_datetime) AND DATE(end_datetime)
        AND (
            ($3::time, $4::time) OVERLAPS (
                CAST(start_datetime AS time), 
                CAST(end_datetime AS time)
            )
        )
    `, [instructorId, date, startTime, endTime]);

    return sessionConflict.rows.length > 0 || unavailabilityConflict.rows.length > 0;
};

// Generate time slots from availability
const generateTimeSlots = async (client, availability, durationMinutes, instructorId, studentId) => {
    const suggestedSlots = [];
    const today = toUtcIso();
    const twoWeeksFromNow = assertUtcIso(today.getTime() + (14 * 24 * 60 * 60 * 1000));

    for (const availSlot of availability) {
        const slotDate = getNextDayOccurrence(availSlot.day_of_week, today);
        
        // Only consider dates within the next 2 weeks
        if (slotDate > twoWeeksFromNow) continue;

        // Generate time slots within this availability period
        let currentTime = availSlot.start_time;
        
        while (true) {
            const endTime = addMinutesToTimeString(currentTime, durationMinutes);
            
            // Check if this slot fits within availability
            if (!isTimeInAvailabilitySlot(endTime, availSlot)) {
                break;
            }

            // Check for conflicts
            const hasConflict = await checkSchedulingConflicts(
                client, instructorId, studentId, slotDate, currentTime, endTime
            );
            
            if (!hasConflict) {
                // Format date for display
                const formattedDate = assertUtcIso(slotDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                });

                suggestedSlots.push({
                    date: assertUtcIso(slotDate).toISOString().split('T')[0], // YYYY-MM-DD format
                    displayDate: formattedDate,
                    startTime: currentTime,
                    endTime: endTime,
                    location: 'Zoom', // Default location
                    dayOfWeek: availSlot.day_of_week,
                    availabilityType: availSlot.type
                });
            }

            // Move to next 15-minute slot
            currentTime = addMinutesToTimeString(currentTime, 15);
            
            // Stop if we've reached the end of availability
            if (currentTime >= availSlot.end_time) {
                break;
            }
        }
    }

    // Sort slots by date and time
    suggestedSlots.sort((a, b) => {
        const dateComparison = assertUtcIso(a.date) - assertUtcIso(b.date);
        if (dateComparison !== 0) return dateComparison;
        return a.startTime.localeCompare(b.startTime);
    });

    return suggestedSlots;
};

// Validate scheduling request (student credits, instructor qualifications, etc.)
const validateSchedulingRequest = async (client, studentId, instructorId, subjectId, durationMinutes) => {
    // Check if student exists and is active
    const studentCheck = await client.query(`
        SELECT s.student_id, u.name, u.is_active
        FROM students s
        JOIN users u ON s.student_id = u.user_id
        WHERE s.student_id = $1
    `, [studentId]);

    if (studentCheck.rows.length === 0) {
        throw new Error('Student not found');
    }

    if (!studentCheck.rows[0].is_active) {
        throw new Error('Student account is inactive');
    }

    // Check if instructor exists and is active
    const instructorCheck = await client.query(`
        SELECT i.instructor_id, u.name, u.is_active
        FROM instructors i
        JOIN users u ON i.instructor_id = u.user_id
        WHERE i.instructor_id = $1
    `, [instructorId]);

    if (instructorCheck.rows.length === 0) {
        throw new Error('Instructor not found');
    }

    if (!instructorCheck.rows[0].is_active) {
        throw new Error('Instructor account is inactive');
    }

    // Check if subject exists
    const subjectCheck = await client.query(`
        SELECT subject_id, name FROM subjects WHERE subject_id = $1
    `, [subjectId]);

    if (subjectCheck.rows.length === 0) {
        throw new Error('Subject not found');
    }

    // Check if instructor is qualified to teach this subject
    const instructorSubjectCheck = await client.query(`
        SELECT * FROM instructor_specialties 
        WHERE instructor_id = $1 AND subject_id = $2
    `, [instructorId, subjectId]);

    if (instructorSubjectCheck.rows.length === 0) {
        throw new Error('Instructor is not qualified to teach this subject');
    }

    // Check if student has sufficient time packages
    const studentTimePackages = await client.query(`
        SELECT COALESCE(SUM(minutes_remaining), 0) as total_minutes
        FROM student_time_packages 
        WHERE student_id = $1 AND expiration_date >= CURRENT_DATE
    `, [studentId]);

    const totalMinutes = parseInt(studentTimePackages.rows[0].total_minutes);

    if (totalMinutes < durationMinutes) {
        throw new Error(`Insufficient time. Student has ${(totalMinutes / 60).toFixed(1)} hours, needs ${(durationMinutes / 60).toFixed(1)} hours for this session`);
    }

    return { totalMinutes, minutesNeeded: durationMinutes };
};

// NEW: Smart scheduling functions

// Get qualified instructors for a subject
const getQualifiedInstructors = async (client, subjectId) => {
    const result = await client.query(`
        SELECT 
            i.instructor_id,
            u.name as instructor_name,
            u.email as instructor_email,
            i.employment_type,
            i.hourly_rate
        FROM instructor_specialties ins
        JOIN instructors i ON ins.instructor_id = i.instructor_id
        JOIN users u ON i.instructor_id = u.user_id
        WHERE ins.subject_id = $1 AND u.is_active = true
        ORDER BY u.name
    `, [subjectId]);
    
    return result.rows;
};

// Get instructor availability for specific days and time range
const getInstructorAvailabilityForRange = async (client, instructorId, preferredDays, preferredStartTime, preferredEndTime) => {
    console.log(`[DEBUG] Getting availability for instructor ${instructorId}, days: ${preferredDays}, time: ${preferredStartTime}-${preferredEndTime}`);
    
    const result = await client.query(`
        SELECT 
            ia.availability_id,
            ia.day_of_week,
            ia.start_time,
            ia.end_time,
            ia.type,
            ia.notes
        FROM instructor_availability ia
        WHERE ia.instructor_id = $1
        AND ia.status = 'active'
        AND ia.day_of_week = ANY($2::text[])
        AND (
            -- Availability slot overlaps with preferred time range
            (ia.start_time <= $3::time AND ia.end_time >= $4::time) OR
            -- Availability slot starts within preferred range
            (ia.start_time >= $3::time AND ia.start_time < $4::time) OR
            -- Availability slot ends within preferred range
            (ia.end_time > $3::time AND ia.end_time <= $4::time) OR
            -- Availability slot is completely within preferred range
            (ia.start_time >= $3::time AND ia.end_time <= $4::time)
        )
        AND (ia.start_date IS NULL OR ia.start_date <= CURRENT_DATE + INTERVAL '14 days')
        AND (ia.end_date IS NULL OR ia.end_date >= CURRENT_DATE)
        ORDER BY 
            CASE ia.day_of_week 
                WHEN 'sun' THEN 1 WHEN 'mon' THEN 2 WHEN 'tue' THEN 3 
                WHEN 'wed' THEN 4 WHEN 'thu' THEN 5 WHEN 'fri' THEN 6 WHEN 'sat' THEN 7 
            END,
            ia.start_time
    `, [instructorId, preferredDays, preferredStartTime, preferredEndTime]);
    
    console.log(`[DEBUG] Found ${result.rows.length} availability slots for instructor ${instructorId}:`, result.rows);
    return result.rows;
};

// Calculate time proximity score (lower is better)
const calculateTimeProximity = (preferredStart, preferredEnd, actualStart, actualEnd) => {
    const prefStart = parseInt(preferredStart.replace(':', ''));
    const prefEnd = parseInt(preferredEnd.replace(':', ''));
    const actStart = parseInt(actualStart.replace(':', ''));
    const actEnd = parseInt(actualEnd.replace(':', ''));
    
    // Calculate overlap
    const overlapStart = Math.max(prefStart, actStart);
    const overlapEnd = Math.min(prefEnd, actEnd);
    const overlap = Math.max(0, overlapEnd - overlapStart);
    
    // Calculate total preferred duration
    const preferredDuration = prefEnd - prefStart;
    
    // Return proximity score (0 = perfect match, higher = worse match)
    return preferredDuration - overlap;
};

// Check if a time slot is an exact match
const isExactMatch = (preferredStart, preferredEnd, actualStart, actualEnd) => {
    return preferredStart === actualStart && preferredEnd === actualEnd;
};

// Generate smart time slots with proximity scoring
const generateSmartTimeSlots = async (client, instructorId, studentId, availability, durationMinutes, preferredDays, preferredStartTime, preferredEndTime) => {
    const suggestedSlots = [];
    const today = toUtcIso();
    const twoWeeksFromNow = assertUtcIso(today.getTime() + (14 * 24 * 60 * 60 * 1000));

    // Track the best match for each day
    const bestMatchesByDay = {};

    for (const availSlot of availability) {
        const slotDate = getNextDayOccurrence(availSlot.day_of_week, today);
        
        // Only consider dates within the next 2 weeks
        if (slotDate > twoWeeksFromNow) continue;

        // Generate time slots within this availability period
        // Start with the preferred start time if it's within availability
        let currentTime = availSlot.start_time;
        
        // If preferred start time is within this availability slot, start from there
        if (preferredStartTime >= availSlot.start_time && preferredStartTime < availSlot.end_time) {
            currentTime = preferredStartTime;
        }
        
        // Generate slots with 30-minute intervals instead of 15-minute
        while (true) {
            const endTime = addMinutesToTimeString(currentTime, durationMinutes);
            
            // Check if this slot fits within availability
            if (!isTimeInAvailabilitySlot(endTime, availSlot)) {
                break;
            }

            // Check for conflicts
            const hasConflict = await checkSchedulingConflicts(
                client, instructorId, studentId, slotDate, currentTime, endTime
            );
            
            if (!hasConflict) {
                // Format date for display
                const formattedDate = assertUtcIso(slotDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                });

                // Calculate proximity score
                const proximityScore = calculateTimeProximity(
                    preferredStartTime, preferredEndTime, currentTime, endTime
                );

                // Check if this is a preferred day
                const isPreferredDay = preferredDays.includes(availSlot.day_of_week);
                
                // Check if this is an exact time match
                const isExactTimeMatch = isExactMatch(preferredStartTime, preferredEndTime, currentTime, endTime);
                
                // Determine match quality
                let matchQuality = 'alternate';
                if (isPreferredDay && isExactTimeMatch) {
                    matchQuality = 'exact';
                } else if (isPreferredDay && proximityScore <= 60) { // Within 1 hour of preferred time
                    matchQuality = 'close';
                }

                // Only add slots with reasonable proximity (within 2 hours of preferred time)
                if (proximityScore <= 120) { // 2 hours = 120 minutes
                    const slot = {
                        date: assertUtcIso(slotDate).toISOString().split('T')[0],
                        displayDate: formattedDate,
                        startTime: currentTime,
                        endTime: endTime,
                        location: 'Zoom',
                        dayOfWeek: availSlot.day_of_week,
                        availabilityType: availSlot.type,
                        proximityScore,
                        isPreferredDay,
                        isExactTimeMatch,
                        matchQuality
                    };

                    // Track the best match for this day
                    const dayKey = availSlot.day_of_week;
                    if (!bestMatchesByDay[dayKey] || 
                        (matchQuality === 'exact' && bestMatchesByDay[dayKey].matchQuality !== 'exact') ||
                        (matchQuality === 'close' && bestMatchesByDay[dayKey].matchQuality === 'alternate') ||
                        (matchQuality === bestMatchesByDay[dayKey].matchQuality && proximityScore < bestMatchesByDay[dayKey].proximityScore)) {
                        bestMatchesByDay[dayKey] = slot;
                    }
                }
            }

            // Move to next 30-minute slot instead of 15-minute
            currentTime = addMinutesToTimeString(currentTime, 30);
            
            // Stop if we've reached the end of availability
            if (currentTime >= availSlot.end_time) {
                break;
            }
        }
    }

    // Convert best matches to array and sort by match quality and proximity
    const bestSlots = Object.values(bestMatchesByDay);
    bestSlots.sort((a, b) => {
        // First sort by match quality (exact > close > alternate)
        const qualityOrder = { 'exact': 3, 'close': 2, 'alternate': 1 };
        if (qualityOrder[a.matchQuality] !== qualityOrder[b.matchQuality]) {
            return qualityOrder[b.matchQuality] - qualityOrder[a.matchQuality];
        }
        
        // Then sort by proximity score (lower is better)
        if (a.proximityScore !== b.proximityScore) {
            return a.proximityScore - b.proximityScore;
        }
        
        // Finally sort by date and time
        const dateComparison = assertUtcIso(a.date) - assertUtcIso(b.date);
        if (dateComparison !== 0) return dateComparison;
        return a.startTime.localeCompare(b.startTime);
    });

    return bestSlots;
};

// Main smart scheduling function
const findSmartSchedulingMatches = async (client, studentId, subjectId, preferredDays, preferredStartTime, preferredEndTime, durationMinutes = 60) => {
    // Get qualified instructors
    const qualifiedInstructors = await getQualifiedInstructors(client, subjectId);
    
    if (qualifiedInstructors.length === 0) {
        throw new Error('No qualified instructors found for this subject');
    }

    const allMatches = [];

    // For each qualified instructor, find available time slots
    for (const instructor of qualifiedInstructors) {
        try {
            // Get instructor availability for preferred range
            const availability = await getInstructorAvailabilityForRange(
                client, instructor.instructor_id, preferredDays, preferredStartTime, preferredEndTime
            );

            if (availability.length > 0) {
                // Generate time slots for this instructor
                const timeSlots = await generateSmartTimeSlots(
                    client, instructor.instructor_id, studentId, availability, 
                    durationMinutes, preferredDays, preferredStartTime, preferredEndTime
                );

                // Add instructor info to each slot
                const slotsWithInstructor = timeSlots.map(slot => ({
                    ...slot,
                    instructor: {
                        id: instructor.instructor_id,
                        name: instructor.instructor_name,
                        email: instructor.instructor_email,
                        employmentType: instructor.employment_type,
                        hourlyRate: instructor.hourly_rate
                    }
                }));

                allMatches.push(...slotsWithInstructor);
            }
        } catch (error) {
            console.error(`Error processing instructor ${instructor.instructor_id}:`, error);
            // Continue with other instructors
        }
    }

    // Sort all matches by quality and proximity
    allMatches.sort((a, b) => {
        // First sort by match quality
        if (a.matchQuality !== b.matchQuality) {
            return a.matchQuality === 'exact' ? -1 : 1;
        }
        
        // Then sort by proximity score
        if (a.proximityScore !== b.proximityScore) {
            return a.proximityScore - b.proximityScore;
        }
        
        // Finally sort by date and time
        const dateComparison = assertUtcIso(a.date) - assertUtcIso(b.date);
        if (dateComparison !== 0) return dateComparison;
        return a.startTime.localeCompare(b.startTime);
    });

    return allMatches;
};

export {
    getNextDayOccurrence,
    addMinutesToTimeString,
    isTimeInAvailabilitySlot,
    checkSchedulingConflicts,
    generateTimeSlots,
    validateSchedulingRequest,
    // New smart scheduling exports
    getQualifiedInstructors,
    getInstructorAvailabilityForRange,
    generateSmartTimeSlots,
    findSmartSchedulingMatches
}; 