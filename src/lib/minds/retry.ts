/** Retry live Mind / HTTP calls with backoff. */

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts?: { attempts?: number; baseMs?: number; label?: string },
): Promise<T> {
  const attempts = opts?.attempts ?? 3;
  const baseMs = opts?.baseMs ?? 800;
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (i === attempts - 1) break;
      const wait = baseMs * 2 ** i;
      console.warn(`[aftercut] ${opts?.label ?? "retry"} attempt ${i + 1} failed — wait ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw last instanceof Error ? last : new Error(String(last));
}

export function cognitionWarningLevel(credits: number | null | undefined): "ok" | "low" | "critical" | null {
  if (credits == null) return null;
  if (credits < 50) return "critical";
  if (credits < 200) return "low";
  return "ok";
}
