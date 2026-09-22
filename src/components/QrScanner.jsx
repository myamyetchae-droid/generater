import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

const READER_ID = 'qr-reader'

export default function QrScanner() {
  const scannerRef = useRef(null)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  const stop = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch {
        // already stopped
      }
      setRunning(false)
    }
  }

  useEffect(() => () => stop(), [])

  const startCamera = async () => {
    setError('')
    setResult('')
    try {
      const scanner = new Html5Qrcode(READER_ID)
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          setResult(decoded)
          stop()
        },
        () => {}
      )
      setRunning(true)
    } catch (e) {
      setError(
        'Camera unavailable. Check permissions, or scan an image file instead.'
      )
    }
  }

  const scanFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    await stop()
    try {
      const scanner = scannerRef.current ?? new Html5Qrcode(READER_ID)
      scannerRef.current = scanner
      const decoded = await scanner.scanFile(file, true)
      setResult(decoded)
    } catch {
      setError('No QR code found in that image.')
    }
    e.target.value = ''
  }

  const isUrl = /^https?:\/\//i.test(result)

  return (
    <div className="scanner">
      <div id={READER_ID} className="reader" />

      <div className="row actions">
        {running ? (
          <button onClick={stop}>Stop camera</button>
        ) : (
          <button className="primary" onClick={startCamera}>
            Start camera
          </button>
        )}
        <label className="file-btn">
          Scan image file
          <input type="file" accept="image/*" onChange={scanFile} hidden />
        </label>
      </div>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <h3>Decoded</h3>
          <code>{result}</code>
          <div className="row actions">
            <button onClick={() => navigator.clipboard.writeText(result)}>
              Copy
            </button>
            {isUrl && (
              <a className="btn-link" href={result} target="_blank" rel="noreferrer">
                Open link
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
