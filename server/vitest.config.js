import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // each test file boots its own PGlite sockets + imports the app with its own
    // env; keep files sequential so ports/env never race
    fileParallelism: false,
    hookTimeout: 60000,
    testTimeout: 30000,
    // Known teardown artifact: pg's Terminate handshake races the pglite-socket
    // wire shim and can emit a stray commandComplete after all tests pass
    // (see testEnv.stop()). Swallow exactly that error — anything else unhandled
    // still fails the run.
    onUnhandledError(err) {
      if (err?.message?.includes('Received unexpected commandComplete message')) return false;
    }
  }
});
