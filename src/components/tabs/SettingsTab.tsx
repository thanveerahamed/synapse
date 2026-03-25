import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import {
  Monitor,
  Moon,
  Sun,
  Shield,
  Loader2,
  CheckCircle,
  FlaskConical,
} from "lucide-react"
import { useTheme } from "@/context/useTheme"
import { useAuth } from "@/context/useAuth"
import { useUserProfile, useUpdateUserProfile } from "@/hooks/useUserProfile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

export function SettingsTab() {
  const { theme, setTheme } = useTheme()
  const { changePassword } = useAuth()
  const { data: profile } = useUserProfile()
  const updateProfile = useUpdateUserProfile()
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  const themeOptions = [
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
  ]

  const openPasswordForm = () => {
    setError(null)
    setSuccess(false)
    reset()
    setShowPasswordForm(true)
  }

  const closePasswordForm = () => {
    setShowPasswordForm(false)
    setError(null)
    setSuccess(false)
    reset()
  }

  const onSubmitPassword = async (data: PasswordFormValues) => {
    setError(null)
    try {
      await changePassword(data.currentPassword, data.newPassword)
      setSuccess(true)
      setTimeout(() => {
        closePasswordForm()
      }, 1500)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to change password"
      if (message.includes("wrong-password") || message.includes("invalid-credential")) {
        setError("Current password is incorrect")
      } else if (message.includes("weak-password")) {
        setError("New password is too weak")
      } else {
        setError(message)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Customize your Synapse experience.</p>
      </div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="text-muted-foreground h-5 w-5" />
              <div>
                <CardTitle className="text-lg">Appearance</CardTitle>
                <CardDescription>Choose your preferred theme.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {themeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={theme === option.value ? "default" : "outline"}
                  className="flex h-12 flex-1 items-center justify-center gap-2"
                  onClick={() => setTheme(option.value)}
                >
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="text-muted-foreground h-5 w-5" />
              <div>
                <CardTitle className="text-lg">Security</CardTitle>
                <CardDescription>Manage your account security.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="h-12 w-full" onClick={openPasswordForm}>
              Change Password
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Admin Tools toggle — only visible to admins */}
      {profile?.isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FlaskConical className="text-muted-foreground h-5 w-5" />
                <div>
                  <CardTitle className="text-lg">Admin Tools</CardTitle>
                  <CardDescription>
                    Show or hide the Admin tab in the bottom navigation.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <button
                type="button"
                role="switch"
                aria-checked={profile.adminTabEnabled}
                onClick={() =>
                  updateProfile.mutate({
                    adminTabEnabled: !profile.adminTabEnabled,
                  })
                }
                className="flex w-full items-center justify-between rounded-lg py-1"
              >
                <span className="text-sm font-medium">Enable Admin Tab</span>
                <div
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                    profile.adminTabEnabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`bg-background inline-block h-4 w-4 rounded-full shadow-sm transition-transform ${
                      profile.adminTabEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </div>
              </button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Change Password bottom sheet */}
      <AnimatePresence>
        {showPasswordForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60"
              onClick={closePasswordForm}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="bg-background fixed inset-x-0 bottom-0 z-[60] max-h-[90svh] overflow-y-auto rounded-t-2xl"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
            >
              <div className="px-4 pt-4 pb-8">
                <div className="bg-muted mx-auto mb-4 h-1 w-10 rounded-full" />

                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 py-6 text-center"
                  >
                    <div className="bg-primary/15 flex h-14 w-14 items-center justify-center rounded-full">
                      <CheckCircle className="text-primary h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold">Password Changed</h3>
                    <p className="text-muted-foreground text-sm">
                      Your password has been updated successfully.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <h3 className="mb-4 text-lg font-bold">Change Password</h3>
                    <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
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
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          placeholder="Enter current password"
                          autoComplete="current-password"
                          className="h-12 text-base"
                          {...register("currentPassword")}
                        />
                        {errors.currentPassword && (
                          <p className="text-destructive text-xs">
                            {errors.currentPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="At least 6 characters"
                          autoComplete="new-password"
                          className="h-12 text-base"
                          {...register("newPassword")}
                        />
                        {errors.newPassword && (
                          <p className="text-destructive text-xs">
                            {errors.newPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Re-enter new password"
                          autoComplete="new-password"
                          className="h-12 text-base"
                          {...register("confirmPassword")}
                        />
                        {errors.confirmPassword && (
                          <p className="text-destructive text-xs">
                            {errors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-12 flex-1"
                          onClick={closePasswordForm}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="h-12 flex-1"
                          disabled={isSubmitting}
                        >
                          {isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Update Password
                        </Button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
