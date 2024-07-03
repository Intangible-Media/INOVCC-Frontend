// contexts/LoadingContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import useBodyClass from "../hooks/useBodyClass";
import { requestWakeLock, releaseWakeLock } from "../utils/wakeLock";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showReminder, setShowReminder] = useState(false); // New state for reminder message

  useBodyClass("overflow-hidden", loading || success || error);

  useEffect(() => {
    let reminderTimeout;

    if (loading) {
      // Activate wake lock
      requestWakeLock();

      // Set timeout to show the reminder message after 10 seconds
      reminderTimeout = setTimeout(() => {
        setShowReminder(true);
      }, 1000);
    } else {
      // Deactivate wake lock and clear timeout when not loading
      releaseWakeLock();
      clearTimeout(reminderTimeout);
      setShowReminder(false);
    }

    // Cleanup function to clear timeout on unmount or loading state change
    return () => {
      releaseWakeLock();
      clearTimeout(reminderTimeout);
    };
  }, [loading]);

  const showLoading = (msg) => {
    setLoading(true);
    setMessage(msg);
  };

  const showSuccess = (msg) => {
    setSuccess(true);
    setSuccessMessage(msg);
    setLoading(false);
    setTimeout(() => {
      resetLoading();
    }, 3000); // Duration for showing the success message
  };

  const showError = (msg) => {
    setError(true);
    setErrorMessage(msg);
    setLoading(false);
    setTimeout(() => {
      resetLoading();
    }, 3000); // Duration for showing the error message
  };

  const resetLoading = () => {
    setLoading(false);
    setSuccess(false);
    setError(false);
    setMessage("");
    setSuccessMessage("");
    setErrorMessage("");
    setShowReminder(false); // Reset reminder message
  };

  return (
    <LoadingContext.Provider
      value={{
        loading,
        message,
        success,
        successMessage,
        error,
        errorMessage,
        showLoading,
        showSuccess,
        showError,
        resetLoading,
        showReminder, // Provide reminder state
      }}
    >
      {children}
      {loading && showReminder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
          Don't worry we haven't forgotten about you!
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
