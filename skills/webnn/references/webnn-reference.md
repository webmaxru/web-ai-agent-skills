# WebNN Reference

The W3C WebNN specification at `https://www.w3.org/TR/webnn/` is the authoritative source for API semantics. Use `https://webnn.io/en/api-reference/reference` as the practical index for interface details, compatibility notes, and examples.

## Core execution model

* `navigator.ml` is the browser entry point.
* `navigator.ml.createContext(options?)` creates an `MLContext` with optional `powerPreference` and `accelerated` preferences.
* `navigator.ml.createContext(gpuDevice)` creates an `MLContext` backed by an existing `GPUDevice` for interop with WebGPU.
* `MLGraphBuilder` constructs a graph from `MLOperand` inputs, constants, and operations.
* `builder.build()` compiles the graph asynchronously into an `MLGraph`. It can only be called once per builder.
* `MLContext.createTensor()` creates reusable `MLTensor` objects for graph I/O.
* `MLContext.createConstantTensor(descriptor, inputData)` creates an immutable constant `MLTensor` for weight data. The constant tensor can be destroyed after `build()` completes.
* `MLContext.writeTensor()` copies input data into writable tensors.
* `MLContext.dispatch()` schedules graph execution.
* `await MLContext.readTensor(tensor)` reads output data back to script as an `ArrayBuffer`.
* `await MLContext.readTensor(tensor, outputData)` reads output data into an existing `AllowSharedBufferSource`.
* `MLContext.destroy()`, `MLGraph.destroy()`, `MLTensor.destroy()` release associated resources explicitly.

## Context options and attributes

* `powerPreference`: `"default"`, `"high-performance"`, or `"low-power"`.
* `accelerated`: boolean (default `true`). When `true`, the platform attempts to use massively parallel hardware such as a GPU or NPU. When `false`, the application prefers CPU inference. `accelerated` has less priority than `powerPreference`; contradictory combinations (e.g., `powerPreference: "high-performance"` with `accelerated: false`) let the implementation choose the best available match.
* `MLContext.accelerated`: read-only attribute reflecting whether the context uses hardware acceleration.
* `context.lost`: `Promise<MLContextLostInfo>` that resolves when the execution context becomes invalid. The resolved `MLContextLostInfo` object carries a `message: DOMString` field with a human-readable description of the loss reason.
* `opSupportLimits()`: reports device-dependent support limits, operator data type coverage, and rank ranges for inputs, constants, and outputs. Note: the W3C specification (§5.1 and §8.3.7) identifies `opSupportLimits()` as a potential fingerprinting vector; implementations may bucket capabilities to reduce entropy.

Note: `MLDeviceType` (`"cpu"` / `"gpu"` / `"npu"`) was removed from the specification (see [#809](https://github.com/webmachinelearning/webnn/pull/809)). Use `accelerated` and `powerPreference` instead.

Note: `MLContextOptions` is under active development and the design is expected to evolve. The Working Group is considering controls for fallback devices, ordered device preference lists, and exclusion of specific devices. Build detection and fallback paths that remain correct when context option semantics change (see [§8.2.1](https://www.w3.org/TR/webnn/#api-mlcontextoptions)).

## MLTensor attributes

* `MLTensor.readable`: boolean indicating the tensor was created as readable.
* `MLTensor.writable`: boolean indicating the tensor was created as writable.
* `MLTensor.constant`: read-only boolean indicating the tensor was created as a constant via `createConstantTensor()`.

## MLOperand attributes

`MLOperand` exposes the following readonly attributes (not methods):

* `operand.dataType`: `MLOperandDataType` — the data type of the operand.
* `operand.shape`: `FrozenArray<unsigned long>` — the shape dimensions of the operand.

Use these as property accesses (`operand.dataType`, `operand.shape`), not function calls.

`MLTensor` exposes the same `dataType` and `shape` readonly attributes with the same semantics.

## MLGraphBuilder constant overloads

* `builder.constant(descriptor, buffer)` creates a constant operand from an `MLOperandDescriptor` and a data buffer.
* `builder.constant(dataType, value)` creates a scalar constant operand. `dataType` is an `MLOperandDataType`; `value` is an `MLNumber` (a unified numeric type for any supported data type).
* `builder.constant(tensor)` creates a constant operand from a constant `MLTensor` created by `context.createConstantTensor()`. The constant tensor may be destroyed after `build()` completes.

## Integration rules

* WebNN requires a secure context.
* WebNN surfaces are available in `Window` and all `Worker` contexts (including `DedicatedWorker`, `SharedWorker`, and `ServiceWorker`).
* `dispatch()` does not report completion. Read output tensors to synchronize with the executed result.
* Hardware acceleration is a preference. Implementations can partition graphs or fall back per operator.
* Reuse compiled graphs and tensors when shapes remain stable.
* Call `destroy()` on tensors, graphs, and contexts when the feature is disposed.

## When to prefer direct WebNN graphs

Use direct `MLGraphBuilder` flows when:

* the application owns the graph logic,
* the graph is small or deterministic,
* the feature needs tight control over tensors and execution lifecycle,
* the team wants minimal runtime indirection.

## When to preserve an adapter layer

Use an adapter around an existing local runtime when:

* the application already loads models through ONNX Runtime Web or another in-browser runtime,
* pre-processing and post-processing are already centralized there,
* the task is to prefer WebNN acceleration instead of rewriting the full inference path.

Keep WebNN as the preferred local acceleration path, not as a reason to invent a second inference architecture.