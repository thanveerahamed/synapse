export interface Deck {
  id: string
  name: string
  description: string
  frontLabel: string // e.g. "Dutch", "Number", "Question"
  backLabel: string // e.g. "English", "Word", "Answer"
  cardCount: number
  progress: DeckProgress
  createdAt: number
  updatedAt: number
}

export interface DeckProgress {
  currentIndex: number
  isReversed: boolean
  knownCardIds: string[]
  lastPlayedAt: number | null
}

export interface FlipCard {
  id: string
  front: string
  back: string
  createdAt: number
}

export const DEFAULT_PROGRESS: DeckProgress = {
  currentIndex: 0,
  isReversed: false,
  knownCardIds: [],
  lastPlayedAt: null,
}
