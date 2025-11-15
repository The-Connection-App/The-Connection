/**
 * Platform-specific environment adapter for Vite/React web.
 * Maps to 'shared-env' in tsconfig path resolution.
 */
export const API_BASE = import.meta.env.VITE_API_BASE || '';
