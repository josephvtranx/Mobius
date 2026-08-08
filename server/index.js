// Build: `npm install && npm run build`
// Start: `npm start`
// App wiring lives in src/app.js (exported for tests); this file boots it.

import dotenv from 'dotenv';
dotenv.config();

// Fail fast at boot if required config is missing, rather than limping
// along and throwing confusing errors on the first request that needs it.
// JWT_SECRET: every token verify/sign; REGISTRY_URL: the institutions
// lookup that resolves every tenant. RESEND_API_KEY is intentionally NOT
// required — email is best-effort and the send path already no-ops when
// it's empty (tests rely on that).
const REQUIRED_ENV = ['JWT_SECRET', 'REGISTRY_URL'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`❌ Missing required environment variable(s): ${missing.join(', ')}. Refusing to start.`);
  process.exit(1);
}

import app from './src/app.js';
import { registryPool } from './src/db/registryPool.js';
import { getTenantPool } from './src/db/tenantPool.js';
import { startScheduler } from './src/jobs/scheduler.js';

// ✅ show a one-line success or error at boot for registry DB
registryPool.connect()
  .then(() => console.log('✅ Connected to Registry DB'))
  .catch(err  => console.error('❌ Registry DB connect error', err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

    // multi-tenant background jobs (spec 08) — runtime only, never in tests
    if (process.env.NODE_ENV !== 'test' && process.env.JOBS_DISABLED !== '1') {
        startScheduler({ registryPool, getTenantPool });
    }
});
