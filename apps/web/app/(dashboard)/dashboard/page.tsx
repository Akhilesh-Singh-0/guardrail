'use client'

import { useSummary } from '@/hooks/use-summary'
import { useEvents } from '@/hooks/use-events'
import { useWebSocket } from '@/hooks/use-websocket'
import { formatDistanceToNow } from 'date-fns'

const SpendCard = ({
  label,
  spent,
  limit,
  percentage,
  isApproaching
}: {
  label: string
  spent: string
  limit: string
  percentage: number
  isApproaching: boolean
}) => {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <span className={`text-xs font-mono ${
          isApproaching ? 'text-amber-400' : 'text-muted-foreground'
        }`}>
          {percentage.toFixed(1)}%
        </span>
      </div>
      <p className="text-2xl font-mono font-medium text-foreground mb-3">
        ${parseFloat(spent).toFixed(4)}
      </p>
      <div className="w-full h-1 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percentage >= 100
              ? 'bg-destructive'
              : isApproaching
              ? 'bg-amber-400'
              : 'bg-primary'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        of ${parseFloat(limit).toFixed(2)} limit
      </p>
    </div>
  )
}

const StatCard = ({
  label,
  value
}: {
  label: string
  value: string | number
}) => (
  <div className="rounded-lg border border-border bg-card p-5">
    <p className="text-xs text-muted-foreground mb-2">{label}</p>
    <p className="text-2xl font-mono font-medium text-foreground">{value}</p>
  </div>
)

export default function DashboardPage() {
  useWebSocket()

  const { data: summary, isLoading: summaryLoading } = useSummary()
  const { data: eventsData, isLoading: eventsLoading } = useEvents()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Monitor your AI spend in real time
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {summaryLoading ? (
          <>
            <div className="rounded-lg border border-border bg-card p-5 h-[120px] animate-pulse" />
            <div className="rounded-lg border border-border bg-card p-5 h-[120px] animate-pulse" />
          </>
        ) : summary ? (
          <>
            <SpendCard
              label="Daily spend"
              spent={summary.daily.currentSpend}
              limit={summary.daily.limit}
              percentage={summary.daily.percentage}
              isApproaching={summary.daily.isApproachingLimit}
            />
            <SpendCard
              label="Monthly spend"
              spent={summary.monthly.currentSpend}
              limit={summary.monthly.limit}
              percentage={summary.monthly.percentage}
              isApproaching={summary.monthly.isApproachingLimit}
            />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {summaryLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5 h-[80px] animate-pulse" />
          ))
        ) : summary ? (
          <>
            <StatCard
              label="Requests today"
              value={summary.daily.requests}
            />
            <StatCard
              label="Tokens today"
              value={summary.daily.totalTokens.toLocaleString()}
            />
            <StatCard
              label="Requests this month"
              value={summary.monthly.requests}
            />
          </>
        ) : null}
      </div>

      <div>
        <h2 className="text-sm font-medium text-foreground mb-3">
          Recent requests
        </h2>
        <div className="rounded-lg border border-border overflow-hidden">
          {eventsLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
              Loading...
            </div>
          ) : eventsData?.events.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No requests yet. Send your first prompt.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {eventsData?.events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono bg-accent text-accent-foreground px-2 py-0.5 rounded">
                      {event.model}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {event.totalTokens.toLocaleString()} tokens
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-foreground">
                      ${parseFloat(event.costUSD).toFixed(6)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}