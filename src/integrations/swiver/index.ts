import 'server-only';
import { getServerEnv } from '@/lib/env';
import { disabledSwiverAdapter } from './disabled-adapter';
import { createHttpSwiverAdapter } from './http-adapter';
import type { SwiverAdapter } from './types';

export type {
  SwiverAdapter,
  SwiverCustomer,
  SwiverProduct,
  SwiverDocumentKind,
  SwiverDocumentStatus,
  SwiverDocumentSummary,
} from './types';

let cached: SwiverAdapter | null = null;

/**
 * Returns the active Swiver adapter, selected by `SWIVER_MODE`:
 *   - `disabled` (default): no-op, returns empty/null for every read.
 *   - `sandbox`           : HTTP adapter pointed at the sandbox base URL.
 *   - `production`        : HTTP adapter pointed at the production base URL.
 *
 * If the live adapter is requested but credentials are missing we fall
 * back to disabled and log a clear warning rather than throwing, so a
 * mis-configured deploy degrades to "no Swiver" instead of a 500 wall.
 */
export function getSwiverAdapter(): SwiverAdapter {
  if (cached) return cached;
  const env = getServerEnv();

  if (env.SWIVER_MODE === 'disabled') {
    cached = disabledSwiverAdapter;
    return cached;
  }

  try {
    cached = createHttpSwiverAdapter({ mode: env.SWIVER_MODE });
  } catch (error) {
    console.warn(
      '[swiver-adapter] live mode requested but credentials missing — falling back to disabled adapter.',
      error instanceof Error ? error.message : error,
    );
    cached = disabledSwiverAdapter;
  }
  return cached;
}

/**
 * Reset the cached adapter. Test-only escape hatch.
 */
export function __resetSwiverAdapterForTests(): void {
  cached = null;
}
