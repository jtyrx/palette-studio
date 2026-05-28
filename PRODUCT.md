# Product

## Register

product

---

## Prologue — Read this first

Hold a single color token in your mind for a moment. Something like `bg-primary-default-hover`.

It looks like nothing. A string. A few words stapled together with hyphens. And yet consider what is actually happening when that string exists: a designer in Figma, a developer in a code editor, and — now — an AI agent reading a manifest can all hold the *exact same idea* in mind at the same time. Not an approximation. The same idea. The hover background of the primary surface. No translation loss. No "which blue did you mean." No drift.

That is not a small thing. That is a shared unit of meaning passing intact between a human mind and a machine. It is, quietly, one of the most interesting interfaces we have ever built — and almost nobody talks about it that way.

This document is about taking it seriously.

Palette Studio is a color studio, a semantic token editor, a component refinement surface, and a block generation system. But underneath all of that, it is an argument: **that the language of a design system is becoming the language through which humans and machines collaborate** — and that getting that language right is now a craft with real gravity behind it.

What follows is written to be three things at once. A working brief for the people and agents who build this product. A walkable artifact for anyone evaluating the thinking behind it. And, honestly, a small master class in why design system language matters more in 2026 than it did when we were only talking to each other.

---

## The conviction

For most of design's history, a design system was a peace treaty between humans. It existed to stop two designers from inventing two different blues, to stop a developer from guessing at a hex code, to keep a hundred screens feeling like one product. The shared vocabulary — the tokens, the roles, the semantic names — was the mechanism that let a *team* think with one mind.

That was always valuable. What changed is the size of the team.

When you ask an agent to "make the hero use `display-lg` on a `surface-raised` background," you are not writing code and you are not drawing. You are *speaking the system's language* — and the system's language is precisely what makes the agent's output predictable, reviewable, and yours. Strip the language away and the agent is guessing. Keep it rigorous and the agent becomes a genuine collaborator, because you and it are reaching for the same nouns.

This is the whole thesis, stated plainly: **a design system's vocabulary is the protocol between human intent and machine execution.** The better the protocol, the less is lost in the handoff. A token named for its *purpose* (`text-alert-subtle`) rather than its *value* (`red-400`) is not pedantry — it is the difference between an instruction a machine can honor and a color a machine can only copy. Purpose travels. Values rot.

So when this product is rigorous about naming, layering, and intent, it is not performing craft for its own sake. It is building the connective tissue between three kinds of reader — the designer, the developer, and the agent — and treating that tissue as the actual product.

> Everything below is downstream of this conviction. If a decision in the system can't be explained to all three readers in the same words, it isn't finished.

---

## Who this is for

Three audiences read this product. The first two are human. The third is increasingly not.

**The makers.** Designers and frontend developers who build design systems — people who need perceptually uniform, accessible palettes generated in OKLCH/LCH space, targeting Display-P3 with sRGB fallback. They think in gamut, in contrast (APCA and WCAG), in token architecture. They do not want a color picker. They want an instrument that already understands what they understand, so the tool can meet them at their ceiling instead of their floor.

**The evaluators.** Portfolio visitors judging technical and design craft — hiring teams, clients, peers. For them, the interface *is* the proof. Every token decision, every component boundary, every naming convention is meant to be walkable and defensible. Nothing here should require a footnote that says "trust me." The reasoning should be visible in the surface.

**The agents.** This is the new one, and the reason the document is shaped the way it is. AI collaborators read the same vocabulary the humans do. When the language is clean, an agent can extend the system without breaking it; when the language leaks values or intent, the agent inherits the mess. Designing *for* the agent — clear roles, semantic names, defensible structure — turns out to be identical to designing well for humans. That is not a coincidence. It is the point.

**Context:** used at a desktop. Focused. Intentional. This is not a quick color grab between meetings. It is a deliberate workspace session — the posture of someone calibrating an instrument, not someone picking a paint chip.

---

## What Palette Studio is

It generates perceptually uniform, accessible palettes in LCH/OKLCH color space, with Display-P3 as the *default* gamut and sRGB as the fallback — not the other way around. The full wide-gamut pipeline, from palette construction through export, should feel scientifically precise and visually premium. Color is the entry point. It is not the whole product.

