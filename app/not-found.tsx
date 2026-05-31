import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-dark">404</h1>
      <p className="text-gray-500">Page not found</p>
      <Link href="/auth/login" className="btn-lime px-6 py-2 rounded-lg">
        Go to Login
      </Link>
    </div>
  )
}