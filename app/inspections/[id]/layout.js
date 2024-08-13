"use client";

import { InspectionProvider } from "../../../context/InspectionContext";
import { SelectedStructureProvider } from "../../../context/SelectedStructureContext";

export default function Layout({ children }) {
  return (
    <div>
      <InspectionProvider>
        <SelectedStructureProvider>{children}</SelectedStructureProvider>
      </InspectionProvider>
    </div>
  );
}
