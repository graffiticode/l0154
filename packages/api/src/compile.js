// SPDX-License-Identifier: MIT
import { compiler } from './compiler.js';
export async function compile({ auth, authToken, code, data, config }) {
  // console.log("compile() code=" + JSON.stringify(code, null, 2));
  // console.log("compile() data=" + JSON.stringify(data, null, 2));
  if (!code || !data) {
    throw new Error('Missing required parameters: code and data');
  }
  return await new Promise((resolve) =>
    compiler.compile(code, data, config, (err, val) => {
      // Standard compile response envelope: success output in `data`, compile
      // errors in `errors` (always an array).
      const errors = err && err.length ? err : [];
      resolve({
        data: errors.length ? null : val,
        errors,
      });
    })
  );
}