Around color sits the rest: a semantic token editor where meaning is assigned to value; a component refinement surface where tokens prove themselves against real UI; a block generation system where the language assembles itself into shippable structure.

Here is what success looks like, stated as an outcome rather than a feature list:

- A maker can build a **production-ready token system in a single session** — and hand it to a teammate or an agent without a glossary.
- An evaluator can **trace any architectural decision back to its reason** and understand the thinking, not just the result.
- An agent can **read the exported system and extend it correctly**, because the names carry intent the machine can act on.

If all three are true, the product has done its job.

---

## Color as emotion

Here is something we forgot for about thirty years.

The human eye perceives a vastly wider range of color than the screens we built for it. For decades, sRGB was the box of crayons every display agreed to share — a sensible, safe, *small* box. Anything richer simply didn't survive the trip to the screen. We adapted. We forgot there was more.

Display-P3 hands some of it back. The reds go deeper. The greens go electric. There are colors in P3 that *cannot exist* in sRGB — and on a capable display, they don't look "more saturated," they look **lit from within.** That difference is not technical trivia. It is emotional bandwidth. Saturation and luminance the old gamut couldn't reach are exactly where a palette stops informing and starts *feeling* — where a success state reads as relief, a warning as genuine alertness, a brand hue as a held breath.

So in this product, wide-gamut is a feeling, not a spec line. Colors achievable only in P3 should look unmistakably richer where the hardware allows it — and degrade honestly, never embarrassingly, to sRGB where it doesn't.

But emotion without structure is just noise, so the color language is layered with the same discipline as everything else:

- **Base palette** — the raw hues, neutrals, and tint/shade ramps. The crayons.
- **Semantic layer** — value bound to meaning. `error`, `success`, `info`, `brand`. A red stops being a red and becomes *the designated alert*.
- **Contextual / usage layer** — where the meaning lands. `bg-error-subtle`, `border-alert-strong`, `text-muted`. Each name answers not just "what color" but "what for, and where."

And the naming follows one grammar, end to end: **`category-intent-variant-state`**. `bg-secondary-default-hover` decomposes cleanly — background, secondary intent, default variant, hover state — for a human *and* for the machine that has to honor it. This is the infrastructure that lets the system scale without a meeting every time someone needs a new state.

> Color carries the emotion. Naming carries the meaning. The product refuses to let either one travel without the other.

---

## Typography as hierarchy, space, and contrast

If color is how a surface *feels*, typography is how attention *moves* through it. And attention is the scarcest thing any interface spends.

Most type systems fail not because the fonts are ugly but because there is no logic chain underneath them — just a folder of pretty styles and a standing argument about one-pixel differences. The fix is architectural, and it is the same shape as everything else in this product: a stack of layers where each one has a single job and a change made once ripples everywhere.

- **Scale** — the spine. Proportions and rhythm, built on a stable ratio, before any role or style exists. It defines relationships, not screens.
- **Primitive tokens** — neutral building blocks. Family, weight, size, line-height, letter-spacing. They know *what is permitted*; they do not know what anything is *for*.
- **Text roles** — where meaning arrives. **Display** for the rare, expressive moment that grabs the room. **Headline** and **Title** for structure. **Body** for the honest work of reading. **Label** and **Caption** to orient and clarify. **Mono** for data and code, where character predictability is the whole point. A role can be explained *without naming a single pixel* — that is the test of whether it's a real role or a hardcoded style wearing a costume.
- **Semantic tokens** — roles translated into reusable values, still independent of any component.
- **Text styles** — the boring, final layer the team and the agent actually touch. They hold no values of their own; they bundle semantic tokens into a ready-to-use combination. The moment a style starts storing its own numbers, it stops being a style and becomes a new source of drift.

What this buys, in human terms:

**Hierarchy is how a surface tells you where to look.** The leap from Display to Body is the difference between a shout and a confidence — and that contrast is doing structural work, not decorative work.

**Space is not emptiness; it is structure.** The rhythm of the scale, the line-height that follows size instead of fighting it, the air around a heading — these are how a dense surface stays *legible* instead of merely *full*. This product is dense by intent. Typography is what keeps dense from curdling into cluttered.

**Contrast creates the room.** You don't make a surface feel spacious by adding margin. You make it feel spacious by making the hierarchy unambiguous, so the eye never has to work to find the next thing.

