export const env = {
  apiMode: import.meta.env.VITE_API_MODE || 'mock',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1',
}
