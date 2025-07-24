// Build: `npm install && npm run build`
// Start: `npm start`

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import bodyParser from 'body-parser';
import pkg from 'pg';
const { Pool } = pkg;

// Import all routes (as in src/server.js)
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import studentRoutes from './src/routes/studentRoutes.js';
import instructorRoutes from './src/routes/instructorRoutes.js';
import guardianRoutes from './src/routes/guardianRoutes.js';
import studentGuardianRoutes from './src/routes/studentGuardianRoutes.js';
import classSessionRoutes from './src/routes/classSessionRoutes.js';
import classSeriesRoutes from './src/routes/classSeriesRoutes.js';
import subjectRoutes from './src/routes/subjectRoutes.js';
import subjectGroupsRouter from './src/routes/subjectGroups.js';
import staffRoutes from './src/routes/staffRoutes.js';
import attendanceRoutes from './src/routes/attendanceRoutes.js';
import timePackageRoutes from './src/routes/timePackageRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import registerInstitutionRouter from './src/routes/registerInstitution.js';
import { getTenantPool } from './src/db/tenantPool.js';
import { toUtcIso } from './src/lib/time.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ✅ show a one-line success or error at boot
pool.connect()
  .then(() => console.log('✅ Connected to Postgres'))
  .catch(err  => console.error('❌ Postgres connect error', err));

const app = express();
dotenv.config();

// CORS (update as needed for production)
app.use(cors({
    origin: [process.env.CLIENT_ORIGIN || 'http://localhost:5173'],
    credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, sameSite: 'lax' }
  })
);

// Attach tenant pool to every request BEFORE all /api routes
app.use(async (req, _res, next) => {
  if (!req.session?.tenantCode) return next();    // public routes
  req.db = await getTenantPool(req.session.tenantCode);
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));

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
app.use('/api/student-guardians', studentGuardianRoutes);
app.use('/api/class-sessions', classSessionRoutes);
app.use('/api/class-series', classSeriesRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/subject-groups', subjectGroupsRouter);
app.use('/api/staff', staffRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/time-packages', timePackageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/register-institution', registerInstitutionRouter);

// Serve React static build
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

// Catch-all route for React Router
app.get('*', (_, res) =>
  res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'))
);

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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
}); 