> Change the scale, swap the font, adjust the density — and if the architecture is right, the whole system updates predictably, with no manual edits and no debate. That predictability is the same gift the agent needs to extend the system safely. Humans and machines want the exact same thing from typography: a structure they can trust.

---

## Brand personality

Precise. Deliberate. Showcase-ready.

**Voice:** expert confidence without arrogance. The tool knows what it's doing and doesn't narrate itself. It has earned its opinions, so it doesn't apologize for them.

**Tone:** dense and information-rich, not terse. Every surface rewards attention. Richness is a feature; the reward for looking closer is *more*, not noise.

**Emotional goal:** the feeling of using a well-calibrated instrument. Not a friendly toy, not a sterile utility — a precision tool that respects the person holding it.

A note on storytelling, since it's why this document reads the way it does: people don't remember specifications, they remember *reasons*. A token system explained as a list is forgotten by the next standup. The same system explained as *why each decision had to be that way* becomes something a person — or an agent — can reconstruct from first principles. Storytelling is not decoration on top of the craft. It is how the craft survives contact with another mind. That is true whether the next mind is a teammate, a hiring manager, or a model.

---

## Anti-references

What this is **not**, stated so the boundary is unambiguous for every reader:

- **Not a Figma clone.** No floating panels, no endless sidebars, no detached tool palettes. One focused surface.
- **Not Coolors or a generic picker.** No pastel card grids, no swatch-row slot machines, no "pick a color" energy. This is serious tooling.
- **Not minimal to the point of sterile.** Stripped-back enough to read as unfinished is its own failure. Visible opinion and craft throughout.
- **Not a SaaS landing page.** No hero metrics, no gradient text, no glassmorphism. This is an instrument, not a pitch.

---

## Design principles

1. **Practice what you preach.** The color system used to build this UI is held to the same standard as the one the tool generates. Every token is defensible; nothing is hardcoded. A tool that builds rigorous systems out of a sloppy one is lying about what it sells.

2. **Dense is not cluttered.** Information richness is the feature — the Stripe / Vercel / Sanity register: opinionated, refined, data-forward. The work is packing meaning into every surface *without noise*. Typography and space do that work.

3. **The process is the artifact.** Token naming, component boundaries, state shape — all of it is meant to be walked by a hiring team and read by an agent. Code and design reinforce each other; the reasoning is part of the deliverable, not a separate doc nobody opens.

4. **Wide-gamut first.** Display-P3 is the default, not the fallback. The visual experience should reflect the full gamut the tool exposes — colors beyond sRGB should look unmistakably richer on capable hardware, and degrade with honesty where they can't.

5. **Single surface, full depth.** No panels, no modes, no navigation. Everything available, nothing buried. Depth comes through interaction, not through pages.

6. **Speak so all three readers understand.** Every name, role, and token should mean the same thing to a designer, a developer, and an agent. If a decision can't be explained to all three in the same words, it isn't done. This is the principle the other five report to.

---

## Accessibility & inclusion

This is not a compliance appendix. It is the most human-centered part of the document, because it is the part that decides who gets to use the thing at all.

- **WCAG 2.1 AA** is the floor. **APCA** (the WCAG 3 draft contrast model) is used as the primary contrast metric throughout the tool itself — the product holds itself to the metric it preaches.
- **No meaning carried by color alone.** Gamut badges and state signals pair color with text labels, so the information survives for anyone who doesn't parse hue the way the designer assumed.
- **The core workflow is keyboard-navigable.** Focus states are obvious, not a barely-visible outline a keyboard user has to hunt for.
- **Reduced motion is respected.** Animations and transitions honor `prefers-reduced-motion`. Motion is used for hierarchy and attention, never as decoration that someone has to endure.

Accessibility, done right, is the same move as everything else in this document: it refuses to let an experience depend on an assumption about who is on the other side of the screen. That refusal — designing for the person you didn't picture — is the most honest definition of human-centered work there is.

---

## Coda

Start where we started. A token. A string. A few words stapled together with hyphens.

We are at a strange and genuinely exciting moment, where the small careful languages we built to keep our own teams aligned are quietly becoming the languages we use to think *alongside machines*. The discipline that once kept two designers from inventing two blues now keeps a human and an agent reaching for the same idea. The craft didn't change. The stakes did.

Build this product as if the vocabulary is the point — because it is. The color is the entry. The language is the legacy.