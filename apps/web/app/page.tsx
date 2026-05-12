'use client'

import { motion, Variants } from 'framer-motion'
import { Logo } from '@/components/logo'
import Link from 'next/link'

const features = [
  { label: 'Block on limit', desc: '402 returned instantly. No OpenAI call made.' },
  { label: 'Live spend counter', desc: 'Cost appears the same second OpenAI responds.' },
  { label: 'Instant alerts', desc: 'Push notification at 80% spend — not an email later.' },
]

const stats = [
  { value: '<1ms', label: 'Block latency' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '1M+', label: 'Requests tracked' },
]

const mockEvents = [
  { model: 'gpt-4o-mini', tokens: '1,247', cost: '$0.000187', time: '0.3s', status: 'allowed' },
  { model: 'gpt-4o', tokens: '3,891', cost: '$0.038910', time: '1.2s', status: 'allowed' },
  { model: 'gpt-4o-mini', tokens: '892', cost: '$0.000134', time: '0.2s', status: 'allowed' },
  { model: 'gpt-4o-mini', tokens: '2,103', cost: '$0.000315', time: '0.4s', status: 'blocked' },
  { model: 'gpt-4o', tokens: '1,567', cost: '$0.015670', time: '0.9s', status: 'allowed' },
]

const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },

  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,

    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="gradient-orb-1" />
      <div className="gradient-orb-2" />

      <nav className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-border backdrop-blur-sm bg-background/80 sticky top-0">
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
            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            Get started
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-8 py-24 gap-6">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 rounded-full px-3 py-1 text-xs text-primary font-mono"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block live-pulse" />
          AI cost enforcement, in real time
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-6xl font-semibold tracking-tight max-w-2xl leading-tight text-foreground"
        >
          Stop burning money
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">
            on OpenAI
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-muted-foreground text-base max-w-sm leading-relaxed"
        >
          Guardrail sits between your app and OpenAI. Blocks over-limit requests,
          tracks per-user spend, and pushes live alerts.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-3 mt-1"
        >
          <Link
            href="/sign-up"
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-95"
          >
            Start for free
          </Link>

          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-6 py-2.5"
          >
            Sign in →
          </Link>
        </motion.div>

        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-8 mt-4"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-xl font-mono font-semibold text-foreground">
                {stat.value}
              </p>

              <p className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="w-full max-w-2xl mt-8 rounded-xl border border-border bg-card overflow-hidden shadow-2xl shadow-black/50"
        >
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-surface-1">
            <span className="w-3 h-3 rounded-full bg-destructive/60" />
            <span className="w-3 h-3 rounded-full bg-amber-400/60" />
            <span className="w-3 h-3 rounded-full bg-green-400/60" />

            <span className="text-xs text-muted-foreground ml-3 font-mono">
              guardrail — request feed
            </span>

            <div className="ml-auto flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 live-pulse" />

              <span className="text-xs text-green-400 font-mono">
                live
              </span>
            </div>
          </div>

          <div className="divide-y divide-border">
            {mockEvents.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.8 + i * 0.15,
                  duration: 0.4,
                }}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-accent/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      event.status === 'allowed'
                        ? 'bg-green-400'
                        : 'bg-destructive'
                    }`}
                  />

                  <span className="text-xs font-mono bg-accent text-accent-foreground px-2 py-0.5 rounded">
                    {event.model}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {event.tokens} tokens
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-foreground">
                    {event.cost}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {event.time}
                  </span>

                  <span
                    className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                      event.status === 'allowed'
                        ? 'text-green-400 bg-green-400/10'
                        : 'text-destructive bg-destructive/10'
                    }`}
                  >
                    {event.status === 'allowed' ? '200' : '402'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-border bg-surface-1 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Daily spend
              </span>

              <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '67%' }}
                  transition={{
                    delay: 1.5,
                    duration: 1,
                    ease: 'easeOut',
                  }}
                  className="h-full bg-primary rounded-full"
                />
              </div>

              <span className="text-xs font-mono text-foreground whitespace-nowrap">
                $3.35 / $5.00
              </span>
            </div>
          </div>
        </motion.div>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 1.2,
          duration: 0.5,
        }}
        className="relative z-10 grid grid-cols-1 sm:grid-cols-3 border-t border-border"
      >
        {features.map((f, i) => (
          <motion.div
            key={i}
            whileHover={{
              backgroundColor: 'oklch(0.511 0.237 264 / 4%)',
            }}
            className="px-8 py-5 sm:border-r border-border last:border-0 border-b sm:border-b-0 transition-colors cursor-default"
          >
            <p className="text-sm font-medium text-foreground mb-1">
              {f.label}
            </p>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </motion.footer>
    </div>
  )
}