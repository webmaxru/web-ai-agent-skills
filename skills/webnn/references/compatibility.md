# Compatibility

WebNN remains experimental. Treat browser support and backend behavior as an explicit project dependency, not as ambient browser capability.

## Baseline support notes

* WebNN is primarily available in Chromium-based browsers.
* `navigator.ml`, `ML`, `MLContext`, and `MLGraphBuilder` landed in Chromium milestone 112.
* `MLTensor` landed in milestone 124.
* `MLContext.dispatch()` and `opSupportLimits()` landed in milestone 128.
* `MLContext.createTensor()`, `readTensor()`, and `writeTensor()` landed in milestone 129.
* The scalar `builder.constant(type, value)` overload is listed from milestone 132.

## Execution context requirements

* Secure context is required.
* `Window` and `DedicatedWorker` contexts are supported from the earliest milestones.
* `SharedWorker` and `ServiceWorker` contexts are supported from the January 2026 CRD snapshot (see [#823](https://github.com/webmachinelearning/webnn/pull/823)). Confirm target browser support before relying on SharedWorker or ServiceWorker execution.
* Non-browser, server-side, or headless-only environments do not expose WebNN directly.

## Platform backend notes

* Windows 11 24H2+ can use ONNX Runtime through the Windows ML path when the relevant Chromium WebNN ONNX Runtime feature is enabled.
* Older or differently configured Windows builds can still fall back to TFLite or legacy DirectML-related paths.
* DirectML was officially deprecated in 2025. Do not build new product assumptions around DirectML-specific behavior.
* Apple Silicon systems on current macOS releases can route through Core ML when that backend is enabled.
* Linux and ChromeOS commonly rely on TFLite-based paths with CPU-first fallback behavior.
* Android support also depends on TFLite-backed delegates and can fall back to CPU.

## Device selection guidance

* `powerPreference: "default"` is the safest starting point for broad compatibility.
* `powerPreference: "high-performance"` targets throughput-oriented workloads.
* `powerPreference: "low-power"` targets power-efficient local acceleration.
* `accelerated: true` (the default) allows the platform to use GPU or NPU hardware.
* `accelerated: false` explicitly requests CPU-based inference.
* Requested preferences are not guarantees that every operator will run on the preferred device.
* On some backends, the graph can be partitioned and unsupported pieces can still fall back to CPU.

Note: `MLDeviceType` (`"cpu"` / `"gpu"` / `"npu"`) was removed from the specification in PR [#809](https://github.com/webmachinelearning/webnn/pull/809). Code that passed `deviceType` must migrate to `accelerated` and `powerPreference`.

## Chromium preview notes

* Chromium-based previews can require `#web-machine-learning-neural-network`.
* Experimental surfaces can additionally require `#experimental-web-machine-learning-neural-network`.
* Windows ML or ONNX Runtime-specific behavior can depend on the Chromium WebNN ONNX Runtime feature flag.
* Development-only flags such as `--no-sandbox` or `--disable-gpu-sandbox` are not acceptable shipping guidance.

## Origin Trial

* A WebNN Origin Trial is in preparation. Developers can register for trial keys to enable WebNN without requiring a Chromium flag flip. See `https://webnn.io/learn/get-started/ot_registration` for registration details.
* Origin Trial keys are time-limited. Build detection and fallback paths that remain correct when a trial key expires or is unavailable.

Validate the actual target browser and milestone before attributing failures to application code.