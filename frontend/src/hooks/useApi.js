import { useState, useRef } from 'react';
import apiClient from '../utils/api.js';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestRef = useRef(null);

  if (!requestRef.current) {
    requestRef.current = async (method, url, data = null) => {
      setLoading(true);
      setError(null);
      try {
        const config = { method, url };
        if (data) config.data = data;
        const response = await apiClient(config);
        return response.data;
      } catch (err) {
        const errorMessage = err.response?.data?.error?.message || err.message || 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    };
  }

  return { request: requestRef.current, loading, error };
}
