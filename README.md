# Year in Code — a Wrapped for GitHub
 
A mobile-first story that turns a year of commits into developer identity — archetypes, a personal palette, a data-generated soundtrack, and a share card you'd actually post.
 
## The bet
 
The brief warns that most Wrapped clones are dashboards in disguise. So the bet here: **identity machine, not stats app.** Numbers stay simple and uncrowded — one big thing per card — because the moment it feels like a dashboard, people click out. Every cut passed one filter: *would a dev rather post this than write a LinkedIn post about their year?*
 
## The story (7 cards)
 
1. **Cold open** — a typed `git log --since="2026-01-01"` resolves into the title.
2. **Hero volume** — commits count up, then "one commit every 4.7 waking hours," then the joke: *top 1% of contributors named Avery — \*of 1.* I don't have other people's data, so the only percentile flex allowed is one that admits it.
3. **Commit O'Clock** — the whole year rains onto a 24-hour radial clock (each dot a pitched audio grain — a night owl's year literally sounds different) and stamps an archetype: Night Owl, Dawn Patrol, The Professional, Chaos Gremlin.
4. **Code DNA** — languages as a gradient strand in GitHub's own linguist colors; its dominant colors become CSS variables that tint everything after. The data generates the design system.
5. **Devotion** — top repo, Spotify-top-artist style: typed at a terminal prompt, with a 52-week "you came back" strip and a one-commit fling. Privacy toggle hides repo names, since unlike top artists, top repos can be confidential.
6. **Streak + Gap** — the streak, then the part nobody builds: your longest quiet stretch, audio ducking to actual silence. "The repos survived. Good." The anti-green-square-anxiety card.
7. **Share card** — two-sided. Front: a trading card (archetype, your clock as card art, DNA holo border). Back: "Pair Programmer Wanted" — your soulmate as your derived complement (Night Owl seeks Dawn Patrol; TS seeks Rust). Both sides export as PNG with your github.com handle on them.
## The seven requirements
 
1. **5+ cards** — seven, each a different cut, each its own component.
2. **Navigation** — tap zones, arrow keys, swipe; progress dots. No auto-advance.
3. **Motion** — shared Framer Motion variants: directional slide transitions, staggered reveals, 1.2s count-ups with tabular-nums, dot rain, the card flip. `prefers-reduced-motion` gets crossfades and final values.
4. **Mobile-shaped** — one layout grid (eyebrow / centered stage / anchored caption), checked at 375/390/414px, safe-area padding.
5. **Share card** — visually distinct (a framed object, not a stat page), 2× PNG export via html-to-image from a cleaned hidden clone, iOS share-sheet path, dataURL fallback.
6. **Cohesive identity** — GitHub's actual green and dark hex codes, one type pairing, one motion language, one dry voice, one sound system.
7. **Either dataset** — cards never touch raw data. `parseDataset` shape-sniffs the JSON and routes to `commitsAdapter` or `listeningAdapter`; both emit the same normalized spec, and components contain zero domain nouns (grep it). The listening story maps card-for-card: minutes, listening clock, genre DNA, top artist + most-replayed track, listening streak/silence, "Aux Cord Applications Open" back.
## Architecture, fast
 
- **Adapter wall:** all math, archetypes, and copy live in pure adapter functions. Dataset swap = one function call; hard-coding is structurally impossible, not just avoided.
- **Hostile-input handling, three rings:** schema validation at the door (bad JSON lands on a designed `MERGE CONFLICT` card, never a white screen) → per-card error boundaries (a crashing card gets evicted, the show goes on) → a minimum-five backfill so the safety net can't drop the deck below the rubric.
- **Designed empty states:** zero commits isn't an error, it's "Year Zero" — a Day One share card with `COMMITS 0 / POTENTIAL ∞`. Try `?demo=empty`, `?demo=sparse`, `?demo=broken`, and `?data=commits|listening`.
- **Sound:** synthesized Web Audio, no files, muted by default. Timbre from your top language, register from your archetype, the devotion strip plays your year as a 52-note melody, and the share card composes a ~10s anthem from your monthly counts (`anthem: 94 BPM · D minor`). Audio failing degrades to silence, never breaks the app.
## The product zoom-out
 
What actually made Spotify Wrapped spread wasn't stats — it was segmentation people could argue about. The Burlington, Vermont "sound town" discourse, Spotify's listening personalities, Pokémon Go's three teams: categories that make people post *against each other*. The archetypes here are that mechanism for devs. I've tested this instinct before — GitRizAI, a dev-matchmaking meme I built on GitHub profiles for TreeHacks, got organic traction, and it directly shaped the soulmate card. The constraint I held: silly enough to share, never so silly it's off-brand — a GitHub Wrapped should ultimately human-center devs and their craft, especially as more of the actual code gets written alongside agents.
 
## With more time
 
Real percentile flexes against population data (the most viral Wrapped mechanic, impossible with one user's file), an animated Canvas-style share export, and archetype-vs-archetype pages to complete the posting-against-each-other loop.
