# GOAI idea search — ROOT process

> **Pass:** 2026-08-14 · **LOCK 2026-08-14:** **T1 TOOLLAW**  
> Build in **new chat** + repo `C:\Users\jessi\Desktop\toollaw`. This aftercut/scoutbot chat = SCOUT / LOCKIN / AFTERCUT only.  
> **ROOT analog:** AFTERCUT did not rebuild Opus. GOAI must not rebuild AgentTeams demo #4 or handbook Direction 1.

## Tools this pass

| Tool | Result | Source |
|---|---|---|
| **Tavily** `api.tavily.com/search` | Pass 1 **432 quota**. Pass 2 **2026-08-14 ~19:00Z** — 8/8 HTTP 200, new gitignored key. | `research-raw/goai-tavily-pass2.json` |
| **TinyFish** `agent.tinyfish.ai` `X-API-Key` | **OK** scrape of goaihz.com, AgentTeams GitHub, hiclaw.io | `research-raw/goai-idea-search.json` |
| **Primary fetch** | Aliyun track article | https://developer.aliyun.com/article/1750732 |
| **WebSearch** | crowding + AgentTeams README/blogs | newsfile 306212 · AgentTeams repo |

CLAIM: Tavily citations now exist. VERIFIED: yes (pass 2). ACTION: facts below; Tavily *answers* can be sloppy — handbook still wins on MCP-vs-Skill.

---

## Locked constraints (verified)

- Track already on form: **Agent Infra**. Switching tracks now wastes the Aug 16 clock.
- AgentTeams (formerly Hiclaw) **required**. Skills **required**. ≥3 distinct roles. Prelim **Aug 16**. Semi **Sep 3** runnable AgentTeams. Top 15 **Sep 10**. Finals **Sep 22–23**.
- Judges score: scenario 25 · multi-agent loop 25 · **Skill engineering 25** · engineering/audit 20 · OSS 5.
- Aliyun (Yang Yi): not “smarter agent” — **governable, observable, evolvable production system**. Prefer a **small closed loop with evidence** over a fake big platform.
- AgentTeams already ships **six copy-paste demos**, including: software delivery, research report, content localization, **incident analysis (read-only, no prod write without human)**, long-running Team mode, **custom Skill distribution**.

---

## Kill list (Opus-class crowded)

Same move as AFTERCUT: if the official kit already demos it, do not submit it.

| Kill | Why |
|---|---|
| Handbook Dir 3 — software collab | AgentTeams **demo 1** (BE/FE/Test/Review) |
| Handbook Dir 2 — CS loop | Generic chatbot-adjacent; Boundless also eats this |
| Handbook Dir 1 — generic ITSM / zero-touch ops | AgentTeams **demo 4** + Aliyun’s own example (“alert → RCA → change → verify”) |
| **PROOFLOOP as written** | Demo 4 + Dir 1 with a trading-desk fixture. Lived scar is real; **idea shape is the default clone**. |
| Nacos+Higress+PolarDB+RocketMQ logo stack | Handbook: quantity not scored. Every Aliyun-native team will do this. |
| Single-runtime “Manager says, Workers chat” | That is the HiClaw quickstart, not infra. |

PROOFLOOP repo can stay as notes. It is **not** the lock.

---

## Crowded field (web, not Tavily)

2026 multi-agent production blogs cluster on **LangGraph + HITL + MCP SRE crews** (Monitor/Diagnose/Policy/Remediate). Example shape: `ashrane111/multi-agent-sre`. Submitting that plot on AgentTeams is still the same plot.

AgentTeams’ actual unused surface (TinyFish + GitHub):

- **CRDs:** Worker / Team / Human / Manager reconcile (`agentteams.io/v1beta1`)
- **Human L1/L2/L3** permission tiers
- **Three Worker families in one room:** OpenClaw, QwenPaw, Hermes
- **Higress MCP:** OSS = **server-level** ACL; **tool-level** ACL called out as Enterprise (HiClaw 1.0.6 blog)
- Skills.sh + Manager Skill distribution (demo 6 is the shallow version)

---

## Scorecard (Henry: complex + tight clocks)

Scale 1–5. **Demo** = filmable Sep 3 loop, not a 40-slide OS.

| ID | Idea | Complex | Tight demo | Uncrowded | Skill 25% | Audit 20% | Scenario 25% | Total |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| **T1 TOOLLAW** | Compile a **tool-level allowlist** on Higress OSS. Policy Worker writes contracts; Gateway Auditor proves forbidden MCP/Skill cannot fire; Red-team Worker attacks. Close the OSS gap their own blog admits. | 5 | 4 | 5 | 5 | 5 | 4 | **28** |
| **T2 HANDSHAKE** | One Team, **three runtimes** (QwenPaw / OpenClaw / Hermes), **typed context schema** + contract tests on every handoff. Most teams will use one runtime. | 5 | 3 | 4 | 4 | 4 | 3 | **23** |
| **T3 SKILLCI** | Skill as a product: schema, golden I/O, version, rollback, Manager attach → Worker discover → run → fail closed. Deeper than demo 6. | 4 | 5 | 4 | 5 | 3 | 3 | **24** |
| **T4 INCIDENT-CR** | Production incidents as **CRs** (reconcile like Worker/Team), not a chat runbook. Dual-fleet isolation as **fixture**, not the product. | 5 | 3 | 3 | 3 | 5 | 4 | **23** |
| T5 FinOps LLM spend loop | Real, but FinOps agents are a 2026 blog genre. | 3 | 4 | 2 | 3 | 3 | 3 | 18 |
| T6 Handbook finance claims | Domain we do not live; fake compliance. | 4 | 2 | 2 | 3 | 4 | 2 | 17 |
| ~~PROOFLOOP chat SRE~~ | Kill | 3 | 4 | 1 | 3 | 4 | 3 | 18 |

