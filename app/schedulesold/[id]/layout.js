"use client";
import { SelectedStructureProvider } from "../../../context/SelectedStructureContext";

export default function Layout({ children }) {
  return (
    <SelectedStructureProvider>
      {/* Your layout components */}
      {children}
    </SelectedStructureProvider>
  );
}
