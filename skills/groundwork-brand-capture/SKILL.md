---
name: groundwork-brand-capture
description: Capture a client's brand from their live website and turn it into the shared stylesheet their Groundwork pages use, so every branded page looks like the client's own site. Use when onboarding a new client, or when someone says "capture <client>'s brand", "match their website", "brand the pages like their site", "rebrand the Groundwork pages", or "the pages don't look like <client>". Writes `_shared/brand.css` (plus the logo) in the client's repo; `groundwork-outbox` then builds pages on it.
---

# Groundwork Brand Capture

Goal: a client opens a Groundwork page and it looks like it came from their own website. Measure the
site; don't guess from memory or a screenshot.

## Where it goes

- Database project (repo has `groundwork/`, no `groundwork.yml`): `groundwork/pages/_shared/`.
- File-based workspace (`groundwork.yml`): `workspace/deliverables/_shared/` (and `_theme.css` if the
  workspace uses one).

Files: `brand.css` and the logo (`<client>-logo.png` or `.svg`). Pages link it with
`<link rel="stylesheet" href="_shared/brand.css">` after `/deliverable.css`.

## Steps

1. **Open the site** in a browser (built-in browser, or Claude in Chrome). Read the home page and one
   inner page. Public pages only; never sign in to anything for this.
2. **Measure computed styles** with one script, not by eye. For `body`, every visible `h1`–`h4`, `p`,
   buttons/CTA links, and each full-width section wrapper, collect: font-family, size, weight,
   letter-spacing, text-transform, color, background-color, border-radius, padding, text-align.
   Read the output in slices if it's long.
3. **Get the real logo.** Find the header `<img>` (or inline SVG) and download it into `_shared/`.
   Note whether it's dark-on-transparent or light, so you know which backgrounds it can sit on. Never
   redraw a logo in CSS or type.
4. **Write down the system**, in a comment at the top of `brand.css`, with the source URL and date:
   - Fonts (heading, body) and where they load from (Google Fonts if they're there).
   - Page background, text color, and each **section band** the site uses (e.g. green band, black
     band, light-gray band) with its text color.
   - Headline treatment (color, tracking, case), section-heading treatment, body size.
   - Buttons: color, case, padding, radius. Corners: square or rounded across the site.
   - Layout habits: centered or left, how wide, hero style (photo, solid, white).
   - Light or dark. If the site is light-only, make the pages light-only (`color-scheme: light`,
     explicit backgrounds) rather than inventing a dark mode.
5. **Write `brand.css`** with tokens on `:root` (`--bg --fg --muted --surface --line --accent
   --on-accent --display --font --radius --max`, plus brand colors) and reusable classes:
   `.<x>-wrap`, `.<x>-band` (hero), `.<x>-brand` (logo link), `.<x>-section`, `.<x>-eyebrow`,
   `.<x>-label`, one class per section band (`.<x>-green`, `.<x>-black` …), `.<x>-btn`. `<x>` is a
   short client prefix.
   - **Contrast:** bright brand colors often fail as text on white. Keep the bright value for fills
     and add a darker `-text` token for small text (aim for 4.5:1).
6. **Update existing pages** to use the logo image and the band classes; remove page-level styles
   that fight the brand (old colors, rounded cards on a square site).
7. **Check it** live in Groundwork (pages load `/deliverable.css` from the host, so a local file
   preview is misleading). Compare side by side with the client's site at desktop and phone width.
8. Commit and push (main, no branches). Note the capture in the repo's log.

## Rules

- Measure, then match. If the site is inconsistent, follow the home page and say what you chose.
- Their fonts, their colors, their logo file; our layout and content.
- Don't copy page text, photos of people, or testimonials onto our pages unless asked.
- Re-run when the client redesigns their site; the comment's date says when it was captured.
