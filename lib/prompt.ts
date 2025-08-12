type BuildPromptArgs = {
  age: string
  sex: "Male" | "Female" | "Other"
  history: string
  priority: "Routine" | "STAT"
  views: "PA" | "AP" | "Lateral" | "PA+Lateral" | "AP Portable"
  includeDifferential: boolean
  includeSeverity: boolean
  includeRecommendations: boolean
}

export function buildPrompt({
  age,
  sex,
  history,
  priority,
  views,
  includeDifferential,
  includeSeverity,
  includeRecommendations,
}: BuildPromptArgs) {
  const sections: string[] = [
    "Provide a concise, structured chest radiograph report in Markdown.",
    "Write in the voice of a senior, board‑certified thoracic radiologist.",
    "Be specific and avoid hedging when findings are clear; otherwise explain uncertainty briefly.",
    "Use layperson-friendly clarification where helpful in parentheses.",
  ]

  const meta = `Patient: ${age} ${sex}
Study: ${views} Chest X‑ray
Priority: ${priority}
Clinical history: ${history}`

  const reportOrder: string[] = [
    "Technique: Mention projection and any quality limitations (rotation, inspiration, artifacts).",
    "Comparison: If no prior provided, state 'No prior available.'",
    "Findings: Systematic head‑to‑toe approach (mediastinum, cardiac silhouette, lungs, pleura, diaphragm, bones, devices). Be concise.",
    "Impression: Numbered, prioritized statements highlighting the most important diagnoses first.",
  ]
  if (includeSeverity) {
    reportOrder.push("Severity: If applicable (e.g., edema, consolidation), rate as mild, moderate, or severe.")
  }
  if (includeDifferential) {
    reportOrder.push("Differential: Provide 2‑4 most likely alternatives with brief justification.")
  }
  if (includeRecommendations) {
    reportOrder.push(
      "Recommendations: Actionable next steps (e.g., correlate clinically, CT, ultrasound, follow‑up timing).",
    )
  }

  return [
    sections.join("\n"),
    "",
    meta,
    "",
    "Format strictly as:",
    "## Technique",
    "## Comparison",
    "## Findings",
    "## Impression",
    includeSeverity ? "## Severity" : "",
    includeDifferential ? "## Differential" : "",
    includeRecommendations ? "## Recommendations" : "",
    "",
    "Reporting guidance:",
    ...reportOrder.map((s) => `- ${s}`),
    "",
    "If image quality limits interpretation, clearly state this. Do not fabricate devices or prior studies.",
  ]
    .filter(Boolean)
    .join("\n")
}
