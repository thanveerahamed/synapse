import { useState, useRef, useCallback } from "react"
import { useNavigate } from "react-router"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  Upload,
  FileSpreadsheet,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react"
import { toast } from "sonner"

import { useDecks, useCreateDeck } from "@/hooks/useDecks"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface ParsedRow {
  front: string
  back: string
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

function detectDelimiter(firstLine: string): string {
  // Count occurrences of common delimiters in the first line
  const semicolons = (firstLine.match(/;/g) || []).length
  const commas = (firstLine.match(/,/g) || []).length
  const tabs = (firstLine.match(/\t/g) || []).length

  if (semicolons >= commas && semicolons >= tabs) return ";"
  if (tabs >= commas && tabs >= semicolons) return "\t"
  return ","
}

function parseCSV(text: string): { rows: ParsedRow[]; errors: string[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length === 0) return { rows: [], errors: ["File is empty"] }

  const errors: string[] = []
  const rows: ParsedRow[] = []

  // Auto-detect delimiter from the first line
  const delimiter = detectDelimiter(lines[0])

  // Check if first line is a header
  const firstLine = lines[0].toLowerCase().trim()
  const startIdx = firstLine.startsWith("front") || firstLine.startsWith('"front') ? 1 : 0

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    // Simple CSV parse handling quoted values
    const cols = parseCSVLine(line, delimiter)
    if (cols.length < 2) {
      errors.push(`Row ${i + 1}: Expected at least 2 columns, got ${cols.length}`)
      continue
    }

    const front = cols[0].trim()
    const back = cols[1].trim()

    if (!front || !back) {
      errors.push(`Row ${i + 1}: Front or back is empty`)
      continue
    }

    rows.push({ front, back })
  }

  return { rows, errors }
}

function parseCSVLine(line: string, delimiter: string = ","): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++ // skip next quote
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === delimiter) {
        result.push(current)
        current = ""
      } else {
        current += char
      }
    }
  }
  result.push(current)
  return result
}

