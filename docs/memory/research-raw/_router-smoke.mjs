import { readFileSync } from "node:fs";
import { liveChat, getAgentRouterKey } from "../../../src/lib/llm/agent-router.ts";

const e = readFileSync(".env.local", "utf8");
for (const k of [
  "AGENT_ROUTER_API_KEY",
  "ANTHROPIC_AUTH_TOKEN",
  "ANTHROPIC_API_KEY",
  "TAVILY_API_KEY",
  "TINYFISH_API_KEY",
]) {
  const hit = e.split(/\n/).find((l) => l.trim().startsWith(k + "="));
  console.log(k, hit ? "line-present" : "line-absent");
}
console.log("resolvedKey", getAgentRouterKey() ? "yes" : "no");
const r = await liveChat({ user: "Reply OK", family: "claude", maxTokens: 16 });
console.log(JSON.stringify(r).slice(0, 300));
