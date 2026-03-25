import { useState } from "react"
import { useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { LogIn, UserPlus, Loader2, BrainCircuit } from "lucide-react"

import { useAuth } from "@/context/useAuth"
import { ThemeToggle } from "@/components/ThemeToggle"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const { login, register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setError(null)
    try {
      if (isRegistering) {
        await registerUser(data.email, data.password)
      } else {
        await login(data.email, data.password)
      }
      navigate("/home", { replace: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed"
      setError(message)
    }
  }

  return (
    <div
      className="bg-background relative flex min-h-svh items-center justify-center px-4"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Theme toggle in top-right corner — safe area aware */}
      <div
        className="absolute top-4 right-4"
        style={{ marginTop: "env(safe-area-inset-top)" }}
      >
        <ThemeToggle />
      </div>

      {/* Animated background gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="bg-primary/5 absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="bg-primary/5 absolute -right-32 -bottom-32 h-96 w-96 rounded-full blur-3xl"
          animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 shadow-2xl backdrop-blur-sm sm:mx-auto">
          <CardHeader className="space-y-3 pb-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
              className="bg-primary mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
            >
              <BrainCircuit className="text-primary-foreground h-7 w-7" />
            </motion.div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isRegistering ? "Create Account" : "Welcome back"}
            </CardTitle>
            <CardDescription>
              {isRegistering
                ? "Sign up to get started with Synapse"
                : "Sign in to your Synapse account"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-12 text-base"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-destructive text-xs">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  className="h-12 text-base"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-destructive text-xs">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="h-12 w-full text-base"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isRegistering ? (
                  <UserPlus className="mr-2 h-4 w-4" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {isRegistering ? "Create Account" : "Sign In"}
              </Button>

              <div className="text-muted-foreground pt-2 text-center text-sm">
                {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering)
                    setError(null)
                  }}
                  className="text-primary px-1 py-2 font-medium underline-offset-4 hover:underline"
                >
                  {isRegistering ? "Sign in" : "Sign up"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
