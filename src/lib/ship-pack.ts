/** Build CapCut / manual-post copy pack from Studio drafts. */

import { platformLabel, type Draft, type Platform } from "./aftercut-data";

const order: Platform[] = ["shorts", "x", "linkedin", "newsletter"];

export function buildShipPack(input: {
  brandName: string;
  drafts: Draft[];
  onlyStages?: Draft["stage"][];
}): string {
  const stages = input.onlyStages ?? ["needs-approve", "scheduled", "shipped"];
  const rows = input.drafts
    .filter((d) => stages.includes(d.stage) && d.stage !== "ingested")
    .sort((a, b) => order.indexOf(a.platform) - order.indexOf(b.platform));

  const lines = [
    `# AFTERCUT copy-pack — ${input.brandName || "untitled"}`,
    `# Generated ${new Date().toISOString()}`,
    `# Paste into CapCut / native apps. Publish leash: human posts only.`,
    "",
  ];

  if (rows.length === 0) {
    lines.push("(No drafts in approve/scheduled/shipped — atomize and approve first.)");
    return lines.join("\n");
  }

  for (const d of rows) {
    lines.push(`## ${platformLabel[d.platform]} · ${d.title}`);
    lines.push(`stage: ${d.stage} · agent: ${d.agent}${d.proactive ? " · proactive" : ""}`);
    lines.push("");
    lines.push(d.hook);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}
