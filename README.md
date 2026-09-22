# GenerateR

Create and scan QR codes — a React + Vite web app.

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
- **Scan** QR codes with your device camera or by uploading an image file
- **History** of generated codes stored in `localStorage` (keeps the last 50)

## Getting started

```bash
npm install
npm run dev
```

Then open the URL printed by Vite (default `http://localhost:5173`).

> Camera scanning requires a secure context (HTTPS or `localhost`) and camera permission.

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
- [html5-qrcode](https://www.npmjs.com/package/html5-qrcode) — QR scanning

## Project structure

```
src/
  components/
    QrGenerator.jsx   # QR code form, styling options, PNG/SVG download
    QrScanner.jsx     # Camera + image-file scanning
    QrHistory.jsx     # Generated-code history list
  utils/
    qrPayload.js      # Builds QR payloads (WIFI:, mailto:, tel:, sms:, ...)
  App.jsx             # Tabs + history state
  main.jsx
  index.css
```

---

Developed by Chitchae
