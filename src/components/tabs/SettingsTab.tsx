import { motion } from "framer-motion"
import { Monitor, Moon, Sun, Bell, Shield, Globe } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"

export function SettingsTab() {
  const { theme, setTheme } = useTheme()

  const themeOptions = [
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Customize your Synapse experience.
        </p>
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
              <Monitor className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">Appearance</CardTitle>
                <CardDescription>
                  Choose your preferred theme.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {themeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={theme === option.value ? "default" : "outline"}
                  className="flex flex-1 items-center justify-center gap-2 h-12"
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

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">Notifications</CardTitle>
                <CardDescription>
                  Manage notification preferences.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                label: "Push notifications",
                description: "Receive push notifications on this device",
              },
              {
                label: "Email notifications",
                description: "Get email updates on important activity",
              },
              {
                label: "Weekly digest",
                description: "Receive a weekly summary of activity",
              },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between gap-3 min-h-[56px]">
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm font-medium">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 h-10">
                    Configure
                  </Button>
                </div>
                {i < 2 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Security & Language */}
      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-lg">Security</CardTitle>
                  <CardDescription>
                    Manage your security settings.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full h-12">
                Change Password
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-lg">Language</CardTitle>
                  <CardDescription>
                    Select your preferred language.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full h-12">
                English (US)
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

