import { execSync } from "node:child_process";
import { globSync, readFileSync, writeFileSync } from "node:fs";

const SOURCE_PATH = "../../packages/core/src/**/*.rs";
const SYNC_UTIL_NAMED_MARKER = "// util-sync-named";
const SYNC_UTIL_POSITIONAL_MARKER = "// util-sync-positional";
const SYNC_UTIL_MARKER = "// util-sync";
const FINAL_FILE_PATH = "rust/src/api/utils.rs";

function countChar(str: string, target: string): number {
  let count = 0;
  for (const char of str) {
    if (char === target) {
      count++;
    }
  }
  return count;
}

console.log("Reading and adapting original Rust code...");

const finalContent = ["// This file is auto-generated, so do not change it manually\n"];

for (const file of globSync(SOURCE_PATH)) {
  const content = readFileSync(file).toString();
  const lines = content.split("\n");
  if (!content.includes(SYNC_UTIL_MARKER)) continue;
  let isSearching = false;
  let searchStartedAt = -1;
  let linesAlredy = 0;
  let bracketsOpen = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!isSearching && !line.includes(SYNC_UTIL_MARKER)) continue;
    if (!isSearching) {
      isSearching = true;
      searchStartedAt = i;
      continue;
    }
    linesAlredy++;
    bracketsOpen += countChar(line, "{");
    bracketsOpen -= countChar(line, "}");
    if (bracketsOpen <= 0) {
      finalContent.push(
        lines
          .slice(searchStartedAt, searchStartedAt + linesAlredy + 1)
          .join("\n")
          .replaceAll(SYNC_UTIL_NAMED_MARKER, "#[flutter_rust_bridge::frb(sync)]")
          .replaceAll(SYNC_UTIL_POSITIONAL_MARKER, "#[flutter_rust_bridge::frb(sync, positional)]"),
      );
      isSearching = false;
      searchStartedAt = -1;
      linesAlredy = 0;
      bracketsOpen = 0;
    }
  }
}

console.log("Writing...");

writeFileSync(FINAL_FILE_PATH, finalContent.join("\n"));

console.log("Running rustfmt...");

execSync(`rustfmt ${FINAL_FILE_PATH}`);

console.log("Done!");
