import { describe, expect, it } from "vitest";

import { agentLabel, formatToolUsage, friendlyError } from "../src/lib/display";

describe("display", () => {
  it("maps internal agent names", () => {
    expect(agentLabel("HOOKsmith")).toBe("Hooks specialist");
    expect(agentLabel("AFTERCUT Director")).toBe("Lead agent");
  });

  it("formats cognition usage", () => {
    expect(formatToolUsage("LLM_Turn:101")).toBe("101 agent replies");
  });

  it("strips API jargon from errors", () => {
    expect(friendlyError("MINDS_BUILDER_API_KEY not set")).toMatch(/not connected/i);
  });
});
