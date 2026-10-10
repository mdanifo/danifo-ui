// What `npm pack` would ship: the build, the SCSS, and nothing from the source
// tree, tests, or demo. Run after `npm run build`.
import { execFileSync } from "node:child_process";

// npm runs `prepare` for a pack even with --ignore-scripts, and the build's log
// lands on stdout ahead of the JSON: parse from the array on.
const stdout = execFileSync("npm", ["pack", "--dry-run", "--json"], { encoding: "utf8" });
const [pack] = JSON.parse(stdout.slice(stdout.lastIndexOf("\n[") + 1));
const paths = pack.files.map((f) => f.path).sort();

const required = ["dist/index.js", "dist/index.js.map", "scss/_base.scss", "scss/_shell.scss", "package.json", "README.md"];
const forbidden = /^(src|demo|e2e|scripts|docs|coverage|node_modules)\//;

const missing = required.filter((p) => !paths.includes(p));
const leaked = paths.filter((p) => forbidden.test(p));

console.log(`${pack.name}@${pack.version}: ${paths.length} files, ${(pack.unpackedSize / 1024).toFixed(1)} kB unpacked`);
for (const p of paths) console.log(`  ${p}`);

if (missing.length || leaked.length) {
  if (missing.length) console.error(`Missing from the package: ${missing.join(", ")}`);
  if (leaked.length) console.error(`Should not ship: ${leaked.join(", ")}`);
  process.exit(1);
}
