import { InspectionProvider } from "../../../context/InspectionContext";

export default function Layout({ children }) {
  return (
    <div>
      <InspectionProvider>
        <h1>Inspection Layout</h1>
        {children}
      </InspectionProvider>
    </div>
  );
}
