"use client"

import dynamic from "next/dynamic"
import { memo } from "react"

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false })

type Props = {
  markdown?: string
}

function ReportViewInner({ markdown = "" }: Props) {
  return (
    <div className="prose prose-stone dark:prose-invert max-w-none">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  )
}

export const ReportView = memo(ReportViewInner)
