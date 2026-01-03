import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for API calls with loading, error, and data states
 * @param {Function} apiFunc - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, refetch, execute }
 */
export const useApiCall = (apiFunc, options = {}) => {
  const {
    immediate = false, // Whether to execute immediately on mount
    onSuccess = null, // Success callback
    onError = null, // Error callback
    initialData = null, // Initial data value
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFunc(...args);
        setData(response);

        if (onSuccess) {
          onSuccess(response);
        }

        return { success: true, data: response };
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "An error occurred";

        setError(errorMessage);

        if (onError) {
          onError(err);
        }

        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [apiFunc, onSuccess, onError]
  );

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    setData, // Allow manual data updates
  };
};

export default useApiCall;
