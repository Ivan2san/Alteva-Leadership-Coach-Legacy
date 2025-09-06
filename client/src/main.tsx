import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Enable MSW in development with error handling
if (import.meta.env.DEV) {
  import("./mocks/browser")
    .then(({ worker }) => {
      return worker.start({ 
        onUnhandledRequest: "bypass",
        serviceWorker: {
          url: "/mockServiceWorker.js"
        }
      });
    })
    .then(() => {
      console.log("MSW service worker started successfully");
    })
    .catch((error) => {
      console.warn("MSW service worker failed to start:", error);
      // Continue without MSW - app should still work
    });
}

// Load Web Vitals in production
if (import.meta.env.PROD) {
  import("./vitals");
}

createRoot(document.getElementById("root")!).render(<App />);
