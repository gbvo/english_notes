import test from "node:test"
import assert from "node:assert/strict"
import {
  CatalogueState,
  LearningNote,
  learningNoteKind,
  paginateLearningNotes,
  selectLearningNotes,
} from "./learning"

test("discovers canonical Quartz routes and original folder names without indexing folder pages", () => {
  assert.equal(learningNoteKind("vocabulary/stake"), "vocabulary")
  assert.equal(learningNoteKind("Vocabulary/new-word"), "vocabulary")
  assert.equal(learningNoteKind("expressions/buy-time"), "expressions")
  assert.equal(learningNoteKind("Expressions/is-the-norm"), "expressions")
  assert.equal(learningNoteKind("vocabulary/index"), undefined)
  assert.equal(learningNoteKind("expressions/index"), undefined)
  assert.equal(learningNoteKind("vocabulary"), undefined)
  assert.equal(learningNoteKind("templates/vocabulary"), undefined)
})

const notes: LearningNote[] = [
  {
    title: "stake",
    href: "./stake",
    description: "赌注；利害关系",
    kind: "vocabulary",
    topics: ["社会"],
    modified: 2,
  },
  {
    title: "buy time",
    href: "./buy-time",
    description: "争取时间",
    kind: "expressions",
    topics: ["日常"],
    modified: 3,
  },
  {
    title: "confront",
    href: "./confront",
    description: "直面；当面对质",
    kind: "vocabulary",
    topics: ["社会", "情绪"],
    modified: 1,
  },
]
const initial: CatalogueState = { query: "", topic: "", letter: "", sort: "alpha", page: 1 }

test("finds English and Chinese notes, including multiple terms across metadata", () => {
  assert.deepEqual(
    selectLearningNotes(notes, { ...initial, query: " STAKE " }).map((note) => note.title),
    ["stake"],
  )
  assert.deepEqual(
    selectLearningNotes(notes, { ...initial, query: "争取时间" }).map((note) => note.title),
    ["buy time"],
  )
  assert.deepEqual(
    selectLearningNotes(notes, { ...initial, query: "confront 社会" }).map((note) => note.title),
    ["confront"],
  )
})

test("combines topic and letter filters; clearing them restores alphabetical browsing", () => {
  assert.deepEqual(
    selectLearningNotes(notes, { ...initial, topic: "社会", letter: "C" }).map(
      (note) => note.title,
    ),
    ["confront"],
  )
  assert.equal(selectLearningNotes(notes, { ...initial, topic: "日常", letter: "S" }).length, 0)
  assert.deepEqual(
    selectLearningNotes(notes, initial).map((note) => note.title),
    ["buy time", "confront", "stake"],
  )
  assert.deepEqual(
    selectLearningNotes(notes, { ...initial, sort: "recent" }).map((note) => note.title),
    ["buy time", "stake", "confront"],
  )
})

test("a growing catalogue has no gaps or duplicates across pages", () => {
  const growing = Array.from({ length: 53 }, (_, index) => ({
    ...notes[0],
    title: `word ${index}`,
  }))
  const pages = [1, 2, 3].map((page) => paginateLearningNotes(growing, page))
  assert.deepEqual(
    pages.map((page) => page.notes.length),
    [20, 20, 13],
  )
  assert.deepEqual(
    pages.flatMap((page) => page.notes),
    growing,
  )
  assert.equal(paginateLearningNotes(growing, 100).page, 3)
  assert.equal(paginateLearningNotes(growing, -1).page, 1)
})

test("a restrictive filter clamps a stale page and an empty query result stays usable", () => {
  const filtered = selectLearningNotes(notes, { ...initial, topic: "情绪" })
  assert.equal(paginateLearningNotes(filtered, 3).notes[0].title, "confront")
  assert.deepEqual(paginateLearningNotes([], 3), { notes: [], page: 1, pages: 1, start: 0 })
})
