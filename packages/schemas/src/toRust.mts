import { execSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const FOLDER = "temp";
const OUTPUT_FILE = "../core/src/models/generated_structs.rs";
const TEMP_FILE = "types.rs";

console.log("Converting json schemas from", FOLDER, "to rust...");

if (existsSync(TEMP_FILE)) unlinkSync(TEMP_FILE);

writeFileSync(
  TEMP_FILE,
  execSync(`pnpm exec quicktype --src-lang schema --src ${join(FOLDER, "*.json")} --lang rust`)
    .toString()
    .replaceAll("Schema", "Data"),
);

console.log("Moving output file to dart package...");
mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
renameSync(TEMP_FILE, OUTPUT_FILE);

console.log("Running formatter...");
execSync(`rustfmt ${OUTPUT_FILE}`);
console.log("Done!");
