import { execSync } from "child_process";
import { existsSync, renameSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";

const FOLDER = "temp";
const OUTPUT_FILE = "../dart-types/lib/src/types.g.dart";
const TEMP_FILE = "types.dart";

console.log("Converting json schemas from", FOLDER, "to dart...");

if (existsSync(TEMP_FILE)) unlinkSync(TEMP_FILE);

let content = "";

const dartContent = execSync(
  `pnpm exec quicktype --src-lang schema --src ${join(FOLDER, "*.json")} --lang dart --required-props`,
);
content += dartContent + "\n";

console.log("Fixing...");
const preprefixContent: string[] = [];
const prefixContent: string[] = [];
const newContent: string[] = [];
const enums: string[] = [];
let isSearching: boolean = false;
let doAddWhenSearching: boolean = false;

content.split("\n").forEach(line => {
  if (line.startsWith("//")) return;
  if (isSearching) {
    if (line.includes("}")) {
      isSearching = false;
    }
    if (doAddWhenSearching) prefixContent.push(line.toLocaleLowerCase());
  } else {
    if (line.startsWith("enum")) {
      const enumName = line.split(" ")[1];
      if (!enums.includes(enumName)) enums.push(enumName);
      if (!prefixContent.includes(line)) {
        prefixContent.push(line.replaceAll("Schema", "Data"));
        doAddWhenSearching = true;
      } else {
        doAddWhenSearching = false;
      }
      isSearching = true;
    } else if (line.startsWith("import ")) {
      preprefixContent.push(line);
    } else {
      newContent.push(line.replaceAll("Schema", "Data"));
    }
  }
});

let almostFinalContent = [...preprefixContent, ...prefixContent, ...newContent].join("\n");

function getAllIndices(str: string, searchStr: string): number[] {
  const indices: number[] = [];
  let pos = str.indexOf(searchStr);

  while (pos !== -1) {
    indices.push(pos);
    pos = str.indexOf(searchStr, pos + 1);
  }

  return indices;
}

enums.forEach(enumName => {
  const searchEntry = enumName + ".";
  const indexes = getAllIndices(almostFinalContent, searchEntry);
  indexes.forEach(index => {
    const finalIndex = index + searchEntry.length;
    const value = almostFinalContent.slice(finalIndex).split(" ")[0];
    almostFinalContent = almostFinalContent.replace(value, value.toLowerCase());
  });
});

const finalContent = almostFinalContent;

writeFileSync(TEMP_FILE, finalContent);

console.log("Moving output file to dart package...");
renameSync(TEMP_FILE, OUTPUT_FILE);

console.log("Running formatter...");
execSync(`dart fix ${OUTPUT_FILE} --apply`);
execSync(`dart format ${OUTPUT_FILE}`);
console.log("Done!");
