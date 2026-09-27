import { useState } from "react";
import { Form } from "react-bootstrap";
import { THEMES, readStoredTheme, setTheme } from "./theme.js";

const LABELS = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

/**
 * System / light / dark select. Off by default in apps that do not render it;
 * workout (and optionally finance) place it in AppShell `headerActions`.
 */
export default function ThemeToggle({ className = "theme-select w-auto" }) {
  const [theme, setThemeState] = useState(readStoredTheme);

  function onChange(event) {
    setThemeState(setTheme(event.target.value));
  }

  return (
    <Form.Select
      className={className}
      size="sm"
      value={theme}
      onChange={onChange}
      aria-label="Theme"
    >
      {THEMES.map((value) => (
        <option key={value} value={value}>
          {LABELS[value]}
        </option>
      ))}
    </Form.Select>
  );
}
