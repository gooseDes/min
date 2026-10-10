/// <reference types="node" />
import fs from "fs/promises";
import { parseArgs } from "util";
import packageJson from "./package.json" with { type: "json" };

const { values } = parseArgs({
  options: {
    tag: { type: "string", short: "t" },
  },
});

if (values.tag) fs.writeFile("flutter-latest.json", JSON.stringify({ version: packageJson.version, release_tag: values.tag }));
else console.error("No tag specified");
