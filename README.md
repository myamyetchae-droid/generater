# GenerateR

Create QR codes — a React + Vite web app.

## Features

- **Generate** QR codes for:
  - Text
  - URL
  - Wi-Fi (SSID, password, WPA/WEP/open, hidden network)
  - Email (recipient, subject, body)
  - Phone number
  - SMS (number + message)
- **Customize** the QR code:
  - Size (128–1024 px)
  - Error correction level (L/M/Q/H)
  - Foreground and background colors
  - Optional logo overlay in the center (EC level auto-set to H to keep it scannable)
- **Download** as PNG or SVG
- **History** of generated codes stored in `localStorage` (keeps the last 5)

## Getting started

```bash
npm install
npm run dev
```

Then open the URL printed by Vite (default `http://localhost:5173`).

## Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start the Vite dev server      |
| `npm run build`   | Build for production to `dist` |
| `npm run preview` | Preview the production build   |

## Tech stack

- [React](https://react.dev) 19
- [Vite](https://vite.dev)
- [qrcode](https://www.npmjs.com/package/qrcode) — QR generation

## Project structure

```
src/
  components/
    QrGenerator.jsx   # QR code form, styling options, PNG/SVG download
    QrHistory.jsx     # Generated-code history list
  utils/
    qrPayload.js      # Builds QR payloads (WIFI:, mailto:, tel:, sms:, ...)
  App.jsx             # Tabs + history state
  main.jsx
  index.css
```

---

Developed by Chitchae
