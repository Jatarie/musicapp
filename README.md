# Sightline MIDI Reader

A browser-based music sight-reading trainer that connects to a MIDI keyboard, displays generated sheet music, and checks whether the played note matches the highlighted note.

## Run

Web MIDI is normally available only on secure origins or `localhost`. From this folder, start a local static server:

```powershell
python -m http.server 5173
```

Then open:

```text
http://localhost:5173
```

Use Chrome or Edge for the most reliable Web MIDI support.

## Deploy to GitHub Pages

This repository is ready to publish as a GitHub Pages app. The included workflow deploys the static files in the repository root whenever changes are pushed to `main` or `master`.

In GitHub, open the repository settings and set **Pages > Build and deployment > Source** to **GitHub Actions**. After the workflow runs, the app will be available at:

```text
https://<your-github-username>.github.io/<repository-name>/
```

GitHub Pages serves over HTTPS, so Web MIDI can request device access there in supported browsers.

## Features

- Treble, bass, and grand-staff practice ranges
- Configurable round length
- Optional accidentals
- MIDI input selection
- Optional octave-exact checking
- Computer-key demo mode for testing without a keyboard.
