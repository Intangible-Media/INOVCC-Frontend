// components/ProtectedContent.js
import { useSession } from "next-auth/react";

const ProtectedContent = ({ requiredRoles, children }) => {
  const { data: session, status } = useSession();

  // Determine if we are still waiting for session data to load
  const isLoading = status === "loading";

  // Assuming session includes a 'user' object that has a 'role' property
  const userRole = session?.user?.role?.name; // Adjust based on your session structure

  // Determine if the user's role matches any of the required roles
  const hasPermission = requiredRoles.some((role) => role === userRole);

  if (isLoading) {
    return <p>Loading...</p>; // Or any other loading state
  }

  if (!hasPermission) {
    return null;
  }

  return <>{children}</>; // Render children if authorization check passes
};

export default ProtectedContent;
