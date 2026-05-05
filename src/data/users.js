import { ROLES, ROLE_PERMISSIONS, PERMISSION_MAP } from "../constants/roles";

// Re-export so existing imports of `roles` from this file keep working
export const roles = ROLES;
export const users = [];

/**
 * hasPermission — fully backend-driven.
 *
 * 1. Admin always has full access.
 * 2. If user.permissions array is set (from backend), use it.
 * 3. Otherwise fall back to role defaults.
 * 4. Maps old short-form keys (e.g. "pos") to backend keys (e.g. "pos:view").
 */
export const hasPermission = (user, permission) => {
  if (!user) return false;

  const rawRole = typeof user.role === "object" ? user.role?.name : user.role;
  const role = (rawRole || "").toLowerCase();

  if (role === "admin") return true;

  const effectiveKey = PERMISSION_MAP[permission] || permission;

  const stored =
    Array.isArray(user.permissions) && user.permissions.length > 0
      ? user.permissions
      : ROLE_PERMISSIONS[role] || [];

  return stored.some(
    (p) =>
      p === effectiveKey ||
      p === permission ||
      p.startsWith(permission + ":") ||
      p.startsWith(effectiveKey + ":")
  );
};
