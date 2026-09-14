# Semantic Embedder API Reference

Use this file for core API shape and rules before writing or reviewing browser integrations.

## Status

`SemanticEmbedder` is an Early Preview Program (EPP) API from the Chrome Built-in AI team. It has not been approved to ship and is not part of a standards-track specification yet. Treat every detail here as subject to change between Canary milestones; re-check `references/compatibility.md` before relying on specific behavior.

## API surface

`SemanticEmbedder` is a secure-context `Window` API, available on desktop only.

Core members:

* `SemanticEmbedder.availability(options?)`
* `SemanticEmbedder.create(options?)`
* `session.embed(input, options?)`
* `session.destroy()`

## Create options

`create()` accepts:

* `monitor?: (monitor: EventTarget) => void`

`create()` does not accept `taskType`. Passing it there has no documented effect; `taskType` belongs on `embed()` calls only.

## Availability states

The developer guide's sample code checks `availability()` against `"available"` and treats every other value as not ready:

```js
if (!SemanticEmbedder || (await SemanticEmbedder.availability()) !== "available") {
  console.error("Semantic Embedder API is not available on this device.");
}
```

Sibling Built-in AI APIs (Language Detector, Translator, Proofreader, Writing Assistance) use a four-state `unavailable` / `downloadable` / `downloading` / `available` enum. The Semantic Embedder developer guide has not explicitly documented all four states for this API, so treat any value other than `"available"` as "not ready yet" rather than branching on a specific state name.

## `embed()` input and output

`embed()` accepts a single string or an array of strings (batch input):

```js
const single = await session.embed("some text");
const batch = await session.embed(["passage one", "passage two"]);
```

`embed()` returns an `EmbedderResult`:

```js
{
  embeddings: [
    { values: Float32Array(256) } // dimension is model-defined
    // one entry per input string, in the same order
  ]
}
```

Rules:

* Batch results correspond 1:1, in order, with the input array.
* The API does not automatically chunk large text inputs; pre-chunk documents before calling `embed()`.
* The API does not currently expose token-count, truncation, or model/version metadata on the result object. Design proposals for a `statistics` field (per-embedding token counts) and a `metadata` field (embedding-space or model identifier) exist in the API explainer but are not part of the shipped developer-guide surface; do not assume they exist without re-checking `references/compatibility.md`.

## `taskType` option

`embed(input, { taskType })` accepts an optional `taskType` hint:

| `taskType` value | Use case |
| --- | --- |
| `"semantic-similarity"` | Optimized for assessing text similarity. Not intended for retrieval. |
| `"retrieval-query"` | Optimized for embedding a user's real-time search query. |
| `"retrieval-document"` | Optimized for embedding a document collection to index in a vector database. |
| `"classification"` | Optimized for classifying text against preset labels (sentiment analysis, spam detection). |
| `"clustering"` | Optimized for clustering text by similarity (document organization, market research, anomaly detection). |

Rules:

* `taskType` is optional. If it is not specified, the API computes the embedding for the raw string input as-is; it does not silently choose a default optimized task.
* Always pick a `taskType` deliberately for production similarity or retrieval code; relying on the unset default means comparing unoptimized, non-task-tuned vectors.
* Use `retrieval-document` for the indexed side of a retrieval flow and `retrieval-query` for the query side; do not use the same `taskType` for both.
* Task types are a hint the browser can ignore if the underlying model does not support them; do not treat them as a hard contract on output shape or dimensionality.

## Embedding-space and comparability

* Embeddings can only be compared when they originate from the same embedding space, meaning the same model version produced them.
* The API does not currently expose an embedding-space or model-version identifier on the result. Applications must externally track when their stored vectors might have been produced by a different model build (for example, after a browser update) and re-embed rather than trust a cached vector across an unproven version boundary.
* Do not compare vectors produced by different sessions, browsers, or platforms unless the product has an explicit way to confirm they share the same embedding space.

## Lifecycle and cleanup

* `create()` initializes a session; the resulting session exposes `embed()` and `destroy()`.
* Call `destroy()` proactively once embeddings have been extracted, especially after a large batch call, to release model resources.
* The developer guide's `embed()` and `create()` signatures do not document a per-call `AbortSignal`; do not add cancellation logic that assumes one exists without re-verifying against `references/compatibility.md`.

## Permissions policy and context limits

* The API's design explainer describes access as gated by an embedding-scoped permissions policy, restricted to top-level frames and same-origin iframes by default, with third-party contexts requiring explicit delegation. This has not been confirmed as implemented in the shipped EPP build; verify current iframe behavior empirically before depending on cross-origin delegation syntax.
* The API is scoped to desktop platforms (Linux, macOS, Windows); it is not available on Chrome for Android, iOS, or other mobile platforms.

## Error shapes

Neither the developer guide nor the public design explainer enumerates specific exception names (such as `NotAllowedError` or `OperationError`) for this API yet. Implement generic `try`/`catch` around `create()` and `embed()`, log `error.name` and `error.message` for diagnosis, and treat unrecognized failures as environment or EPP-build issues rather than permanent unsupported states.
