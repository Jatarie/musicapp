# Sightline Music Reader

A browser-based MusicXML practice app. It loads scores from a library, follows MIDI input through each page, and records completion time and note accuracy.

## Run

Web MIDI and repository score loading require a secure origin or `localhost`. From this folder, start a static server:

```powershell
python -m http.server 5173
```

Then open `http://localhost:5173` in Chrome or Edge.

## Score library

Repository MusicXML files are listed in `MUSIC_XML_LIBRARY` near the top of `app.js`. Static web apps cannot enumerate files in their deployed directory, so add one manifest entry when adding a new `.xml` or `.musicxml` score.

Users can also load a local score with **Import MusicXML**.

## Performance statistics

Timing starts with the first played note and ends when the final target in the piece is completed. Accuracy is calculated as completed note/chord targets divided by completed targets plus incorrect note presses. Completed results are stored in browser `localStorage` and shown in the score library.

## Features

- MusicXML score library and local MusicXML import
- Four systems of two measures per page
- Automatic page progression
- Meter, key, voices, chords, rests, ties, and slurs from MusicXML
- MIDI input selection and octave-exact checking
- Per-piece best/last completion time and accuracy
- Optional Space-bar input for testing without a MIDI keyboard
