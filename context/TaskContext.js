"use client";

import { createContext, useContext, useState } from "react";

// Create the context
const TaskContext = createContext();

// Custom hook to use the TaskContext
export const useTaskContext = () => {
  return useContext(TaskContext);
};

// Context provider component
export const TaskProvider = ({ children }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const value = {
    selectedTask,
    setSelectedTask,
    openModal,
    setOpenModal,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
