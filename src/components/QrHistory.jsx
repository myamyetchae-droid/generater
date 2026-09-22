import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

function Thumb({ payload }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    QRCode.toDataURL(payload, { width: 96, margin: 1 })
      .then(setSrc)
      .catch(() => setSrc(''))
  }, [payload])
  return src ? <img src={src} alt="" width={48} height={48} /> : null
}

export default function QrHistory({ items, onRemove }) {
  if (items.length === 0) {
    return <p className="placeholder">Nothing generated yet.</p>
  }
  return (
    <ul className="history">
      {items.map((item) => (
        <li key={item.id}>
          <Thumb payload={item.payload} />
          <div className="meta">
            <span className="type">{item.type}</span>
            <code>{item.payload}</code>
            <time>{new Date(item.createdAt).toLocaleString()}</time>
          </div>
          <button className="remove" onClick={() => onRemove(item.id)}>
            Remove
          </button>
        </li>
      ))}
    </ul>
  )
}
