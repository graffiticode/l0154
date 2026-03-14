// SPDX-License-Identifier: MIT
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../lib/index.css';
import { View } from "../lib/view";

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <View />
  </React.StrictMode>,
);
