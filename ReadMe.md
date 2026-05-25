# Magic 8 Ball (Static Web App)

A lightweight browser-based Magic 8 Ball built with plain HTML, CSS, and JavaScript.

## Features

- Click **Ask the 8 Ball** for a random classic answer
- Shake-to-answer support on devices with motion events
- iOS motion permission flow using `DeviceMotionEvent.requestPermission()`
- Graceful fallback when motion access is unavailable
- Random selection avoids immediate answer repeats when possible

## Run locally

Because this is static, you can either:

1. Open `index.html` directly in a browser, or
2. Serve it locally (recommended):
   - Python 3: `python -m http.server 8000`
   - Then open `http://localhost:8000`

## Notes

- On iOS Safari, tap **Enable shake access** first.
- If motion is denied, you can retry access and continue using the ask button.
- If motion is blocked or unsupported, the ask button still works fully.
