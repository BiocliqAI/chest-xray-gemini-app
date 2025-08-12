"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CloudUpload } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  onFile?: (file: File | null) => void
  value?: File | null
  accept?: string[] // mime types
  maxSizeMB?: number
  className?: string
}

export function FileDropzone({
  onFile = () => {},
  value = null,
  accept = ["image/jpeg", "image/png", "image/webp"],
  maxSizeMB = 20,
  className = "",
}: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>("")

  const handleFiles = useCallback(
    (files: FileList | null) => {
      setError("")
      if (!files || files.length === 0) return
      const f = files[0]
      if (!accept.includes(f.type)) {
        setError(`Unsupported file type. Allowed: ${accept.join(", ")}`)
        onFile(null)
        return
      }
      const sizeMB = f.size / (1024 * 1024)
      if (sizeMB > maxSizeMB) {
        setError(`File too large (${sizeMB.toFixed(1)} MB). Max ${maxSizeMB} MB.`)
        onFile(null)
        return
      }
      onFile(f)
    },
    [accept, maxSizeMB, onFile],
  )

  return (
    <div className={cn("space-y-2", className)}>
      <Label>Chest X-ray</Label>
      <div
        className={cn(
          "relative rounded-lg border border-dashed bg-white p-4 transition-colors",
          isDragging ? "border-emerald-500 bg-emerald-50" : "border-stone-300 hover:border-stone-400",
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm">
            <div className="font-medium">Drag & drop a CXR image</div>
            <div className="text-muted-foreground text-xs">JPG, PNG, or WebP. Max {maxSizeMB} MB.</div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept={accept.join(",")}
              onChange={(e) => handleFiles(e.target.files)}
              className="sr-only"
              id="file-input"
            />
            <Button asChild variant="outline" type="button" className="gap-2 bg-transparent">
              <label htmlFor="file-input" className="cursor-pointer">
                <CloudUpload className="h-4 w-4" />
                Browse
              </label>
            </Button>
          </div>
        </div>
      </div>
      {!!value && (
        <div className="text-xs text-stone-600 truncate">
          Selected: <span className="font-medium">{value.name}</span>
        </div>
      )}
      {!!error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  )
}
