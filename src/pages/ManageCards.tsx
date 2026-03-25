import { useState } from "react"
import { useParams, useNavigate } from "react-router"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ChevronLeft,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  Layers,
} from "lucide-react"

import {
  useDeck,
  useCards,
  useCreateCard,
  useUpdateCard,
  useDeleteCard,
} from "@/hooks/useDecks"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import type { FlipCard } from "@/types/deck"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const cardSchema = z.object({
  front: z.string().min(1, "Front side is required"),
  back: z.string().min(1, "Back side is required"),
})
type CardFormValues = z.infer<typeof cardSchema>

export default function ManageCards() {
  const { deckId } = useParams<{ deckId: string }>()
  const navigate = useNavigate()
  const { data: deck } = useDeck(deckId!)
  const { data: cards, isLoading } = useCards(deckId!)
  const createCard = useCreateCard(deckId!)
  const updateCard = useUpdateCard(deckId!)
  const deleteCard = useDeleteCard(deckId!)

  const [search, setSearch] = useState("")
  const [editingCard, setEditingCard] = useState<FlipCard | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: { front: "", back: "" },
  })

  const filteredCards = (cards ?? []).filter((c) => {
    const q = search.toLowerCase()
    return c.front.toLowerCase().includes(q) || c.back.toLowerCase().includes(q)
  })

  const openCreate = () => {
    setEditingCard(null)
    reset({ front: "", back: "" })
    setShowForm(true)
  }

  const openEdit = (card: FlipCard) => {
    setEditingCard(card)
    reset({ front: card.front, back: card.back })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingCard(null)
    reset({ front: "", back: "" })
  }

  const onSubmit = async (data: CardFormValues) => {
    if (editingCard) {
      await updateCard.mutateAsync({ cardId: editingCard.id, data })
    } else {
      await createCard.mutateAsync(data)
    }
    closeForm()
  }

  const handleDelete = async () => {
    if (!deletingCardId) return
    await deleteCard.mutateAsync(deletingCardId)
    setDeletingCardId(null)
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
            <h1 className="truncate text-sm font-bold">{deck?.name ?? "Manage Cards"}</h1>
            <p className="text-muted-foreground text-xs">{cards?.length ?? 0} cards</p>
          </div>
          <Button size="sm" className="h-10 gap-1.5" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </Button>
        </div>
      </header>

      {/* ── Search bar ── */}
      <div className="border-border/30 border-b px-4 py-3">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={`Search by ${deck?.frontLabel ?? "front"} or ${deck?.backLabel ?? "back"}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pl-9 text-base"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Card table ── */}
      <main className="flex-1 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-20">
            <Layers className="text-muted-foreground h-10 w-10" />
            <p className="text-muted-foreground text-sm">
              {search
                ? "No cards match your search"
                : "No cards yet — tap Add to create one"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Table header */}
            <div className="border-border/50 bg-muted/50 text-muted-foreground sticky top-0 z-10 grid grid-cols-[1fr_1fr_auto] gap-px border-b px-4 py-2.5 text-xs font-semibold tracking-wider uppercase">
              <span>{deck?.frontLabel ?? "Front"}</span>
              <span>{deck?.backLabel ?? "Back"}</span>
              <span className="w-20 text-center">Actions</span>
            </div>

            {/* Table rows */}
            <div className="divide-border/30 divide-y">
              <AnimatePresence>
                {filteredCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.2 }}
                    className={`grid min-h-[52px] grid-cols-[1fr_1fr_auto] items-center gap-px px-4 py-3 ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    } active:bg-muted/40 transition-colors`}
                  >
                    <span className="truncate pr-3 text-sm font-medium">
                      {card.front}
                    </span>
                    <span className="text-muted-foreground truncate pr-3 text-sm">
                      {card.back}
                    </span>
                    <div className="flex w-20 justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground h-9 w-9"
                        onClick={() => openEdit(card)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-9 w-9"
                        onClick={() => setDeletingCardId(card.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary footer */}
            <div className="border-border/50 text-muted-foreground border-t px-4 py-2.5 text-xs">
              {filteredCards.length} of {cards?.length ?? 0} cards
              {search && " matching"}
            </div>
          </div>
        )}
      </main>

      {/* ── Bottom sheet form for add/edit ── */}
      <AnimatePresence>
        {showForm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60"
              onClick={closeForm}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="bg-background fixed inset-x-0 bottom-0 z-[60] rounded-t-2xl"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
            >
              <div className="px-4 pt-4 pb-8">
                <div className="bg-muted mx-auto mb-4 h-1 w-10 rounded-full" />
                <h3 className="mb-4 text-lg font-bold">
                  {editingCard ? "Edit Card" : "New Card"}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>{deck?.frontLabel ?? "Front"}</Label>
                    <Input
                      placeholder={`Enter ${deck?.frontLabel ?? "front"} side...`}
                      className="h-12 text-base"
                      {...register("front")}
                    />
                    {errors.front && (
                      <p className="text-destructive text-xs">{errors.front.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>{deck?.backLabel ?? "Back"}</Label>
                    <Input
                      placeholder={`Enter ${deck?.backLabel ?? "back"} side...`}
                      className="h-12 text-base"
                      {...register("back")}
                    />
                    {errors.back && (
                      <p className="text-destructive text-xs">{errors.back.message}</p>
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 flex-1"
                      onClick={closeForm}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="h-12 flex-1" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingCard ? "Save" : "Add Card"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deletingCardId}
        title="Delete Card?"
        description="This card will be permanently removed from the deck."
        confirmLabel="Delete Card"
        onConfirm={handleDelete}
        onCancel={() => setDeletingCardId(null)}
      />
    </div>
  )
}
