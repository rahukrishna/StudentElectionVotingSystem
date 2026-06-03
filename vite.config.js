import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const pagesBasePath = process.env.NODE_ENV === 'production'
  ? `/${repositoryName || 'StudentElectionVotingSystest'}/`
  : '/';

export default defineConfig({
  base: pagesBasePath,
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
