import { useState } from "react"
import { motion } from "framer-motion"

interface FlipCardProps {
  front: string
  back: string
  frontLabel: string
  backLabel: string
  isReversed: boolean
}

export function FlipCardComponent({
  front,
  back,
  frontLabel,
  backLabel,
  isReversed,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const displayFront = isReversed ? back : front
  const displayBack = isReversed ? front : back
  const displayFrontLabel = isReversed ? backLabel : frontLabel
  const displayBackLabel = isReversed ? frontLabel : backLabel

  return (
    <div
      role="button"
      tabIndex={0}
      className="w-full cursor-pointer select-none"
      style={{ perspective: 1200, minHeight: 280 }}
      onClick={() => setIsFlipped(!isFlipped)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          setIsFlipped(!isFlipped)
        }
      }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d", minHeight: 280 }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* Front face */}
        <div
          className="border-border/50 bg-card absolute inset-0 flex flex-col items-center justify-center rounded-2xl border p-6 shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-muted-foreground mb-4 text-xs font-medium tracking-widest uppercase">
            {displayFrontLabel}
          </span>
          <p className="text-card-foreground text-center text-3xl font-bold">
            {displayFront}
          </p>
          <span className="text-muted-foreground mt-6 text-xs">Tap to flip</span>
        </div>

        {/* Back face */}
        <div
          className="border-primary/30 bg-card absolute inset-0 flex flex-col items-center justify-center rounded-2xl border p-6 shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <span className="text-primary mb-4 text-xs font-medium tracking-widest uppercase">
            {displayBackLabel}
          </span>
          <p className="text-card-foreground text-center text-3xl font-bold">
            {displayBack}
          </p>
          <span className="text-muted-foreground mt-6 text-xs">Tap to flip back</span>
        </div>
      </motion.div>
    </div>
  )
}
