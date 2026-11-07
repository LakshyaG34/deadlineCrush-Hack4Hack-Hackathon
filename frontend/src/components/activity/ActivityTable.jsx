import Icon from '../common/Icon'

export default function ActivityTable({ submissions, onExportCsv, onViewAll }) {
  return (
    <section className="panel activity-panel">
      <div className="activity-heading">
        <div>
          <div className="panel-kicker">THE COMMUNITY</div>
          <h2>Submission activity</h2>
        </div>
        <div className="activity-actions">
          <button className="export-button" onClick={onExportCsv}>
            <Icon name="download" size={13} /> Export CSV
          </button>
          <button className="filter-button">
            <span /> All submissions <span className="down-caret">⌄</span>
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>TEAM / PROJECT</th>
              <th>STATUS</th>
              <th>VERSION</th>
              <th>SUBMITTED</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {submissions.slice(0, 4).map((row, i) => (
              <tr key={`${row.team}-${i}`}>
                <td>
                  <div className="team-cell">
                    <div className={`team-avatar ${row.color}`}>{row.initials}</div>
                    <div>
                      <strong>{row.team}</strong>
                      <span>{row.project}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className={`status-pill ${
                      row.status === 'Accepted'
                        ? 'accepted'
                        : row.status === 'Checking'
                        ? 'checking'
                        : 'attention'
                    }`}
                  >
                    <i />
                    {row.status}
                  </span>
                </td>
                <td>{row.version}</td>
                <td>{row.time}</td>
                <td>
                  <button className="row-more" aria-label="Row actions">···</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="all-submissions" onClick={onViewAll}>
        View all submissions <Icon name="chevron" size={14} />
      </button>
    </section>
  )
}
