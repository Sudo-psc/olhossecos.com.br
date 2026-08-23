import { execFileSync } from "node:child_process";

const command = process.argv[2];
if (!command || !["build", "check"].includes(command)) {
  throw new Error("Use npm run build:v2 ou npm run check:v2.");
}

execFileSync(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["run", command],
  {
    env: { ...process.env, SITE_BASE_PATH: "/v2" },
    stdio: "inherit",
  },
);
