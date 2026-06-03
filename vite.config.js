import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isMobileBuild = process.env.CAPACITOR_BUILD === 'true';
const pagesBasePath = process.env.NODE_ENV === 'production'
  ? `/${repositoryName || 'StudentElectionVotingSystem'}/`
  : '/';

// Capacitor WebView requires relative asset paths, while GitHub Pages needs repo-prefixed paths.
const appBasePath = isMobileBuild ? './' : pagesBasePath;

export default defineConfig({
  base: appBasePath,
  plugins: [
    react({
      include: /\.[jt]sx?$/
    })
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    globals: true
  }
});
