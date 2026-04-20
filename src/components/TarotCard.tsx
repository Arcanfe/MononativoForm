import type { TarotCard as TarotCardType } from '../data/cards'

interface Props {
  card: TarotCardType
  isSelected: boolean
  isDisabled: boolean
  onToggle: (id: number) => void
}

export default function TarotCard({ card, isSelected, isDisabled, onToggle }: Props) {
  const classes = [
    'tarot-card',
    isSelected ? 'selected' : '',
    isDisabled ? 'disabled' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classes}
      onClick={() => !isDisabled && onToggle(card.id)}
      role="checkbox"
      aria-checked={isSelected}
      aria-label={card.label}
      tabIndex={isDisabled ? -1 : 0}
      onKeyDown={(e) => e.key === 'Enter' && !isDisabled && onToggle(card.id)}
    >
      <img src={card.image} alt={card.label} draggable={false} />
    </div>
  )
}
