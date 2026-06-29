interface ScanProgress {
  status: "idle" | "running" | "completed" | "failed"
  currentKeyword: string | null
  keywordsDone: number
  keywordsTotal: number
  listingsFound: number
  dealsFound: number
  message: string
  error?: string
}

let progress: ScanProgress = {
  status: "idle",
  currentKeyword: null,
  keywordsDone: 0,
  keywordsTotal: 0,
  listingsFound: 0,
  dealsFound: 0,
  message: "",
}

export function getScanProgress(): ScanProgress {
  return { ...progress }
}

export function updateScanProgress(update: Partial<ScanProgress>) {
  progress = { ...progress, ...update }
}

export function resetScanProgress() {
  progress = {
    status: "idle",
    currentKeyword: null,
    keywordsDone: 0,
    keywordsTotal: 0,
    listingsFound: 0,
    dealsFound: 0,
    message: "",
  }
}
