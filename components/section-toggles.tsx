"use client"

import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CheckCircle2, Gauge, Lightbulb, ListChecks } from "lucide-react"

type Props = {
  includeDifferential: boolean
  setIncludeDifferential: (v: boolean) => void
  includeSeverity: boolean
  setIncludeSeverity: (v: boolean) => void
  includeRecommendations: boolean
  setIncludeRecommendations: (v: boolean) => void
  className?: string
}

export function SectionToggles({
  includeDifferential,
  setIncludeDifferential,
  includeSeverity,
  setIncludeSeverity,
  includeRecommendations,
  setIncludeRecommendations,
  className = "",
}: Props) {
  return (
    <div
      className={`rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 backdrop-blur-sm shadow-sm ${className}`}
    >
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <Label id="report-sections-label" className="text-sm font-medium">
          Report sections
        </Label>
        <Badge variant="outline" className="gap-1 text-xs bg-stone-50/80 dark:bg-stone-800/60">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Structured
        </Badge>
      </div>

      <ul
        role="group"
        aria-labelledby="report-sections-label"
        className="px-2 pb-2 divide-y divide-stone-200/80 dark:divide-stone-800"
      >
        <li className="flex items-start justify-between gap-3 p-3 hover:bg-stone-50/70 dark:hover:bg-stone-800/50 rounded-lg transition-colors">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 rounded-md p-2 text-violet-700 bg-gradient-to-br from-violet-100 to-stone-50 ring-1 ring-violet-200/70 dark:text-violet-300 dark:from-violet-900/30 dark:to-stone-900/20 dark:ring-violet-900/40">
              <ListChecks className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium">Differential dx</div>
              <div className="text-xs text-muted-foreground">Ranked 2-4 items</div>
            </div>
          </div>
          <Switch
            id="toggle-differential"
            aria-label="Toggle Differential section"
            checked={includeDifferential}
            onCheckedChange={setIncludeDifferential}
            className="shrink-0"
          />
        </li>

        <li className="flex items-start justify-between gap-3 p-3 hover:bg-stone-50/70 dark:hover:bg-stone-800/50 rounded-lg transition-colors">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 rounded-md p-2 text-amber-700 bg-gradient-to-br from-amber-100 to-stone-50 ring-1 ring-amber-200/70 dark:text-amber-300 dark:from-amber-900/30 dark:to-stone-900/20 dark:ring-amber-900/40">
              <Gauge className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium">Severity</div>
              <div className="text-xs text-muted-foreground">Mild/Moderate/Severe</div>
            </div>
          </div>
          <Switch
            id="toggle-severity"
            aria-label="Toggle Severity section"
            checked={includeSeverity}
            onCheckedChange={setIncludeSeverity}
            className="shrink-0"
          />
        </li>

        <li className="flex items-start justify-between gap-3 p-3 hover:bg-stone-50/70 dark:hover:bg-stone-800/50 rounded-lg transition-colors">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 rounded-md p-2 text-emerald-700 bg-gradient-to-br from-emerald-100 to-stone-50 ring-1 ring-emerald-200/70 dark:text-emerald-300 dark:from-emerald-900/30 dark:to-stone-900/20 dark:ring-emerald-900/40">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium">Recommendations</div>
              <div className="text-xs text-muted-foreground">Follow-up & next steps</div>
            </div>
          </div>
          <Switch
            id="toggle-recommendations"
            aria-label="Toggle Recommendations section"
            checked={includeRecommendations}
            onCheckedChange={setIncludeRecommendations}
            className="shrink-0"
          />
        </li>
      </ul>
    </div>
  )
}
