"use client";

import { SelectedStructureProvider } from "../../../context/SelectedStructureContext";

export default function Layout({ children }) {
  return (
    <div>
      <SelectedStructureProvider>{children}</SelectedStructureProvider>
    </div>
  );
}
