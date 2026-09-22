const escapeWifi = (s) => s.replace(/([\\;,:"'])/g, '\\$1')

export function buildPayload(type, fields) {
  switch (type) {
    case 'url': {
      let url = fields.url.trim()
      if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`
      return url
    }
    case 'email': {
      const params = new URLSearchParams()
      if (fields.subject) params.set('subject', fields.subject)
      if (fields.body) params.set('body', fields.body)
      const qs = params.toString()
      return `mailto:${fields.address}${qs ? `?${qs}` : ''}`
    }
    case 'phone':
      return `tel:${fields.number}`
    case 'sms': {
      return `sms:${fields.number}${fields.message ? `?body=${encodeURIComponent(fields.message)}` : ''}`
    }
    case 'wifi': {
      const hidden = fields.hidden ? 'H:true;' : ''
      const pass = fields.encryption === 'nopass' ? '' : `P:${escapeWifi(fields.password)};`
      return `WIFI:T:${fields.encryption};S:${escapeWifi(fields.ssid)};${pass}${hidden};`
    }
    case 'text':
    default:
      return fields.text
  }
}
