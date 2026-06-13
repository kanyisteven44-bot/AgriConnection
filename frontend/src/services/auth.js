import API from "./api";

export const isLoggedIn = () => {
  const token = localStorage.getItem("token");
  // Basic check: just presence of token. For more robust check,
  // you might want to decode the token and check its expiry.
  return !!token;
};

export const logout = () => {
  localStorage.removeItem("token");
  // Optionally, you might want to clear any user-specific state here
  // and redirect to login page.
  window.location.href = "/login"; // Force reload and redirect
};