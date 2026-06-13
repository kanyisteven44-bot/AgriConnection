/**
 * Standardizes error responses from API services.
 * @param {Error} error - The error object caught from an API call.
 * @returns {Error} A standardized error object with message and status.
 */
export const handleServiceError = (error) => {
  let message = "An unexpected error occurred. Please try again.";
  let status = null;

  if (error.response) {
    // Server responded with a status code outside the 2xx range
    message = error.response.data?.message || `Request failed with status ${error.response.status}`;
    status = error.response.status;
  } else if (error.request) {
    // Request was made but no response was received (e.g., network timeout)
    message = "Network error: Unable to reach the server. Please check your connection.";
  }

  const standardizedError = new Error(message);
  standardizedError.status = status;
  return standardizedError;
};