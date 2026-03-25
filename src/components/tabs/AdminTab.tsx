import { useNavigate } from "react-router"
import { FileSpreadsheet, FlaskConical, ChevronRight } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const adminTools = [
  {
    id: "upload-csv",
    label: "Upload CSV",
    description: "Bulk-import cards from a CSV file into a deck",
    icon: FileSpreadsheet,
    path: "/upload-csv",
  },
] as const

export function AdminTab() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Tools</h2>
        <p className="text-muted-foreground text-sm">
          Internal &amp; experimental features
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FlaskConical className="text-primary h-5 w-5" />
            <CardTitle>Experimental</CardTitle>
          </div>
          <CardDescription>
            These tools are only visible to admin accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 p-0 pb-2">
          {adminTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => navigate(tool.path)}
              className="hover:bg-muted/60 active:bg-muted flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
            >
              <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <tool.icon className="text-primary h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{tool.label}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {tool.description}
                </p>
              </div>
              <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
