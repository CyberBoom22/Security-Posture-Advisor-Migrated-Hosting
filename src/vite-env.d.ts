/// <reference types="vite/client" />

/**
 * Replaced at build time by vite.config.ts. True only when VITE_DISPATCH=true,
 * which is how the internal Dispatch tab is included for local use.
 */
declare const __SHOW_DISPATCH__: boolean;

declare module '@dispatch' {
  export const DispatchView: React.FC;
}
