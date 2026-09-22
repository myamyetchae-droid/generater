import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { buildPayload } from '../utils/qrPayload.js'
import { drawRoundedQr, roundedQrSvg } from '../utils/qrStyle.js'

const TYPES = [
  ['text', 'Text'],
  ['url', 'URL'],
  ['wifi', 'Wi-Fi'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['sms', 'SMS'],
]

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

const EMPTY = {
  text: '',
  url: '',
  ssid: '',
  password: '',
  encryption: 'WPA',
  hidden: false,
  address: '',
  subject: '',
  body: '',
  number: '',
  message: '',
}

export default function QrGenerator({ onGenerate }) {
  const [type, setType] = useState('text')
  const [fields, setFields] = useState(EMPTY)
  const [size, setSize] = useState(256)
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [level, setLevel] = useState('M')
  const [moduleShape, setModuleShape] = useState('rounded')
  const [logo, setLogo] = useState(null)
  const [dataUrl, setDataUrl] = useState('')
  const [error, setError] = useState('')

  const payload = useMemo(() => buildPayload(type, fields), [type, fields])
  const qrOpts = useMemo(
    () => ({
      width: size,
      margin: 2,
      errorCorrectionLevel: level,
      color: { dark: fgColor, light: bgColor },
    }),
    [size, level, fgColor, bgColor]
  )

  const set = (key) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFields((f) => ({ ...f, [key]: v }))
  }

  const onLogo = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setLogo(reader.result)
      setLevel('H')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  useEffect(() => {
    if (!payload) {
      setDataUrl('')
      setError('')
      return
    }
    let cancelled = false
    const t = setTimeout(async () => {
      try {
        const canvas = document.createElement('canvas')
        if (moduleShape === 'rounded') {
          drawRoundedQr(canvas, payload, {
            width: size,
            level,
            fg: fgColor,
            bg: bgColor,
          })
        } else {
          await QRCode.toCanvas(canvas, payload, qrOpts)
        }
        if (logo) {
          const img = await loadImage(logo)
          const ctx = canvas.getContext('2d')
          const s = canvas.width * 0.22
          const pad = s * 0.18
          const pos = (canvas.width - s) / 2
          ctx.fillStyle = bgColor
          ctx.beginPath()
          if (ctx.roundRect) {
            ctx.roundRect(pos - pad, pos - pad, s + pad * 2, s + pad * 2, s * 0.2)
          } else {
            ctx.rect(pos - pad, pos - pad, s + pad * 2, s + pad * 2)
          }
          ctx.fill()
          ctx.drawImage(img, pos, pos, s, s)
        }
        if (cancelled) return
        setDataUrl(canvas.toDataURL('image/png'))
        setError('')
        onGenerate({ payload, type })
      } catch {
        if (!cancelled) setError('Content too long for this QR code.')
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, qrOpts, moduleShape, size, level, fgColor, logo, bgColor])

  const downloadPng = () => {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `qr-${type}.png`
    a.click()
  }

  const downloadSvg = async () => {
    let svg
    if (moduleShape === 'rounded') {
      svg = roundedQrSvg(payload, { level, fg: fgColor, bg: bgColor, logo })
    } else {
      svg = await QRCode.toString(payload, { ...qrOpts, type: 'svg' })
    }
    if (logo && moduleShape !== 'rounded') {
      const vb = Number(svg.match(/viewBox="0 0 (\d+)/)?.[1]) || 25
      const s = vb * 0.22
      const pad = s * 0.18
      const pos = (vb - s) / 2
      svg = svg.replace(
        '</svg>',
        `<rect x="${pos - pad}" y="${pos - pad}" width="${s + pad * 2}" height="${s + pad * 2}" rx="${s * 0.2}" fill="${bgColor}"/>` +
          `<image href="${logo}" x="${pos}" y="${pos}" width="${s}" height="${s}" preserveAspectRatio="xMidYMid meet"/></svg>`
      )
    }
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `qr-${type}.svg`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="generator">
      <div className="form">
        <div className="type-picker">
          {TYPES.map(([key, label]) => (
            <button
              key={key}
              className={type === key ? 'chip active' : 'chip'}
              onClick={() => setType(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {type === 'text' && (
          <label>
            Text
            <textarea
              rows={3}
              value={fields.text}
              onChange={set('text')}
              placeholder="Any text…"
            />
          </label>
        )}

        {type === 'url' && (
          <label>
            URL
            <input
              value={fields.url}
              onChange={set('url')}
              placeholder="example.com"
            />
          </label>
        )}

        {type === 'wifi' && (
          <>
            <label>
              Network name (SSID)
              <input value={fields.ssid} onChange={set('ssid')} />
            </label>
            <label>
              Password
              <input value={fields.password} onChange={set('password')} />
            </label>
            <div className="row">
              <label>
                Security
                <select value={fields.encryption} onChange={set('encryption')}>
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None</option>
                </select>
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={fields.hidden}
                  onChange={set('hidden')}
                />
                Hidden network
              </label>
            </div>
          </>
        )}

        {type === 'email' && (
          <>
            <label>
              Recipient
              <input
                type="email"
                value={fields.address}
                onChange={set('address')}
                placeholder="name@example.com"
              />
            </label>
            <label>
              Subject
              <input value={fields.subject} onChange={set('subject')} />
            </label>
            <label>
              Body
              <textarea rows={3} value={fields.body} onChange={set('body')} />
            </label>
          </>
        )}

        {type === 'phone' && (
          <label>
            Phone number
            <input
              type="tel"
              value={fields.number}
              onChange={set('number')}
              placeholder="+1234567890"
            />
          </label>
        )}

        {type === 'sms' && (
          <>
            <label>
              Phone number
              <input
                type="tel"
                value={fields.number}
                onChange={set('number')}
                placeholder="+1234567890"
              />
            </label>
            <label>
              Message
              <textarea rows={3} value={fields.message} onChange={set('message')} />
            </label>
          </>
        )}

        <fieldset>
          <legend>Style</legend>
          <div className="row">
            <label>
              Size: {size}px
              <input
                type="range"
                min={128}
                max={1024}
                step={32}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
            </label>
            <label>
              EC level
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="L">L (7%)</option>
                <option value="M">M (15%)</option>
                <option value="Q">Q (25%)</option>
                <option value="H">H (30%)</option>
              </select>
            </label>
          </div>
          <div className="row">
            <label>
              Module shape
              <select
                value={moduleShape}
                onChange={(e) => setModuleShape(e.target.value)}
              >
                <option value="rounded">Rounded</option>
                <option value="square">Square</option>
              </select>
            </label>
          </div>
          <div className="row">
            <label>
              Foreground
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
              />
            </label>
            <label>
              Background
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
            </label>
          </div>
          <div className="row logo-row">
            <span className="logo-label">Logo</span>
            {logo ? (
              <>
                <img className="logo-thumb" src={logo} alt="logo" />
                <button type="button" onClick={() => setLogo(null)}>
                  Remove
                </button>
                <span className="hint">EC set to H so it stays scannable</span>
              </>
            ) : (
              <label className="file-btn">
                Select logo
                <input type="file" accept="image/*" onChange={onLogo} hidden />
              </label>
            )}
          </div>
        </fieldset>
      </div>

      <div className="preview">
        {dataUrl ? (
          <>
            <img src={dataUrl} alt="QR code preview" />
            <div className="row actions">
              <button className="primary" onClick={downloadPng}>
                Download PNG
              </button>
              <button onClick={downloadSvg}>Download SVG</button>
            </div>
          </>
        ) : (
          <div className="placeholder">
            {error || 'Fill in the fields to generate a QR code'}
          </div>
        )}
        {payload && (
          <details className="payload">
            <summary>Encoded content</summary>
            <code>{payload}</code>
          </details>
        )}
      </div>
    </div>
  )
}
