import React from 'react';

/**
 * Stands in for DispatchView in a public build.
 *
 * vite.config.ts aliases the "@dispatch" specifier to this file unless
 * VITE_DISPATCH=true, so the real Dispatch view — and, more to the point,
 * src/changelog.ts with the audit trail and findings inside it — is never
 * reached by the bundler and never reaches a visitor's browser. Hiding the tab
 * alone would not do that: anything imported still ships in the JavaScript,
 * where anyone can read it.
 */
export const DispatchView: React.FC = () => null;
