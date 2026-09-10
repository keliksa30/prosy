import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true, // Bind to all interfaces (0.0.0.0) so phone can access via LAN IP
    port: 5173,
    strictPort: true,
    hmr: {
      // Prevent aggressive client reload loops on mobile devices
      overlay: false
    }
  }
});
