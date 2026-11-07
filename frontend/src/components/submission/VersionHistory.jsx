import { MOCK_VERSION_HISTORY } from '../../constants/mockData'

export default function VersionHistory({ items = MOCK_VERSION_HISTORY }) {
  return (
    <div className="history-list">
      {items.map((item, i) => (
        <div className="history-row" key={item.version}>
          <div className={`version-dot ${i === 0 ? 'current' : ''}`} />
          <div>
            <strong>
              {item.version} {i === 0 && <span className="current-pill">LATEST</span>}
            </strong>
            <span>{item.time}</span>
          </div>
          <span className="history-status">{item.status}</span>
          <button className="row-more" aria-label="Version actions">···</button>
        </div>
      ))}
    </div>
  )
}
