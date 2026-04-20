// SPDX-License-Identifier: MIT
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiDir = join(__dirname, "..");
const specDir = join(apiDir, "spec");
const distDir = join(apiDir, "dist");

const userGuidePath = join(specDir, "user-guide.md");
const languageInfoPath = join(specDir, "language-info.json");

const userGuide = readFileSync(userGuidePath, "utf-8");

const overviewMatch = userGuide.match(/^##\s+Overview\s*\n([\s\S]*?)(?=^##\s)/m);
if (!overviewMatch) {
  console.error(
    `build-language-info: ${userGuidePath} is missing a '## Overview' section. ` +
    "The Overview section populates the authoring_guide field in dist/language-info.json " +
    "and is required."
  );
  process.exit(1);
}

const authoringGuide = overviewMatch[1].trim();
if (authoringGuide.length < 100) {
  console.error(
    `build-language-info: extracted Overview body is ${authoringGuide.length} chars ` +
    "(minimum 100). Expand the '## Overview' section of spec/user-guide.md."
  );
  process.exit(1);
}

const envelope = JSON.parse(readFileSync(languageInfoPath, "utf-8"));
if ("authoring_guide" in envelope) {
  console.error(
    "build-language-info: spec/language-info.json must not contain 'authoring_guide'; " +
    "the field is build-injected from spec/user-guide.md's Overview section."
  );
  process.exit(1);
}

const enriched = { ...envelope, authoring_guide: authoringGuide };

mkdirSync(distDir, { recursive: true });
writeFileSync(join(distDir, "language-info.json"), JSON.stringify(enriched, null, 2) + "\n");
writeFileSync(join(distDir, "user-guide.md"), userGuide);

console.log(
  `build-language-info: wrote dist/language-info.json (${authoringGuide.length}-char authoring_guide) ` +
  "and dist/user-guide.md"
);
