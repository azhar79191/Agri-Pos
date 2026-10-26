const TOKEN_KEY = "token";
const USER_KEY = "user";

export const readAuthToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
};

export const writeAuthToken = (token) => {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage failures; they are non-fatal to app UX.
  }
};

export const clearAuthToken = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage failures; they are non-fatal to app UX.
  }
};

export const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const writeStoredUser = (user) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Ignore storage failures; they are non-fatal to app UX.
  }
};

export const clearStoredUser = () => {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // Ignore storage failures; they are non-fatal to app UX.
  }
};
