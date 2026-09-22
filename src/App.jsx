import { useEffect, useState } from 'react'
import QrGenerator from './components/QrGenerator.jsx'
import QrScanner from './components/QrScanner.jsx'
import QrHistory from './components/QrHistory.jsx'

const HISTORY_KEY = 'generater.history'

export default function App() {
  const [tab, setTab] = useState('generate')
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) ?? []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)))
  }, [history])

  const addToHistory = (entry) =>
    setHistory((h) => [{ id: Date.now(), createdAt: Date.now(), ...entry }, ...h].slice(0, 50))

  const removeFromHistory = (id) => setHistory((h) => h.filter((e) => e.id !== id))

  return (
    <div className="app">
      <header className="app-header">
        <h1>GenerateR</h1>
        <p>Create and scan QR codes</p>
      </header>

      <nav className="tabs">
        {[
          ['generate', 'Generate'],
          ['scan', 'Scan'],
          ['history', `History (${history.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? 'tab active' : 'tab'}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="panel">
        {tab === 'generate' && <QrGenerator onGenerate={addToHistory} />}
        {tab === 'scan' && <QrScanner />}
        {tab === 'history' && (
          <QrHistory items={history} onRemove={removeFromHistory} />
        )}
      </main>

      <footer className="app-footer">
        Developed by Chitchae
        <svg
          className="heart"
          viewBox="0 0 24 24"
          aria-label="love"
          role="img"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </footer>
    </div>
  )
}
