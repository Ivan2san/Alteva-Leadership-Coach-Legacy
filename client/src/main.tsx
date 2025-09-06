import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Enable MSW in development
if (import.meta.env.DEV) {
  const { worker } = await import("./mocks/browser");
  worker.start({ onUnhandledRequest: "bypass" });
}

// Load Web Vitals in production
if (import.meta.env.PROD) {
  import("./vitals");
}

createRoot(document.getElementById("root")!).render(<App />);
