/**
 * Centralized API configuration for EcoSense.
 * Uses environment variable in production, never hardcodes localhost.
 */
const API_BASE = import.meta.env.VITE_API_URL || '';

export const apiUrl = (path) => `${API_BASE}${path}`;
