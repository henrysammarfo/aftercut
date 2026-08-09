/**
 * AFTERCUT live Mind smoke — one list + balance call.
 * Usage: npx tsx scripts/minds-smoke.ts
 * Never prints API keys.
 */
import {
  createLiveMindsClient,
  getBuilderApiKey,
  getConfiguredDirectorMindId,
  resolveDirectorMind,
} from "../src/lib/minds/runtime";

async function main() {
  const out: Record<string, unknown> = {
    keyPresent: Boolean(getBuilderApiKey()),
    directorPinned: getConfiguredDirectorMindId(),
  };
  if (!out.keyPresent) {
    console.log(JSON.stringify({ ...out, ok: false, error: "no key" }, null, 2));
    process.exit(1);
  }
  const client = createLiveMindsClient();
  const minds = await client.listMinds();
  const d = await resolveDirectorMind(client);
  let cognition: number | string | null = null;
  try {
    cognition = (await client.getCognitionBalance(d.mindId)).cognition;
  } catch (e) {
    cognition = `err:${String(e).slice(0, 100)}`;
  }
  const detail = await client.getMind(d.mindId);
  console.log(
    JSON.stringify(
      {
        ok: true,
        ...out,
        mindId: d.mindId,
        name: d.name,
        hasTelegram: detail.hasTelegram,
        isEnabled: detail.isEnabled,
        cognition,
        mindCount: minds.length,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: String(e) }));
  process.exit(1);
});
