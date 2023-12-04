const AuthorizedWrapper = ({ authorization, userRole, children }) => {
  const getUserAuthorizationLevel = (userRole) => {
    switch (userRole) {
      case "Admin":
        return 4; // Highest level

      case "Qualified Electrical Worker":
        return 3;

      case "Field Worker":
        return 2;

      case "Client":
        return 1; // Lowest level

      default:
        return 0; // No role or unrecognized role
    }
  };

  // Check if the user role meets or exceeds the required authorization
  const hasAuthorization = getUserAuthorizationLevel() >= authorization;

  return <>{hasAuthorization ? children : null}</>;
};

export default AuthorizedWrapper;