---

## What each shortlist actually is (one sentence)

**T1 TOOLLAW** — Agent Infra for *tools*: Skills that compile “who may call which tool with which args,” then a red-team Worker must fail in the Matrix room with evidence.

**T2 HANDSHAKE** — Agent Infra for *runtimes*: prove mixed OpenClaw/QwenPaw/Hermes can pass a typed incident object without dumping 20k tokens of chat.

**T3 SKILLCI** — Agent Infra for *Skills themselves*: CI + version + rollback so Skills are not one-off agent behaviors (exactly what the 25% rubric asks).

**T4 INCIDENT-CR** — Agent Infra for *control plane*: incident YAML reconciles to rooms, Skills, and BLOCK/ALLOW the same way HiClaw reconciles Workers.

Lived SCOUT/LOCKIN halt/redeem/env-mix goes in as **fixtures** for T1 or T4. It is evidence, not the pitch.

---

## Tight-deadline plan (same for any lock)

| Clock | Bar |
|---|---|
| **Aug 16** | 500-char intro + PDF that maps AgentTeams (roles, decompose, context, execute, state) + Skill list + one fixture |
| **Aug 24** | Top 30 on completeness + scenario, not code |
| **Sep 3** | One filmed Matrix loop: attack or handoff **fails closed**, then ALLOW path, evidence zip |
| **Sep 22** | Hangzhou: that same loop live, not a new product |

Aliyun: a small evidenced loop beats a fake platform. Matches “complex mechanism, tiny demo.”

---

## Honest

Cannot guarantee Top 15. This pass **does** use the ROOT process: research → crowded kill → scorecard → **you pick**. I will not lock T1–T4 until you say which.

## Tavily pass 2 (2026-08-14) — what changed the scorecard

| CLAIM | VERIFIED | SOURCES | ACTION |
|---|---|---|---|
| Prelim Aug 16 · finals Sep 22–23 · Grand 1M RMB · pool 5M | yes | Tavily + [newsfile 306212](https://www.newsfilecorp.com/release/306212/GOAI-Global-OpenSource-AI-Challenge-Four-Tracks-Officially-Launched) · [goaihz.com/en](https://www.goaihz.com/en) | clocks unchanged |
| AgentTeams is K8s-native; Skills registry / MCP / Human CRs | partial | [AgentTeams GitHub](https://github.com/agentscope-ai/AgentTeams) · Tavily answer wrongly said “MCP skill required” — **handbook: Skill mandatory, MCP recommended** | do not copy Tavily answer blindly |
| LangGraph/CrewAI/AutoGen is the default 2026 multi-agent blog stack | yes | [AY Automate](https://www.ayautomate.com/blog/best-multi-agent-frameworks) · [Pickaxe](https://pickaxe.co/post/crewai-vs-langgraph-vs-autogen) | kill “LangGraph SRE crew ported to AgentTeams” |
| Aliyun Agent Infra product line is AgentRun / AgentTeams / AgentLoop / STAROps | yes | [Alibaba Agent Infra blog](https://www.alibabacloud.com/blog/what-does-alibaba-clouds-agent-infra-look-like_603177) · LinkedIn Agent chaos post | wrapping their own four logos is crowded |
| Nacos 3.x AI Registry already wants to own Skills/MCP/Prompts | yes | [nacos.io overview](https://nacos.io/en/docs/next/overview) · skill-governance blog titles in Tavily | **T3 must not be “we installed Nacos”** — contract tests + fail-closed distribute |
| OTel GenAI traces exist; **enforcement / approval is a separate layer** | yes | [MintMCP OTel](https://www.mintmcp.com/blog/opentelemetry-ai-agents) · [KLA audit buyer guide](https://kla.digital/blog/ai-agent-audit-software-requirements-vendor-categories) (Phoenix = traces, not approval) | dashboard-only AgentLoop clone is weak; **T1 still has the missing control** |
| High-risk tools need human gate + blast-radius isolation | yes | [LoginRadius blast radius](https://www.loginradius.com/blog/engineering/limiting-data-exposure-and-blast-radius-for-ai-agents) · [Openlayer](https://www.openlayer.com/blog/multi-agent-system-architecture-guide) · [OWASP agentic ASI02 tool misuse](https://cycode.com/blog/owasp-top-10-agentic-applications) | T1/T4 fixtures; still not a unique *product* if we only HITL-chat |
| Skill SemVer / contract / testing is an open gap | yes | [agentskills discussion #415](https://github.com/agentskills/agentskills/discussions/415) · Spring AI “no built-in skill versioning” | **T3 still strong** |
| Higress OSS vs tool-level ACL | **partial** | Tavily answer: tool-level **not clearly documented** in retrieved hits. [Lunar MCP gateway guide](https://www.lunar.dev/post/the-best-open-source-mcp-gateways-in-2026) asks server vs tool vs **parameter** ACL as the real question. [Cerbos](https://www.cerbos.dev/blog/mcp-permissions-securing-ai-agent-access-to-tools) = all-or-nothing MCP tokens. HiClaw 1.0.6 blog (TinyFish/GitHub) still the best source for OSS server-level vs Enterprise tool-level | **T1 still #1**; do not claim Tavily proved the Enterprise split |

Scorecard **unchanged**: T1 TOOLLAW > T3 SKILLCI > T2 HANDSHAKE ≈ T4 INCIDENT-CR. Tavily made T1/T3 *more* justified, not a new winner.

If Tavily quota is raised, re-run `goai-tavily-pass2.mjs` and append citations.
