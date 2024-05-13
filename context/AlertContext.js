import React, { createContext, useContext, useState } from "react";
import { Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";

const AlertContext = createContext();

export function useAlert() {
  return useContext(AlertContext);
}

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({ open: false, message: "", type: "" });

  /**
   * Displays an alert message.
   *
   * @param {string} message - The message to display in the alert.
   * @param {string} [type="info"] - The type of the alert. Defaults to "info".
   * @param {number} [duration=3000] - The duration in milliseconds for which the alert should be displayed. Defaults to 3000.
   * @param {Function} [callback=null] - An optional callback function to be executed after the alert is displayed.
   */

  const showAlert = (
    message,
    type = "info",
    duration = 3000,
    callback = null
  ) => {
    setAlert({ open: true, message, type });
    setTimeout(() => {
      setAlert((prevState) => ({ ...prevState, open: false }));
    }, duration);
    if (callback) {
      setTimeout(() => {
        callback();
      }, duration);
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert.open && (
        <Alert
          color={alert.type === "success" ? "success" : "failure"}
          icon={HiInformationCircle}
          className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50 shadow-lg"
        >
          <span className="font-medium">{alert.message}</span>
        </Alert>
      )}
    </AlertContext.Provider>
  );
};
