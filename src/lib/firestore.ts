import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { DEFAULT_PROGRESS } from "@/types/deck"
import type { Deck, FlipCard, DeckProgress } from "@/types/deck"

// ── Deck helpers ──

function decksCol(uid: string) {
  return collection(db, "users", uid, "decks")
}

function deckRef(uid: string, deckId: string) {
  return doc(db, "users", uid, "decks", deckId)
}

// ── Card helpers ──

function cardsCol(uid: string, deckId: string) {
  return collection(db, "users", uid, "decks", deckId, "cards")
}

function cardRef(uid: string, deckId: string, cardId: string) {
  return doc(db, "users", uid, "decks", deckId, "cards", cardId)
}

// ── Deck CRUD ──

export async function fetchDecks(uid: string): Promise<Deck[]> {
  const q = query(decksCol(uid), orderBy("updatedAt", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Deck)
}

export async function fetchDeck(uid: string, deckId: string): Promise<Deck | null> {
  const snap = await getDoc(deckRef(uid, deckId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Deck
}

export async function createDeck(
  uid: string,
  data: Pick<Deck, "name" | "description" | "frontLabel" | "backLabel">,
): Promise<string> {
  const now = Date.now()
  const ref = await addDoc(decksCol(uid), {
    ...data,
    cardCount: 0,
    progress: DEFAULT_PROGRESS,
    createdAt: now,
    updatedAt: now,
  })
  return ref.id
}

export async function updateDeck(
  uid: string,
  deckId: string,
  data: Partial<Pick<Deck, "name" | "description" | "frontLabel" | "backLabel">>,
) {
  await updateDoc(deckRef(uid, deckId), { ...data, updatedAt: Date.now() })
}

export async function deleteDeck(uid: string, deckId: string) {
  // Delete all cards in the deck first, then the deck itself
  const cardsSnap = await getDocs(cardsCol(uid, deckId))
  const batch = writeBatch(db)
  cardsSnap.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(deckRef(uid, deckId))
  await batch.commit()
}

export async function updateDeckProgress(
  uid: string,
  deckId: string,
  progress: Partial<DeckProgress>,
) {
  const ref = deckRef(uid, deckId)
  const updates: Record<string, unknown> = { updatedAt: Date.now() }
  for (const [key, val] of Object.entries(progress)) {
    updates[`progress.${key}`] = val
  }
  await updateDoc(ref, updates)
}

// ── Card CRUD ──

export async function fetchCards(uid: string, deckId: string): Promise<FlipCard[]> {
  const q = query(cardsCol(uid, deckId), orderBy("createdAt", "asc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FlipCard)
}

export async function createCard(
  uid: string,
  deckId: string,
  data: Pick<FlipCard, "front" | "back">,
): Promise<string> {
  const ref = await addDoc(cardsCol(uid, deckId), {
    ...data,
    createdAt: Date.now(),
  })
  // Update card count on the deck
  const count = (await getDocs(cardsCol(uid, deckId))).size
  await updateDoc(deckRef(uid, deckId), {
    cardCount: count,
    updatedAt: Date.now(),
  })
  return ref.id
}

export async function updateCard(
  uid: string,
  deckId: string,
  cardId: string,
  data: Pick<FlipCard, "front" | "back">,
) {
  await updateDoc(cardRef(uid, deckId, cardId), data)
}

export async function deleteCard(uid: string, deckId: string, cardId: string) {
  await deleteDoc(cardRef(uid, deckId, cardId))
  // Update card count on the deck
  const count = (await getDocs(cardsCol(uid, deckId))).size
  await updateDoc(deckRef(uid, deckId), {
    cardCount: count,
    updatedAt: Date.now(),
  })
}
