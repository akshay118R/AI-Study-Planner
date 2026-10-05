/**
 * Central Configuration for Local Ollama and Gemma Model Integration
 * Single Source of Truth for local AI inference across the application.
 */

export const OLLAMA_CONFIG = {
  // Default base URL for local Ollama instance (loopback only)
  defaultBaseUrl: 'http://127.0.0.1:11434',

  // Required Gemma model tag
  defaultModel: 'gemma4:2b',

  // Supported GitHub Pages origin for CORS configuration
  githubPagesOrigin: 'https://akshay118r.github.io',

  // Fallback acceptable model aliases if user has a similar gemma installed
  compatibleModelPrefixes: ['gemma4:2b', 'gemma4:e2b', 'gemma4', 'gemma:2b', 'gemma2:2b', 'gemma2:9b'],

  // Connection and health check timeout (5 seconds)
  healthTimeoutMs: 5000,

  // Generation timeout (3 minutes for local LLM inference)
  generationTimeoutMs: 180000,

  // Generation temperature (lower = more deterministic structured JSON)
  temperature: 0.2,

  // Context window size allocated for Ollama
  contextWindow: 8192,

  // Max retry count for network checks
  maxRetries: 2
};
