// components/ui/VisualEditor/templates/types.ts
import { BlockType } from '../blocks'

export type TemplateCategoryId = 'full' | 'conversion' | 'product' | 'policy' | 'branding'

export interface TemplateSection {
    id: string
    name: string
    description: string
    category: TemplateCategoryId
    thumbnail?: string
    blocks: Array<{
        type: BlockType
        props?: Record<string, unknown>
    }>
}
