import { API_BASE_URL } from '../config/apiConfig';

let keepAliveInterval = null;

// Ping the backend every 5 minutes to prevent cold starts
export const startKeepAlive = () => {
  if (keepAliveInterval) return; // Already running

  const pingBackend = async () => {
    try {
      await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      console.log('🏓 Keep-alive ping sent');
    } catch (error) {
      // Silently fail - this is just a keep-alive
    }
  };

  // Ping immediately on start
  pingBackend();

  // Then ping every 5 minutes (300000ms)
  keepAliveInterval = setInterval(pingBackend, 300000);
};

export const stopKeepAlive = () => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
};
