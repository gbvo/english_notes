import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { PageTypeDispatcher } from "./quartz/plugins/pageTypes/dispatcher"
import { QuartzPageTypePluginInstance } from "./quartz/plugins/types"
import {
  LearningDashboard,
  LearningNav,
  LearningRelated,
  LearningSummary,
} from "./quartz/components/Learning"

const config = await loadQuartzConfig()
const contentPage = config.plugins.pageTypes?.find((pageType) => pageType.name === "ContentPage")
if (contentPage) {
  // Category index files use the learning catalogue instead of the generic folder listing.
  const cataloguePage: QuartzPageTypePluginInstance = {
    name: "LearningCataloguePage",
    priority: 20,
    match: ({ fileData }) =>
      ["all", "vocabulary", "expressions"].includes(String(fileData.frontmatter?.catalogue)),
    layout: "content",
    body: contentPage.body,
  }
  config.plugins.pageTypes!.push(cataloguePage)
}
export const layout = await loadQuartzLayout()

layout.defaults.left = [...(layout.defaults.left ?? []), LearningNav]
layout.defaults.right = []
for (const [pageType, pageLayout] of Object.entries(layout.byPageType)) {
  if (pageType === "404") continue
  pageLayout.left = [...(pageLayout.left ?? []), LearningNav]
  pageLayout.right = []
}
const contentLayout = layout.byPageType.content ?? {}
contentLayout.beforeBody = [...(contentLayout.beforeBody ?? []), LearningSummary]
contentLayout.afterBody = [...(contentLayout.afterBody ?? []), LearningDashboard, LearningRelated]
layout.byPageType.content = contentLayout

// The v5 loader creates its dispatcher before TypeScript layout overrides run.
// Use the extended layout without changing Quartz's core or community packages.
config.plugins.emitters = config.plugins.emitters.map((emitter) =>
  emitter.name === "PageTypeDispatcher" ? PageTypeDispatcher(layout) : emitter,
)
export default config
