// Express app wiring, extracted from index.js so tests can import the app
// without binding a port. index.js remains the runtime entrypoint.
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

// Import all routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import guardianRoutes from './routes/guardianRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import subjectGroupsRouter from './routes/subjectGroups.js';
import staffRoutes from './routes/staffRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import registerInstitutionRouter from './routes/registerInstitution.js';
import classRoutes from './routes/classRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import rescheduleRoutes from './routes/rescheduleRoutes.js';
import instructorCalendarRoutes from './routes/instructorCalendarRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import guardianPortalRoutes from './routes/guardianPortalRoutes.js';
import studentGuardianV2Routes from './routes/studentGuardianV2Routes.js';
import reportRoutes from './routes/reportRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { getTenantPool } from './db/tenantPool.js';
import { HttpError } from './helpers/httpError.js';
import { DateTime } from 'luxon';

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
  // D7: no cookies — the JWT is the single credential, so no CORS credentials
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Institution-Code']
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Tenant resolution (MODERNIZATION D7) — BEFORE all /api routes. The JWT is
// the single credential: a verified Bearer token's tenantCode claim resolves
// req.db. Pre-auth tenant-scoped requests (login/register) instead send the
// X-Institution-Code header (or body.code). Any failure leaves req.db
// undefined — login's 400 guard / authenticateToken's 401 handle it.
app.use(async (req, _res, next) => {
  try {
    const bearer = req.headers['authorization']?.split(' ')[1];
    if (bearer) {
      try {
        const decoded = jwt.verify(bearer, process.env.JWT_SECRET);
        if (decoded.tenantCode) {
          req.tenantCode = decoded.tenantCode;
          req.db = await getTenantPool(decoded.tenantCode);
          return next();
        }
      } catch {
        // invalid/expired token: fall through — authenticateToken 401s later
      }
    }
    const code = req.headers['x-institution-code'] || req.body?.code;
    if (code) {
      req.db = await getTenantPool(code);
      req.tenantCode = code;
    }
  } catch {
    // unknown institution: req.db stays undefined
  }
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${DateTime.utc().toISO()} - ${req.method} ${req.url}`);
    if (req.method !== 'GET') {
        console.log('Request body:', req.body);
    }
    next();
});

// Institution code validation (D7: stateless — the login UI checks the code
// exists; the tenant itself travels in the X-Institution-Code header and,
// after login, inside the JWT)
app.post('/api/institution', async (req, res) => {
  try {
    await getTenantPool(req.body.code);           // throws if invalid
    res.sendStatus(200);
  } catch {
    res.status(404).send('Invalid institution code');
  }
});

// Route middlewares
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentGuardianV2Routes); // schema-v2 guardian links + purchasing (spec 05) — Phase 7.4
app.use('/api/students', studentRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/guardians', guardianPortalRoutes);   // schema-v2 guardian portal (spec 05) — Phase 7.4
app.use('/api/guardians', guardianRoutes);         // legacy v1 model (guardian contact-blob columns) — superseded by Phase 7.4
app.use('/api/classes', classRoutes);           // schema-v2 domain (spec 03) — Phase 7.1
app.use('/api/sessions', sessionRoutes);        // schema-v2 domain (spec 04/06/07) — Phase 7.2/7.3
app.use('/api/wallets', walletRoutes);          // schema-v2 domain (spec 04) — Phase 7.2
app.use('/api/reschedule-requests', rescheduleRoutes);   // schema-v2 domain (spec 07) — Phase 7.3
app.use('/api/bookings', bookingRoutes);                 // schema-v2 domain (spec 03 SCH-4) — self-serve 1:1 booking
app.use('/api/reports', reportRoutes);                   // staff reports (spec 06 ACA-3 / 08 signals) — Phase 7.5
app.use('/api/rooms', roomRoutes);                       // room directory — the rooms table predates this API
app.use('/api/payroll', payrollRoutes);                  // payroll/time_logs predate this API too
app.use('/api/payments', paymentRoutes);                 // payments/payment_methods predate this API too
app.use('/api/invoices', invoiceRoutes);                 // invoices/invoice_payments predate this API too
app.use('/api/messages', messageRoutes);                 // real two-way messaging — new schema, no v1 precedent
app.use('/api/instructors', instructorCalendarRoutes);   // v2 open-slots read (spec 03/07)
app.use('/api/subjects', subjectRoutes);
app.use('/api/subject-groups', subjectGroupsRouter);
app.use('/api/staff', staffRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/register-institution', registerInstitutionRouter);

// Serve React static build
app.use(express.static(path.join(__dirname, '..', '..', 'client', 'dist')));

// Catch-all route for React Router
app.get('*', (_, res) =>
  res.sendFile(path.join(__dirname, '..', '..', 'client', 'dist', 'index.html'))
);

// Error handling middleware. HttpError (MODERNIZATION 4.3) renders with its
// own status/body; everything else is a 500.
app.use((err, req, res, next) => {
    if (err instanceof HttpError) {
        return res.status(err.status).json(err.body);
    }
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
