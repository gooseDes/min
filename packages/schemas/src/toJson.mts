import { mkdirSync, writeFileSync } from "fs";
import * as schemas from "./index.ts";

console.log("Converting zod schemas to json...");

mkdirSync("temp", { recursive: true });

Object.entries(schemas).forEach(([name, schema]) => {
  const json = schema.toJSONSchema({
    unrepresentable: "any",
    override: ctx => {
      if (ctx.zodSchema._zod?.def?.type === "date") {
        ctx.jsonSchema.type = "string";
        ctx.jsonSchema.format = "date-time";
      }
    },
  });
  const path = `temp/${name}.json`;
  writeFileSync(path, JSON.stringify(json, null, 2));
});

console.log("Done!");
