import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur flex h-14">
      <nav className="flex items-center gap-6 text-sm max-w-screen-2xl m-auto">
        <Link href="/">Home</Link>
        <Link href="/docs/users">Docs</Link>
      </nav>
    </header>
  )
}
