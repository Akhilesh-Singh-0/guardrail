export default function DashboardPage() {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor your AI spend in real time
          </p>
        </div>
  
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {['Daily spend', 'Monthly spend', 'Total requests'].map((label) => (
            <div
              key={label}
              className="rounded-lg border border-border bg-card p-5"
            >
              <p className="text-xs text-muted-foreground mb-2">{label}</p>
              <p className="text-2xl font-mono font-medium text-foreground">—</p>
            </div>
          ))}
        </div>
      </div>
    )
}