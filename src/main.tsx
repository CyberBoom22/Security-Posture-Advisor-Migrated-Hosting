import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Application entry point. Vite injects this module into index.html, and the
// index.css import is what causes the stylesheet to be emitted as a separate
// fingerprinted asset rather than inlined.
//
// The #root element is asserted non-null because it is hard-coded in
// index.html; if it were ever removed the app should fail loudly here rather
// than silently render nothing.
//
// StrictMode double-invokes effects and renders in development only, which
// surfaces impure render logic early. It has no effect on the production build.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
