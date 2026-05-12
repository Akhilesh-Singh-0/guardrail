'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useSummary } from '@/hooks/use-summary'
import { useWebSocket } from '@/hooks/use-websocket'
import { formatDistanceToNow } from 'date-fns'
import { api } from '@/lib/api'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

type BillingSnapshot = {
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  costUSD: string
  requestId: string
  timestamp: Date
}

type RequestState = 'idle' | 'loading' | 'success' | 'blocked' | 'error'

const ModelBadge = ({ model }: { model: string }) => (
  <span className="text-xs font-mono bg-accent text-accent-foreground px-2 py-0.5 rounded">
    {model}
  </span>
)

const BillingCard = ({ snapshot }: { snapshot: BillingSnapshot }) => (
  <div className="rounded-lg border border-border bg-card p-4 space-y-3">
    <p className="text-xs font-medium text-foreground">Billing snapshot</p>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Model</span>
        <ModelBadge model={snapshot.model} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Prompt tokens</span>
        <span className="text-xs font-mono text-foreground">{snapshot.promptTokens.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Completion tokens</span>
        <span className="text-xs font-mono text-foreground">{snapshot.completionTokens.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Total tokens</span>
        <span className="text-xs font-mono text-foreground">{snapshot.totalTokens.toLocaleString()}</span>
      </div>
      <div className="h-px bg-border" />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Cost</span>
        <span className="text-xs font-mono font-medium text-foreground">
          ${parseFloat(snapshot.costUSD).toFixed(6)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Request ID</span>
        <span className="text-xs font-mono text-muted-foreground truncate max-w-[120px]">
          {snapshot.requestId.slice(0, 8)}...
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Time</span>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(snapshot.timestamp, { addSuffix: true })}
        </span>
      </div>
    </div>
  </div>
)

const SpendMeter = ({ summary }: { summary: ReturnType<typeof useSummary>['data'] }) => {
  if (!summary) return null

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium text-foreground mb-3">Current spend</p>
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Daily</span>
            <span className="text-xs font-mono text-foreground">
              ${parseFloat(summary.daily.currentSpend).toFixed(4)} / ${parseFloat(summary.daily.limit).toFixed(2)}
            </span>
          </div>
          <div className="w-full h-1 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                summary.daily.percentage >= 100 ? 'bg-destructive' :
                summary.daily.isApproachingLimit ? 'bg-amber-400' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(summary.daily.percentage, 100)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Monthly</span>
            <span className="text-xs font-mono text-foreground">
              ${parseFloat(summary.monthly.currentSpend).toFixed(4)} / ${parseFloat(summary.monthly.limit).toFixed(2)}
            </span>
          </div>
          <div className="w-full h-1 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                summary.monthly.percentage >= 100 ? 'bg-destructive' :
                summary.monthly.isApproachingLimit ? 'bg-amber-400' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(summary.monthly.percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'] as const
type Model = typeof MODELS[number]

export default function PlaygroundPage() {
  useWebSocket()

  const { getToken } = useAuth()
  const { data: summary } = useSummary()

  const [prompt, setPrompt]               = useState('')
  const [model, setModel]                 = useState<Model>('gpt-4o-mini')
  const [state, setState]                 = useState<RequestState>('idle')
  const [response, setResponse]           = useState<string | null>(null)
  const [billing, setBilling]             = useState<BillingSnapshot | null>(null)
  const [errorMessage, setErrorMessage]   = useState<string | null>(null)
  const [history, setHistory]             = useState<BillingSnapshot[]>([])

  const handleSend = async () => {
    if (!prompt.trim() || state === 'loading') return

    setState('loading')
    setResponse(null)
    setBilling(null)
    setErrorMessage(null)

    try {
      const token = await getToken()

      const { data } = await api.post(
        '/proxy/chat',
        {
          model,
          messages: [{ role: 'user', content: prompt.trim() }]
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const snapshot: BillingSnapshot = {
        model:            data.data.model,
        promptTokens:     data.data.usage.promptTokens,
        completionTokens: data.data.usage.completionTokens,
        totalTokens:      data.data.usage.totalTokens,
        costUSD:          data.data.costUSD,
        requestId:        data.requestId,
        timestamp:        new Date()
      }

      setResponse(data.data.content)
      setBilling(snapshot)
      setHistory(prev => [snapshot, ...prev].slice(0, 10))
      setState('success')
      setPrompt('')

    } catch (error: any) {
      const code = error?.response?.data?.error?.code
      const message = error?.response?.data?.error?.message

      if (error?.response?.status === 402) {
        setState('blocked')
        setErrorMessage(message ?? 'Spending limit exceeded')
      } else {
        setState('error')
        setErrorMessage(message ?? 'Something went wrong')
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSend()
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-foreground">Playground</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Send prompts through Guardrail and watch billing happen in real time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        <div className="lg:col-span-3 space-y-4">

          <div className="flex items-center gap-2">
            {MODELS.map(m => (
              <button
                key={m}
                onClick={() => setModel(m)}
                className={`text-xs font-mono px-3 py-1.5 rounded-md border transition-colors ${
                  model === m
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a prompt..."
              rows={6}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground p-4 resize-none focus:outline-none"
            />
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                ⌘ + Enter to send
              </span>
              <button
                onClick={handleSend}
                disabled={!prompt.trim() || state === 'loading'}
                className="text-xs bg-primary text-primary-foreground px-4 py-1.5 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {state === 'loading' ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>

          {state === 'loading' && (
            <div className="rounded-lg border border-border bg-card p-4 space-y-2">
              <div className="h-3 bg-border rounded animate-pulse w-3/4" />
              <div className="h-3 bg-border rounded animate-pulse w-1/2" />
              <div className="h-3 bg-border rounded animate-pulse w-2/3" />
            </div>
          )}

          {state === 'success' && response && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-2">Response</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {response}
              </p>
            </div>
          )}

          {(state === 'blocked' || state === 'error') && errorMessage && (
            <div className={`rounded-lg border p-4 ${
              state === 'blocked'
                ? 'border-destructive/40 bg-destructive/5'
                : 'border-border bg-card'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium ${
                  state === 'blocked' ? 'text-destructive' : 'text-foreground'
                }`}>
                  {state === 'blocked' ? '402 — Limit exceeded' : 'Error'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{errorMessage}</p>
            </div>
          )}

          {history.length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground mb-2">Request history</p>
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="divide-y divide-border">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ModelBadge model={h.model} />
                        <span className="text-xs text-muted-foreground">
                          {h.totalTokens.toLocaleString()} tokens
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-foreground">
                          ${parseFloat(h.costUSD).toFixed(6)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(h.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">

          <SpendMeter summary={summary} />

          {state === 'loading' && (
            <div className="rounded-lg border border-border bg-card p-4 space-y-3 animate-pulse">
              <div className="h-3 bg-border rounded w-1/2" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-2.5 bg-border rounded w-1/3" />
                    <div className="h-2.5 bg-border rounded w-1/4" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {billing && state === 'success' && (
            <BillingCard snapshot={billing} />
          )}

          {!billing && state === 'idle' && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground text-center py-4">
                Billing details will appear here after your first request.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}