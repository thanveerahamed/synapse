import { Navigate } from "react-router"
import { useAuth } from "@/context/useAuth"
import { SplashScreen } from "@/components/SplashScreen"
import { AnimatePresence } from "framer-motion"
import type { ReactNode } from "react"

/**
 * Wraps authenticated-only pages.
 * Shows SplashScreen while Firebase resolves, then redirects to "/" if not logged in.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <AnimatePresence>
        <SplashScreen />
      </AnimatePresence>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

/**
 * Wraps guest-only pages (e.g., Login).
 * If user is already authenticated, skip login and go straight to "/home".
 */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <AnimatePresence>
        <SplashScreen />
      </AnimatePresence>
    )
  }

  if (user) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}
