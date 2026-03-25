import { useState } from "react"
import { useNavigate } from "react-router"
import { motion } from "framer-motion"
import { Plus, Play, Pencil, Trash2, Layers, BookOpen, Loader2 } from "lucide-react"

import { useDecks, useCreateDeck, useUpdateDeck, useDeleteDeck } from "@/hooks/useDecks"
import { DeckForm } from "@/components/DeckForm"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import type { Deck } from "@/types/deck"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const containerVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
}

export function DashboardTab() {
  const navigate = useNavigate()
  const { data: decks, isLoading } = useDecks()
  const createDeck = useCreateDeck()
  const updateDeck = useUpdateDeck()
  const deleteDeck = useDeleteDeck()

  const [formOpen, setFormOpen] = useState(false)
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null)
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null)

  const openCreate = () => {
    setEditingDeck(null)
    setFormOpen(true)
  }

  const openEdit = (deck: Deck) => {
    setEditingDeck(deck)
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: {
    name: string
    description?: string
    frontLabel: string
    backLabel: string
  }) => {
    if (editingDeck) {
      await updateDeck.mutateAsync({ deckId: editingDeck.id, data })
    } else {
      await createDeck.mutateAsync({
        name: data.name,
        description: data.description ?? "",
        frontLabel: data.frontLabel,
        backLabel: data.backLabel,
      })
    }
  }

  const handleDelete = async () => {
    if (!deletingDeckId) return
    await deleteDeck.mutateAsync(deletingDeckId)
    setDeletingDeckId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Decks</h2>
          <p className="text-muted-foreground text-sm">Tap a deck to start learning</p>
        </div>
        <Button className="h-10 gap-1.5" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          <span>New Deck</span>
        </Button>
      </div>

      {/* Deck list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      ) : !decks || decks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-border flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed py-16"
        >
          <Layers className="text-muted-foreground h-12 w-12" />
          <div className="text-center">
            <p className="text-base font-medium">No decks yet</p>
            <p className="text-muted-foreground text-sm">
              Create your first deck to start learning
            </p>
          </div>
          <Button onClick={openCreate} className="gap-1.5">
            <Plus className="h-4 w-4" /> Create Deck
          </Button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="space-y-3"
        >
          {decks.map((deck) => {
            const total = deck.cardCount
            const known = deck.progress?.knownCardIds?.length ?? 0
            const pct = total > 0 ? Math.round((known / total) * 100) : 0
            const lastPlayed = deck.progress?.lastPlayedAt
              ? new Date(deck.progress.lastPlayedAt).toLocaleDateString()
              : null

            return (
              <motion.div key={deck.id} variants={itemVariants}>
                <Card className="overflow-hidden transition-shadow active:shadow-lg">
                  <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-base">{deck.name}</CardTitle>
                      {deck.description && (
                        <p className="text-muted-foreground mt-0.5 truncate text-xs">
                          {deck.description}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground h-9 w-9"
                        onClick={() => openEdit(deck)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-9 w-9"
                        onClick={() => setDeletingDeckId(deck.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Meta info */}
                    <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {total} cards
                      </span>
                      <span>
                        {deck.frontLabel} → {deck.backLabel}
                      </span>
                      {lastPlayed && <span>Played {lastPlayed}</span>}
                    </div>

                    {/* Progress bar */}
                    {total > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-primary font-medium">{pct}%</span>
                        </div>
                        <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                          <motion.div
                            className="bg-primary h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{
                              duration: 0.6,
                              ease: "easeOut" as const,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        className="h-10 flex-1 gap-1.5"
                        onClick={() => navigate(`/deck/${deck.id}/play`)}
                        disabled={total === 0}
                      >
                        <Play className="h-4 w-4" />
                        {deck.progress?.lastPlayedAt ? "Continue" : "Start"}
                      </Button>
                      <Button
                        variant="outline"
                        className="h-10 flex-1 gap-1.5"
                        onClick={() => navigate(`/deck/${deck.id}/manage`)}
                      >
                        <Pencil className="h-4 w-4" />
                        Cards
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Deck form bottom sheet */}
      <DeckForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        deck={editingDeck}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deletingDeckId}
        title="Delete Deck?"
        description="This will permanently delete this deck and all its cards. This action cannot be undone."
        confirmLabel="Delete Deck"
        onConfirm={handleDelete}
        onCancel={() => setDeletingDeckId(null)}
      />
    </div>
  )
}
