import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Calendar, MapPin, Pencil, Loader2, CheckCircle } from "lucide-react"
import { useAuth } from "@/context/useAuth"
import { useUserProfile, useUpdateUserProfile } from "@/hooks/useUserProfile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const profileSchema = z.object({
  displayName: z.string().min(1, "Name is required"),
  location: z.string(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfileTab() {
  const { user } = useAuth()
  const { data: profile } = useUserProfile()
  const updateProfile = useUpdateUserProfile()

  const [showForm, setShowForm] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: "", location: "" },
  })

  // Sync form defaults when profile loads or form opens
  useEffect(() => {
    if (showForm && profile) {
      reset({
        displayName: profile.displayName || "",
        location: profile.location || "",
      })
    }
  }, [showForm, profile, reset])

  const openForm = () => {
    setSuccess(false)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setSuccess(false)
  }

  const onSubmit = async (data: ProfileFormValues) => {
    await updateProfile.mutateAsync(data)
    setSuccess(true)
    setTimeout(() => closeForm(), 1200)
  }

  const initials = (profile?.displayName ?? user?.email ?? "SU")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const displayLocation = profile?.location || "Not set"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">Manage your personal information.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <CardTitle className="text-xl">
                  {profile?.displayName ?? "Synapse User"}
                </CardTitle>
                <CardDescription>{profile?.bio}</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-10 shrink-0 gap-1.5"
                onClick={openForm}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <Mail className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">{user?.email ?? "user@example.com"}</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <MapPin className="text-muted-foreground h-4 w-4" />
                <span
                  className={`text-sm ${!profile?.location ? "text-muted-foreground italic" : ""}`}
                >
                  {displayLocation}
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3"
              >
                <Calendar className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">
                  Joined{" "}
                  {user?.metadata.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString()
                    : "Recently"}
                </span>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Profile bottom sheet */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60"
              onClick={closeForm}
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
                    <h3 className="text-lg font-bold">Profile Updated</h3>
                    <p className="text-muted-foreground text-sm">
                      Your changes have been saved.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <h3 className="mb-4 text-lg font-bold">Edit Profile</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Name</Label>
                        <Input
                          id="displayName"
                          placeholder="Your name"
                          autoComplete="name"
                          className="h-12 text-base"
                          {...register("displayName")}
                        />
                        {errors.displayName && (
                          <p className="text-destructive text-xs">
                            {errors.displayName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="e.g. Amsterdam, NL"
                          autoComplete="address-level2"
                          className="h-12 text-base"
                          {...register("location")}
                        />
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
                        <Button
                          type="submit"
                          className="h-12 flex-1"
                          disabled={isSubmitting}
                        >
                          {isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Save
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
