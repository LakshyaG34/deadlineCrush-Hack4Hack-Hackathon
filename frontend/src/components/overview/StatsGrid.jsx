export default function StatsGrid({ stats }) {
  return (
    <section className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">
          TOTAL SUBMISSIONS <span className="stat-icon purple">↗</span>
        </div>
        <strong>{stats.total.toLocaleString()}</strong>
        <div className="stat-foot">
          <span className="tiny-green">↑ 12.8%</span> vs. last hour
        </div>
        <div className="sparkline purple-line">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">
          IN REVIEW <span className="stat-icon amber">◷</span>
        </div>
        <strong>{stats.checking}</strong>
        <div className="stat-foot">Files being checked now</div>
        <div className="sparkline amber-line">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">
          ACCEPTED <span className="stat-icon green">✓</span>
        </div>
        <strong>{stats.accepted.toLocaleString()}</strong>
        <div className="stat-foot">
          <span className="tiny-green">80.9%</span> acceptance rate
        </div>
        <div className="sparkline green-line">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">
          NEEDS ATTENTION <span className="stat-icon rose">!</span>
        </div>
        <strong>{stats.failed}</strong>
        <div className="stat-foot">We’ll email teams to fix these</div>
        <div className="sparkline rose-line">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
    </section>
  )
}
