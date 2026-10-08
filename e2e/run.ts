import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { E2E_DATABASE_URL } from "./config";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const composeFile = path.join(root, "e2e.compose.yml");
const composeArgs = ["compose", "-f", composeFile];
const environment = { ...process.env, DATABASE_URL: E2E_DATABASE_URL };

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: environment,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with ${result.status}`);
}

let databaseStarted = false;
try {
  run("docker", [...composeArgs, "up", "-d", "--wait"]);
  databaseStarted = true;
  run(process.execPath, [path.join(root, "node_modules/prisma/build/index.js"), "migrate", "deploy"]);
  run(process.execPath, [
    path.join(root, "node_modules/@playwright/test/cli.js"),
    "test",
    ...process.argv.slice(2),
  ]);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (databaseStarted) {
    try {
      run("docker", [...composeArgs, "down", "--volumes"]);
    } catch (error) {
      console.error("Failed to stop the E2E database", error);
      process.exitCode = 1;
    }
  }
}
