# ADR 0007 — LLM with structured output + Zod for order extraction

- **Status.** Proposed
- **Date.** 2026-05-03
- **Owner.** Souhail
- **Supersedes.** —

## Context

The internal console must extract line items from heterogeneous inputs:

- Pasted email body (free text, multiple languages, mixed FR/AR).
- Uploaded PDF (text-extractable at MVP; image-only PDFs deferred).
- Inbound email body + attachments via Postmark webhook.

Output schema needed per line: `rawText`, `qty`, `unit?`, `code?`, `note?`, plus a per-line confidence.

Constraints:

- Single developer. Cannot fine-tune or self-host.
- Provider-agnostic preferred (avoid lock-in).
- Privacy: prompts must contain only what is needed (no PII beyond order content).
- Cost-sensitive but not cost-blocked.

## Decision

We extract via a **frontier LLM (Claude or GPT) using structured output** validated by a **Zod schema**. Specifically:

- A thin server-side `extractor` adapter exposes `extract(input: string, ctx?: Context): Promise<ExtractionResult>`.
- The adapter targets **one provider at a time** (configurable). Default is Anthropic Claude; OpenAI is supported via a parallel adapter.
- The extraction result is `{lines: Line[], confidenceOverall: number, languageDetected: string, notes?: string}` with `Line = {rawText, qty, unit?, code?, note?, confidence}`.
- Zod validates the structured output. On parse failure: log to `extraction_jobs.status = 'failure'`, expose the raw input + a manual-entry fallback in the UI.
- Each call records: `model`, `prompt_version`, `input_chars`, `output_lines_count`, `latency_ms`, `cost_usd`, `raw_response` (jsonb) → `extraction_jobs`.

Prompting:

- One **system prompt** (versioned: `v1`, `v2`, ...) describing the output schema, examples (few-shot from real anonymized data), and the rule "do not invent products that are not present in the input".
- One **user prompt** with the raw input.
- Temperature: 0.
- Token budget: 2k input / 1k output at MVP (revisit if real PDFs blow this).
- **No catalog stuffed into the extractor prompt.** Extraction is "what did the customer write?", not "what does Prodet sell?". Matching is a separate step (see [ADR 0008](0008-product-matching-engine.md)).

PDF handling:

- Text-PDF: extract text server-side via `pdf-parse` (or `unpdf`) → feed to extractor.
- Image-PDF: detect (no extractable text), reject with "OCR not yet supported, please retype."

## Alternatives considered

- **Bespoke regex / heuristic parser.** Rejected — every customer's email/PDF format is different. The LLM exists precisely because the long tail kills heuristics.
- **Self-hosted small model (e.g. Llama 3.1 8B).** Tempting for cost/privacy. Rejected at MVP — operational burden disqualifies for solo dev. Re-evaluate at Phase 4 if cost or privacy becomes binding.
- **Multi-step LLM agent.** Rejected — over-engineered. A single structured-output call is sufficient for "parse this text into lines."
- **Function calling without Zod.** Rejected — Zod validation gives type-safe output and a clean failure mode.

## Consequences

- **Positive.**
  - Provider swap is a one-day project (same Zod schema, different adapter).
  - Type-safe outputs end-to-end.
  - Logged jobs enable replay, A/B testing prompts, and accuracy tracking.
  - Clean failure mode (manual entry).
- **Negative.**
  - Variable cost per extraction (~$0.001–0.01 each at MVP volumes).
  - Latency of frontier models (1–5s typical) — acceptable for an async-ish review queue.
  - Privacy: customer text leaves Tunisia for the LLM provider's region. Mitigated by zero-retention mode and minimal prompt content.
- **Neutral.**
  - Prompt versioning is required. Every prompt change increments `prompt_version`.
  - Extraction is decoupled from matching; both can evolve independently.

## Open questions

- Which provider as default — Claude or GPT? Decided by [Spike 2](../../06-spikes/spike-ai-extraction.md) on real Prodet emails.
- Whether to add optional auto-language detection in the prompt or as a separate Detect-Language pre-pass. Default: included in the same prompt; revisit if cost/quality demand.
- OCR provider for image PDFs (Phase 2). Candidates: Mistral OCR, Anthropic vision, Google Document AI. Decision deferred.

## References

- [system-overview.md](../system-overview.md)
- [adr/0008-product-matching-engine.md](0008-product-matching-engine.md)
- [../../06-spikes/spike-ai-extraction.md](../../06-spikes/spike-ai-extraction.md)
- [../../03-modules/order-intake/](../../03-modules/order-intake/)
