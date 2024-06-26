// contexts/LoadingContext.js
import React, { createContext, useState, useContext } from "react";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const showLoading = (msg = "Loading...") => {
    setMessage(msg);
    setLoading(true);
    setSuccess(false);
  };

  const hideLoading = () => {
    setLoading(false);
  };

  const showSuccess = (msg = "Operation Successful!") => {
    setSuccessMessage(msg);
    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      setSuccess(false);
    }, 3000); // Duration for showing the success message
  };

  return (
    <LoadingContext.Provider
      value={{
        loading,
        message,
        success,
        successMessage,
        showLoading,
        hideLoading,
        showSuccess,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
