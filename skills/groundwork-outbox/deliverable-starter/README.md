# Deliverable starter

Copy into a workspace when making a client page (see "Hosted deliverables" in the Groundwork repo
contract):

- `_shared/brand.css` → `workspace/deliverables/_shared/brand.css`, **once per client**. Fill in
  their colors and fonts. Every page in the workspace uses it.
- `page/` → `workspace/deliverables/<slug>/` (or `outbox/deliverables/<slug>/` as a draft), for
  each page. Rename the title in both files.

Every page links two stylesheets, in this order:
1. `/deliverable.css`: Groundwork's neutral look (light and dark, cards, `.question`, `.note`,
   tables). Always there.
2. `_shared/brand.css`: the client's brand, which overrides the neutral tokens.

So a page made before the brand file exists still looks clean, just neutral. Once the brand file
is added, every page picks it up with no edits.
