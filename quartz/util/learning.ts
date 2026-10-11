export type LearningNote = {
  title: string
  href: string
  description: string
  kind: "vocabulary" | "expressions"
  topics: string[]
  modified: number
}

export type CatalogueState = {
  query: string
  topic: string
  letter: string
  sort: string
  page: number
}

export const cataloguePageSize = 20

export function learningNoteKind(slug = ""): LearningNote["kind"] | undefined {
  const normalized = slug.toLowerCase()
  if (normalized.startsWith("vocabulary/") && !normalized.endsWith("/index")) return "vocabulary"
  if (normalized.startsWith("expressions/") && !normalized.endsWith("/index")) return "expressions"
}

export function selectLearningNotes(notes: LearningNote[], state: CatalogueState) {
  const terms = state.query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  return notes
    .filter((note) => {
      const text = [note.title, note.description, ...note.topics].join(" ").toLocaleLowerCase()
      return (
        terms.every((term) => text.includes(term)) &&
        (!state.topic || note.topics.includes(state.topic)) &&
        (!state.letter || note.title.toUpperCase().startsWith(state.letter))
      )
    })
    .sort((a, b) => {
      if (state.sort === "recent" && a.modified !== b.modified) return b.modified - a.modified
      return a.title.localeCompare(b.title, "en", { sensitivity: "base" })
    })
}

export function paginateLearningNotes(notes: LearningNote[], requestedPage: number) {
  const pages = Math.max(1, Math.ceil(notes.length / cataloguePageSize))
  const page = Math.min(pages, Math.max(1, Math.floor(requestedPage) || 1))
  const start = (page - 1) * cataloguePageSize
  return { notes: notes.slice(start, start + cataloguePageSize), page, pages, start }
}
