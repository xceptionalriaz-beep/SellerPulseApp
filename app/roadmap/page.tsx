// app/roadmap/page.tsx
import RoadmapClient from './RoadmapClient'

export const metadata = {
  title: 'Feature Roadmap | Riazify',
  description: 'See what we are building next. Vote on features you want most.',
}

export default function RoadmapPage() {
  return <RoadmapClient />
}