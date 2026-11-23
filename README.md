# Japanese Auto Repair — Irving, TX

A static, bilingual (English / Español) website for **Japanese Auto Repair**, 1402 W Irving Blvd, Irving, TX 75061, (972) 253-6031.

No build step, no framework, no backend. Four hand-written HTML pages, one stylesheet, two scripts.

---

## 1. Preview it locally

From the parent folder (`WEBSITES-CLD`):

```bash
py -m http.server 8101 --directory japanese-auto-repair
```

Then open <http://localhost:8101>. A `japanese-auto-repair` entry is also registered in `../.claude/launch.json`, so Claude's preview pane can start the same server by name.

Opening `index.html` directly from the filesystem works too, but a local server is closer to production behaviour.

---

## 2. Files

```
japanese-auto-repair/
├─ index.html               Home — hero, makes, services, the shop, how a visit goes, visit
├─ services.html            Six detailed service entries + "what this page is not"
├─ about.html               Verified-facts ledger + an explicit "owner must confirm" list
├─ contact.html             Phone-first contact, prep checklist, hours table, directions
├─ README.md                This file
└─ assets/
   ├─ css/styles.css        Whole design system: tokens, components, responsive, print
   ├─ js/i18n.js            Every customer-facing string, in EN and ES (204 keys each)
   ├─ js/site.js            Language switch, live open/closed status, drawer, scroll reveal
   ├─ img/                  hero-engine-bay · shop-bays · oil-service · diagnostics ·
   │                        on-the-lift · bench-work · favicon.svg
   └─ brands/               honda, toyota, nissan (+ 9 other Japanese makes, unused)
```

---

## 3. Design system

| Token | Value | Notes |
| --- | --- | --- |
| Ink (charcoal) | `#15171a` | Page ink, dark sections, hero scrim |
| Paper (cream) | `#f4f0e7` | Default background |
| Amber (signal) | `#e0821c` | Accents and CTAs — only on dark, where it clears 4.5:1 |
| Deep red (seal) | `#8c2f22` | Section indices and markers on cream |
| Display | Bricolage Grotesque | Headings, tight tracking |
| Body | Inter | 17px / 1.65 |
| Technical | JetBrains Mono | Section indices, hours, labels, buttons |

Recurring motifs: hairline rules and gauge-tick dividers, `§ 01` mono section indices, numbered service cards, tabular-figure hours, and a dashed amber "confirm this" marker. Motion is deliberately minimal — one short fade-and-rise on scroll, fully disabled under `prefers-reduced-motion`.

The palette and typography were chosen against the brief. The `ui-ux-pro-max` design-system generator proposed a generic corporate blue (`#1E40AF`) with EB Garamond/Lato for this query; that was rejected as off-brief, and only its structural and pre-delivery checklists were applied.

---

## 4. Language switch (EN / ES)

* Strings live in `assets/js/i18n.js` as `window.JAR_I18N = { en: {...}, es: {...} }`.
* Markup binds to them with `data-i18n` (text), `data-i18n-html` (values containing `<em>`, `<br>`, `<strong>`), `data-i18n-alt`, `data-i18n-aria-label`, `data-i18n-title`, `data-i18n-content` (meta description).
* The choice is stored in `localStorage` under `jar-lang` and survives navigation and reloads. A tiny inline script in each `<head>` applies the stored language before paint, so there is no flash of the wrong language.
* With no stored choice, a browser whose language starts with `es` gets Spanish; everyone else gets English.
* The switch updates `<html lang>`, the `<title>`, the meta description, every visible string, image alt text, and the live hours status.

**To add or change copy:** add the key to *both* `en` and `es` in `i18n.js`, then reference it from the markup. Run the checker in §7 — it fails if a key is missing from either language.

---

## 5. Live "open now / closed" status

`site.js` holds the published hours as minute ranges and evaluates them against **America/Chicago** time (via `Intl.DateTimeFormat`, so a visitor in another time zone still sees the shop's status, with a graceful fallback to the visitor's clock). It renders "Open now · Closes 6:00 PM", "Closed · Opens 8:00 AM", or "Closed · Opens Mon 8:00 AM", highlights today's row in every hours list, and refreshes once a minute.

