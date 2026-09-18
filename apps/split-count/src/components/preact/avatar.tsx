import { initials } from '@/lib/split'

interface Props {
  name: string
  color: string
  size?: number
  className?: string
}

export function Avatar({ name, color, size = 36, className = '' }: Props) {
  const text = initials(name)
  const fontSize = size <= 24 ? 11 : text.length > 1 ? size * 0.36 : size * 0.5
  return (
    <span
      class={`flex shrink-0 items-center justify-center rounded-full font-serif font-normal text-ink ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: color,
        fontSize: `${fontSize}px`,
        letterSpacing: text.length > 1 ? '0.3px' : undefined
      }}
    >
      {text}
    </span>
  )
}
