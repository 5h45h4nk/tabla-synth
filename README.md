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
- `tabla_tun1.flac`
- `tabla_te1.flac`
- `tabla_te2.flac`
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

## Controls
- Select a taal
- Select a sound pack:
  - `Auto` (tries real samples first, falls back to synth)
  - `Sonic Pi (Real)` (prioritizes real sample playback)
  - `Synth` (always uses built-in synthesized tabla)
- Set tempo with slider in 5 BPM steps (40-240)
- Enter exact tempo with numeric BPM input (40-240)
- Play/Stop loop
