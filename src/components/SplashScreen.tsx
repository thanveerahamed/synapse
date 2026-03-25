import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

export function SplashScreen() {
  return (
    <motion.div
      className="bg-background fixed inset-0 z-50 flex flex-col items-center justify-center gap-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-4"
      >
        <div className="bg-primary flex h-16 w-16 items-center justify-center rounded-2xl">
          <span className="text-primary-foreground text-2xl font-bold">S</span>
        </div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight">Synapse</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </motion.div>
    </motion.div>
  )
}
