export interface TarotCard {
  id: number
  label: string
  image: string
}

export const TAROT_CARDS: TarotCard[] = [
  { id: 1,  label: 'JUSTICE', image: '/cards/card-01.png' },
  { id: 2,  label: 'THE DEVIL', image: '/cards/card-02.png' },
  { id: 3,  label: 'DEATH', image: '/cards/card-03.png' },
  { id: 4,  label: 'KING OF COINS', image: '/cards/card-04.png' },
  { id: 5,  label: 'THE LOVERS', image: '/cards/card-05.png' },
  { id: 6,  label: 'THE REAPER', image: '/cards/card-06.png' },
  { id: 7,  label: 'THE STRANGERS', image: '/cards/card-07.png' },
  { id: 8,  label: 'DUKE OF COINS', image: '/cards/card-08.png' },
  { id: 9,  label: 'AMBITION', image: '/cards/card-09.png' },
  { id: 10, label: 'THE JESTER', image: '/cards/card-10.png' },
  { id: 11, label: 'THE ECLIPSE', image: '/cards/card-11.png' },
  { id: 12, label: 'ACE OF STONES', image: '/cards/card-12.png' },
  { id: 13, label: 'DUKE OF DIAMONDS', image: '/cards/card-13.png' },
  { id: 14, label: 'DEAD', image: '/cards/card-14.png' },
  { id: 15, label: 'THE SECRET', image: '/cards/card-15.png' },
  { id: 16, label: 'KNIGHT OF CROWS', image: '/cards/card-16.png' },
]

export function shuffleCards<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
