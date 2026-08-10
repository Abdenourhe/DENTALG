type DeepStringify<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? DeepStringify<T[K]>
    : string;
};

export type Dictionary = DeepStringify<typeof import("./fr").fr>;
