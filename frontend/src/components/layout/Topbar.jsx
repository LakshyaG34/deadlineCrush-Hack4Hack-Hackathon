import Icon from '../common/Icon'

export default function Topbar({ view }) {
  const viewTitle =
    view === 'overview' ? 'Overview' : view === 'submission' ? 'My submission' : 'Version history'

  return (
    <header className="topbar">
      <div className="crumb">
        Build for tomorrow <Icon name="chevron" size={14} /> <strong>{viewTitle}</strong>
      </div>
      <div className="top-actions">
        <span className="secure-tag">
          <span /> All systems operational
        </span>
        <button className="icon-button" aria-label="Notifications">
          <Icon name="bell" />
        </button>
        <div className="avatar avatar-profile small">AL</div>
      </div>
    </header>
  )
}
