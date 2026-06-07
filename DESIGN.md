---
name: Lorcana Lore Tracker
description: Real-time competitive lore score tracker for Lorcana card game sessions.
colors:
  ink-deep: "#0d0a1a"
  ink-dark: "#16102b"
  ink-mid: "#241a40"
  ink-border: "#3a2a60"
  gold: "#d4a42a"
  gold-bright: "#f0c040"
  gold-muted: "#6e5214"
  gold-bg: "#1f1508"
  star-white: "#ede8ff"
  star-silver: "#9d91c0"
  star-dim: "#5a4f78"
  ambient: "#4a2c8a"
  error: "#e05070"
typography:
  display:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "clamp(1.5rem, 5vw, 2.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.15em"
  score:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(4.5rem, 22vw, 9rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.1em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  2xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.gold-bright}"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.gold}"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
  button-score-increment:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.lg}"
    width: "112px"
    height: "80px"
  button-score-decrement:
    backgroundColor: "{colors.ink-mid}"
    textColor: "{colors.star-silver}"
    rounded: "{rounded.lg}"
    width: "112px"
    height: "80px"
  input-game-code:
    backgroundColor: "{colors.ink-mid}"
    textColor: "{colors.star-white}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
  card-player:
    backgroundColor: "{colors.ink-dark}"
    textColor: "{colors.star-white}"
    rounded: "{rounded.2xl}"
    padding: "24px"
  chip-badge:
    backgroundColor: "transparent"
    textColor: "{colors.gold}"
    rounded: "9999px"
    padding: "2px 12px"
---

# Design System: Lorcana Lore Tracker

## 1. Overview

**Creative North Star: "The Enchanted Ledger"**

This is a record-keeper's instrument from inside the Lorcana world. Every design decision stems from a single premise: a player should be able to glance at the screen mid-game, read the scores immediately, and look away. The darkness is not atmosphere for its own sake; it is the condition under which this app is actually used: dim rooms, card-game tables, ambient light from above. Gold on void is the highest-contrast pairing available, and that is why it is the only pairing that matters here.

The design rejects warmth, friendliness, and decoration. There are no gradients for pleasure, no rounded-corner cuteness, no animation that doesn't mark a meaningful event. The interface earns the word "enchanted" through restraint, not through effect: the score numerals float in darkness, massive and immediate, and the controls are exactly large enough to hit without looking. Everything else disappears.

The "Void and Flame" palette character is the emotional spine. The ink palette is cold and deep, purple-shifted rather than warm-black. Gold cuts through it like fire; it is not an accent but a primary signal — every time it appears it means "this matters." The system holds this polarity without compromise.

**Key Characteristics:**
- Scores dominate at all breakpoints; layout subordinates everything else to the numeral
- Single accent color (gold) used exclusively for primary actions and winner states
- Typography pairing: Cinzel (display/ceremonial) + Geist (UI/data); never mixed within a functional element
- Elevation through glow and shadow, not raised surfaces or blur
- Motion marks state, not decoration; 200ms maximum on all transitions
- Tap targets are oversized for own-card controls, recognizing the use context (glancing, distracted)

## 2. Colors: The Void and Flame Palette

The palette is a polarity. Deep cold void; single flame accent. No warmth, no third hue.

### Primary
- **Void Flame** (`#d4a42a` / oklch(70% 0.14 85)): The only saturated color in the system. Used exclusively for the primary increment button, winner-state borders, the game title glyph, and the active focus ring. Its rarity is the point. If it appears somewhere new, a previous use should be reconsidered.
- **Bright Flame** (`#f0c040` / oklch(82% 0.13 85)): Hover state for gold elements only. Never used at rest.

### Secondary
- **Gold Muted** (`#6e5214`): Decorative dividers, separator lines, the background of gold-wash surfaces. Never used for text.
- **Gold Bg** (`#1f1508`): Deep amber shadow used behind gold-glowing elements.

### Neutral
- **Void Deep** (`#0d0a1a`): The body background. Nearly black, faint purple undertone. Not warm. Rendered as a radial gradient that lightens slightly toward center (`ink-dark` at center, `ink-deep` at edges) to prevent the screen from reading as flat.
- **Void Dark** (`#16102b`): Card and panel surface. One step lighter than the body; the distinction is enough to define hierarchy without using shadows.
- **Void Mid** (`#241a40`): Raised elements — secondary buttons, input backgrounds, chips, dividers.
- **Void Border** (`#3a2a60`): All border values. Not visible as a contrast separator on hover; it marks boundary, not hierarchy.
- **Ambient** (`oklch(38.1% 0.176 305)` / approx `#4a2c8a`): The ambient purple glow. Used exclusively as a large blurred radial on the body background. Not a surface color; not used on any interactive element.
- **Star White** (`#ede8ff`): Primary text. Not pure white; carries a faint violet undertone that aligns with the ink palette. Contrast on `ink-dark` exceeds 12:1.
- **Star Silver** (`#9d91c0`): Secondary text, muted labels, placeholder text. Contrast on `ink-dark` is approximately 5.5:1 — passes AA.
- **Star Dim** (`#5a4f78`): Decorative text only. Micro-labels, "or" dividers, tertiary affordances. Does not pass AA for body text; only permitted at 14px+ bold labels where the ≥3:1 threshold applies.
- **Error** (`#e05070`): Destructive states, validation errors. Contrast on `ink-dark` passes AA.

