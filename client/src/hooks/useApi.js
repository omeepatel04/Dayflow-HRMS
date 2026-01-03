import { useState } from 'react';

/**
 * Custom hook for handling API calls with loading and error states
 * @param {Function} apiFunction - The API function to call
 * @returns {Object} { data, loading, error, execute }
 */
export const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};
