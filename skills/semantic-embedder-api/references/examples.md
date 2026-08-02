# Examples

Use these patterns as shape references. Adapt them to the host framework and state model instead of copying them blindly.

## Support detection

```ts
function detectSemanticEmbedderSupport(): { supported: boolean; reason: string | null } {
  const runtimeScope = globalThis as typeof globalThis & {
    isSecureContext?: boolean;
    SemanticEmbedder?: unknown;
  };

  if (!runtimeScope.isSecureContext) {
    return { supported: false, reason: "Semantic Embedder requires HTTPS or localhost." };
  }

  if (!runtimeScope.SemanticEmbedder) {
    return {
      supported: false,
      reason: "SemanticEmbedder is unavailable. Confirm Chrome Canary and the semantic-embedder-api flag.",
    };
  }

  return { supported: true, reason: null };
}

const support = detectSemanticEmbedderSupport();
if (!support.supported) {
  console.warn(support.reason);
}
```

## Availability and monitored session creation

```ts
const availability = await SemanticEmbedder.availability();

if (availability !== "available") {
  console.warn(`Semantic Embedder is not immediately ready: ${availability}`);
}

const semanticEmbedder = await SemanticEmbedder.create({
  monitor(monitor) {
    monitor.addEventListener("downloadprogress", event => {
      const progressEvent = event as Event & { loaded: number; total?: number };
      console.log(`Downloaded ${progressEvent.loaded * 100}%`);
    });
  },
});
```

## Single-string similarity comparison

```ts
function cosineSimilarity(vecA: Float32Array, vecB: Float32Array): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

const resultA = await semanticEmbedder.embed("The quick brown fox jumps over the lazy dog.", {
  taskType: "semantic-similarity",
});
const resultB = await semanticEmbedder.embed("A fast, dark-colored fox leaps over a resting hound.", {
  taskType: "semantic-similarity",
});

const similarity = cosineSimilarity(resultA.embeddings[0].values, resultB.embeddings[0].values);
console.log(`Similarity score: ${similarity}`);
```

## Batched retrieval indexing

```ts
const passages = [
  "Built-in AI APIs use on-device models.",
  "Embeddings are high-dimensional vectors representing semantic meaning.",
];

const documentBatch = await semanticEmbedder.embed(passages, {
  taskType: "retrieval-document",
});

for (let i = 0; i < documentBatch.embeddings.length; i++) {
  await myLocalVectorDB.insert({
    text: passages[i],
    embedding: documentBatch.embeddings[i].values,
    // Track the schema/model context locally; the result object does not
    // expose an embedding-space or model-version identifier.
    embeddingSchemaVersion: CURRENT_EMBEDDING_SCHEMA_VERSION,
  });
}
```

## Query-time retrieval embedding

```ts
const queryResult = await semanticEmbedder.embed(userSearchText, {
  taskType: "retrieval-query",
});

const queryVector = queryResult.embeddings[0].values;
const matches = await myLocalVectorDB.searchByVector(queryVector);
```

## Cleanup

```ts
let session: SemanticEmbedderSession | null = null;

try {
  session = await SemanticEmbedder.create();
  const result = await session.embed(userText, { taskType: "semantic-similarity" });
  render(result);
} finally {
  session?.destroy();
}
```

## Decision shortcuts

Use `retrieval-document` when embedding the side of a flow that gets indexed, and `retrieval-query` when embedding the side that searches it. Never mix the two for the same flow.

Use `semantic-similarity` only for direct text-to-text comparisons, not for retrieval ranking.

Do not omit `taskType` in production code paths; an unset `taskType` produces a raw, non-task-optimized embedding.

Version-tag every persisted vector before storage; there is no API-native way to detect that the underlying model changed between sessions.
