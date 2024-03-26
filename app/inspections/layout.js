import { InspectionProvider } from "../../context/InspectionContext";

export default function Layout({ children }) {
  return (
    <div>
      <InspectionProvider>{children}</InspectionProvider>
    </div>
  );
}
