import React, { useState } from 'react';

const ClassRoster = () => {
    const [classes, setClasses] = useState([]);
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
        <div className="main-class-roster">
            {loading ? (
                <div className="loading">Loading...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <table className="roster-table">
                    <thead>
                        <tr>
                            <th>Class Name</th>
                            <th>Instructor</th>
                            <th>Contact</th>
                            <th>Schedule</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map((classItem) => (
                            <React.Fragment key={classItem._id}>
                                <tr 
                                    className={`roster-row ${expandedRows[classItem._id] ? 'expanded' : ''}`}
                                    onClick={() => toggleRow(classItem._id)}
                                >
                                    <td>{classItem.name}</td>
                                    <td>{classItem.instructor}</td>
                                    <td>
                                        <div className="contact-info">
                                            <span className="email">{classItem.instructorEmail}</span>
                                            {classItem.instructorPhone && expandedRows[classItem._id] && (
                                                <span className="phone">{classItem.instructorPhone}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{classItem.schedule}</td>
                                    <td>
                                        <button 
                                            className="edit-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(classItem);
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="delete-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(classItem._id);
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ClassRoster; 