// app/sitemap.ts
import { createClient } from '@/lib/supabase'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()
  const { data: posts } = await (supabase.from('blog_posts') as any)
    .select('slug, updated_at, created_at')
    .eq('status', 'live')
    .order('created_at', { ascending: false })

  const blogPosts = (posts ?? []).map((post: any) => ({
    url: `https://riazify.com/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: 'https://riazify.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://riazify.com/blog', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://riazify.com/pricing', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://riazify.com/roadmap', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    ...blogPosts,
  ]
}