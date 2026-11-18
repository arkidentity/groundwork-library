# Deliverable starter

Copy `page/` into a workspace for each client page: `workspace/deliverables/<slug>/` (or
`outbox/deliverables/<slug>/` as a draft). Rename the title in both files.

**A client's brand lives in one place: `theme:` in their `groundwork.yml`** (colors for light and
dark, Google Fonts). It styles their Groundwork workspace and, through `_theme.css`, every page we
make them. Change it there and both follow. See the Groundwork repo's `docs/ADDING-A-CLIENT.md`.

Every page links three stylesheets, in this order:
1. `/deliverable.css`: Groundwork's neutral look (cards, `.question`, `.note`, tables, light and
   dark). Always there.
2. `_theme.css`: the client's colors and fonts, generated from `theme:`. Empty when there's no theme,
   so a page made before the brand is known looks clean and neutral.
3. `_shared/brand.css`: **optional** extras the theme can't express (a paper texture, a logo, a
   signature stripe). Most clients don't need one. Start from `_shared/brand.css` here.
