/**
 * API utility for mobile app
 * All calls go to the web backend via /api/* routes
 * The fetch is automatically intercepted by src/__create/fetch.ts
 * to add proper headers and route to the right server.
 */

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || "";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      let errorMsg = `Request failed: ${res.status}`;
      try {
        const data = await res.json();
        errorMsg = data.error || data.message || errorMsg;
      } catch {}
      throw new ApiError(errorMsg, res.status);
    }

    const text = await res.text();
    if (!text) return {};
    return JSON.parse(text);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || "Network error", 0);
  }
}

export const api = {
  get: (path, params) => {
    const query = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    return request(`${path}${query}`);
  },
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) =>
    request(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body) =>
    request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export default api;
