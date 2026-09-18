interface Props {
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit'
  children: any
}

export function Button({
  onClick,
  disabled,
  loading,
  type = 'button',
  children
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      class="flex h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-accent text-[17px] font-semibold text-paper-white shadow-button transition-transform active:scale-[0.98] disabled:opacity-60"
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}

export function Spinner() {
  return (
    <svg
      class="size-5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke-linecap="round" />
    </svg>
  )
}

interface IconButtonProps {
  onClick?: () => void
  label: string
  children: any
}

export function IconButton({ onClick, label, children }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-paper-white text-ink transition-colors hover:bg-paper-soft active:bg-chip"
    >
      {children}
    </button>
  )
}
