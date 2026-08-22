/** Follow-up probe: histories + bazaar creator apps */
import {
  createLiveMindsClient,
  resolveDirectorMind,
} from "../src/lib/minds/runtime";

async function main() {
  const c = createLiveMindsClient();
  const d = await resolveDirectorMind(c);
  const mind = await c.getMind(d.mindId);
  const convos = await c.listConversations();
  const rows: unknown[] = [];
  for (const cv of convos.filter((x) => x.alias).slice(0, 8)) {
    try {
      const h = await c.getHistory(String(cv.alias), { limit: 4 });
      rows.push({
        alias: cv.alias,
        n: h.length,
        sample: h.map((r) => ({
          senderType: r.senderType,
          text: (r.messageText ?? "").slice(0, 70),
        })),
      });
    } catch (e) {
      rows.push({ alias: cv.alias, error: String(e).slice(0, 100) });
    }
  }
  const searches = ["transcribe", "youtube", "telegram", "notion", "slack"];
  const bazaar: Record<string, unknown> = {};
  for (const q of searches) {
    const apps = await c.bazaar.listApps({ search: q, pageSize: 6 });
    bazaar[q] = {
      total: apps.totalCount,
      items: apps.items.map((i) => ({
        id: i.appId,
        name: i.appName,
        tier: i.tier,
      })),
    };
  }
  console.log(
    JSON.stringify(
      {
        telegram: {
          hasTelegram: mind.hasTelegram,
          telegramBotId: mind.telegramBotId,
        },
        conversationCount: convos.length,
        histories: rows,
        bazaar,
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
