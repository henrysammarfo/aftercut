import { describe, expect, it } from "vitest";

import {
  looksLikeJsonRefusal,
  parseAtomizeReplyFlexible,
  parseProseAtomizeReply,
  stripMindHtml,
} from "../src/lib/minds/parse";
import { atomizePrompt } from "../src/lib/minds/prompts";

describe("parse", () => {
  it("strips HTML wrappers from Mind replies", () => {
    const raw = "<p>{\"drafts\":[]}</p>";
    expect(stripMindHtml(raw)).toBe('{"drafts":[]}');
  });

  it("flags wrapper refusals without treating real JSON as a refusal", () => {
    expect(
      looksLikeJsonRefusal("I cannot output a JSON wrapper after the same template again."),
    ).toBe(true);
    expect(
      looksLikeJsonRefusal('{"drafts":[{"hook":"Ship the cut","platform":"x"}]}'),
    ).toBe(false);
  });

  it("parses labeled prose cuts when JSON is skipped", () => {
    const parsed = parseProseAtomizeReply(
      `Shorts: Wait — native hooks beat copy-paste.\nX: One claim: approve the cut.\nLinkedIn: Lesson: memory is the editor.\nNewsletter: This week: dump the VOD, wake to drafts.`,
      { title: "AMA", source: "paste" },
    );
    expect(parsed.drafts.length).toBe(4);
    expect(parsed.drafts.map((d) => d.platform)).toEqual(["shorts", "x", "linkedin", "newsletter"]);
  });

  it("still parses fenced JSON", () => {
    const parsed = parseAtomizeReplyFlexible(
      '```json\n{"beatCount":1,"drafts":[{"title":"X cut","platform":"x","stage":"needs-approve","hook":"Ship the cut tonight.","agent":"HOOKsmith"}]}\n```',
      { title: "AMA", source: "paste" },
    );
    expect(parsed.drafts[0]?.hook).toMatch(/Ship the cut/);
  });
});

describe("atomize prompt", () => {
  it("does not demand JSON-only and tags a unique job", () => {
    const text = atomizePrompt({
      kit: {
        name: "Northline",
        tone: "calm sharp founder",
        examples: ["", "", ""],
        ctas: [],
        doNotSay: [],
      },
      title: "AMA",
      source: "paste",
      text: "Last week we closed a 90-minute founder AMA on shipping multi-surface content.",
      runId: "ingest-test1",
    });
    expect(text).toMatch(/cut job ingest-test1/);
    expect(text).not.toMatch(/ONLY one JSON object/);
    expect(text).toMatch(/labeled lines/);
    expect(text).toMatch(/BRAND EVIDENCE/);
    expect(text).toMatch(/ANTI-HALLUCINATION/);
  });
});
