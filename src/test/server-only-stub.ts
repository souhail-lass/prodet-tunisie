/**
 * `server-only` throws by design outside a React Server Component graph.
 * Vitest runs plain Node, so server modules are aliased onto this no-op to
 * keep server actions and mutations unit-testable (see vitest.config.ts).
 */
export {};
