import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

function gitValue(args, fallback) {
  try {
    return (
      execFileSync("git", args, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim() || fallback
    );
  } catch {
    return fallback;
  }
}

const commit = gitValue(["rev-parse", "--short", "HEAD"], "uncommitted");
const branch = gitValue(["branch", "--show-current"], "main");

mkdirSync("src/generated", { recursive: true });

const info = {
  name: packageJson.name,
  version: packageJson.version,
  commit,
  branch,
  repositoryUrl: "https://github.com/baditaflorin/earthquake-wave-propagation",
  paypalUrl: "https://www.paypal.com/paypalme/florinbadita",
  pagesUrl: "https://baditaflorin.github.io/earthquake-wave-propagation/",
};

writeFileSync(
  "src/generated/buildInfo.ts",
  `export const buildInfo = {
  name: ${JSON.stringify(info.name)},
  version: ${JSON.stringify(info.version)},
  commit: ${JSON.stringify(info.commit)},
  branch: ${JSON.stringify(info.branch)},
  repositoryUrl: ${JSON.stringify(info.repositoryUrl)},
  paypalUrl: ${JSON.stringify(info.paypalUrl)},
  pagesUrl: ${JSON.stringify(info.pagesUrl)},
} as const;\n`,
);
