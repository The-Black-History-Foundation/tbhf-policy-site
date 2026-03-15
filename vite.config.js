import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const aiUrl = env.VITE_AI_AGENT_URL || 'https://draftpolicysummary-oukor3pbiq-uc.a.run.app';

  return {
  root: '.',
  publicDir: 'public',
  server: {
    proxy: {
      '/api/ai-draft': {
        target: aiUrl,
        changeOrigin: true,
        rewrite: () => '/',
      },
      '/api/federal-register': {
        target: 'https://www.federalregister.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/federal-register/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        policies: resolve(__dirname, 'policies.html'),
        policy: resolve(__dirname, 'policy.html'),
        admin: resolve(__dirname, 'admin.html'),
        'donate-bitcoin': resolve(__dirname, 'donate-bitcoin.html'),
      },
    },
  },
};
});
