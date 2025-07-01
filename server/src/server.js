import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';

// Import all routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import guardianRoutes from './routes/guardianRoutes.js';
import studentGuardianRoutes from './routes/studentGuardianRoutes.js';
import classSessionRoutes from './routes/classSessionRoutes.js';
import classSeriesRoutes from './routes/classSeriesRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import subjectGroupsRouter from './routes/subjectGroups.js';
import staffRoutes from './routes/staffRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import timePackageRoutes from './routes/timePackageRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Initialize express app
const app = express();
dotenv.config();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (req.method !== 'GET') {
        console.log('Request body:', req.body);
    }
    next();
});

// Route middlewares
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/guardians', guardianRoutes);
app.use('/api/student-guardian', studentGuardianRoutes);
app.use('/api/class-sessions', classSessionRoutes);
app.use('/api/class-series', classSeriesRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/subject-groups', subjectGroupsRouter);
app.use('/api/staff', staffRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/time-packages', timePackageRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        body: req.body
    });
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.url} not found` });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
});

export default app;