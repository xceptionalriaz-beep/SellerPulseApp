// components/ui/Spinner.tsx
// Simple clean round spinner used across all pages

export default function Spinner({ size = 32, color = '#8FFF00' }: {
  size?: number; color?: string
}) {
  return (
    <div
      className="rounded-full border-2 border-transparent animate-spin"
      style={{
        width: size,
        height: size,
        borderTopColor: color,
        borderRightColor: color + '40',
      }}
    />
  )
}

// Full page centered spinner
export function PageSpinner() {
  return (
    <div className="flex items-center justify-center w-full py-16">
      <Spinner />
    </div>
  )
}
