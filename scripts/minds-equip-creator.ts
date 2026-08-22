/** Equip creator Bazaar apps on AFTERCUT Director — one-shot. */
import {
  createLiveMindsClient,
  resolveDirectorMind,
} from "../src/lib/minds/runtime";

const IDS = [
  "4665473e-f36b-1410-8464-00039ce7df11", // VoiceTranscribe
  "cc66d91f-902d-f111-ad1d-0ea9a5017e89", // YouTube Research Scout
];

async function main() {
  const client = createLiveMindsClient();
  const d = await resolveDirectorMind(client);
  const before = await client.listEquippedApps(d.mindId);
  const result = await client.equipApps(d.mindId, { ids: IDS });
  const after = await client.listEquippedApps(d.mindId);
  console.log(
    JSON.stringify(
      {
        ok: true,
        mindId: d.mindId,
        before: before.map((a) => a.appName ?? a.appId),
        results: result.results,
        after: after.map((a) => a.appName ?? a.appId),
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
