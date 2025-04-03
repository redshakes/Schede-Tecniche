import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initPrimeReact } from "./lib/prime-react";

// Initialize PrimeReact styles
initPrimeReact();

createRoot(document.getElementById("root")!).render(<App />);
