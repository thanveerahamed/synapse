import { motion } from "framer-motion"
import { Mail, Calendar, MapPin } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useUserProfile } from "@/hooks/useUserProfile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export function ProfileTab() {
  const { user } = useAuth()
  const { data: profile } = useUserProfile()

  const initials = (profile?.displayName ?? user?.email ?? "SU")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Manage your personal information.
        </p>
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
                  <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="space-y-1 text-center sm:text-left">
                <CardTitle className="text-xl">
                  {profile?.displayName ?? "Synapse User"}
                </CardTitle>
                <CardDescription>{profile?.bio}</CardDescription>
                <div className="flex justify-center gap-2 sm:justify-start">
                  <Badge variant="secondary">Pro Member</Badge>
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>
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
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {user?.email ?? "user@example.com"}
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">San Francisco, CA</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3"
              >
                <Calendar className="h-4 w-4 text-muted-foreground" />
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
    </div>
  )
}

