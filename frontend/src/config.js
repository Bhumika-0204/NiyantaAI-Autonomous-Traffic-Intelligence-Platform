// Centralized configuration helper for dynamic API and WebSocket endpoint resolution.

export const getApiUrl = (path = '') => {
  let base = import.meta.env.VITE_API_URL;
  if (!base) {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname || '127.0.0.1';
    const port = window.location.port;
    if (port === '' || port === '80' || port === '443') {
      base = `${protocol}//${window.location.host}/api/v1`;
    } else {
      base = `${protocol}//${hostname}:8000/api/v1`;
    }
  }
  if (path) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return base.endsWith('/api/v1') ? base + cleanPath.replace('/api/v1', '') : base + cleanPath;
  }
  return base;
};

export const API_BASE_URL = getApiUrl();

export const getWsUrl = (path = '') => {
  const isSecure = window.location.protocol === 'https:';
  const wsProto = isSecure ? 'wss:' : 'ws:';
  
  if (import.meta.env.VITE_API_URL) {
    const base = import.meta.env.VITE_API_URL;
    if (base.startsWith('http')) {
      return base.replace(/^https?:/, wsProto).replace('/api/v1', '') + path;
    }
    // Relative VITE_API_URL like '/api/v1'
    return `${wsProto}//${window.location.host}${path}`;
  }
  
  const hostname = window.location.hostname || '127.0.0.1';
  const port = window.location.port;
  if (port === '' || port === '80' || port === '443') {
    return `${wsProto}//${window.location.host}${path}`;
  }
  return `${wsProto}//${hostname}:8000${path}`;
};


