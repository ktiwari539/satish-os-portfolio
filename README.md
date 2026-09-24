# Satish OS — cinematic interaction review

**Development preview; not production.** This repository is separate from the existing portfolio.

## Browser preview without downloading anything

[Open Satish OS browser preview](https://htmlpreview.github.io/?https://github.com/ktiwari539/satish-os-portfolio/blob/main/index.html)

This is a third-party GitHub HTML previewer, not a Netlify deployment. Do not enter passwords or private data into this previewer.

## What is implemented

- A full-screen cinematic welcome on initial load, replayable via “Watch welcome animation”; it exits automatically or through Skip/Enter.
- Approved generated character artwork stored in `assets/satish-workspace.webp`. Original personal photographs are excluded.
- Browser-rendered eyelid-overlay blink, gentle camera/parallax motion and responsive reaction panels when sections are selected.
- About, Experience, Projects, Skills, Contact, résumé request, and fictional incident response simulation.

**Limitations:** The character is illustration-based (2.5D), not a fully rigged 3D model. A genuinely natural skeletal hand wave, independent head rotation and precise eye gaze tracking still require animated avatar assets. The résumé PDF is not yet committed.

## Testing locally

Clone this repository, run `python3 -m http.server 4219` from the repository root and visit `http://localhost:4219`.

The dedicated Netlify preview project has been created but no deployment has been confirmed. Do not modify the existing portfolio or production.
