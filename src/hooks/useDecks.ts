import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/context/useAuth"
import {
  fetchDecks,
  fetchDeck,
  createDeck,
  updateDeck,
  deleteDeck,
  updateDeckProgress,
  fetchCards,
  createCard,
  updateCard,
  deleteCard,
  bulkCreateCards,
} from "@/lib/firestore"
import type { Deck, FlipCard, DeckProgress } from "@/types/deck"

// ── Decks ──

export function useDecks() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ["decks", user?.uid],
    queryFn: () => fetchDecks(user!.uid),
    enabled: !!user,
  })
}

export function useDeck(deckId: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ["deck", user?.uid, deckId],
    queryFn: () => fetchDeck(user!.uid, deckId),
    enabled: !!user && !!deckId,
  })
}

export function useCreateDeck() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Pick<Deck, "name" | "description" | "frontLabel" | "backLabel">) =>
      createDeck(user!.uid, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["decks"] }),
  })
}

export function useUpdateDeck() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      deckId,
      data,
    }: {
      deckId: string
      data: Partial<Pick<Deck, "name" | "description" | "frontLabel" | "backLabel">>
    }) => updateDeck(user!.uid, deckId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["decks"] }),
  })
}

export function useDeleteDeck() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (deckId: string) => deleteDeck(user!.uid, deckId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["decks"] }),
  })
}

export function useUpdateProgress() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      deckId,
      progress,
    }: {
      deckId: string
      progress: Partial<DeckProgress>
    }) => updateDeckProgress(user!.uid, deckId, progress),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["deck", user?.uid, vars.deckId] })
      qc.invalidateQueries({ queryKey: ["decks"] })
    },
  })
}

// ── Cards ──

export function useCards(deckId: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ["cards", user?.uid, deckId],
    queryFn: () => fetchCards(user!.uid, deckId),
    enabled: !!user && !!deckId,
  })
}

export function useCreateCard(deckId: string) {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Pick<FlipCard, "front" | "back">) =>
      createCard(user!.uid, deckId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards", user?.uid, deckId] })
      qc.invalidateQueries({ queryKey: ["decks"] })
    },
  })
}

export function useUpdateCard(deckId: string) {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      cardId,
      data,
    }: {
      cardId: string
      data: Pick<FlipCard, "front" | "back">
    }) => updateCard(user!.uid, deckId, cardId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cards", user?.uid, deckId] }),
  })
}

export function useDeleteCard(deckId: string) {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (cardId: string) => deleteCard(user!.uid, deckId, cardId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards", user?.uid, deckId] })
      qc.invalidateQueries({ queryKey: ["decks"] })
    },
  })
}

export function useBulkCreateCards(deckId: string) {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (cards: Pick<FlipCard, "front" | "back">[]) =>
      bulkCreateCards(user!.uid, deckId, cards),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cards", user?.uid, deckId] })
      qc.invalidateQueries({ queryKey: ["decks"] })
      qc.invalidateQueries({ queryKey: ["deck", user?.uid, deckId] })
    },
  })
}
