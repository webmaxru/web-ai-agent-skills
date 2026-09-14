export type SemanticEmbedderAvailability = "unavailable" | "available" | string;

export type SemanticEmbedderTaskType =
  | "semantic-similarity"
  | "retrieval-query"
  | "retrieval-document"
  | "classification"
  | "clustering";

export type EmbeddingResult = {
  values: Float32Array;
};

export type EmbedderResult = {
  embeddings: EmbeddingResult[];
};

export type DownloadProgress = {
  loaded: number;
  total: number | null;
  fraction: number | null;
};

export type SemanticEmbedderCreateOptions = {
  onDownloadProgress?: (progress: DownloadProgress) => void;
};

export type SemanticEmbedderEmbedOptions = {
  taskType?: SemanticEmbedderTaskType;
};

export interface SemanticEmbedderSession {
  embed(input: string | string[], options?: SemanticEmbedderEmbedOptions): Promise<EmbedderResult>;
  destroy(): void;
}

declare const SemanticEmbedder: {
  availability(): Promise<SemanticEmbedderAvailability>;
  create(options?: { monitor?: (monitor: EventTarget) => void }): Promise<SemanticEmbedderSession>;
};

function attachMonitor(
  onDownloadProgress: SemanticEmbedderCreateOptions["onDownloadProgress"],
): ((monitor: EventTarget) => void) | undefined {
  if (!onDownloadProgress) {
    return undefined;
  }

  return monitor => {
    monitor.addEventListener("downloadprogress", event => {
      const progressEvent = event as Event & { loaded: number; total?: number };
      const total = typeof progressEvent.total === "number" ? progressEvent.total : null;
      const loaded = typeof progressEvent.loaded === "number" ? progressEvent.loaded : 0;

      onDownloadProgress({
        loaded,
        total,
        fraction: total && total > 0 ? loaded / total : loaded <= 1 ? loaded : null,
      });
    });
  };
}

export function isSemanticEmbedderSupported(): boolean {
  if (typeof self === "undefined") {
    return false;
  }

  return Boolean(globalThis.isSecureContext && "SemanticEmbedder" in self);
}

export async function getSemanticEmbedderAvailability(): Promise<SemanticEmbedderAvailability> {
  if (!isSemanticEmbedderSupported()) {
    return "unavailable";
  }

  return SemanticEmbedder.availability();
}

export async function createSemanticEmbedderSession(
  options: SemanticEmbedderCreateOptions = {},
): Promise<SemanticEmbedderSession | null> {
  const availability = await getSemanticEmbedderAvailability();
  if (availability === "unavailable") {
    return null;
  }

  return SemanticEmbedder.create({
    monitor: attachMonitor(options.onDownloadProgress),
  });
}

export function cosineSimilarity(vecA: Float32Array, vecB: Float32Array): number {
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

// The API does not expose a model/embedding-space identifier on results, so
// callers must version their own stored vectors to detect staleness after a
// browser or model update.
export function tagEmbeddingSchemaVersion<T extends Record<string, unknown>>(
  record: T,
  schemaVersion: string,
): T & { embeddingSchemaVersion: string } {
  return { ...record, embeddingSchemaVersion: schemaVersion };
}
