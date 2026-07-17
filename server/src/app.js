// Express app wiring, extracted from index.js so tests can import the app
// without binding a port. index.js remains the runtime entrypoint.
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import bodyParser from 'body-parser';

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
import classRoutes from './routes/classRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import rescheduleRoutes from './routes/rescheduleRoutes.js';
import instructorCalendarRoutes from './routes/instructorCalendarRoutes.js';
import { getTenantPool } from './db/tenantPool.js';
import { toUtcIso } from './lib/time.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

// Determine environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1); // trust first proxy (Render)

// CORS configuration for both development and production
const developmentOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CORS_ORIGIN
].filter(Boolean);

const productionOrigins = [
  // Render app domain
  'https://mobius-t071.onrender.com',
  // Custom domains
  'https://mobiusteach.com',
  'https://www.mobiusteach.com',
  process.env.CORS_ORIGIN
].filter(Boolean);

const allowedOrigins = isDevelopment ? developmentOrigins : productionOrigins;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests like server-side health checks or direct browser hits (no Origin header)
    if (!origin) return callback(null, true);

    // Fast path: exact match
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Fallback: allow subdomains for custom domain if needed
    try {
      const hostname = new URL(origin).hostname;
      const allowedHostnames = ['mobiusteach.com'];
      if (allowedHostnames.some(h => hostname === h || hostname.endsWith(`.${h}`))) {
        return callback(null, true);
      }
    } catch (_) {
      // If URL parsing fails, reject below
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // Only use secure cookies in production
      sameSite: 'lax'
    }
  })
);

// Attach tenant pool to every request BEFORE all /api routes
app.use(async (req, _res, next) => {
  if (!req.session?.tenantCode) return next();    // public routes
  req.db = await getTenantPool(req.session.tenantCode);
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    req.session.save(err => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).send('Session error');
      }
      res.sendStatus(200);
    });
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
app.use('/api/classes', classRoutes);           // schema-v2 domain (spec 03) — Phase 7.1
app.use('/api/sessions', sessionRoutes);        // schema-v2 domain (spec 04/06/07) — Phase 7.2/7.3
app.use('/api/wallets', walletRoutes);          // schema-v2 domain (spec 04) — Phase 7.2
app.use('/api/reschedule-requests', rescheduleRoutes);   // schema-v2 domain (spec 07) — Phase 7.3
app.use('/api/instructors', instructorCalendarRoutes);   // v2 open-slots read (spec 03/07) — coexists with the legacy router below
app.use('/api/class-sessions', classSessionRoutes);  // legacy v1 model — replaced by Phase 7.x slices
app.use('/api/class-series', classSeriesRoutes);     // legacy v1 model — replaced by Phase 7.x slices
app.use('/api/subjects', subjectRoutes);
app.use('/api/subject-groups', subjectGroupsRouter);
app.use('/api/staff', staffRoutes);
app.use('/api/attendance', attendanceRoutes);     // legacy v1 model (dropped tables) — superseded by /api/sessions (Phase 7.2)
app.use('/api/time-packages', timePackageRoutes); // legacy v1 model (dropped tables) — superseded by wallets/credit_ledger (Phase 7.2)
app.use('/api/payments', paymentRoutes);          // partially legacy: credits/packages halves hit dropped v1 tables (→ /api/wallets)
app.use('/api/upload', uploadRoutes);
app.use('/api/register-institution', registerInstitutionRouter);

// Serve React static build
app.use(express.static(path.join(__dirname, '..', '..', 'client', 'dist')));

// Catch-all route for React Router
app.get('*', (_, res) =>
  res.sendFile(path.join(__dirname, '..', '..', 'client', 'dist', 'index.html'))
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

export default app;
