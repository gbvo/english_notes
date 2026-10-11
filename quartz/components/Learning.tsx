import { QuartzComponent, QuartzComponentProps } from "./types"
import { resolveRelative, FullSlug, simplifySlug } from "../util/path"
import { cataloguePageSize, LearningNote, learningNoteKind as kindOf } from "../util/learning"
// @ts-ignore: Quartz bundles inline scripts as strings.
import script from "./scripts/learning.inline"

const categories = [
  {
    kind: "vocabulary",
    slug: "vocabulary/index",
    title: "单词",
    english: "Vocabulary",
    label: "在语境里理解每一个词。",
  },
  {
    kind: "expressions",
    slug: "expressions/index",
    title: "表达",
    english: "Expressions",
    label: "积累自然、准确的英语表达。",
  },
] as const

function href(props: QuartzComponentProps, slug: string) {
  return resolveRelative(props.fileData.slug!, slug as FullSlug)
}

function learningNotes(props: QuartzComponentProps): LearningNote[] {
  return props.allFiles
    .flatMap((file) => {
      const kind = kindOf(file.slug)
      if (!kind || !file.frontmatter || file.unlisted || file.frontmatter.draft) return []
      const topics = file.frontmatter.topics
      return [
        {
          title: file.frontmatter.title,
          href: href(props, file.slug!),
          description:
            typeof file.frontmatter.description === "string" ? file.frontmatter.description : "",
          kind,
          topics: Array.isArray(topics)
            ? topics.filter((topic): topic is string => typeof topic === "string")
            : [],
          modified: file.dates?.modified?.getTime() ?? 0,
        },
      ]
    })
    .sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }))
}

function NoteRows({ notes }: { notes: LearningNote[] }) {
  return (
    <ul class="learning-rows">
      {notes.map((note) => (
        <li>
          <a class="internal learning-note-link" href={note.href}>
            <span class="learning-word">{note.title}</span>
            <span class="learning-meaning">{note.description || "查看笔记"}</span>
          </a>
          <span class="learning-note-kind">{note.kind === "vocabulary" ? "单词" : "表达"}</span>
        </li>
      ))}
    </ul>
  )
}

export const LearningNav: QuartzComponent = (props) => {
  const notes = learningNotes(props)
  const current = props.fileData.slug
  const active = kindOf(current) ?? props.fileData.frontmatter?.catalogue ?? current
  return (
    <nav class="learning-nav" aria-label="学习导航">
      <span class="learning-eyebrow">我的英语笔记</span>
      <a
        class="internal"
        href={href(props, "index")}
        aria-current={current === "index" ? "page" : undefined}
      >
        首页 <span>Home</span>
      </a>
      <a
        class="internal"
        href={href(props, "library")}
        aria-current={current === "library" ? "page" : undefined}
      >
        全部笔记 <span>{notes.length}</span>
      </a>
      {categories.map((category) => (
        <a
          class="internal"
          href={href(props, category.slug)}
          aria-current={active === category.kind ? "page" : undefined}
        >
          {category.title}
          <span>{notes.filter((note) => note.kind === category.kind).length}</span>
        </a>
      ))}
      <p class="learning-nav-caption">Read. Notice. Remember.</p>
    </nav>
  )
}

export const LearningSummary: QuartzComponent = (props) => {
  const kind = kindOf(props.fileData.slug)
  if (!kind) return null
  const description = props.fileData.frontmatter?.description
  const topics = props.fileData.frontmatter?.topics
  return (
    <div class="learning-summary">
      {typeof description === "string" && <p>{description}</p>}
      <div class="learning-note-tags">
        <a class="internal" href={href(props, `${kind}/index`)}>
          {kind === "vocabulary" ? "单词" : "表达"}
        </a>
        {Array.isArray(topics) &&
          topics.map(
            (topic) =>
              typeof topic === "string" && (
                <a
                  class="internal"
                  href={`${href(props, "library")}?topic=${encodeURIComponent(topic)}`}
                >
                  {topic}
                </a>
              ),
          )}
      </div>
    </div>
  )
}

