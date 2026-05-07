import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const appFiles = [
  "assets",
  "index.html",
  "404.html",
  "favicon.svg",
  "manifest.webmanifest",
  "sw.js",
  "icons.svg",
];

mkdirSync("docs", { recursive: true });

for (const file of appFiles) {
  const target = join("docs", file);
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
  }
}

cpSync("dist", "docs", { recursive: true });
copyFileSync("docs/index.html", "docs/404.html");
