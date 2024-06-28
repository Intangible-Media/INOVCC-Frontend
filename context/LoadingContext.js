// contexts/LoadingContext.js
import React, { createContext, useState, useContext } from "react";
import useBodyClass from "../hooks/useBodyClass";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useBodyClass("overflow-hidden", loading || success || error);

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
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
