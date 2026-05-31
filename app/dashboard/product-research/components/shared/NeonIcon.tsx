// app/dashboard/product-research/components/shared/NeonIcon.tsx
// Converted 1:1 from lib/pages/product_research/shared/neon_icon.dart

interface Props {
  icon: React.ElementType
}

export default function NeonIcon({ icon: Icon }: Props) {
  return (
    <div className="flex items-center justify-center rounded-full p-2 shrink-0"
         style={{ backgroundColor: '#8FFF00' }}>
      <Icon size={18} color="#000" />
    </div>
  )
}