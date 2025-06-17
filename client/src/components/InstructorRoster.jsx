import React, { useState } from 'react';

const InstructorRoster = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});

    const toggleRow = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="main-student-roster">
            {loading ? (
                <div className="loading">Loading...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <table className="roster-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Contact</th>
                            <th>Department</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {instructors.map((instructor) => (
                            <React.Fragment key={instructor._id}>
                                <tr 
                                    className={`roster-row ${expandedRows[instructor._id] ? 'expanded' : ''}`}
                                    onClick={() => toggleRow(instructor._id)}
                                >
                                    <td>{instructor.name}</td>
                                    <td>{instructor.email}</td>
                                    <td>{instructor.department}</td>
                                    <td>{instructor.status}</td>
                                </tr>
                                {expandedRows[instructor._id] && instructor.phone && (
                                    <tr className="roster-subrow">
                                        <td></td>
                                        <td className="phone-cell">{instructor.phone}</td>
                                        <td colSpan="2"></td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default InstructorRoster; 