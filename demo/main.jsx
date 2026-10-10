import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { configureTheme, initTheme } from "@danifo/ui";
import App from "./App.jsx";
import "./theme.scss";

export const THEME_STORAGE_KEY = "danifo-ui-demo:theme";

// Before the first paint, like an app's entry file.
configureTheme({ storageKey: THEME_STORAGE_KEY });
initTheme();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
