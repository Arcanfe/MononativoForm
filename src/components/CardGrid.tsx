import type { TarotCard } from '../data/cards'
import TarotCardComponent from './TarotCard'

const MAX_SELECTION = 5

interface Props {
  cards: TarotCard[]
  selected: number[]
  onToggle: (id: number) => void
}

export default function CardGrid({ cards, selected, onToggle }: Props) {
  const atMax = selected.length >= MAX_SELECTION

  return (
    <div>
      <div className="card-grid">
        {cards.map((card) => {
          const isSelected = selected.includes(card.id)
          const isDisabled = atMax && !isSelected
          return (
            <TarotCardComponent
              key={card.id}
              card={card}
              isSelected={isSelected}
              isDisabled={isDisabled}
              onToggle={onToggle}
            />
          )
        })}
      </div>

      <p
        style={{
          marginTop: '16px',
          color: atMax ? 'var(--gold-bright)' : 'var(--gold)',
          fontFamily: "'IM Fell English', serif",
          fontStyle: 'italic',
          fontSize: '0.9rem',
          textAlign: 'center',
          letterSpacing: '0.03em',
        }}
      >
        {selected.length} / {MAX_SELECTION} cartas seleccionadas
      </p>
    </div>
  )
}
