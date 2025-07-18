import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import { getTenantPool } from './db/tenantPool.js';

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
import uploadRoutes from './routes/uploadRoutes.js';
import registerInstitutionRouter from './routes/registerInstitution.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { toUtcIso } from './lib/time.js';

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
app.use(express.json());
app.use(session({
  secret: 'mobius-secret',
  resave: false,
  saveUninitialized: false
}));

// Attach tenant pool to every request BEFORE all /api routes
app.use(async (req, _res, next) => {
  if (!req.session?.tenantCode) return next();    // public routes
  req.db = await getTenantPool(req.session.tenantCode);
  next();
});

// Serve static files from uploads directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${toUtcIso(new Date())} - ${req.method} ${req.url}`);
    if (req.method !== 'GET') {
        console.log('Request body:', req.body);
    }
    next();
});

// STEP 1 – user submits institution code
app.post('/api/institution', async (req, res) => {
  try {
    await getTenantPool(req.body.code);           // throws if invalid
    req.session.tenantCode = req.body.code;       // store tenant context
    res.sendStatus(200);
  } catch {
    res.status(404).send('Invalid institution code');
  }
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
app.use('/api/upload', uploadRoutes);
app.use(registerInstitutionRouter);

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