### Named Rules
**The One Flame Rule.** Gold (`#d4a42a`) appears on ≤15% of any screen surface. Its high chroma is its signal value; saturation everywhere is signal nowhere. If a design iteration adds gold to a new element, an existing gold use should be removed or dimmed.

**The Cold Void Rule.** Background surfaces are never warm. No amber, cream, or brown tones in the neutral ramp. The only warmth in the palette is gold; the contrast between cold dark and warm gold is the entire emotional register.

## 3. Typography

**Display Font:** Cinzel (400, 600, 700) with Georgia, serif fallback
**Body/UI Font:** Geist Sans with system-ui, sans-serif fallback
**Mono Font:** Geist Mono (available; used sparingly for game codes)

**Character:** Cinzel is a Roman-inscribed serif: stately, precise, carved rather than printed. It carries the Lorcana world register — it appears only on titles and the game heading, never on UI labels, buttons, or data. Geist is the counterpart: a modern neutral sans that disappears behind the data it displays. The pairing works because it is never competing: Cinzel owns ceremony, Geist owns function.

### Hierarchy
- **Display** (700, clamp(1.5rem → 2.5rem), leading 1.1, tracking 0.15em, uppercase): Game title "Lorcana Lore Tracker" only. The tracking is wide because Cinzel at large sizes needs optical room between its monumental letterforms.
- **Score** (800, clamp(4.5rem 22vw → 9rem), leading 1, tracking -0.02em): The score numeral. Uses Geist, not Cinzel. The score must read as data, not as decoration; a serif score would look ornate, not competitive.
- **Headline** (600, 1.125rem, leading 1.25): Player names inside cards. Medium weight Geist; needs to be distinct from body but not shout.
- **Body** (400, 1rem, leading 1.5): Instruction text, status messages, lobby copy. Max 65ch.
- **Label** (700, 0.75rem, tracking 0.1em, uppercase): Badge text ("HOST"), control affordance labels ("DELEGATE TO"). Short uppercase is permitted here because these are ≤2-word identifiers, not sentences.

### Named Rules
**The Cinzel Quarantine Rule.** Cinzel is the game-world font. Geist is the UI font. They must not appear in the same functional element. A player name is Geist; the game title is Cinzel. A score is Geist; a decorative section marker could be Cinzel. If the two fonts appear inside the same interactive component, one is wrong.

**The Score Primacy Rule.** The score numeral is the largest typographic element on the game screen at all times. No heading, badge, or label may visually compete with it. If a new element is larger than the score, it should not exist.

## 4. Elevation

This system uses glow and shadow, not raised flat surfaces. There is no tonal layering in the Material sense; depth is created through light emission, not surface separation.

The background is the darkest element. Cards are one step lighter. Raised controls (buttons, inputs) are one step lighter still. No element is "elevated" by its own shadow; instead, key elements emit a colored glow that marks importance or state.

### Shadow Vocabulary
- **Card ambient** (`0 4px 32px rgba(74, 44, 138, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04)`): Applied to all PlayerCard surfaces. The purple-tinted outer shadow separates card from background; the white inset top edge lifts the card's top surface into the light.
- **Gold glow** (`0 0 14px rgba(212, 164, 42, 0.4)`): Applied to primary buttons on hover and to score numerals of the winning player. Marks "this matters" through warmth.
- **Gold glow strong** (`0 0 18px rgba(212, 164, 42, 0.5)`): Winner state, final score CTA. More intense; used sparingly.
- **Code ambient** (`0 0 24px rgba(212, 164, 42, 0.08)`): Very low-intensity gold wash behind the game code display. Barely visible; creates warmth without competing with foreground elements.
- **Winner halo** (`0 0 48px rgba(212, 164, 42, 0.25)`): The largest glow; used on the winning player's card at end-of-game. Extended radius, lower opacity for a diffuse halo effect.

### Named Rules
**The Emit, Don't Raise Rule.** Shadows mark light emission, not physical elevation. A button does not cast a shadow because it sits above the surface; it glows because it is active and important. Flat-colored drop shadows are prohibited.

## 5. Components

### Buttons
Elemental and simple: two variants, clear color assignment, no intermediate states that feel designed.

- **Shape:** Gently curved (12px radius, `rounded-xl`). Not pill, not sharp. The radius is functional, not decorative.
- **Primary (increment / create / submit):** Gold fill (`#d4a42a`), ink-deep text (`#0d0a1a`), 12px/24px padding. On own-card score controls: oversized (112×80px on mobile, 64×64px at sm+) to hit without looking.
- **Primary hover:** `#f0c040` fill plus gold glow (`0 0 14px rgba(212,164,42,0.4)`). Transition 200ms.
- **Secondary (decrement):** `ink-mid` fill, star-silver text. Same radius and sizing as primary. Disabled when score is 0.
- **Ghost (join / transfer host / delegate links):** Transparent fill, gold border, gold text. Hover: `rgba(gold, 0.1)` background tint. Used for lower-priority actions.
- **Disabled:** 30% opacity, `cursor-not-allowed`. No other visual change; the dimming is the signal.

