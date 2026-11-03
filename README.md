# The Queensland Grass Rush, 1840 to 1902

By Robin McKean. A non-fiction information bank about the Queensland grass rush: squatters, runs and stations, the move from sheep to cattle, land laws, drought and Aboriginal people.

- Student version: https://robmac10.github.io/grass-rush-adventure/
- Teacher version: https://robmac10.github.io/grass-rush-adventure/teacher/ (not linked from the student version, and set to noindex). It adds discussion questions with suggested answers behind "Show" buttons.

## What is in it
Overview, Timeline (dated events, each with a short explanation and its source), Places, Settlement map (an SVG map of Queensland with a slider, Back and Next buttons and a list view, showing pastoral districts opening decade by decade from the 1840s to the 1890s, with each district's dates and whose Country it is, from named sources), Money from London (the banks and companies that lent money for runs, a checked list of who was really in Queensland, the 1866 crisis, the 1880s boom, the 1893 bank failures, the 1891 strike link and the Federation Drought), People and groups (real ones only), Real lives (short documented accounts, with a person's own words only where a source records them), Did you know, and Sources (including where sources disagree). There are no invented characters, no story and no newspaper headlines.

## Content warning and review
This resource may contain names and images of deceased Aboriginal and Torres Strait Islander people (and, for the sugar resource, South Sea Islander people). It has **not yet been reviewed** by community members. Please seek review, for example from the Giabal, Jarowair, Keinjan and Barunggam peoples, the Gayiri, Bidjara and Ghungalu peoples, and the Darumbal people, before classroom use.

## Editing
Edit files in `src/` (`info.js` holds most text, facts and questions; `london.js` holds the Money from London page and its entries; `settlement.js` holds the settlement map data and its entries; `extra-sources.js` holds source notes; `app.js`, `index.html` and `styles.css` hold the page), then run `node build.js`. It writes the student version at the site root and the teacher version in `teacher/`. The student build removes all discussion questions, answers and teacher-only code. Do not edit the built files in the root or in `teacher/` directly.

## Archive
The earlier choose-your-path story version is kept, not deleted. It is the git tag `story-version` and the folder `archive/story-version/`.

## Rules followed
No invented facts (where sources disagree, the resource says so), public domain credited images only, no AI images, plain prose, Australian English.
