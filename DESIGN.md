---
name: Lorcana Lore Tracker
description: Real-time lore score tracker for Lorcana card game sessions.
colors:
  base-deep: "#14100d"
  base: "#1e1814"
  surface: "#261f1b"
  raised: "#332b26"
  line: "#433a34"
  clay: "#d2764a"
  clay-strong: "#e88e59"
  clay-soft: "#7a5037"
  clay-deep: "#442415"
  fg: "#ece7df"
  fg-muted: "#b1a9a2"
  fg-faint: "#a49d96"
  glow: "#9c6a47"
  danger: "#df6862"
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
    backgroundColor: "{colors.clay}"
    textColor: "{colors.base-deep}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.clay-strong}"
    textColor: "{colors.base-deep}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.clay}"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
  button-score-increment:
    backgroundColor: "{colors.clay}"
    textColor: "{colors.base-deep}"
    rounded: "{rounded.lg}"
    width: "112px"
    height: "80px"
  button-score-decrement:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.fg-muted}"
    rounded: "{rounded.lg}"
    width: "112px"
    height: "80px"
  input-game-code:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.fg}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
  card-player:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.fg}"
    rounded: "{rounded.2xl}"
    padding: "24px"
  chip-badge:
    backgroundColor: "transparent"
    textColor: "{colors.clay}"
    rounded: "9999px"
    padding: "2px 12px"
---

# Design System: Lorcana Lore Tracker

## 1. Overview

**Creative North Star: "Hearthlight"**

This is a record-keeper that belongs at the table, not on a broadcast screen. A player should be able to glance mid-game, read the scores immediately, and look away. The interface is used in low ambient light around a card-game table, so it stays dark, but the darkness is warm: an espresso-and-taupe room lit by a single ember, not a cold void. The feeling we are after is clean, trustworthy, and warm, the way a well-made wooden game box feels in the hand.

There are no neon accents, no pure black, no pure white. The neutral ramp is a tinted warm-dark (hue ~55), and the single saturated color is terracotta clay (hue ~45). Clay is not decoration; it is the one deliberate brand accent. Every time it appears it carries meaning: a primary action, the current selection, a focus ring, or a win. The per-player Lorcana ink colors (Amber, Amethyst, Emerald, Ruby, Sapphire, Steel) are the only other saturated colors on screen, and they are reserved strictly for player identity (score numeral, accent strip, avatar), never for chrome.

**Key Characteristics:**
- Scores dominate at all breakpoints; layout subordinates everything else to the numeral.
- Single brand accent (terracotta clay) for primary actions, current selection, focus, and winner states.
- Warm tinted-neutral surface ramp; never pure black, never warm-near-white "paper".
- Typography pairing: Cinzel (display) + Geist (UI/data); never mixed within a functional element.
- Depth through warm shadow, not raised flat surfaces or blur; terracotta glow marks state (hover, win), never rest.
- Motion marks state, not decoration; 150–250 ms on transitions.
- Tap targets are oversized for own-card controls, recognizing the use context (glancing, distracted).

## 2. Colors: The Hearthlight Palette

A warm tinted-neutral ramp carries the surface; a single terracotta accent carries meaning. This is a Restrained strategy: the accent stays well under 10% of any screen. All values are authored in OKLCH; the hex values below are the resolved sRGB and the contrast figures are measured against the rendered output.

### Brand Accent
- **Clay** (`#d2764a` / `oklch(0.66 0.13 45)`): The single saturated brand color. Primary increment / create / submit buttons, the game title, the game code, winner state, host badge, focus rings. Contrast 4.97:1 on `surface`, 5.38:1 on `base` (passes AA for text). Dark `base-deep` text on a clay fill measures 5.8:1.
- **Clay Strong** (`#e88e59` / `oklch(0.73 0.13 50)`): Hover state for clay elements only. Never used at rest.
- **Clay Soft** (`#7a5037` / `oklch(0.5 0.08 48)`): Low-chroma accent for subtle dividers and washes. Never used for text.
- **Clay Deep** (`#442415` / `oklch(0.3 0.055 45)`): Deep terracotta wash behind the winner card and glowing elements.

### Neutral (warm, tinted toward hue ~55)
- **Base Deep** (`#14100d` / `oklch(0.175 0.009 55)`): Darkest tone; the outer edge of the body radial gradient and the modal backdrop. Never pure black.
- **Base** (`#1e1814` / `oklch(0.215 0.012 55)`): Body background center. The page is a radial gradient from `base` at center to `base-deep` at the edges, so the screen never reads flat.
- **Surface** (`#261f1b` / `oklch(0.245 0.013 55)`): Card and drawer surface. One step up from the body.
- **Raised** (`#332b26` / `oklch(0.295 0.015 55)`): Raised elements — secondary buttons, input backgrounds, chips, segmented controls.
- **Line** (`#433a34` / `oklch(0.355 0.016 55)`): All border values, and the hover fill for raised controls.