### Chips / Badges
- **Host badge:** `gold/15` background fill, gold text, pill radius (9999px), 7px/12px padding, uppercase label bold 12px. Purpose: identity marker on the PlayerCard, not an interactive element.
- **Delegate badge:** `ambient/30` tint, star-silver text, ink-border border, pill radius. Indicates delegated control state.

### Cards
- **Player Card:** `ink-dark` surface, `ink-border` border, 24px radius (`rounded-2xl`), 24px padding. Card ambient shadow. A thin colored strip at the top edge (1px height, full width, player's color) is the only place player-assigned color appears as a surface. Scores render in the player's color with matching text glow.
- **No nested cards.** The PlayerCard is the single card primitive in the system; nothing nests inside it.

### Inputs
- **Game code input:** `ink-mid` background, star-white text, ink-border border, `rounded-xl` (12px). Focus: gold ring (`ring-gold/40`) plus gold border tint. All text uppercase (game code only). Min height 44px for touch. Placeholder text in star-dim; contrast passes AA at bold 14px label threshold.
- **Focus treatment:** 2px gold-tinted ring, not a border shift. The glow communicates "active" without a hard shape change.

### Navigation
No persistent navigation in this product. The landing page has a title + two actions (create / join). The game screen has no nav. Navigation is implicit: the game code is the session; leaving closes it.

### Score Display (Signature Component)
The score numeral is the most important element in the product. It renders in the player's assigned color (hex, passed as a prop), with a text-shadow glow matching that color at 40% opacity. Size uses the `--score-size-hero` fluid token (`clamp(4.5rem, 22vw, 9rem)`) on mobile and collapses to `4.5rem` at `sm` breakpoint. The numeral is tabular-nums weight 800 to prevent width shifts during score changes. This is not a chart, not a widget — it is a numeral in darkness.

### Avatar
A circular badge (48px default) with an ink-mid background, a 2px border in the player's color, and a soft glow of the same color at 33% opacity. Contains the Lorcana inkwell SVG icon in the player's color. The icon is not decorative; it is the player identifier when the name is too long to scan.

## 6. Do's and Don'ts

### Do:
- **Do** size own-card score buttons at 112×80px (mobile) so they can be hit with a thumb during play without looking at the screen.
- **Do** use `tabular-nums` on every score numeral to prevent layout shift when numbers change.
- **Do** use `--score-size-hero` (`clamp(4.5rem, 22vw, 9rem)`) for scores so they remain dominant across all screen widths.
- **Do** use player-assigned colors exclusively for the score numeral, the top accent strip on PlayerCard, and the Avatar border/glow. Nowhere else.
- **Do** apply `prefers-reduced-motion` alternatives to all score animations and state transitions. The reduced-motion fallback is a crossfade or instant switch; never remove the state change entirely.
- **Do** use Cinzel only for the game title. All other UI text uses Geist.
- **Do** verify contrast on star-silver text against ink-dark at every new use; it passes AA at 5.5:1 and must not be used at smaller sizes where that ratio drops below threshold.
- **Do** keep gold to ≤15% of screen surface area. Its rarity is its signal value.
- **Do** use `position: fixed` or the popover API for any dropdown (delegate picker, host transfer menu) to escape overflow clipping on card containers.

### Don't:
- **Don't** use warm neutral backgrounds. The whole warm-neutral band (cream, sand, paper, parchment) is prohibited. The app is used in dim rooms; a warm bg would look washed out and read as a different product entirely.
- **Don't** use gradient text (`background-clip: text`). The score and title carry enough presence on their own. Gradient text on the title is the saturated AI move; a solid gold on void is harder.
- **Don't** add a colored `border-left` or `border-right` stripe greater than 1px as an accent on cards or list items. The top-strip on PlayerCard (1px height, full width) is the one accent stroke; replicating it as a side stripe is prohibited.
- **Don't** use Cinzel for labels, button text, badge text, or score numbers. It is a display font; it is unreadable at small sizes and strange at medium sizes outside titles.
- **Don't** use glassmorphism or backdrop-blur as a default surface treatment. If blur is used, it must mark a specific modal or overlay state with a clear reason.
- **Don't** build decorative animations. No page-load choreography, no staggered card entrances. Motion is reserved for score changes, winner reveal, and state feedback.
- **Don't** build the interface to look like a generic SaaS dashboard: white cards, metric grids, clean serif headings, soft drop shadows. This is the primary anti-reference from PRODUCT.md and the single most common failure mode for this category.
- **Don't** make the UI feel like a mobile game: neon fills, aggressive gradients, casino-style reward animations, full-saturation accent colors on every element.
- **Don't** use `star-dim` (`#5a4f78`) for any body text or labeling that needs to pass AA. It is a decorative color only; its contrast ratio on ink-dark does not meet 4.5:1.
- **Don't** place interactive controls where the score numeral belongs. The score is the most important element; layout decisions should never subordinate it to navigation or secondary information.
