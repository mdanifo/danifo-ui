// Install the packed tarball the way an app would and use it: the ESM entry
// resolves against the peer dependencies (this is the class of bug fixed in
// v0.2.1), and the SCSS base compiles through the package's own path with the
// app's accent. Run after `npm run build`.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const app = mkdtempSync(join(tmpdir(), "danifo-ui-consumer-"));
const run = (file, args, options = {}) =>
  execFileSync(file, args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], ...options });

try {
  // npm runs `prepare` for a pack and its log precedes the JSON on stdout.
  const packed = run("npm", ["pack", "--json", "--pack-destination", app], { cwd: repo });
  const [{ filename }] = JSON.parse(packed.slice(packed.lastIndexOf("\n[") + 1));

  const modules = join(app, "node_modules");
  mkdirSync(join(modules, "@danifo"), { recursive: true });
  run("tar", ["-xzf", join(app, filename), "-C", join(modules, "@danifo")]);
  renameSync(join(modules, "@danifo", "package"), join(modules, "@danifo", "ui"));
  for (const peer of ["react", "react-dom", "react-bootstrap", "bootstrap"]) {
    symlinkSync(join(repo, "node_modules", peer), join(modules, peer), "dir");
  }
  writeFileSync(join(app, "package.json"), JSON.stringify({ name: "consumer", private: true, type: "module" }));

  writeFileSync(
    join(app, "app.mjs"),
    `import * as ui from "@danifo/ui";
import pkg from "@danifo/ui/package.json" with { type: "json" };
if (typeof ui.AppShell !== "function" || typeof ui.usd !== "function") {
  throw new Error("the entry did not export the library");
}
console.log(\`imported \${pkg.name}@\${pkg.version}: \${Object.keys(ui).length} exports; usd(1234.5) = \${ui.usd(1234.5)}\`);
`,
  );
  run(process.execPath, ["app.mjs"], { cwd: app, stdio: "inherit" });

  writeFileSync(join(app, "theme.scss"), '$primary: #1c7c54;\n@import "@danifo/ui/scss/base";\n');
  const css = run(
    process.execPath,
    [
      join(repo, "node_modules", "sass", "sass.js"),
      "theme.scss",
      "--load-path=node_modules",
      "--quiet-deps",
      "--silence-deprecation=import",
      "--no-source-map",
    ],
    { cwd: app },
  );
  if (!css.includes("--bs-primary: #1c7c54") || !css.includes(".dui-tabbar")) {
    throw new Error("the compiled theme is missing the app's accent or the shell rules");
  }
  console.log(`compiled theme.scss through the package: ${Math.round(css.length / 1024)} kB of CSS, accent and shell rules present`);
} finally {
  rmSync(app, { recursive: true, force: true });
}
