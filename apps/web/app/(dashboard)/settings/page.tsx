'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import type { LimitsResponse } from '@/types/api'

type Alert = {
  id: string
  type: string
  threshold: string
  triggered: boolean
  triggeredAt: string | null
  createdAt: string
}

const useAlerts = () => {
  const { isSignedIn, getToken } = useAuth()
  return useQuery<{ alerts: Alert[] }>({
    queryKey: ['alerts'],
    enabled:  !!isSignedIn,
    queryFn:  async () => {
      const token = await getToken()
      const { data } = await api.get('/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return data
    }
  })
}

const useLimitsData = () => {
  const { isSignedIn, getToken } = useAuth()
  return useQuery<LimitsResponse>({
    queryKey: ['limits'],
    enabled:  !!isSignedIn,
    queryFn:  async () => {
      const token = await getToken()
      const { data } = await api.get('/limits', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return data
    }
  })
}

const alertLabel: Record<string, string> = {
  DAILY_LIMIT_80:   'Daily spend at 80%',
  DAILY_LIMIT_100:  'Daily limit reached',
  MONTHLY_LIMIT_80: 'Monthly spend at 80%',
  MONTHLY_LIMIT_100:'Monthly limit reached',
  ANOMALY:          'Spending anomaly detected'
}

export default function SettingsPage() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  const { data: limits, isLoading: limitsLoading } = useLimitsData()
  const { data: alertsData, isLoading: alertsLoading } = useAlerts()

  const [dailyLimit,   setDailyLimit]   = useState('')
  const [monthlyLimit, setMonthlyLimit] = useState('')
  const [editing, setEditing]           = useState(false)

  const updateLimits = useMutation({
    mutationFn: async () => {
      const token = await getToken()
      const body: Record<string, string> = {}
      if (dailyLimit)   body.dailyLimitUSD   = dailyLimit
      if (monthlyLimit) body.monthlyLimitUSD = monthlyLimit

      await api.patch('/limits', body, {
        headers: { Authorization: `Bearer ${token}` }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['limits'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      setEditing(false)
      setDailyLimit('')
      setMonthlyLimit('')
      toast.success('Limits updated')
    },
    onError: () => {
      toast.error('Failed to update limits')
    }
  })

  const resolveAlert = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken()
      await api.patch(`/alerts/${id}/resolve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Alert resolved')
    },
    onError: () => {
      toast.error('Failed to resolve alert')
    }
  })

  const handleSaveLimits = () => {
    if (!dailyLimit && !monthlyLimit) {
      toast.error('Enter at least one limit value')
      return
    }
    updateLimits.mutate()
  }

  const handleEditStart = () => {
    if (limits) {
      setDailyLimit(parseFloat(limits.daily.limit).toFixed(2))
      setMonthlyLimit(parseFloat(limits.monthly.limit).toFixed(2))
    }
    setEditing(true)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your spending limits and alerts
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">

        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Spending limits</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set daily and monthly caps for AI spend
              </p>
            </div>
            {!editing && (
              <button
                onClick={handleEditStart}
                className="text-xs text-primary hover:opacity-80 transition-opacity"
              >
                Edit
              </button>
            )}
          </div>

          <div className="p-5 space-y-4">
            {limitsLoading ? (
              <div className="space-y-3">
                <div className="h-8 bg-border rounded animate-pulse" />
                <div className="h-8 bg-border rounded animate-pulse" />
              </div>
            ) : editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">
                    Daily limit (USD)
                  </label>
                  <input
                    type="number"
                    value={dailyLimit}
                    onChange={e => setDailyLimit(e.target.value)}
                    placeholder="5.00"
                    step="0.01"
                    min="0"
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">
                    Monthly limit (USD)
                  </label>
                  <input
                    type="number"
                    value={monthlyLimit}
                    onChange={e => setMonthlyLimit(e.target.value)}
                    placeholder="50.00"
                    step="0.01"
                    min="0"
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleSaveLimits}
                    disabled={updateLimits.isPending}
                    className="text-xs bg-primary text-primary-foreground px-4 py-1.5 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    {updateLimits.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors px-4 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : limits ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Daily limit</span>
                  <span className="text-sm font-mono font-medium text-foreground">
                    ${parseFloat(limits.daily.limit).toFixed(2)}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Monthly limit</span>
                  <span className="text-sm font-mono font-medium text-foreground">
                    ${parseFloat(limits.monthly.limit).toFixed(2)}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-sm font-medium text-foreground">Alerts</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Active alerts triggered by your spending
            </p>
          </div>

          <div className="divide-y divide-border">
            {alertsLoading ? (
              <div className="p-5 space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-10 bg-border rounded animate-pulse" />
                ))}
              </div>
            ) : !alertsData?.alerts.length ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No active alerts</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Alerts fire automatically when you approach your spending limits
                </p>
              </div>
            ) : (
              alertsData.alerts.map(alert => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      alert.triggered ? 'bg-destructive' : 'bg-muted-foreground'
                    }`} />
                    <div>
                      <p className="text-sm text-foreground">
                        {alertLabel[alert.type] ?? alert.type}
                      </p>
                      {alert.triggeredAt && (
                        <p className="text-xs text-muted-foreground">
                          Triggered {new Date(alert.triggeredAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {alert.triggered && (
                    <button
                      onClick={() => resolveAlert.mutate(alert.id)}
                      disabled={resolveAlert.isPending}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}