"use client";

// context/SelectedStructureContext.js
import { createContext, useState, useContext, useEffect } from "react";

// Create the context
export const SelectedStructureContext = createContext();

// Create a provider component
export function SelectedStructureProvider({ children }) {
  const [selectedStructure, setSelectedStructure] = useState(null);

  return (
    <SelectedStructureContext.Provider
      value={{ selectedStructure, setSelectedStructure }}
    >
      {children}
    </SelectedStructureContext.Provider>
  );
}

// Custom hook for using the context
export function useSelectedStructure() {
  const context = useContext(SelectedStructureContext);
  if (!context) {
    throw new Error(
      "useSelectedStructure must be used within a SelectedStructureProvider"
    );
  }
  return context;
}
