// SPDX-License-Identifier: MIT
export const createState = (data, reducer) => {
  return {
    apply(action) {
      data = reducer(data, action);
    },
    get data() {
      return data
    },
  };
};