If the hours change, edit the `SCHEDULE` array in `assets/js/site.js` **and** the hours rows in the four HTML files.

---

## 6. Where to connect a backend later

There is deliberately **no contact form**, because no verified email address or form destination exists for this business. The contact flow is phone-and-directions first throughout.

When the owner confirms an email address or a form endpoint:

1. **Simplest — an email link.** Add the address as `email` / `contact.email` keys in `i18n.js` and drop an `<a href="mailto:...">` into the `.call__cell` on `contact.html` (and, if you want it everywhere, the footer "Visit" column on all four pages).
2. **A real form.** Add the form markup inside the `.notebox` on `contact.html` that currently explains why there is no form (replace that block). Point `action` at a form service (Formspree, Basin, Netlify Forms) or your own endpoint. Label every field visibly, keep inputs at least 44px tall, show errors next to the field, and add the new field labels and error strings to both dictionaries in `i18n.js`.
3. **Online booking.** If the shop adopts a scheduling tool, replace the "Call first. It saves everyone a trip." section on `index.html` and the step copy (`home.step*` keys) — the current copy states that no online booking exists and would become wrong.

Whatever is added, remove the matching line from the "What the owner should confirm" list on `about.html` (`about.open.i*` keys).

---

## 7. Checks that were run

A static checker (`check_site.py`, run from the session scratchpad) verified across all four pages:

* HTML tag nesting and closure — no unclosed or mismatched tags
* Every `data-i18n*` key used in markup or `site.js` exists in **both** dictionaries (204 EN / 204 ES, 203 in use)
* Every local `src`/`href` resolves to a file that exists
* Every `<img>` has an `alt` attribute
* Each page has the `tel:+19722536031` link, the Google Maps link, both language buttons, the mobile menu button, a `#main` landmark and a skip link
* No stray or mistyped `tel:` targets
* `styles.css` braces balance, and every `var(--x)` used is defined

Result: **0 errors.** One warning (`nav.close` "unused") is a false positive — it is referenced inside a ternary in `site.js`.

Browser verification in the preview pane:

* No console errors on any of the four pages, in either language
* Language switch updates `<html lang>`, `<title>`, meta description, headings, nav, hours, alt text and the live status pill; the choice persists across page navigation and reloads
* Every element bound to a key renders non-empty text in Spanish; the only untranslated strings left on the page are language-neutral (the `JAR` monogram and the `01`–`06` numerals)
* Mobile drawer opens, closes, and relabels itself ("Open menu" / "Cerrar menú")
* Live status correctly read "Open now · Closes 6:00 PM" on a Wednesday afternoon, with today's row highlighted in all three hours lists
* No horizontal overflow at 375, 430, 768, 1024, 1280 or 1440px

Two layout bugs were found this way and fixed: the header call button overflowed below 700px (it is now icon-only there, with its label kept for screen readers), and the header overflowed between roughly 900 and 1020px (the secondary "Get directions" button now drops out at 1080px).

No linter or test runner exists for this project (no Node toolchain on this machine), so these are the available checks.

---

## 8. Facts, sources, and what still needs confirmation

### Presented as verified
Taken from public business listings and shown as such on the site:

* Business name: Japanese Auto Repair (listed as Quj Inc Japanese Auto Repair)
* Category: auto repair
* Address: 1402 W Irving Blvd, Irving, TX 75061
* Phone: (972) 253-6031
* Hours: Mon–Fri 8:00 AM–6:00 PM, Sat 9:00 AM–4:00 PM, Sun closed

### Presented as "call to confirm"
Honda, Toyota and Nissan are named in public listings and customer reviews. Maintenance, oil changes, brakes, diagnostics, inspections and general repair are described the same way. Every one of these is labelled on the site as a listed capability to confirm by phone, never as a guaranteed offering or a quoted price.

### Marked "suggested content — for owner review"
The "How a visit goes" steps, the "Have this ready when you call" checklist, and all photography. These are reasonable but unverified, and are visibly tagged as such.

### Claims that were removed

Every page was audited line by line against the verified facts above. Anything that asserted more than the listings support was cut or rewritten rather than tagged, because a label on a fabricated detail is still a fabricated detail.

