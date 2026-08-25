import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const { discoveryStaticHeaders } = await import(
  pathToFileURL(join(repositoryDirectory, "src/lib/discovery.ts")).href
);

writeFileSync(
  join(repositoryDirectory, "dist", "_headers.json"),
  `${JSON.stringify(discoveryStaticHeaders, null, 2)}\n`,
);
