// Application parameters - No Base44!
export const appParams = {
  appId: import.meta.env.VITE_APP_ID || 'applyease',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  appName: import.meta.env.VITE_APP_NAME || 'Applyease',
  appBaseUrl: import.meta.env.VITE_APP_BASE_URL || window.location.origin,
};

export default appParams;
