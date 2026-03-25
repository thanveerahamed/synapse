import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod/v4"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Deck } from "@/types/deck"

const deckSchema = z.object({
  name: z.string().min(1, "Deck name is required"),
  description: z.string(),
  frontLabel: z.string().min(1, "Front label is required"),
  backLabel: z.string().min(1, "Back label is required"),
})

type DeckFormValues = z.infer<typeof deckSchema>

interface DeckFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: DeckFormValues) => Promise<void>
  deck?: Deck | null
}

export function DeckForm({ open, onClose, onSubmit, deck }: DeckFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DeckFormValues>({
    resolver: zodResolver(deckSchema),
    defaultValues: {
      name: "",
      description: "",
      frontLabel: "",
      backLabel: "",
    },
  })

  useEffect(() => {
    if (open) {
      reset(
        deck
          ? {
              name: deck.name,
              description: deck.description,
              frontLabel: deck.frontLabel,
              backLabel: deck.backLabel,
            }
          : {
              name: "",
              description: "",
              frontLabel: "",
              backLabel: "",
            },
      )
    }
  }, [open, deck, reset])

  const handleFormSubmit = async (data: DeckFormValues) => {
    await onSubmit(data)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60"
            onClick={onClose}
          />
          {/* Bottom sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="bg-background fixed inset-x-0 bottom-0 z-[60] rounded-t-2xl"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
          >
            <div className="px-4 pt-4 pb-8">
              {/* Drag handle */}
              <div className="bg-muted mx-auto mb-4 h-1 w-10 rounded-full" />
              <h3 className="mb-4 text-lg font-bold">
                {deck ? "Edit Deck" : "New Deck"}
              </h3>
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Deck Name</Label>
                  <Input
                    placeholder="e.g. Dutch Basics, Learning Numbers"
                    className="h-12 text-base"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-destructive text-xs">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Input
                    placeholder="e.g. Common Dutch words for beginners"
                    className="h-12 text-base"
                    {...register("description")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Front Label</Label>
                    <Input
                      placeholder="e.g. Dutch"
                      className="h-12 text-base"
                      {...register("frontLabel")}
                    />
                    {errors.frontLabel && (
                      <p className="text-destructive text-xs">
                        {errors.frontLabel.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Back Label</Label>
                    <Input
                      placeholder="e.g. English"
                      className="h-12 text-base"
                      {...register("backLabel")}
                    />
                    {errors.backLabel && (
                      <p className="text-destructive text-xs">
                        {errors.backLabel.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 flex-1"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="h-12 flex-1" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {deck ? "Save" : "Create Deck"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
