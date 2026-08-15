import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { jsonSchemaToZod } from "json-schema-to-zod";

// Settings
const GENERATED_FILE = "./src/apiSchemas.ts";

console.log("Compiling JSON schemas to Zod...");

type RawData = {
  [endpointName: string]: {
    input?: object;
    output?: object;
  };
};

const rawData = JSON.parse(readFileSync("./api.json", "utf8")) as RawData;
let outputCode = `import { z } from "zod";import type { WebSocketEvent } from "@/types";\n\n`;

const inputEndpoints: Record<string, string> = {};
const outputEndpoints: Record<string, string> = {};

for (const [endpointName, methods] of Object.entries(rawData)) {
  if (methods.input) {
    const inputZod = jsonSchemaToZod(methods.input);
    const schemaName = `${endpointName}InputSchema`;
    outputCode += `export const ${schemaName} = ${inputZod};\n`;
    inputEndpoints[endpointName] = schemaName;
  }

  if (methods.output) {
    const outputZod = jsonSchemaToZod(methods.output);
    const schemaName = `${endpointName}OutputSchema`;
    outputCode += `export const ${schemaName} = ${outputZod};\n\n`;
    outputEndpoints[endpointName] = schemaName;
  }
}

outputCode += `export const inputEndpoints = {${Object.entries(inputEndpoints)
  .map(([key, value]) => `${key}: ${value}`)
  .join(", ")}} satisfies Record<WebSocketEvent, z.ZodObject>;\n\n`;
outputCode += `export const outputEndpoints = {${Object.entries(outputEndpoints)
  .map(([key, value]) => `${key}: ${value}`)
  .join(", ")}} satisfies Record<WebSocketEvent, z.ZodObject>;\n\n`;

writeFileSync(GENERATED_FILE, outputCode);

console.log("Successfully compiled all nested JSON schemas to Zod.");

console.log("Styling with prettier...");
execSync(`pnpm exec prettier --write ${GENERATED_FILE}`);
console.log("Successfully styled with prettier.");

console.log("Done!");