export default function UploadCSV() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const { data: decks } = useDecks()

  const [selectedDeckId, setSelectedDeckId] = useState<string>("")
  const [showNewDeck, setShowNewDeck] = useState(false)
  const [newDeckName, setNewDeckName] = useState("")
  const [newDeckDesc, setNewDeckDesc] = useState("")
  const [frontLabel, setFrontLabel] = useState("Front")
  const [backLabel, setBackLabel] = useState("Back")

  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [fileName, setFileName] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)

  const createDeck = useCreateDeck()

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setUploaded(false)

    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      const { rows, errors } = parseCSV(text)
      setParsedRows(rows)
      setParseErrors(errors)
    }
    reader.readAsText(file)
  }, [])

  const removeRow = (index: number) => {
    setParsedRows((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (parsedRows.length === 0) {
      toast.error("No rows to upload")
      return
    }

    setUploading(true)
    try {
      let deckId = selectedDeckId

      if (showNewDeck) {
        if (!newDeckName.trim()) {
          toast.error("Deck name is required")
          setUploading(false)
          return
        }
        deckId = await createDeck.mutateAsync({
          name: newDeckName.trim(),
          description: newDeckDesc.trim(),
          frontLabel: frontLabel.trim() || "Front",
          backLabel: backLabel.trim() || "Back",
        })
      }

      if (!deckId) {
        toast.error("Please select or create a deck")
        setUploading(false)
        return
      }

      // Firestore batches limited to 500 operations — chunk if needed
      const { bulkCreateCards } = await import("@/lib/firestore")
      const { getAuth } = await import("firebase/auth")
      const auth = getAuth()
      const uid = auth.currentUser?.uid
      if (!uid) {
        toast.error("Not authenticated")
        setUploading(false)
        return
      }

      const BATCH_SIZE = 450
      for (let i = 0; i < parsedRows.length; i += BATCH_SIZE) {
        const chunk = parsedRows.slice(i, i + BATCH_SIZE)
        await bulkCreateCards(uid, deckId, chunk)
      }

      toast.success(`Uploaded ${parsedRows.length} cards successfully!`)
      setUploaded(true)
      setParsedRows([])
      setFileName("")
      if (fileRef.current) fileRef.current.value = ""
    } catch (err) {
      toast.error("Upload failed: " + (err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-background flex min-h-svh flex-col"
    >
      {/* Header */}
      <header className="border-border/50 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="flex h-14 items-center gap-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/home")}
            className="h-9 w-9 rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="text-primary h-5 w-5" />
            <h1 className="text-lg font-semibold">Upload CSV</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-6">
        {/* Step 1 — Choose / Create Deck */}
        <Card>
          <CardHeader>
            <CardTitle>1. Choose Deck</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showNewDeck ? (
              <>
                <div className="space-y-2">
                  <Label>Select existing deck</Label>
                  <select
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    value={selectedDeckId}
                    onChange={(e) => setSelectedDeckId(e.target.value)}
                  >
                    <option value="">— Select a deck —</option>
                    {(decks ?? []).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.cardCount} cards)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <span>or</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewDeck(true)}
                  >
                    <Plus className="mr-1 h-4 w-4" /> New Deck
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Deck Name *</Label>
                  <Input
                    placeholder="e.g. Dutch Vocabulary"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Input
                    placeholder="Optional description"
                    value={newDeckDesc}
                    onChange={(e) => setNewDeckDesc(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Front Label</Label>
                    <Input
                      placeholder="Front"
                      value={frontLabel}
                      onChange={(e) => setFrontLabel(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Back Label</Label>
                    <Input
                      placeholder="Back"
                      value={backLabel}
                      onChange={(e) => setBackLabel(e.target.value)}
                    />
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowNewDeck(false)}>
                  ← Use existing deck instead
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2 — Upload CSV */}
        <Card>
          <CardHeader>
            <CardTitle>2. Upload CSV File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              CSV should have two columns: <strong>front</strong> and{" "}
              <strong>back</strong>. A header row is optional.
            </p>
            <div
              className="border-border hover:border-primary/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="text-muted-foreground mb-2 h-8 w-8" />
              <span className="text-muted-foreground text-sm">
                {fileName || "Click to select a .csv file"}
              </span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />

            {parseErrors.length > 0 && (
              <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                <div className="mb-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="h-4 w-4" /> Parse warnings
                </div>
                <ul className="list-inside list-disc space-y-0.5">
                  {parseErrors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3 — Preview */}
        {parsedRows.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                3. Preview ({parsedRows.length} card{parsedRows.length !== 1 && "s"})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-border text-muted-foreground border-b">
                      <th className="py-2 pr-2 text-left font-medium">#</th>
                      <th className="py-2 pr-2 text-left font-medium">Front</th>
                      <th className="py-2 pr-2 text-left font-medium">Back</th>
                      <th className="w-10 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((row, i) => (
                      <tr key={i} className="border-border/50 border-b last:border-0">
                        <td className="text-muted-foreground py-2 pr-2">{i + 1}</td>
                        <td className="py-2 pr-2">{row.front}</td>
                        <td className="py-2 pr-2">{row.back}</td>
                        <td className="py-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive h-7 w-7"
                            onClick={() => removeRow(i)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <Button
                  className="w-full"
                  onClick={handleUpload}
                  disabled={uploading || parsedRows.length === 0}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload {parsedRows.length} Card{parsedRows.length !== 1 && "s"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success */}
        {uploaded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2 py-8"
          >
            <CheckCircle2 className="text-primary h-12 w-12" />
            <p className="text-lg font-medium">Upload complete!</p>
            <Button variant="outline" onClick={() => navigate("/home")}>
              Back to Dashboard
            </Button>
          </motion.div>
        )}
      </main>
    </motion.div>
  )
}
