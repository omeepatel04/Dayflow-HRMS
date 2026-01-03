/**
 * Unified API configuration
 * Re-export the canonical endpoints so any legacy imports stay correct.
 */
import BASE_URL, { API_ENDPOINTS as CANONICAL_ENDPOINTS } from "./apiEndpoints";

export const API_BASE_URL = BASE_URL;
export const API_ENDPOINTS = CANONICAL_ENDPOINTS;

export default API_BASE_URL;