### Foreground (warm off-white, hue ~75)
- **Fg** (`#ece7df` / `oklch(0.93 0.012 80)`): Primary text. Not pure white; a faint warm undertone. Contrast 13.2:1 on `surface`.
- **Fg Muted** (`#b1a9a2` / `oklch(0.74 0.014 70)`): Secondary text, labels, placeholders. Contrast 7.0:1 on `surface`, 6.0:1 on `raised` — passes AA at body sizes.
- **Fg Faint** (`#a49d96` / `oklch(0.7 0.013 65)`): De-emphasized labels, section headers, inactive toggle text, micro-hints. Contrast 6.1:1 on `surface`, 5.2:1 on `raised` — passes AA.

### Signal
- **Danger** (`#df6862` / `oklch(0.66 0.15 25)`): Destructive states and validation errors. Contrast 4.86:1 on `surface` — passes AA.
- **Glow** (`#9c6a47` / `oklch(0.6 0.1 50)`): Warm tint for low-alpha washes (the delegate badge). Never a surface, an interactive color, or an ambient backdrop.

### Named Rules
**The One Ember Rule.** Clay is the only brand-saturated color and stays under ~10% of any screen surface. Its rarity is its signal value. If an iteration adds clay to a new element, an existing clay use should be removed or dimmed. Player ink colors are exempt — they are identity data, not brand.

**The Warm Neutral Rule.** Surfaces are warm tinted neutrals (hue ~55), never pure black and never a warm-near-white "paper/cream/sand". The warmth lives in the whole ramp plus the clay accent, not in a bright bg. The contrast between warm-dark and ember is the emotional register.

## 3. Typography

**Display Font:** Cinzel (400, 600, 700) with Georgia, serif fallback
**Body/UI Font:** Geist Sans with system-ui, sans-serif fallback
**Mono Font:** Geist Mono (game codes only)

**Character:** Cinzel is a Roman-inscribed serif: stately, precise, carved. It carries the Lorcana world register and appears only on the title and the winner heading, never on UI labels, buttons, or data. Geist is the counterpart: a modern neutral sans that disappears behind the data it displays. The pairing works because the two never compete: Cinzel owns ceremony, Geist owns function.

### Hierarchy
- **Display** (700, clamp(1.5rem → 2.5rem), leading 1.1, tracking 0.15em, uppercase): Game title and winner heading. Tracking is wide because Cinzel needs optical room between its monumental letterforms.
- **Score** (800, clamp(4.5rem → 9rem), leading 1, tracking -0.02em): The score numeral, in Geist. A serif score would read ornate, not immediate.
- **Headline** (600, 1.125rem, leading 1.25): Player names inside cards.
- **Body** (400, 1rem, leading 1.5): Instruction text, status messages, lobby copy. Max 65ch.
- **Label** (700, 0.75rem, tracking 0.1em, uppercase): Badge text ("HOST"), section headers. Short uppercase only (≤2 words), never sentences.

### Named Rules
**The Cinzel Quarantine Rule.** Cinzel is the game-world font; Geist is the UI font. They must not appear in the same functional element. A player name is Geist; the title is Cinzel; a score is Geist.

**The Score Primacy Rule.** The score numeral is the largest typographic element on the game screen at all times. Nothing may visually compete with it.

## 4. Elevation

Depth comes from warm shadow, not raised flat surfaces. The body is the darkest element; cards step up one tone; raised controls step up again. Terracotta glow exists in the vocabulary but only ever marks state: a hover, a live score, a win. Nothing glows at rest.

### Shadow Vocabulary
- **Card** (`0 8px 32px rgba(20,14,8,0.45), inset 0 1px 0 rgba(255,244,232,0.05)`): All card surfaces. A warm brown outer shadow separates card from background; a warm inset top edge catches the light.
- **Glow** (`0 0 16px rgba(208,132,88,0.4)`): Primary buttons on hover; winning score numerals.
- **Glow strong** (`0 0 20px rgba(208,132,88,0.5)`): Winner heading only. Used sparingly.
- **Winner halo** (`0 0 48px rgba(208,132,88,0.3)`): The largest glow, on the winner card at end-of-game. Wide radius, diffuse.

