import {
  CatalogueState,
  LearningNote,
  paginateLearningNotes,
  selectLearningNotes,
} from "../../util/learning"

document.addEventListener("nav", () => {
  const catalogue = document.querySelector<HTMLElement>("[data-learning-catalogue]")
  if (!catalogue) return
  const notes: LearningNote[] = JSON.parse(
    catalogue.querySelector("[data-learning-notes]")!.textContent!,
  )
  // Resolve relative links before changing pages: SPA normalizes HTML attributes,
  // but cannot rewrite URLs inside the JSON payload.
  for (const note of notes) note.href = new URL(note.href, window.location.href).href
  const query = catalogue.querySelector<HTMLInputElement>("[data-learning-query]")!
  const topic = catalogue.querySelector<HTMLSelectElement>("[data-learning-topic]")!
  const sort = catalogue.querySelector<HTMLSelectElement>("[data-learning-sort]")!
  const results = catalogue.querySelector<HTMLElement>("[data-learning-results]")!
  const status = catalogue.querySelector<HTMLElement>("[data-learning-status]")!
  const empty = catalogue.querySelector<HTMLElement>("[data-learning-empty]")!
  const reset = catalogue.querySelector<HTMLButtonElement>("[data-learning-reset]")!
  const pagination = catalogue.querySelector<HTMLElement>(".learning-pagination")!
  const previous = catalogue.querySelector<HTMLButtonElement>("[data-learning-prev]")!
  const next = catalogue.querySelector<HTMLButtonElement>("[data-learning-next]")!
  const letters = [...catalogue.querySelectorAll<HTMLButtonElement>("[data-learning-letter]")]
  const params = new URL(window.location.href).searchParams
  const state: CatalogueState = {
    query: params.get("q") ?? "",
    topic: params.get("topic") ?? "",
    sort: params.get("sort") === "recent" ? "recent" : "alpha",
    letter: /^[A-Z]$/.test(params.get("letter") ?? "") ? params.get("letter")! : "",
    page: Number(params.get("page")) || 1,
  }
  if (![...topic.options].some((option) => option.value === state.topic)) state.topic = ""
  query.value = state.query
  topic.value = state.topic
  sort.value = state.sort

  const update = () => {
    const matching = selectLearningNotes(notes, state)
    const paginated = paginateLearningNotes(matching, state.page)
    state.page = paginated.page
    const list = document.createElement("ul")
    list.className = "learning-rows"
    for (const note of paginated.notes) {
      const row = document.createElement("li")
      const link = document.createElement("a")
      link.className = "internal learning-note-link"
      link.href = note.href
      const title = document.createElement("span")
      title.className = "learning-word"
      title.textContent = note.title
      const meaning = document.createElement("span")
      meaning.className = "learning-meaning"
      meaning.textContent = note.description || "查看笔记"
      const kind = document.createElement("span")
      kind.className = "learning-note-kind"
      kind.textContent = note.kind === "vocabulary" ? "单词" : "表达"
      link.append(title, meaning)
      row.append(link, kind)
      list.append(row)
    }
    results.replaceChildren(list)
    status.textContent = matching.length
      ? `共 ${matching.length} 条 · 显示 ${paginated.start + 1}–${paginated.start + paginated.notes.length} 条`
      : "共 0 条笔记"
    empty.hidden = matching.length > 0
    pagination.hidden = paginated.pages <= 1
    previous.disabled = state.page <= 1
    next.disabled = state.page >= paginated.pages
    catalogue.querySelector("[data-learning-page]")!.textContent =
      `${state.page} / ${paginated.pages}`
    reset.hidden = !state.query && !state.topic && !state.letter && state.sort === "alpha"
    for (const button of letters)
      button.setAttribute("aria-pressed", String(button.dataset.learningLetter === state.letter))
    const url = new URL(window.location.href)
    for (const [key, value] of Object.entries({
      q: state.query,
      topic: state.topic,
      letter: state.letter,
      sort: state.sort === "recent" ? "recent" : "",
      page: state.page > 1 ? String(state.page) : "",
    })) {
      if (value) url.searchParams.set(key, value)
      else url.searchParams.delete(key)
    }
    window.history.replaceState(window.history.state, "", url)
  }

  const onFilter = () => {
    state.query = query.value
    state.topic = topic.value
    state.sort = sort.value
    state.page = 1
    update()
  }
  const onClick = (event: MouseEvent) => {
    const button = (event.target as Element).closest<HTMLButtonElement>("button")
    if (!button || button.disabled) return
    if (button.hasAttribute("data-learning-letter")) {
      state.letter = button.dataset.learningLetter ?? ""
      state.page = 1
    } else if (button === reset) {
      Object.assign(state, { query: "", topic: "", letter: "", sort: "alpha", page: 1 })
      query.value = ""
      topic.value = ""
      sort.value = "alpha"
    } else if (button === previous || button === next) {
      state.page += button === next ? 1 : -1
    } else return
    update()
  }
  catalogue.querySelector<HTMLElement>(".learning-controls")!.hidden = false
  query.addEventListener("input", onFilter)
  topic.addEventListener("change", onFilter)
  sort.addEventListener("change", onFilter)
  catalogue.addEventListener("click", onClick)
  window.addCleanup(() => {
    query.removeEventListener("input", onFilter)
    topic.removeEventListener("change", onFilter)
    sort.removeEventListener("change", onFilter)
    catalogue.removeEventListener("click", onClick)
  })
  update()
})
