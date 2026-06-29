# Troubleshooting

## `navigator.ml` is missing

* Confirm the page is running in a secure context.
* Confirm the target browser and milestone actually expose WebNN.
* Confirm preview Chromium flags if the test environment depends on them.
* If the app is server-rendering, move access behind a browser-only boundary.

## `createContext()` fails

* Reduce the request to a simple `createContext()` call without optional preferences and retry.
* If an accelerated or high-performance context fails, retry the product's approved fallback path rather than retrying indefinitely.
* Re-check browser compatibility notes for the target platform.

## `build()` fails

* Confirm the graph uses supported operators and data types for the selected backend.
* Use `context.opSupportLimits()` when the graph depends on backend-specific support.
* Reduce the graph to a minimal reproducible operation chain before changing broader application logic.
* Add optional `label` properties to operator options (e.g., `{ label: "my-relu" }`) to produce more diagnosable error messages when `build()` or `dispatch()` fails. Labels appear in runtime error messages where available.

## `dispatch()` appears to do nothing

* `dispatch()` is scheduling work, not returning the completed result.
* Read the output tensors with `await context.readTensor(...)` before judging the result.
* Confirm the output tensors were created as readable and the input tensors were created as writable.

## Tensor or context reuse breaks later requests

* Do not reuse tensors after destroying them.
* Recreate tensors when shape or type changes.
* Treat a resolved `context.lost` promise as a hard invalidation of the current execution resources.

## Device selection is misleading

* Requested device type is a preference, not a guarantee.
* Backends can partition graphs and execute unsupported pieces elsewhere.
* Surface device choice in product copy as intent, not as a promise that the entire graph stayed on NPU or GPU.