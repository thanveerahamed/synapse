import { useQuery } from "@tanstack/react-query"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"

interface UserProfile {
  displayName: string
  email: string
  bio: string
  avatarUrl: string
  createdAt: string
}

const defaultProfile: UserProfile = {
  displayName: "Synapse User",
  email: "",
  bio: "Welcome to Synapse!",
  avatarUrl: "",
  createdAt: new Date().toISOString(),
}

async function fetchUserProfile(uid: string): Promise<UserProfile> {
  try {
    const snap = await getDoc(doc(db, "users", uid))
    if (snap.exists()) {
      return snap.data() as UserProfile
    }
  } catch {
    // Firestore may not be configured yet — return default
  }
  return { ...defaultProfile }
}

export function useUserProfile() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ["userProfile", user?.uid],
    queryFn: () => fetchUserProfile(user!.uid),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: {
      ...defaultProfile,
      email: user?.email ?? "",
      displayName: user?.displayName ?? "Synapse User",
    },
  })
}