### Named Rule
**The Emit, Don't Raise Rule.** Shadows mark light emission and warmth, not physical elevation. A button glows because it is being used or has just won something, never because it is merely present. No ambient glow blobs, no resting glows on chrome, no permanent text-shadows. If everything glows, nothing is the ember. Flat gray drop shadows are prohibited.

## 5. Components

### Buttons
- **Shape:** Gently curved (12px radius, `rounded-xl`). Not pill, not sharp.
- **Primary (increment / create / submit):** Clay fill, `base-deep` text, 12px/24px padding. Own-card score controls are oversized (112×80px mobile, 64×64px at sm+) to hit without looking.
- **Primary hover:** `clay-strong` fill plus glow. Transition 200ms.
- **Secondary (decrement, menu items):** `raised` fill, `fg-muted` text, `line` hover fill. Disabled when score is 0.
- **Ghost (join / transfer / delegate links):** Transparent fill, clay border, clay text, `clay/10` hover tint.
- **Disabled:** 30% opacity, `cursor-not-allowed`. The dimming is the only signal.

### Chips / Badges
- **Host badge:** `clay/15` fill, clay text, pill radius, uppercase bold 12px. Identity marker, not interactive.
- **Delegate badge:** `glow/30` tint, `fg-muted` text, `line` border, pill radius.

### Cards
- **Player Card:** `surface` fill, `line` border, 24px radius, 24px padding, card shadow. A thin full-width strip at the top edge in the player's color is the only place player color appears as a surface. Scores render in the player's color with matching glow.
- **No nested cards.** PlayerCard is the single card primitive; nothing nests inside it.

### Inputs
- **Game code / name / lore target:** `raised` fill, `fg` text, `line` border, `rounded-xl`. Focus: 2px `clay/40` ring plus `clay/60` border tint. Min height 44px. Placeholder in `fg-faint` (passes AA). `color-scheme: dark` is set so the number spinner renders in the dark theme.
- **Focus treatment:** a clay-tinted ring, not a border shift.

### Navigation
No persistent navigation. Landing has title + two actions; the game screen has a single corner menu trigger (`raised`) opening a fixed drawer. Navigation is implicit: the game code is the session.

### Score Display (Signature Component)
The score numeral is the most important element. It renders in the player's assigned color with a text-shadow glow matching that color at 40% opacity. Size uses `--score-size-hero` (`clamp(4.5rem, 22vw, 9rem)`), collapsing to `4.5rem` at `sm`. Weight 800, `tabular-nums` to prevent width shift. A numeral in warm darkness, not a chart.

### Avatar
A circular badge (48px default) with a `raised` background and a 2px border in the player's color. Contains the Lorcana ink SVG glyph in the player's color — the player identifier when names are too long to scan. No resting glow.

## 6. Do's and Don'ts

### Do:
- **Do** size own-card score buttons at 112×80px (mobile) so they can be hit with a thumb without looking.
- **Do** use `tabular-nums` and `--score-size-hero` on every score numeral.
- **Do** use player-assigned colors exclusively for the score numeral, the top accent strip, and the Avatar border. Nowhere else.
- **Do** apply `prefers-reduced-motion` alternatives to all motion (confetti, score change, winner reveal). The fallback is a crossfade or instant switch, never removing the state change.
- **Do** use Cinzel only for the game title and winner heading. All other text is Geist.
- **Do** keep clay (the brand accent) under ~10% of screen surface. Its rarity is its signal.
- **Do** verify contrast when introducing text on a new surface; `fg-muted` and `fg-faint` both pass AA on `surface`/`raised`/`base`, but re-check on any tinted fill.
- **Do** use `position: fixed` or the popover API for any dropdown to escape overflow clipping.

### Don't:
- **Don't** use pure black or pure white, and don't use a warm-near-white "paper/cream/sand" background. Surfaces are warm tinted-darks; brightness is not the source of warmth.
- **Don't** introduce neon or full-saturation chrome. Clay is the one brand-saturated color; player inks are identity data, not decoration.
- **Don't** use gradient text (`background-clip: text`). The title and score carry presence on their own; solid clay is the harder, better choice.
- **Don't** add a colored `border-left`/`border-right` stripe as an accent. The 1px full-width top strip on cards is the one accent stroke.
- **Don't** use Cinzel for labels, buttons, badges, or score numbers.
- **Don't** use glassmorphism/backdrop-blur as a default surface. Reserve blur for a specific overlay with a clear reason.
- **Don't** build decorative animations or page-load choreography. Motion is for score changes, winner reveal, and state feedback only.
- **Don't** build a generic SaaS dashboard look (white cards, metric grids, soft gray shadows) or a mobile-game look (neon fills, casino reward animations).
- **Don't** place interactive controls where the score numeral belongs.