export const LearningDashboard: QuartzComponent = (props) => {
  const home = props.fileData.slug === "index"
  const catalogue = props.fileData.frontmatter?.catalogue
  if (!home && !["all", "vocabulary", "expressions"].includes(String(catalogue))) return null
  const allNotes = learningNotes(props)
  const notes =
    catalogue === "all" || home ? allNotes : allNotes.filter((note) => note.kind === catalogue)
  const topics = [...new Set(notes.flatMap((note) => note.topics))].sort((a, b) =>
    a.localeCompare(b, "zh-CN"),
  )

  if (home) {
    const recent = [...notes]
      .sort((a, b) => b.modified - a.modified || a.title.localeCompare(b.title))
      .slice(0, 6)
    return (
      <section class="learning-dashboard learning-home">
        <form
          class="learning-home-search"
          action={href(props, "library")}
          method="get"
          role="search"
        >
          <label class="sr-only" for="learning-home-query">
            搜索单词、表达或中文释义
          </label>
          <input
            id="learning-home-query"
            type="search"
            name="q"
            placeholder="搜索单词、表达或中文释义…"
          />
          <button type="submit">
            查找笔记 <span aria-hidden="true">↗</span>
          </button>
        </form>
        <div class="learning-categories">
          {categories.map((category, i) => (
            <a class="internal learning-category" href={href(props, category.slug)}>
              <div class="learning-category-top">
                <span class="learning-eyebrow">
                  0{i + 1} / {category.english}
                </span>
                <span aria-hidden="true">↗</span>
              </div>
              <h2>{category.title}</h2>
              <p>{category.label}</p>
              <span class="learning-category-count">
                {notes.filter((note) => note.kind === category.kind).length} 条笔记
              </span>
            </a>
          ))}
        </div>
        {topics.length > 0 && (
          <section class="learning-topics">
            <h2>按主题探索</h2>
            <div class="learning-topic-chips">
              {topics.map((topic) => (
                <a
                  class="internal"
                  href={`${href(props, "library")}?topic=${encodeURIComponent(topic)}`}
                >
                  {topic}
                  <span>{notes.filter((note) => note.topics.includes(topic)).length}</span>
                </a>
              ))}
            </div>
          </section>
        )}
        <section class="learning-recent">
          <div class="learning-section-heading">
            <h2>最近更新</h2>
            <a class="internal" href={`${href(props, "library")}?sort=recent`}>
              查看全部 <span aria-hidden="true">→</span>
            </a>
          </div>
          <NoteRows notes={recent} />
          {recent.length === 0 && <p>从阅读中记下第一个词，笔记会出现在这里。</p>}
        </section>
      </section>
    )
  }

  return (
    <section class="learning-dashboard learning-catalogue" data-learning-catalogue>
      <div class="learning-controls" hidden>
        <div class="learning-filter-row">
          <label class="learning-query-label">
            <span class="sr-only">筛选词条</span>
            <input data-learning-query type="search" placeholder="搜索英文或中文释义…" />
          </label>
          <label>
            <span class="sr-only">主题</span>
            <select data-learning-topic>
              <option value="">全部主题</option>
              {topics.map((topic) => (
                <option value={topic}>{topic}</option>
              ))}
            </select>
          </label>
          <label>
            <span class="sr-only">排序</span>
            <select data-learning-sort>
              <option value="alpha">字母 A–Z</option>
              <option value="recent">最近更新</option>
            </select>
          </label>
        </div>
        <div class="learning-alphabet" aria-label="按首字母筛选">
          <button type="button" data-learning-letter="" aria-pressed="true">
            全部
          </button>
          {Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map((letter) => (
            <button
              type="button"
              data-learning-letter={letter}
              aria-pressed="false"
              disabled={!notes.some((note) => note.title.toUpperCase().startsWith(letter))}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>
      <div class="learning-catalogue-status">
        <p data-learning-status role="status">
          共 {notes.length} 条笔记
        </p>
        <button type="button" data-learning-reset hidden>
          清除筛选
        </button>
      </div>
      <div data-learning-results>
        <NoteRows notes={notes.slice(0, cataloguePageSize)} />
      </div>
      <p class="learning-empty" data-learning-empty hidden>
        没有找到匹配的笔记，试试其他关键词或清除筛选。
      </p>
      <nav class="learning-pagination" aria-label="词库分页" hidden>
        <button type="button" data-learning-prev>
          上一页
        </button>
        <span data-learning-page></span>
        <button type="button" data-learning-next>
          下一页
        </button>
      </nav>
      {notes.length > cataloguePageSize && (
        <noscript>
          <p>更多笔记</p>
          <NoteRows notes={notes.slice(cataloguePageSize)} />
        </noscript>
      )}
      <script
        type="application/json"
        data-learning-notes
        dangerouslySetInnerHTML={{ __html: JSON.stringify(notes).replace(/</g, "\\u003c") }}
      />
    </section>
  )
}
LearningDashboard.afterDOMLoaded = script

export const LearningRelated: QuartzComponent = (props) => {
  if (!kindOf(props.fileData.slug)) return null
  const slug = simplifySlug(props.fileData.slug!)
  const linked = new Set(props.fileData.links ?? [])
  const relatedSlugs = new Set<string>(
    props.allFiles
      .filter(
        (file) =>
          kindOf(file.slug) &&
          file.slug !== props.fileData.slug &&
          (linked.has(simplifySlug(file.slug!)) || file.links?.includes(slug)),
      )
      .map((file) => href(props, file.slug!)),
  )
  const notes = learningNotes(props)
    .filter((note) => relatedSlugs.has(note.href))
    .slice(0, 6)
  if (notes.length === 0) return null
  return (
    <section class="learning-related">
      <span class="learning-eyebrow">继续积累</span>
      <h2>相关笔记</h2>
      <NoteRows notes={notes} />
    </section>
  )
}
