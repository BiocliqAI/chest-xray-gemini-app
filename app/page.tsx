"use client"

import { useCallback, useMemo, useRef, useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Activity,
  Brain,
  Camera,
  Clipboard,
  CloudUpload,
  Download,
  FileImage,
  FileText,
  Flag,
  Hash,
  Info,
  Key,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  User,
  Calendar,
  Star,
  X,
} from "lucide-react"
import dynamic from "next/dynamic"
import { buildPrompt } from "@/lib/prompt"
import { ReportView } from "@/components/report-view"
import { FileDropzone } from "@/components/file-dropzone"
import { SectionToggles } from "@/components/section-toggles"
import { Decor } from "@/components/decor"
import { ThemeToggle } from "@/components/theme-toggle"

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false })

type ModelId = "gemini-2.5-flash" | "gemini-2.5-pro"

export default function Page() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [age, setAge] = useState<string>("65")
  const [sex, setSex] = useState<"Male" | "Female" | "Other">("Male")
  const [history, setHistory] = useState<string>(
    "Shortness of breath and productive cough for 3 days. Smoker 30 pack-years.",
  )
  const [priority, setPriority] = useState<"Routine" | "STAT">("Routine")
  const [views, setViews] = useState<"PA" | "AP" | "Lateral" | "PA+Lateral" | "AP Portable">("PA")
  const [model, setModel] = useState<ModelId>("gemini-2.5-flash")
  const [thinkingBudget, setThinkingBudget] = useState<number>(2048)
  const [includeDifferential, setIncludeDifferential] = useState<boolean>(true)
  const [includeSeverity, setIncludeSeverity] = useState<boolean>(true)
  const [includeRecommendations, setIncludeRecommendations] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [report, setReport] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [seed, setSeed] = useState<number>(Date.now())
  const [apiKey, setApiKey] = useState<string>("")

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("gemini-api-key")
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])

  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("gemini-api-key", apiKey)
    } else {
      localStorage.removeItem("gemini-api-key")
    }
  }, [apiKey])

  const onFile = useCallback((f: File | null) => {
    setFile(f)
    setReport("")
    setError("")
    if (f) {
      const url = URL.createObjectURL(f)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setPreview(null)
    }
  }, [])

  const handleTrySample = useCallback(async () => {
    try {
      const res = await fetch("/images/chest-xray-sample.png", { cache: "no-store" })
      const blob = await res.blob()
      const sampleFile = new File([blob], "sample-cxr.jpg", { type: blob.type || "image/jpeg" })
      onFile(sampleFile)
    } catch (e) {
      setError("Could not load sample image. Please upload your own CXR instead.")
    }
  }, [onFile])

  const handleClear = useCallback(() => {
    onFile(null)
  }, [onFile])

  const prompt = useMemo(
    () =>
      buildPrompt({
        age: age || "N/A",
        sex,
        history: history || "N/A",
        priority,
        views,
        includeDifferential,
        includeSeverity,
        includeRecommendations,
      }),
    [age, sex, history, priority, views, includeDifferential, includeSeverity, includeRecommendations],
  )

  const abortRef = useRef<AbortController | null>(null)

  const handleSubmit = useCallback(async () => {
    setIsLoading(true)
    setError("")
    setReport("")
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    // Validate API key
    if (!apiKey.trim()) {
      setError("Please provide your Gemini API key in the settings above.")
      setIsLoading(false)
      return
    }

    console.log("Frontend - API key length:", apiKey.length)
    console.log("Frontend - API key starts with:", apiKey.substring(0, 10))

    try {
      const body = new FormData()
      if (file) body.append("image", file)
      body.append("prompt", prompt)
      body.append("model", model)
      body.append("thinkingBudget", String(thinkingBudget))
      body.append("seed", String(seed))
      body.append("apiKey", apiKey)
      
      console.log("Frontend - About to send request with API key")

      const res = await fetch("/api/interpret", {
        method: "POST",
        body,
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Request failed")
      }

      const { report: text } = (await res.json()) as { report: string }
      setReport(text)
    } catch (e: any) {
      setError(e?.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }, [file, prompt, model, thinkingBudget, seed, apiKey])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(report)
    } catch {
      // ignore
    }
  }, [report])

  const handleDownload = useCallback(() => {
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "radiology-report.md"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }, [report])

  return (
    <main className="relative group min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 dark:from-stone-950 dark:to-stone-900">
      <Decor />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg ring-1 ring-emerald-300/60">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">CXR Radiology Assistant</h1>
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  Beta
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a chest X-ray and receive a structured interpretation drafted like a senior thoracic radiologist.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Gemini
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Info className="h-3.5 w-3.5" />
              Educational use only
            </Badge>
            <ThemeToggle />
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <Card className="border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow rounded-xl">
            <CardHeader>
              <CardTitle className="text-base">Study</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-[1fr_auto] gap-3">
                <FileDropzone
                  value={file}
                  onFile={onFile}
                  accept={["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "image/jpg"]}
                  maxSizeMB={20}
                />
                <div className="flex sm:flex-col gap-2">
                  <Button variant="secondary" onClick={handleTrySample} type="button" className="gap-2">
                    <FileImage className="h-4 w-4" />
                    Try sample
                  </Button>
                  <Button variant="outline" onClick={handleClear} type="button" className="gap-2 bg-transparent">
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>

              {preview && (
                <div className="rounded-lg border border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 backdrop-blur-xs overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="text-sm font-medium">Preview</div>
                    <div className="text-xs text-muted-foreground">{file?.name || "image"}</div>
                  </div>
                  <Separator />
                  <div className="relative aspect-[4/3] bg-stone-50 dark:bg-stone-900">
                    <Image
                      src={preview || "/placeholder.svg"}
                      alt="Chest X-ray preview"
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-stone-600 dark:text-stone-300" />
                    Age
                  </Label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                    <Input
                      id="age"
                      type="number"
                      min={0}
                      placeholder="Age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4 text-stone-600 dark:text-stone-300" />
                    Sex
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                    <Select value={sex} onValueChange={(v) => setSex(v as any)}>
                      <SelectTrigger className="w-full pl-9">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-stone-600 dark:text-stone-300" />
                    Views
                  </Label>
                  <div className="relative">
                    <Camera className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                    <Select value={views} onValueChange={(v) => setViews(v as any)}>
                      <SelectTrigger className="w-full pl-9">
                        <SelectValue placeholder="Views" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PA">PA</SelectItem>
                        <SelectItem value="AP">AP</SelectItem>
                        <SelectItem value="Lateral">Lateral</SelectItem>
                        <SelectItem value="PA+Lateral">PA + Lateral</SelectItem>
                        <SelectItem value="AP Portable">AP Portable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="history" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-stone-600 dark:text-stone-300" />
                  Clinical history
                </Label>
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400 dark:text-stone-500" />
                  <Textarea
                    id="history"
                    value={history}
                    onChange={(e) => setHistory(e.target.value)}
                    rows={4}
                    placeholder="Symptoms, duration, relevant risk factors, prior imaging, etc."
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow rounded-xl">
            <CardHeader>
              <CardTitle className="text-base">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 rounded-lg border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/30 p-4">
                <Label htmlFor="apiKey" className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-amber-600" />
                  Gemini API Key
                </Label>
                <div className="relative">
                  <Key className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-600/70" />
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Get your free API key from{" "}
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    Google AI Studio
                  </a>. Your key is stored locally and never sent to our servers.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 rounded-lg border border-stone-200/80 dark:border-stone-800 p-4">
                  <Label className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    Model
                  </Label>
                  <div className="relative">
                    <Sparkles className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600/70" />
                    <Select value={model} onValueChange={(v) => setModel(v as ModelId)}>
                      <SelectTrigger className="w-full pl-9">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                        <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Uses the AI SDK Google provider to call Gemini models. Flash is fast; Pro is stronger for complex
                    cases [^1].
                  </p>
                </div>

                <div className="space-y-2 rounded-lg border border-stone-200/80 dark:border-stone-800 p-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-emerald-600" />
                      Thinking budget
                    </Label>
                    <span className="text-sm tabular-nums">{thinkingBudget}</span>
                  </div>
                  <Slider
                    value={[thinkingBudget]}
                    onValueChange={(v) => setThinkingBudget(v[0] ?? 0)}
                    min={0}
                    max={8192}
                    step={256}
                  />
                  <p className="text-xs text-muted-foreground">
                    Controls Gemini&apos;s internal reasoning tokens via thinkingConfig; higher can improve complex
                    reasoning [^1].
                  </p>
                </div>
              </div>

              <SectionToggles
                includeDifferential={includeDifferential}
                setIncludeDifferential={setIncludeDifferential}
                includeSeverity={includeSeverity}
                setIncludeSeverity={setIncludeSeverity}
                includeRecommendations={includeRecommendations}
                setIncludeRecommendations={setIncludeRecommendations}
              />

              <div className="rounded-lg border border-stone-200/80 dark:border-stone-800 p-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-stone-600 dark:text-stone-300" />
                      Priority
                    </Label>
                    <div className="relative">
                      <Flag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                      <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                        <SelectTrigger className="pl-9">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Routine">Routine</SelectItem>
                          <SelectItem value="STAT">STAT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-stone-600 dark:text-stone-300" />
                      Seed
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                        <Input
                          type="number"
                          value={seed}
                          onChange={(e) => setSeed(Number.parseInt(e.target.value || "0", 10))}
                          className="pl-9"
                        />
                      </div>
                      <Button type="button" variant="outline" onClick={() => setSeed(Date.now())} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Reroll
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/30 p-4 text-sm text-emerald-900 dark:text-emerald-100">
                This is an educational tool and must not be used for diagnosis or patient care. Always consult a
                qualified radiologist for clinical decisions.
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                className="w-full sm:w-auto gap-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                onClick={handleSubmit}
                disabled={isLoading || !apiKey.trim()}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
                Generate report
              </Button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldAlert className="h-4 w-4 text-emerald-600" />
                Images are processed securely on the server; no data is stored.
              </div>
            </CardFooter>
          </Card>

          <Card className="border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow rounded-xl lg:col-span-2">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-stone-600 dark:text-stone-300" />
                Report
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  {model}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Brain className="h-3.5 w-3.5 text-emerald-600" />
                  thinking {thinkingBudget}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="prose prose-stone dark:prose-invert max-w-none">
              {!report && !error && !isLoading && (
                <div className="text-sm text-muted-foreground">Your structured radiology report will appear here.</div>
              )}
              {isLoading && (
                <div className="space-y-3">
                  <div className="h-4 w-3/4 rounded bg-stone-200 dark:bg-stone-800 animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-stone-200 dark:bg-stone-800 animate-pulse" />
                  <div className="h-40 w-full rounded bg-stone-100 dark:bg-stone-900 animate-pulse" />
                </div>
              )}
              {!!error && (
                <div className="rounded-md border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-900 dark:text-red-100">
                  {error}
                </div>
              )}
              {!!report && (
                <div className="text-sm">
                  <ReportView markdown={report} />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2 bg-transparent" onClick={handleCopy} disabled={!report}>
                <Clipboard className="h-4 w-4" />
                Copy
              </Button>
              <Button variant="outline" className="gap-2 bg-transparent" onClick={handleDownload} disabled={!report}>
                <Download className="h-4 w-4" />
                Download
              </Button>
            </CardFooter>
          </Card>

          <div className="lg:col-span-2">
            <Card className="border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 backdrop-blur-sm shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4 text-stone-600 dark:text-stone-300" />
                  How it works
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  This app uses the AI SDK to call Google Gemini models for multimodal reasoning over your chest X-ray
                  and clinical context [^1]. It prompts the model to act as a board‑certified thoracic radiologist and
                  returns a structured report with Findings, Impression, and optional sections.
                </p>
                <p>
                  You can choose Gemini 2.5 Flash for speed or 2.5 Pro for tougher cases, and adjust the thinking budget
                  to give the model more internal reasoning tokens via thinkingConfig when needed [^1].
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
