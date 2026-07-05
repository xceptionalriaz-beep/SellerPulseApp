// app/api/blog/posts/route.ts
import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data } = await (supabase.from('blog_posts') as any)
      .select('id,title,slug,category,featured_image_url,word_count,views')
      .eq('status', 'live')
      .order('created_at', { ascending: false })
      .limit(10)
    return NextResponse.json({ posts: data ?? [] })
  } catch {
    return NextResponse.json({ posts: [] })
  }
}