// SPDX-License-Identifier: MIT
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { createState } from "./lib/state";
import { compile, getData } from './swr/fetchers';
import './index.css';
import { Form } from "./components";

// The compiled data field can be a record, a non-empty array, or a bare value
// (number, string). Render whenever there is something to show.
function hasRenderableData(data) {
  if (data === null || data === undefined) {
    return false;
  }
  if (typeof data === "object") {
    return Object.keys(data).length > 0;
  }
  return true;
}

// Compile/stored responses use the standard { data, errors } envelope. A
// response carrying a `data` and/or `errors` field is read as an envelope; a
// payload with neither (legacy/raw value or host-provided init data) is used
// as the data model itself.
function unwrapEnvelope(resp) {
  if (
    resp && typeof resp === "object" && !Array.isArray(resp) &&
    ("data" in resp || "errors" in resp)
  ) {
    return {
      data: resp.data,
      errors: Array.isArray(resp.errors) ? resp.errors : [],
    };
  }
  return { data: resp, errors: [] };
}

export const View = () => {
  const [ id, setId ] = useState();
  const [ accessToken, setAccessToken ] = useState();
  const [ targetOrigin, setTargetOrigin ] = useState();
  const [ doGetData, setDoGetData ] = useState(true);
  const [ recompile, setRecompile ] = useState(false);
  const [ height, setHeight ] = useState(0);

  useEffect(() => {
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      setId(params.get("id"));
      const accessToken = params.get("access_token");
      setAccessToken(accessToken);
      setTargetOrigin(params.get("origin"));
      const data = params.get("data");
      if (data) {
        state.apply({
          type: "init",
          args: JSON.parse(data),
        });
      }
    }
  }, [window.location.search]);

  useEffect(() => {
    // If `id` changes, then recompile.
    if (id) {
      setDoGetData(true);
    }
  }, [id]);

  const [ state ] = useState(createState({}, (data, { type, args }) => {
    // console.log("L0154 state.apply() type=" + type + " args=" + JSON.stringify(args, null, 2));
    switch (type) {
    case "init":
      return {
        ...args,
      };
    case "compile":
      // A record merges into existing state; a non-record result (number,
      // string, list) replaces it.
      if (typeof args === "object" && args !== null && !Array.isArray(args)) {
        return {
          ...data,
          ...args,
        };
      }
      return args;
    case "change":
      setRecompile(true);
      return {
        ...data,
        ...args,
      };
    default:
      console.error(false, `Unimplemented action type: ${type}`);
      return data;
    }
  }));

  const dataResp = useSWR(
    doGetData && id && {
      accessToken,
      id,
    },
    getData
  );

  if (dataResp.data) {
    // Stored data uses the { data, errors } envelope (tolerates legacy raw).
    const { data, errors } = unwrapEnvelope(dataResp.data);
    state.setErrors(errors);
    if (errors.length === 0 && data !== null && data !== undefined) {
      state.apply({
        type: "compile",
        args: data,
      });
      // Notify parent that data is loaded
      if (targetOrigin && id) {
        window.parent.postMessage({
          type: 'data-updated',
          itemId: id,
          data,
        }, targetOrigin);
      }
    }
    setDoGetData(false);
  }

  const compileResp = useSWR(
    recompile && id && {
      accessToken,
      id,
      data: state.data,
    },
    compile
  );

  if (compileResp.data) {
    const { data, errors } = unwrapEnvelope(compileResp.data);
    state.setErrors(errors);
    if (errors.length === 0 && data !== null && data !== undefined) {
      state.apply({
        type: "compile",
        args: data,
      });
    }
    setRecompile(false);
  }
  return (
    (hasRenderableData(state.data) || state.errors.length > 0) &&
      <Form state={state} /> ||
      <div />
  );
}
