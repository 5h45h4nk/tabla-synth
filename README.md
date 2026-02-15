# Tabla Loop Lab

A lightweight web app for bansuri practice with selectable taals and tempo control.

## Included Taals
- Teentaal (16 beats)
- Keherwa (8 beats)

## Tabla Sound Resources Used
This project now uses real tabla one-shot samples (FLAC) for primary playback.
Sample files are stored in `assets/samples/` and mapped to bols in `app.js`.

### Source and license
- Source: [Sonic Pi sample library](https://github.com/sonic-pi-net/sonic-pi/tree/dev/etc/samples)
- License statement: [Sonic Pi LICENSE.md](https://github.com/sonic-pi-net/sonic-pi/blob/dev/LICENSE.md)
- Bundled samples are licensed under **CC0 1.0** (public domain dedication)

### Downloaded sample files
- `tabla_na.flac`
- `tabla_na_s.flac`
- `tabla_re.flac`
- `tabla_tun1.flac`
- `tabla_tun2.flac`
- `tabla_tun3.flac`
- `tabla_te1.flac`
- `tabla_te2.flac`
- `tabla_te_m.flac`
- `tabla_te_ne.flac`
- `tabla_tas1.flac`
- `tabla_ke1.flac`
- `tabla_ghe1.flac`
- `tabla_ghe2.flac`
- `tabla_dhec.flac`

If FLAC decoding fails in the browser, the app falls back to the built-in synthesized tabla engine.

## Run
Run a local static server from the project root, then open it in a browser:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Install as App (PWA)
This project includes a web app manifest and service worker, so you can install it like an app.

1. Serve it on `localhost` or HTTPS.
2. Open in Chrome/Edge.
3. Use the browser install option (install icon in address bar or app menu).

After install:
- it opens in standalone app window
- core app files and tabla samples are cached for offline use

## Controls
- Select a taal
- Open `☰ Advanced` for sound pack options:
  - `Auto` (tries real samples first, falls back to synth)
  - `Sonic Pi (Real)` (prioritizes real sample playback)
  - `Synth` (always uses built-in synthesized tabla)
- Set tempo with slider in 5 BPM steps (40-700)
- Enter exact tempo with numeric BPM input (40-700)
- Use `- / +` nudge buttons for easier mobile tempo and tuning control
- Scale slider: chromatic pitch shift from -12 to +12 semitones (all bols)
- Tap tempo button (`Tap x2+`) to set BPM from your hand taps
- Play/Stop loop
- Click beat numbers to preview individual bols
- Sam/Taali/Khali markers are shown on the beat grid
- iPhone hint: if audio is missing, turn off silent mode and increase media volume

## Keyboard shortcuts
- `Space`: play/stop
- `ArrowUp` / `ArrowRight`: tempo +5
- `ArrowDown` / `ArrowLeft`: tempo -5
