import { describe, expect, it } from "vitest";

import { stripMindHtml } from "../src/lib/minds/parse";

describe("parse", () => {
  it("strips HTML wrappers from Mind replies", () => {
    const raw = "<p>{\"drafts\":[]}</p>";
    expect(stripMindHtml(raw)).toBe('{"drafts":[]}');
  });
});
