// SPDX-License-Identifier: MIT
import { lexicon as baseLexicon } from "@graffiticode/basis";
import { lexicon as langLexicon } from "../src/lexicon.js";
const lexicon = {
  ...baseLexicon,
  ...langLexicon,
};
console.log(JSON.stringify(lexicon, null, 2));
