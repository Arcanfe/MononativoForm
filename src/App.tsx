import { useState, useEffect } from 'react'
import { TAROT_CARDS, shuffleCards } from './data/cards'
import { submitToSheet } from './lib/sheetsApi'
import CardGrid from './components/CardGrid'

type Status = 'idle' | 'submitting' | 'success' | 'wrong' | 'cooldown' | 'error'

const CORRECT_CARDS = new Set([1, 2, 3, 4, 5])
const COOLDOWN_MS = 30 * 60 * 1000
const COOLDOWN_KEY = 'tarot_cooldown_until'

function isCorrectSelection(selected: number[]): boolean {
  if (selected.length !== CORRECT_CARDS.size) return false
  return selected.every((id) => CORRECT_CARDS.has(id))
}

function formatRemaining(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const min = Math.floor(totalSec / 60).toString().padStart(2, '0')
  const sec = (totalSec % 60).toString().padStart(2, '0')
  return `${min}:${sec}`
}

export default function App() {
  const [shuffled] = useState(() => shuffleCards(TAROT_CARDS))
  const [email, setEmail] = useState('')
  const [selected, setSelected] = useState<number[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    const until = Number(localStorage.getItem(COOLDOWN_KEY) ?? 0)
    if (until > Date.now()) {
      setRemaining(until - Date.now())
      setStatus('cooldown')
    }
  }, [])

  useEffect(() => {
    if (status !== 'cooldown') return
    const interval = setInterval(() => {
      const until = Number(localStorage.getItem(COOLDOWN_KEY) ?? 0)
      const left = until - Date.now()
      if (left <= 0) {
        localStorage.removeItem(COOLDOWN_KEY)
        setStatus('idle')
        setRemaining(0)
        clearInterval(interval)
      } else {
        setRemaining(left)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [status])

  const toggleCard = (id: number) => {
    if (status === 'wrong') setStatus('idle')
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 5
        ? [...prev, id]
        : prev
    )
  }

  const canSubmit =
    email.includes('@') && email.includes('.') && selected.length === 5 && status === 'idle'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    if (!isCorrectSelection(selected)) {
      const until = Date.now() + COOLDOWN_MS
      localStorage.setItem(COOLDOWN_KEY, String(until))
      setRemaining(COOLDOWN_MS)
      setEmail('')
      setSelected([])
      setStatus('cooldown')
      return
    }

    setStatus('submitting')
    try {
      await submitToSheet(email)
      setStatus('success')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <>
      {status === 'cooldown' && (
        <div className="success-overlay">
          <div style={{ fontSize: '2.5rem', color: '#e05555' }}>⧗</div>
          <h2
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: '#e05555',
              fontSize: '1.5rem',
              letterSpacing: '0.08em',
            }}
          >
            Las cartas guardan silencio por ahora
          </h2>
          <p
            style={{
              fontFamily: "'IM Fell English', serif",
              fontStyle: 'italic',
              color: 'var(--parchment)',
              fontSize: '1.05rem',
              maxWidth: '420px',
              lineHeight: 1.7,
            }}
          >
            La combinación que elegiste no coincide con la visión de Lia. Las energías aún están dispersas, pero no te rindas. Vuelve a concentrarte y deja que tu intuición te guíe en un nuevo intento en:
          </p>
          <div
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: '3rem',
              color: '#e05555',
              letterSpacing: '0.1em',
              margin: '8px 0',
            }}
          >
            {formatRemaining(remaining)}
          </div>
        </div>
      )}

      {status === 'wrong' && (
        <div className="success-overlay">
          <div style={{ fontSize: '2.5rem', color: '#e05555' }}>✦</div>
          <h2
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: '#e05555',
              fontSize: '1.5rem',
              letterSpacing: '0.08em',
            }}
          >
            Las cartas guardan silencio por ahora
          </h2>
          <p
            style={{
              fontFamily: "'IM Fell English', serif",
              fontStyle: 'italic',
              color: 'var(--parchment)',
              fontSize: '1.05rem',
              maxWidth: '420px',
              lineHeight: 1.7,
            }}
          >
            La combinación que elegiste no coincide con la visión de Lia. Las energías aún están dispersas, pero no te rindas. Vuelve a concentrarte y deja que tu intuición te guíe en un nuevo intento.
          </p>
          <button
            onClick={() => {
              setEmail('')
              setSelected([])
              setStatus('idle')
            }}
            className="submit-btn"
            style={{ marginTop: '8px', borderColor: '#e05555', color: '#e05555' }}
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      {status === 'success' && (
        <div className="success-overlay">
          <div style={{ fontSize: '2.5rem', color: 'var(--gold-bright)' }}>✦</div>
          <h2
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              color: 'var(--gold)',
              fontSize: '1.6rem',
              letterSpacing: '0.08em',
            }}
          >
            ¡Felicitaciones!
          </h2>
          <p
            style={{
              fontFamily: "'IM Fell English', serif",
              fontStyle: 'italic',
              color: 'var(--parchment)',
              fontSize: '1.05rem',
              maxWidth: '420px',
              lineHeight: 1.7,
            }}
          >
            Tus ojos han visto lo que el destino ya ha escrito.
          </p>
          <p
            style={{
              fontFamily: "'IM Fell English', serif",
              fontStyle: 'italic',
              color: 'var(--parchment)',
              fontSize: '1.05rem',
              maxWidth: '420px',
              lineHeight: 1.7,
            }}
          >
            Has logrado sintonizar con la energía de la lectura y descifrar el mensaje del Alcalde. Las cartas no mienten: tu intuición es poderosa.
          </p>
          <p
            style={{
              fontFamily: "'IM Fell English', serif",
              fontStyle: 'italic',
              color: 'var(--parchment)',
              fontSize: '1.05rem',
              maxWidth: '420px',
              lineHeight: 1.7,
            }}
          >
            ¿Qué sigue? No desesperes. Mantén tu bandeja de entrada protegida, pues llegará a tu correo el secreto que el destino tiene guardado para ti.
          </p>
          <div style={{ fontSize: '1.5rem', color: 'var(--gold)', marginTop: '8px' }}>
            ✦ ✦ ✦
          </div>
          <a
            href="/downloads/carta-a-lia.pdf"
            download="carta-a-lia.pdf"
            className="submit-btn"
            style={{ marginTop: '8px', display: 'inline-block', textDecoration: 'none' }}
          >
            Descarga la carta a Lia
          </a>
          <button
            onClick={() => {
              setEmail('')
              setSelected([])
              setStatus('idle')
            }}
            className="submit-btn"
            style={{ marginTop: '8px' }}
          >
            Llenar otra vez
          </button>
        </div>
      )}

      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '40px 20px 60px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <h1
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: 'clamp(1.6rem, 5vw, 2.8rem)',
              background: 'linear-gradient(135deg, #c9a84c 0%, #ffd700 50%, #c9a84c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '0.06em',
              marginBottom: '4px',
            }}
          >
            El tarot de Lia
          </h1>
        </div>

        <div className="divider">✦</div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '36px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '10px',
                fontSize: '0.85rem',
                letterSpacing: '0.12em',
                color: 'var(--gold)',
                textTransform: 'uppercase',
              }}
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              className="tarot-input"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="divider">✦</div>

          <div style={{ marginBottom: '28px', textAlign: 'center' }}>
            <h2
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(1rem, 3vw, 1.4rem)',
                color: 'var(--gold)',
                letterSpacing: '0.04em',
                fontWeight: 600,
                marginBottom: '10px',
              }}
            >
              ¿Cual fue la lectura del alcalde?
            </h2>
            <p
              style={{
                fontFamily: "'IM Fell English', serif",
                fontStyle: 'italic',
                color: 'var(--parchment)',
                fontSize: '0.95rem',
                opacity: 0.8,
              }}
            >
              Selecciona exactamente 5 cartas
            </p>
          </div>

          <CardGrid cards={shuffled} selected={selected} onToggle={toggleCard} />

          <div className="divider" style={{ marginTop: '32px' }}>✦</div>

          {status === 'error' && (
            <p
              style={{
                color: '#e05555',
                fontFamily: "'IM Fell English', serif",
                fontStyle: 'italic',
                textAlign: 'center',
                marginBottom: '16px',
                fontSize: '0.9rem',
              }}
            >
              Algo salió mal al registrar tu lectura. Intenta de nuevo.
            </p>
          )}

          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <button
              type="submit"
              className="submit-btn"
              disabled={!canSubmit}
            >
              {status === 'submitting' ? 'Enviando...' : 'Revelar mi lectura'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
