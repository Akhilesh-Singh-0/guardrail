import { Logo } from '@/components/logo'
import Link from 'next/link'

const features = [
  { label: 'Block on limit', desc: '402 returned instantly. No OpenAI call made.' },
  { label: 'Live spend counter', desc: 'Cost appears on screen the same second OpenAI responds.' },
  { label: 'Instant alerts', desc: 'Push notification at 80% spend — not an email 5 mins later.' },
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link href="/sign-up" className="text-sm border border-border text-foreground px-4 py-2 rounded-md font-medium hover:bg-accent transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-6">
        <div className="inline-flex items-center gap-2 border border-border rounded-full px-3 py-1 text-xs text-muted-foreground font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          AI cost enforcement, in real time
        </div>
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight max-w-2xl leading-tight">
          Stop burning money on OpenAI
        </h1>
        <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
          Guardrail sits between your app and OpenAI. It blocks over-limit requests, tracks per-user spend, and pushes live alerts — before the damage is done.
        </p>
        <div className="flex items-center gap-3 mt-2">
          <Link href="/sign-up" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
            Start for free
          </Link>
          <a href="https://docs.guardrail.dev" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-6 py-2.5">
            Read the docs →
          </a>
        </div>
      </main>

      <footer className="grid grid-cols-1 sm:grid-cols-3 border-t border-border">
        {features.map((f, i) => (
          <div key={i} className="px-8 py-6 border-b sm:border-b-0 sm:border-r border-border last:border-0">
            <p className="text-sm font-medium text-foreground mb-1">{f.label}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </footer>
    </div>
  )
}