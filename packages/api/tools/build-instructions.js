// SPDX-License-Identifier: MIT
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const basisDir = dirname(require.resolve("@graffiticode/basis/package.json"));
const basisInstructions = readFileSync(join(basisDir, "spec", "instructions.md"), "utf-8");

const __dirname = dirname(fileURLToPath(import.meta.url));
const langInstructions = readFileSync(join(__dirname, "..", "spec", "instructions.md"), "utf-8");

console.log(`${basisInstructions}\n\n${langInstructions}`);
