
## Whatever — Group Trip Planning App

Two screens, no auth, frontend-only state for now (in-memory + URL params). Backend can be added later when invite links need to persist.

### Design system (src/styles.css)

Replace existing tokens:
- `--background`: #F9F6F1 (warm off-white)
- `--foreground`: #1A1A1A (charcoal)
- `--primary`: #9C4F51 (terracotta), `--primary-foreground`: #FFFFFF
- `--muted`: subtle warm gray strip color, `--border`: soft warm gray
- All in oklch

Typography via Google Fonts link in `__root.tsx` head:
- Bebas Neue → headings (`.font-display`)
- Inter (Helvetica substitute, web-safe) → body, set on `body`

Add utility classes for display font and editorial spacing.

### Routes

```
src/routes/
  __root.tsx        (add font links, set body bg)
  index.tsx         (redirect to /create)
  create.tsx        (Screen 1)
  trip.$tripId.preferences.tsx  (Screen 2)
```

### Screen 1 — /create

Centered single-column form, max-w ~560px, generous vertical padding.

Components used: existing shadcn `Input`, `Label`, `Select`, `Button`, `Popover`+`Calendar` for date pickers, `lucide-react` `Globe`, `Plus`, `X`, `CalendarIcon`.

State (local `useState`):
- name, destination, budget, departDate, returnDate
- invites: `string[]` starting `[""]`; add handler caps at 9; each row has remove button (except when only one)

Submit: generate `tripId = crypto.randomUUID()`, navigate to `/trip/$tripId/preferences` (organizer can preview). No backend yet.

Helper text below CTA in muted-foreground.

### Screen 2 — /trip/$tripId/preferences

Top context bar: full-width strip, light warm gray bg, small text, single line:
`{destination} · {dates} · {budget} · Organized by {name}`
Since there's no backend, read from URL search params (organizer passes them) OR show placeholder values. Plan: pass via search params from /create navigation; fall back to placeholders if missing.

Single scrolling page — all 4 sections rendered simultaneously. No accordion/tabs/steps.

**Section 1 — Vibe (max 2):**
- 2-col grid of toggle cards, each with lucide icon: Mountain (Adventure), Landmark (Culture), UtensilsCrossed (Food & Drink), Sun (Relaxation), Music (Nightlife), Trees (Nature & Outdoors), ShoppingBag (Shopping), Sparkles (Wellness)
- Selected: terracotta border + `bg-primary/10`
- On 3rd click: trigger CSS shake animation on the card + show tooltip "Pick up to 2." (using sonner toast or inline tooltip with timeout)
- Add `@keyframes shake` to styles.css and `animate-shake` utility

**Section 2 — Energy:**
- Custom horizontal slider (use shadcn `Slider` with 3 stops, values 0/1/2)
- Override thumb to be a terracotta filled heart (lucide `Heart`) — absolutely positioned over slider thumb, or restyle via `[&_[role=slider]]` selectors
- Stop labels below: Chill / Balanced / Full throttle, selected one bolded in terracotta

**Section 3 — Schedule:**
- Two question groups, each rendering pill toggle buttons (single-select). Use `ToggleGroup` with `type="single"`, styled pill shape, selected = terracotta bg

**Section 4 — Restrictions:**
- Two stacked `Textarea` with "Optional" gray label inline with heading

**Sticky CTA:**
- `sticky bottom-0` container with backdrop blur + top border, contains full-width terracotta button "Submit my preferences"
- On submit: replace button content with checkmark (lucide `Check`) scale-in animation + text "You're in. We'll let you know when everyone's submitted."

### Out of scope (call out)

- No auth, no database, no real invite emails sent — clicking submit just shows confirmation
- Invitee links won't actually carry trip data across devices (no backend). The organizer is redirected locally to preview the preferences form. To make invites truly work, Lovable Cloud needs to be enabled — flag this for a follow-up.

### Technical notes

- Date pickers: shadcn pattern with `Popover` + `Calendar`, `mode="single"`, `className="p-3 pointer-events-auto"`
- All colors via semantic tokens — no hardcoded hex in components
- Shake keyframe + heart-thumb styling added to `src/styles.css`
- `index.tsx` becomes a redirect to `/create` via `<Navigate to="/create" />`
