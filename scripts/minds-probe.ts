/**
 * Deep Mind probe — exercises unused Builder API surfaces.
 * Usage: npx tsx scripts/minds-probe.ts
 * Never prints API keys.
 */
import {
  createLiveMindsClient,
  getBuilderApiKey,
  resolveDirectorMind,
  conversationAlias,
} from "../src/lib/minds/runtime";

async function safe<T>(label: string, fn: () => Promise<T>): Promise<{ label: string; ok: true; data: T } | { label: string; ok: false; error: string }> {
  try {
    return { label, ok: true, data: await fn() };
  } catch (e) {
    return { label, ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function main() {
  if (!getBuilderApiKey()) {
    console.log(JSON.stringify({ ok: false, error: "no key" }, null, 2));
    process.exit(1);
  }
  const client = createLiveMindsClient();
  const director = await resolveDirectorMind(client);
  const mindId = director.mindId;
  const alias = conversationAlias("probe");

  const results = {
    ok: true as boolean,
    mindId,
    name: director.name,
    detail: await safe("getMind", () => client.getMind(mindId)),
    balance: await safe("getCognitionBalance", () => client.getCognitionBalance(mindId)),
    usage: await safe("getCognitionUsage", () =>
      client.getCognitionUsage(mindId, { interval: "1d" }),
    ),
    usageByTool: await safe("getCognitionUsageByTool", () =>
      client.getCognitionUsageByTool(mindId, { interval: "day" }),
    ),
    skills: await safe("listEquippedSkills", () => client.listEquippedSkills(mindId)),
    apps: await safe("listEquippedApps", () => client.listEquippedApps(mindId)),
    circle: await safe("getCircle", () => client.getCircle(mindId)),
    accountCircles: await safe("listCirclesForAccount", () => client.listCirclesForAccount()),
    conversations: await safe("listConversations", () => client.listConversations()),
    ensure: await safe("ensureConversation", () => client.ensureConversation(alias, mindId)),
    history: await safe("getHistory", async () => {
      await client.ensureConversation(alias, mindId);
      return client.getHistory(alias, { limit: 8 });
    }),
    bazaarApps: await safe("bazaar.listApps", () =>
      client.bazaar.listApps({ search: "telegram", pageSize: 5 }),
    ),
    bazaarSkills: await safe("bazaar.listSkills", () =>
      client.bazaar.listSkills({ search: "memory", pageSize: 5 }),
    ),
  };

  // Compact for stdout
  const compact = {
    ok: true,
    mindId,
    name: director.name,
    detail: results.detail.ok
      ? {
          hasTelegram: (results.detail.data as { hasTelegram?: boolean }).hasTelegram,
          isEnabled: (results.detail.data as { isEnabled?: boolean }).isEnabled,
          walletAddress: (results.detail.data as { walletAddress?: string }).walletAddress,
          model: (results.detail.data as { model?: string }).model,
          species: (results.detail.data as { species?: string }).species,
        }
      : results.detail,
    balance: results.balance.ok
      ? (results.balance.data as { cognition: number }).cognition
      : results.balance,
    usageBuckets: results.usage.ok
      ? ((results.usage.data as { items?: unknown[] }).items?.length ?? 0)
      : results.usage,
    tools: results.usageByTool.ok
      ? ((results.usageByTool.data as { summary?: Array<{ tool: string; callCount: number }> })
          .summary ?? [])
          .slice(0, 8)
          .map((t) => `${t.tool}:${t.callCount}`)
      : results.usageByTool,
    skills: results.skills.ok
      ? (results.skills.data as Array<{ name?: string; skillId: string }>).map(
          (s) => s.name ?? s.skillId,
        )
      : results.skills,
    apps: results.apps.ok
      ? (results.apps.data as Array<{ appName?: string; appId: string }>).map(
          (a) => a.appName ?? a.appId,
        )
      : results.apps,
    circleMembers: results.circle.ok
      ? (results.circle.data as Array<{ email?: string; name?: string; isSteward?: boolean }>).map(
          (m) => ({ email: m.email, name: m.name, steward: m.isSteward }),
        )
      : results.circle,
    accountCircleCount: results.accountCircles.ok
      ? (results.accountCircles.data as unknown[]).length
      : results.accountCircles,
    conversationCount: results.conversations.ok
      ? (results.conversations.data as unknown[]).length
      : results.conversations,
    historyRows: results.history.ok
      ? (results.history.data as Array<{ senderType?: number; messageText?: string }>).map((h) => ({
          senderType: h.senderType,
          text: (h.messageText ?? "").slice(0, 80),
        }))
      : results.history,
    bazaarTelegramApps: results.bazaarApps.ok
      ? {
          total: (results.bazaarApps.data as { totalCount: number }).totalCount,
          names: ((results.bazaarApps.data as { items: Array<{ appName: string }> }).items ?? []).map(
            (i) => i.appName,
          ),
        }
      : results.bazaarApps,
    bazaarMemorySkills: results.bazaarSkills.ok
      ? {
          total: (results.bazaarSkills.data as { totalCount: number }).totalCount,
          names: ((results.bazaarSkills.data as { items: Array<{ name: string }> }).items ?? []).map(
            (i) => i.name,
          ),
        }
      : results.bazaarSkills,
  };

  console.log(JSON.stringify(compact, null, 2));
}

main().catch((e) => {
  console.error(JSON.stringify({ ok: false, error: String(e) }));
  process.exit(1);
});
