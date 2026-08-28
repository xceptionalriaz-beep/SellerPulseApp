// components/ui/VisualEditor/templates/index.ts
// Central export — add new template imports here
export type { TemplateSection, TemplateCategoryId } from './types'

export { electronicsTemplate } from './electronics'
export { fashionTemplate } from './fashion'
export { autoTemplate } from './auto'
export { minimalTemplate } from './minimal'

// Re-export as ordered array for TemplatesTab
import { electronicsTemplate } from './electronics'
import { fashionTemplate } from './fashion'
import { autoTemplate } from './auto'
import { minimalTemplate } from './minimal'
import { TemplateSection } from './types'

export const FULL_TEMPLATES: TemplateSection[] = [
    electronicsTemplate,
    fashionTemplate,
    autoTemplate,
    minimalTemplate,
]