Three kinds of overreach kept recurring, and are worth watching for in any copy added later:

1. **Operational detail nobody stated** — walk-in policy, parking, where the entrance is.
2. **Predicting the shop's behaviour** — that it will answer plainly, give a straight answer, or tell you something. The site can tell a reader what to *ask*; it cannot promise what they will hear.
3. **Quantifying the evidence** — "named repeatedly in reviews" claims a volume of reviews that was never counted. "Named in reviews" is what is actually known.

#### Home page

| Removed | Why | Replaced with |
| --- | --- | --- |
| "Walk-in or call ahead. Parking and the service entrance are on W Irving Blvd." | Nothing verifies that the shop takes walk-ins, or where its parking and service entrance are | A note that the hours come from public listings rather than the shop, and that a call confirms both the hours and whether the shop can see your car |
| "One phone call tells you whether we can take your car this week." | Promises turnaround and capacity the shop never stated, in a first-person voice the site has no standing to use | "Call the shop to confirm what it can take on, and when." |
| "It is not a dealership service lane and not a national chain. When you call, you are calling the shop floor." | The first half is a fair reading of the business record; "calling the shop floor" is an invented detail about how the phone is answered | A statement of what the records actually show, plus an explicit line that anything else about how the shop runs is the owner's to tell |

Two smaller edits in the same pass: "Tell **us** the car and the symptom" became "Tell **the shop** the car and the symptom" (the site speaks about the shop, not as it), and "The shop **will tell you** when it can get the car in" became "**Ask** when the shop can get the car in" — another prediction of how the shop will answer, even though it sat inside a section already tagged as suggested content.

#### Services page

| Removed | Why | Replaced with |
| --- | --- | --- |
| "What the shop is **known for**" (page heading) | A reputation claim, stated as the largest text on the page | "What the listings **point to**" |
| "Oil changes are named **repeatedly** in customer reviews" | Claims a volume of reviews that was never counted | "Oil changes are **named** in customer reviews of this shop." |
| "Listings describe diagnostic work here — the step where the fault is actually traced before parts get bought" | The clause reads as a claim about how *this shop* works | The general definition is separated out and turned into a question: "…ask how the shop approaches it." |
| "the shop **will tell you plainly** whether it is work they take on" | Predicts how the shop will answer the phone | "…**ask** whether it is work they take on." |
| "is **the cheapest** work it will ever have done" | An absolute, stated as fact | "is **usually** the cheapest work it will ever have done" |

#### About page

| Removed | Why | Replaced with |
| --- | --- | --- |
| "Ask on the phone; **you will get a straighter answer** than any website can give." | Promises the quality of an answer from people this site has never spoken to | "Ask on the phone; that is the only place those answers exist." |

#### Contact page

| Removed | Why | Replaced with |
| --- | --- | --- |
| "Calling or driving over are the **two ways in**." | Asserts there is no other channel; what is actually known is that no other channel is *published* | "…are the two **published** ways in." |

#### Meta description (home)

"Service for Japanese vehicles including Honda, Toyota and Nissan" became "**Public listings describe** service for Japanese vehicles…" — a search snippet is displayed copy too, and it was the one place a capability was still asserted flatly.

#### Site-wide: "independent" and the franchise inference

A final pass removed the last characterisations of the business itself. "Independent" was being asserted as fact in the home and About meta descriptions, the home hero, the home shop paragraph, the About page heading and the footer of all four pages — but no listing states the ownership structure. The inference drawn from the business record ("listed under its own name rather than as a dealership service department or a national franchise") went with it: a reasonable reading of a record is still a reading, not a listed fact.

All of it was replaced with wording drawn only from the listed business name, the auto-repair category, the address and the phone number:

