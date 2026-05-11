import { Logo } from '@/components/logo'
import Link from 'next/link'

const features = [
  { label: 'Block on limit', desc: '402 returned instantly. No OpenAI call made.' },
  { label: 'Live spend counter', desc: 'Cost appears the same second OpenAI responds.' },
  { label: 'Instant alerts', desc: 'Push notification at 80% spend — not an email later.' },
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border">
        <Logo size="md" />
        <div className="flex items-center gap-1">
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-md hover:bg-accent/50"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-5 py-24">
        <div className="inline-flex items-center gap-2 border border-border rounded-full px-3 py-1 text-xs text-muted-foreground font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          AI cost enforcement, in real time
        </div>

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight max-w-xl leading-tight text-foreground">
          Stop burning money<br />on OpenAI
        </h1>

        <p className="text-muted-foreground text-base max-w-sm leading-relaxed">
          Guardrail sits between your app and OpenAI. Blocks over-limit requests, tracks per-user spend, and pushes live alerts.
        </p>

        <div className="flex items-center gap-3 mt-1">
          <Link
            href="/sign-up"
            className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Start for free
          </Link>
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-5 py-2"
          >
            Sign in →
          </Link>
        </div>
      </main>

      <footer className="grid grid-cols-1 sm:grid-cols-3 border-t border-border">
        {features.map((f, i) => (
          <div
            key={i}
            className="px-8 py-5 sm:border-r border-border last:border-0 border-b sm:border-b-0"
          >
            <p className="text-sm font-medium text-foreground mb-1">{f.label}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </footer>
    </div>
  )
}