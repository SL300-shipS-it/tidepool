---
name: intake
description: Process change requests from the Build Log doc Inbox (or pasted by Leon), route each to the right subagent, review, verify, and update the doc. Use when Leon says "intake", "process the inbox", or pastes CR blocks.
---
# Intake

Build Log doc: https://claude.ai/code/artifact/960f56ce-520a-467d-8ae6-7fcd51375cf2
(doc id `960f56ce-520a-467d-8ae6-7fcd51375cf2`). Use the docs tools: read the outline, then view
only the Inbox section. Load the docs skill first if the docs tools need it.

1. **Collect**: list every CR in the Inbox (plus any Leon pasted). If the Inbox is empty, say so and stop.
2. **Triage**: for each CR, show Leon a one-line plan: `CR-### → agent(s) — what changes`.
   - Conflicts with the doc's Locked decisions, or CRs that are unclear: don't build; ask Leon.
   - After Oct 9 (freeze): only `story` CRs proceed unless Leon says "override".
3. **Route** (independent CRs in parallel, dependent ones in order):
   | Type | Agent |
   | --- | --- |
   | story | story-writer, then story-reviewer |
   | character | art (then story-writer if scenes should use the new art) |
   | ui | ui |
   | engine | engine (then story-writer for the example/content) |
   | audio | audio |
   | assets | run `tools/optimize_photos.sh`, then story-writer to reference the photos |
   | badges | engine or story-writer; never `gen_tokens.py --force` after stickers are printed |
   Give each agent the CR text verbatim plus any context it needs. If an agent reports "needs X
   work", route X first, then rerun it.
4. **Review**: send story-reviewer's findings back to story-writer and fix them. Skip only trivial nits.
5. **Verify**: run the qa agent, then /playtest (silent; the browser pane). Fix blockers by routing
   them back to the owning agent. Max 2 fix rounds, then escalate to Leon.
6. **Commit** (one commit per CR, message `CR-###: <title>`). Don't deploy unless Leon asked. Offer /deploy.
7. **Update the doc**: move each finished CR to the Done log (newest first: date · CR-### title ·
   one-line outcome) and remove it from the Inbox. Leave blocked CRs in the Inbox with a comment.
8. **Report** to Leon: done / blocked / needs-a-decision, in a few lines.
