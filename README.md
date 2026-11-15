# แผนฝึก 28 วัน · ข้าวตัง & ส้มโอ (Pet 28 Days, Thai)

Free Thai-language 28-day training workbooks (A4 PDF, 37 pages each) with one website:

- Home (team dog vs team cat): https://pond1982.github.io/pet-28-days/
- Puppy plan (ข้าวตัง): https://pond1982.github.io/pet-28-days/dog/ → `dog/puppy-28-day-plan.pdf`
- Kitten plan (ส้มโอ): https://pond1982.github.io/pet-28-days/cat/ → `cat/kitten-28-day-plan.pdf`

Analytics: GA4 measurement ID `G-JY762B0PVG` on every page, with `content_group` = `home` / `dog` / `cat`.
Custom events: `download_pdf` (file_name, link_location), `thanks_auto_download`, `share` (method), `choose_team` (team), `switch_team` (from_team, link_location), `nav_click`, plus from `analytics.js`: `scroll_depth` (percent_scrolled), `view_section` (section), `faq_open` (faq_question), `cta_click` (cta_text, link_location), `preview_scroll`, `mascot_hover` (hovered_team), `page_engaged_30s`. Every event carries `team` (home/dog/cat).
Download buttons play a celebration overlay, then go to `/dog/thanks/` or `/cat/thanks/`, which starts the PDF download (with a retry button).
Illustrations are original mascot art made for this project.

Counters (free Abacus API, namespace `pond1982-pet-28-days`, no sign-up):
- `visits`: one hit per browser session on any page, shown in every footer (`counter.js`).
- `dl-dog` / `dl-cat`: one hit per browser session when a team's thank-you page opens; shown as the team dog vs team cat download scoreboard (`scoreboard.js`) on home, plan and thank-you pages.
These public counters can be inflated by anyone calling the API; treat GA4 as the source of truth.

## About Pondd and dancing Easter egg

All five pages include an About section with Pondd's original character and two embedded dance clips from Screenshot Studio. Tap or Enter changes the dance, a pause button is available, and reduced-motion visitors get static poses. The character loads near the viewport. Existing visitor counter, scoreboard, analytics and PDF downloads are unchanged. The shared component is in `pondd-character/`; a text greeting remains if 3D cannot load.

Each page also links to Pondd's three YouTube channels alongside the website network. Basic markup checks: `python3 tests/test_about.py`.
