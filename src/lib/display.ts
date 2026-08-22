/** User-facing labels — hide internal agent/API names in the UI. */

const AGENT_LABELS: Record<string, string> = {
  "AFTERCUT Director": "Lead agent",
  HOOKsmith: "Hooks specialist",
  PLATFORMFIT: "Platform specialist",
  QC: "Quality check",
  Import: "Import",
  "Publish guard": "Publish guard",
};

export function agentLabel(agent: string): string {
  if (AGENT_LABELS[agent]) return AGENT_LABELS[agent];
  if (/director/i.test(agent)) return "Lead agent";
  if (/hook/i.test(agent)) return "Hooks specialist";
  if (/platform/i.test(agent)) return "Platform specialist";
  if (agent === "QC") return "Quality check";
  return agent.replace(/^AFTERCUT[.\s]*/i, "").trim() || agent;
}

export function mindLabel(name: string): string {
  const cleaned = name.replace(/^AFTERCUT[.\s]*/i, "").trim();
  return cleaned || "Your agent";
}

export function phaseLabel(day: string): string {
  if (day === "Day 0") return "Setup";
  if (day === "Day 1") return "Content";
  if (day === "Day 2") return "Follow-up";
  return day;
}

/** Cognition usage lines like `LLM_Turn:101` → plain English. */
export function formatToolUsage(line: string): string {
  const m = line.match(/^([^:]+):(\d+)$/);
  if (!m) return line;
  const tool = m[1]!;
  const count = m[2]!;
  if (tool === "LLM_Turn") return `${count} agent replies`;
  if (tool.startsWith("SKILL_")) return `${count} skill runs`;
  return `${tool.replace(/_/g, " ").toLowerCase()} · ${count}`;
}

/** Strip dev/API jargon from errors shown in the product UI. */
export function friendlyError(raw: string): string {
  const msg = raw.trim();
  if (!msg) return "Something went wrong. Try again.";
  if (/MINDS_BUILDER_API_KEY|missing.*key|not set/i.test(msg)) {
    return "Your agent is not connected yet. Check workspace settings or try again later.";
  }
  if (/Brand kit incomplete|Save your brand voice|brand voice first/i.test(msg)) {
    return "Save your brand voice before generating drafts.";
  }
  if (/JSON parse failed|unexpected format/i.test(msg)) {
    return "Your agent returned an unexpected response. Try generating again.";
  }
  if (/timed out|timeout/i.test(msg)) {
    return "Your agent took too long to respond. Try again in a moment.";
  }
  if (/Missing atomize|Missing userId|Missing payload/i.test(msg)) {
    return "Something went wrong. Refresh the page and try again.";
  }
  if (/Import content before|Queue an ingest/i.test(msg)) {
    return "Import content before generating drafts.";
  }
  return msg
    .replace(/\bSoul\b/gi, "brand voice")
    .replace(/\blive Mind\b/gi, "agent")
    .replace(/\bhellominds\b/gi, "agent service")
    .replace(/\bBuilder API\b/gi, "agent service")
    .replace(/\batomize\b/gi, "generate drafts");
}
