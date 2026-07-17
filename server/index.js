// Build: `npm install && npm run build`
// Start: `npm start`
// App wiring lives in src/app.js (exported for tests); this file boots it.

import dotenv from 'dotenv';
dotenv.config();

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
