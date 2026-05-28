// SPDX-License-Identifier: MIT
export const createState = (data, reducer) => {
  let errors = [];
  return {
    apply(action) {
      data = reducer(data, action);
    },
    setErrors(nextErrors) {
      errors = Array.isArray(nextErrors) ? nextErrors : [];
    },
    get data() {
      return data
    },
    get errors() {
      return errors;
    },
  };
};

