import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(currentDir, "../..");

config({
  path: resolve(workspaceRoot, ".env.local"),
  override: false,
  quiet: true
});

config({
  path: resolve(workspaceRoot, ".env"),
  override: false,
  quiet: true
});
