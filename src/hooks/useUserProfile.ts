import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/useAuth"

export interface UserProfile {
  displayName: string
  email: string
  location: string
  bio: string
  avatarUrl: string
  createdAt: string
  isAdmin: boolean
  adminTabEnabled: boolean
}

const defaultProfile: UserProfile = {
  displayName: "Synapse User",
  email: "",
  location: "",
  bio: "Welcome to Synapse!",
  avatarUrl: "",
  createdAt: new Date().toISOString(),
  isAdmin: false,
  adminTabEnabled: false,
}

async function fetchUserProfile(uid: string): Promise<UserProfile> {
  try {
    const snap = await getDoc(doc(db, "users", uid))
    if (snap.exists()) {
      return { ...defaultProfile, ...snap.data() } as UserProfile
    }
  } catch {
    // Firestore may not be configured yet — return default
  }
  return { ...defaultProfile }
}

async function saveUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const ref = doc(db, "users", uid)
  await setDoc(ref, { ...data, updatedAt: Date.now() }, { merge: true })
}

export function useUserProfile() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ["userProfile", user?.uid],
    queryFn: () => fetchUserProfile(user!.uid),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    placeholderData: {
      ...defaultProfile,
      email: user?.email ?? "",
      displayName: user?.displayName ?? "Synapse User",
    },
  })
}

export function useUpdateUserProfile() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => saveUserProfile(user!.uid, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userProfile", user?.uid] }),
  })
}
