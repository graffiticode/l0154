// SPDX-License-Identifier: MIT
export const buildGetConfig = ({ global }) => {
  return () => global.config;
};
