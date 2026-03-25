import { useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  RotateCcw,
  ArrowLeftRight,
  Check,
  Layers,
} from "lucide-react"

import { useDeck, useCards, useUpdateProgress } from "@/hooks/useDecks"
import { FlipCardComponent } from "@/components/FlipCard"
import { Button } from "@/components/ui/button"

interface PlayState {
  currentIndex: number
  isReversed: boolean
  knownIds: string[]
  syncedDeckId: string | null
}

export default function PlayDeck() {
  const { deckId } = useParams<{ deckId: string }>()
  const navigate = useNavigate()
  const { data: deck } = useDeck(deckId!)
  const { data: cards } = useCards(deckId!)
  const updateProgress = useUpdateProgress()

  const [state, setState] = useState<PlayState>({
    currentIndex: 0,
    isReversed: false,
    knownIds: [],
    syncedDeckId: null,
  })
  const [direction, setDirection] = useState(0)

  // Restore progress from deck — single setState during render (getDerivedStateFromProps pattern)
  if (deck?.progress && state.syncedDeckId !== deck.id) {
    setState({
      currentIndex: deck.progress.currentIndex,
      isReversed: deck.progress.isReversed,
      knownIds: deck.progress.knownCardIds,
      syncedDeckId: deck.id,
    })
  }

  const { currentIndex, isReversed, knownIds } = state

  // Persist progress to Firestore
  const saveProgress = useCallback(
    (index: number, reversed: boolean, known: string[]) => {
      if (!deckId) return
      updateProgress.mutate({
        deckId,
        progress: {
          currentIndex: index,
          isReversed: reversed,
          knownCardIds: known,
          lastPlayedAt: Date.now(),
        },
      })
    },
    [deckId, updateProgress],
  )

  if (!deck || !cards) {
    return (
      <div className="bg-background flex min-h-svh items-center justify-center">
        <Layers className="text-muted-foreground h-8 w-8 animate-pulse" />
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-4 px-4">
        <Layers className="text-muted-foreground h-12 w-12" />
        <p className="text-muted-foreground text-lg font-medium">
          No cards in this deck yet
        </p>
        <Button variant="outline" onClick={() => navigate(`/deck/${deckId}/manage`)}>
          Add Cards
        </Button>
      </div>
    )
  }

  const safeIndex = Math.min(currentIndex, cards.length - 1)
  const card = cards[safeIndex]
  const total = cards.length
  const knownCount = knownIds.length
  const progressPercent = total > 0 ? Math.round((knownCount / total) * 100) : 0

  const goTo = (idx: number) => {
    setDirection(idx > safeIndex ? 1 : -1)
    const next = Math.max(0, Math.min(idx, total - 1))
    setState((prev) => ({ ...prev, currentIndex: next }))
    saveProgress(next, isReversed, knownIds)
  }

  const toggleReverse = () => {
    const next = !isReversed
    setState((prev) => ({ ...prev, isReversed: next }))
    saveProgress(safeIndex, next, knownIds)
  }

  const toggleKnown = () => {
    const id = card.id
    const nextKnown = knownIds.includes(id)
      ? knownIds.filter((k) => k !== id)
      : [...knownIds, id]
    setState((prev) => ({ ...prev, knownIds: nextKnown }))
    saveProgress(safeIndex, isReversed, nextKnown)
  }

  const resetProgress = () => {
    setState((prev) => ({ ...prev, currentIndex: 0, knownIds: [] }))
    saveProgress(0, isReversed, [])
  }

  return (
    <div className="bg-background flex min-h-svh flex-col">
      {/* ── Header ── */}
      <header className="border-border/50 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="flex h-14 items-center gap-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/home")}
            className="h-10 w-10 shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-bold">{deck.name}</h1>
            <p className="text-muted-foreground truncate text-xs">
              {safeIndex + 1} / {total} · {progressPercent}% mastered
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleReverse}
            className={`h-10 w-10 shrink-0 ${isReversed ? "text-primary" : "text-muted-foreground"}`}
            aria-label="Toggle reverse"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="bg-muted h-1 w-full">
          <motion.div
            className="bg-primary h-full"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" as const }}
          />
        </div>
      </header>

      {/* ── Card area ── */}
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={card.id + (isReversed ? "-r" : "")}
            custom={direction}
            initial={{ opacity: 0, x: direction * 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -80 }}
            transition={{ duration: 0.25, ease: "easeOut" as const }}
            className="w-full max-w-sm"
          >
            <FlipCardComponent
              front={card.front}
              back={card.back}
              frontLabel={deck.frontLabel}
              backLabel={deck.backLabel}
              isReversed={isReversed}
            />
          </motion.div>
        </AnimatePresence>

        {/* Mastered badge */}
        {knownIds.includes(card.id) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/15 text-primary flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          >
            <Check className="h-3 w-3" /> Mastered
          </motion.div>
        )}
      </main>

      {/* ── Bottom controls ── */}
      <nav
        className="border-border/50 bg-background/90 sticky bottom-0 z-40 border-t backdrop-blur-lg"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex h-16 items-center justify-around px-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12"
            onClick={() => goTo(safeIndex - 1)}
            disabled={safeIndex === 0}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12"
            onClick={resetProgress}
            aria-label="Reset progress"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>

          <Button
            variant={knownIds.includes(card.id) ? "default" : "outline"}
            className="h-12 gap-2 px-5"
            onClick={toggleKnown}
          >
            <Check className="h-4 w-4" />
            <span className="text-sm">
              {knownIds.includes(card.id) ? "Mastered" : "Got it"}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12"
            onClick={() => goTo(safeIndex + 1)}
            disabled={safeIndex === total - 1}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </nav>
    </div>
  )
}
