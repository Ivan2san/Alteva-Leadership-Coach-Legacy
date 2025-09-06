import { http, HttpResponse, passthrough } from "msw";

// Mock chat only when explicitly enabled (default: real API)
const MOCK_CHAT = import.meta.env.VITE_MOCK_CHAT === "true";

export const handlers = [
  http.get("/api/profile", () => HttpResponse.json({ name: "Test User" })),

  // Chat: passthrough unless MOCK_CHAT=true, or header asks to bypass
  ...(MOCK_CHAT ? [
    http.post("/api/chat", async ({ request }) => {
      const bypass = request.headers.get("x-msw-bypass") === "true";
      if (bypass) return passthrough();
      return HttpResponse.json({ message: "This is a test response from the coaching AI." });
    })
  ] : []),

  http.get("/api/conversations", () => HttpResponse.json([])),
  http.get("/api/auth/me", () => HttpResponse.json({ user: null }))
];