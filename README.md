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

## Features

- Treble, bass, and grand-staff practice ranges
- Configurable round length
- Optional accidentals
- MIDI input selection
- Optional octave-exact checking
- Computer-key demo mode for testing without a keyboard
