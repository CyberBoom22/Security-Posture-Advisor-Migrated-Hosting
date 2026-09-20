import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // The Dispatch tab is the internal audit trail: what prices moved, what we
  // got wrong, what we concluded. It is not for visitors.
  //
  // Hiding the tab would not be enough. A statically imported module ships in
  // the bundle whether or not anything renders it, so src/changelog.ts would be
  // sitting in the JavaScript for anyone who opened devtools. Instead the
  // "@dispatch" specifier is aliased to a stub that renders nothing, and the
  // real view and its data are never reached by the bundler at all.
  //
  //   npm run dev        public build, no Dispatch
  //   npm run dev:admin  Dispatch included, for local use
  const showDispatch = process.env.VITE_DISPATCH === 'true';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      __SHOW_DISPATCH__: JSON.stringify(showDispatch),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@dispatch': path.resolve(
          __dirname,
          showDispatch
            ? 'src/components/DispatchView.tsx'
            : 'src/components/DispatchView.stub.tsx'
        ),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
