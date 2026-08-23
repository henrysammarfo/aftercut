/**
 * Probe atomize parse against live Director (no keys printed).
 * Usage: npx tsx scripts/minds-atomize-probe.ts
 */
import { atomizePrompt } from "../src/lib/minds/prompts";
import { parseAtomizeReply } from "../src/lib/minds/parse";
import { talkToDirector } from "../src/lib/minds/runtime";
import { emptyBrandKit } from "../src/lib/aftercut-data";

const LONG = `Last week we closed a 90-minute founder AMA on shipping multi-surface content without losing brand DNA. Three takeaways: (1) native hooks beat identical cross-posts; (2) human approve gate; (3) overnight follow-up with memory wins. Shorts under 90 chars; X one claim; LinkedIn lessons; newsletter subject as preview. Never promise guaranteed virality. CTA: reply with your long-form.`;

async function main() {
  const kit = {
    ...emptyBrandKit(),
    name: "Northline Studio",
    tone: "calm, sharp founder",
    doNotSay: ["overnight riches", "set and forget spam", "guaranteed virality"],
    ctas: ["Reply with your long-form"],
    examples: ["Ship the cut. Skip the fluff."],
  };
  const res = await talkToDirector({
    userId: `probe_${Date.now()}`,
    messageText: atomizePrompt({
      kit,
      title: "Founder AMA",
      source: "Transcript paste",
      text: LONG,
    }),
    timeoutMs: 180_000,
    channel: `atomize_${Date.now().toString(36)}`,
  });
  if (!res.ok) {
    console.log(JSON.stringify({ ok: false, error: res.error }));
    process.exit(1);
  }
  const excerpt = res.replyText.slice(0, 500);
  try {
    const parsed = parseAtomizeReply(res.replyText, {
      title: "Founder AMA",
      source: "Transcript paste",
    });
    console.log(
      JSON.stringify({
        ok: true,
        mindName: res.mindName,
        beatCount: parsed.beatCount,
        draftCount: parsed.drafts.length,
        platforms: parsed.drafts.map((d) => d.platform),
        excerpt,
      }),
    );
  } catch (e) {
    console.log(
      JSON.stringify({
        ok: false,
        parseError: String(e),
        excerpt,
        replyLen: res.replyText.length,
      }),
    );
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: String(e) }));
  process.exit(1);
});
