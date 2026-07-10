// app/roadmap/page.tsx
import RoadmapClient from './RoadmapClient'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

export const metadata = {
  title: 'Feature Roadmap | Riazify',
  description: 'See what we are building next. Vote on features you want most.',
}

export default function RoadmapPage() {
  return (
    <>
      <Navbar/>
      <RoadmapClient/>
      <Footer/>
    </>
  )
}