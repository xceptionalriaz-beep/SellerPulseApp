// components/ui/VisualEditor/templates/index.ts
// Central export — add new template imports here
export type { TemplateSection, TemplateCategoryId } from './types'

export { electronicsTemplate } from './electronics'
export { fashionTemplate } from './fashion'
export { autoTemplate } from './auto'
export { minimalTemplate } from './minimal'
export { homeGardenTemplate } from './home_garden'
export { sportsTemplate } from './sports'

// Re-export as ordered array for TemplatesTab
import { electronicsTemplate } from './electronics'
import { fashionTemplate } from './fashion'
import { autoTemplate } from './auto'
import { minimalTemplate } from './minimal'
import { homeGardenTemplate } from './home_garden'
import { sportsTemplate } from './sports'
import { TemplateSection } from './types'

export const FULL_TEMPLATES: TemplateSection[] = [
    electronicsTemplate,
    fashionTemplate,
    homeGardenTemplate,
    sportsTemplate,
    autoTemplate,
    minimalTemplate,
]
