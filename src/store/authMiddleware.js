// Middleware to persist auth state to localStorage
export const authMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type?.startsWith("auth/")) {
    const authState = store.getState().auth;
    localStorage.setItem("authState", JSON.stringify(authState));
  }

  return result;
};
