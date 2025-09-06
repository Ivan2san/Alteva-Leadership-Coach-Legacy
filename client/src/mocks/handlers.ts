import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/profile", () => HttpResponse.json({ name: "Test User" })),
  http.post("/api/chat", () => 
    HttpResponse.json({ message: "This is a test response from the coaching AI." })
  ),
  http.get("/api/conversations", () => 
    HttpResponse.json([])
  ),
  http.get("/api/auth/me", () => 
    HttpResponse.json({ user: null })
  )
];