| Was | Now |
| --- | --- |
| "An **independent** repair shop on West Irving Boulevard" (home hero) | "Auto repair at 1402 W Irving Blvd in Irving, Texas" |
| "A **neighborhood** shop on W Irving Blvd" (home section heading) | "Auto repair at 1402 W Irving Blvd" |
| "is an **independent** auto repair business at…" | "is an auto repair business at 1402 W Irving Blvd in Irving, Texas 75061" |
| "Business records list it under its own name rather than as a dealership service department or a national franchise." | "Public listings record the name, the auto repair category, the address and the phone number — (972) 253-6031." |
| "An **independent** shop, plainly stated" (About heading) | "The record, plainly stated" |
| "**Independent** auto repair on West Irving Boulevard, serving Japanese vehicles…" (footer, all pages) | "Auto repair at 1402 W Irving Blvd, Irving, Texas 75061. Call (972) 253-6031…" |
| "**Independent** auto repair shop at…" (home + About meta descriptions) | "Auto repair at 1402 W Irving Blvd…" / "Japanese Auto Repair, listed as Quj Inc Japanese Auto Repair — auto repair at…" |

"Neighborhood" was swept up in the same pass: it characterises the business the same way "independent" did, and leaving it under a paragraph that no longer makes any such claim would have read as an oversight.

Ownership structure now appears nowhere on the site. If the owner confirms it, "independent" can go back into the hero, the footer blurb and both meta descriptions.

#### Checked and left alone

For the record, these read like claims but are supported, and were deliberately kept:

* "The fastest way to reach Japanese Auto Repair" — true of the *published* channels, since no email or booking form exists
* "A shop's reputation is built in its bays, not in website copy" — editorial voice, not a claim about this business
* Every `svc.*` list item under "Ask about" — framed as questions for the caller, not as an offered menu
* Every sentence in the disclaimers that names prices, warranties or certifications — those *deny* claims rather than make them

### Still needs the owner's confirmation
Listed openly on the About page, and deliberately left out of the copy rather than invented:

1. Years in business and the shop's history
2. Technician names, training, certifications
3. Parts/labour warranty and its terms
4. Which inspections are currently offered
5. A working email address or booking method
6. Loaner / shuttle / after-hours drop-off
7. Accepted payment methods
8. Full list of makes serviced beyond Honda, Toyota and Nissan

Also unconfirmed, and therefore absent from the copy: whether walk-ins are accepted, where parking and the service entrance are, typical turnaround, whether appointments are needed, and the shop's ownership structure (whether it is independently owned, a franchise, or part of a group).

### Deliberately absent
No prices, no review counts or star ratings, no "years of experience" or "cars serviced" statistics, no certifications, no staff names, no email address, no social links, no contact form. None of these are verified for this business.

### The legacy domain
`http://japaneserepair.com/` was inaccessible when this site was built. Nothing on these pages comes from it. Treat it as unavailable and possibly outdated until the owner confirms its status.

---

## 9. Before this goes live

* [ ] Owner confirms the hours, phone number and the service list
* [ ] Owner confirms whether walk-ins are accepted, and where parking and the service entrance are — then add it back to the hero spec card (`home.hero.specFoot`)
* [ ] Owner confirms the ownership structure — then "independent" can return to `home.hero.lede`, `footer.blurb`, `meta.home.desc` and `meta.about.desc`
* [ ] Replace the six stock photos in `assets/img/` with real photos of the shop, its bays and its team — then delete the "representative photography" captions and the `mark.suggested` tags they belong to
* [ ] Confirm or remove the eight "Also ask about" makes on the home page (`.marques__more` chips)
* [ ] Fill in or delete each item on the About page's "What the owner should confirm" list
* [ ] Add an email address or booking method per §6, if one exists
* [ ] Replace the `JAR` monogram and `assets/img/favicon.svg` if the shop has a real logo
* [ ] Add an `og:image` and social preview tags once real photos exist

### Photography credit
The six workshop photos are from Unsplash, downloaded under the [Unsplash License](https://unsplash.com/license) (free to use commercially, no attribution required). They are stand-ins and should be replaced with photos of the actual shop. The make logos in `assets/brands/` were copied from the sibling `beltline-auto` project in this workspace; they are white artwork, which is why the makes band on the home page runs on a charcoal panel.

---

## 10. Browser support

Modern evergreen browsers. `IntersectionObserver`, `Intl.DateTimeFormat` with IANA time zones, CSS custom properties, `clamp()` and `backdrop-filter` are used, each with a sensible fallback: without `IntersectionObserver` all content renders immediately; without time zone data the status falls back to the visitor's clock; without `localStorage` (private mode) the switch still works for the current visit.
