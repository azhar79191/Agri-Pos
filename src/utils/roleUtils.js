/**
 * getRoleName — safely extracts the role name from a user object.
 * The backend sometimes returns role as a string ("admin") and
 * sometimes as an object ({ name: "admin", ... }).
 */
export const getRoleName = (user) => {
  const role = user?.role;
  return (typeof role === "object" ? role?.name : role) || "";
};

export const isAdminOrManager = (user) => {
  const r = getRoleName(user);
  return r === "admin" || r === "manager";
};

export const isAdmin = (user) => getRoleName(user) === "admin";
