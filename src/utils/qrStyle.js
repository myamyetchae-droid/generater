import QRCode from 'qrcode'

const MARGIN = 2 // quiet zone in modules, matches qrOpts.margin

const inFinder = (row, col, n) =>
  (row < 7 && col < 7) || (row < 7 && col >= n - 7) || (row >= n - 7 && col < 7)

const roundRect = (ctx, x, y, w, h, r) => {
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r)
  else ctx.rect(x, y, w, h)
}

export function drawRoundedQr(canvas, payload, { width, level, fg, bg }) {
  const { modules } = QRCode.create(payload, { errorCorrectionLevel: level })
  const n = modules.size
  const cell = width / (n + MARGIN * 2)
  canvas.width = width
  canvas.height = width

  const ctx = canvas.getContext('2d')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, width)
  ctx.fillStyle = fg

  const inset = cell * 0.06
  const dot = cell - inset * 2

  ctx.beginPath()
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (!modules.get(row, col) || inFinder(row, col, n)) continue
      roundRect(ctx, (col + MARGIN) * cell + inset, (row + MARGIN) * cell + inset, dot, dot, dot * 0.38)
    }
  }
  ctx.fill()

  const finder = (fx, fy) => {
    ctx.beginPath()
    roundRect(ctx, fx, fy, cell * 7, cell * 7, cell * 1.75)
    ctx.fill()
    ctx.fillStyle = bg
    ctx.beginPath()
    roundRect(ctx, fx + cell, fy + cell, cell * 5, cell * 5, cell * 1.2)
    ctx.fill()
    ctx.fillStyle = fg
    ctx.beginPath()
    roundRect(ctx, fx + cell * 2, fy + cell * 2, cell * 3, cell * 3, cell * 0.9)
    ctx.fill()
  }

  const o = MARGIN * cell
  const e = (n - 7 + MARGIN) * cell
  finder(o, o)
  finder(e, o)
  finder(o, e)
}

export function roundedQrSvg(payload, { level, fg, bg, logo }) {
  const { modules } = QRCode.create(payload, { errorCorrectionLevel: level })
  const n = modules.size
  const vb = n + MARGIN * 2
  const inset = 0.06
  const dot = 1 - inset * 2

  let dots = ''
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (!modules.get(row, col) || inFinder(row, col, n)) continue
      dots += `<rect x="${col + MARGIN + inset}" y="${row + MARGIN + inset}" width="${dot}" height="${dot}" rx="${dot * 0.38}"/>`
    }
  }

  const finder = (x, y) =>
    `<rect x="${x}" y="${y}" width="7" height="7" rx="1.75"/>` +
    `<rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="1.2" fill="${bg}"/>` +
    `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="0.9"/>`

  const e = n - 7 + MARGIN

  let logoSvg = ''
  if (logo) {
    const s = vb * 0.22
    const pad = s * 0.18
    const pos = (vb - s) / 2
    logoSvg =
      `<rect x="${pos - pad}" y="${pos - pad}" width="${s + pad * 2}" height="${s + pad * 2}" rx="${s * 0.2}" fill="${bg}"/>` +
      `<image href="${logo}" x="${pos}" y="${pos}" width="${s}" height="${s}" preserveAspectRatio="xMidYMid meet"/>`
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb} ${vb}">` +
    `<rect width="${vb}" height="${vb}" fill="${bg}"/>` +
    `<g fill="${fg}">${dots}${finder(MARGIN, MARGIN)}${finder(e, MARGIN)}${finder(MARGIN, e)}</g>` +
    `${logoSvg}</svg>`
  )
}
