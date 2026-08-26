import { execSync } from "child_process";
import { existsSync, readdirSync, renameSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";

const FOLDER = "temp";
const OUTPUT_FILE = "../dart-types/lib/src/types.dart";
const TEMP_FILE = "types.dart";

console.log("Converting json schemas from", FOLDER, "to dart...");

if (existsSync(TEMP_FILE)) unlinkSync(TEMP_FILE);

let content = "";

readdirSync(FOLDER).forEach(file => {
  const dartContent = execSync(`pnpm exec quicktype --src-lang schema --src ${join(FOLDER, file)} --lang dart --just-types`);
  content += dartContent + "\n";
});

console.log("Fixing enums...");
const startEnums: string[] = [];
const newContent: string[] = [];
let isSearching: boolean = false;
let doAddWhenSearching: boolean = false;

content.split("\n").forEach(line => {
  if (isSearching) {
    if (line.includes("}")) {
      isSearching = false;
    }
    if (doAddWhenSearching) startEnums.push(line.toLocaleLowerCase());
  } else {
    if (line.startsWith("enum")) {
      if (!startEnums.includes(line)) {
        startEnums.push(line.replace("Schema", "Data"));
        doAddWhenSearching = true;
      } else {
        doAddWhenSearching = false;
      }
      isSearching = true;
    } else {
      newContent.push(line.replace("Schema", "Data"));
    }
  }
});

const fixedContent = [...startEnums, ...newContent].join("\n");
writeFileSync(TEMP_FILE, fixedContent);

console.log("Moving output file to dart package...");
renameSync(TEMP_FILE, OUTPUT_FILE);

console.log("Running formatter...");
execSync(`dart fix ${OUTPUT_FILE} --apply`);
execSync(`dart format ${OUTPUT_FILE}`);
console.log("Done!");
