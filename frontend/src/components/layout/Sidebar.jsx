import Icon from '../common/Icon'

export default function Sidebar({ view, onViewChange }) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#home">
        <span className="brand-mark">
          <span />
          <span />
          <span />
          <span />
        </span>
        <span>
          deadline<span className="brand-light">crush</span>
        </span>
      </a>

      <div className="event-card">
        <div className="event-label">
          <span className="live-dot" /> LIVE EVENT
        </div>
        <strong>Build for tomorrow</strong>
        <span>Global Hackathon · 2026</span>
        <div className="event-meta">
          <span>⌁</span> 2,000 teams <span className="meta-sep">·</span> Online
        </div>
      </div>

      <div className="nav-label">WORKSPACE</div>
      <nav className="nav-list">
        <button
          className={view === 'overview' ? 'nav-item active' : 'nav-item'}
          onClick={() => onViewChange('overview')}
        >
          <Icon name="grid" /> Overview
        </button>
        <button
          className={view === 'submission' ? 'nav-item active' : 'nav-item'}
          onClick={() => onViewChange('submission')}
        >
          <Icon name="upload" /> My submission <span className="nav-badge">3</span>
        </button>
        <button
          className={view === 'history' ? 'nav-item active' : 'nav-item'}
          onClick={() => onViewChange('history')}
        >
          <Icon name="clock" /> Version history
        </button>
      </nav>

      <div className="sidebar-bottom">
        <div className="help-card">
          <div className="help-icon">✳</div>
          <strong>Need a hand?</strong>
          <p>We’re here to help your team cross the finish line.</p>
          <a href="mailto:support@deadlinecrush.dev">
            Talk to support <span>↗</span>
          </a>
        </div>
        <button className="nav-item settings">
          <Icon name="settings" /> Settings
        </button>
        <div className="profile">
          <div className="avatar avatar-profile">AL</div>
          <div className="profile-text">
            <strong>Alex Lee</strong>
            <span>Team Orbit</span>
          </div>
          <span className="profile-menu">···</span>
        </div>
      </div>
    </aside>
  )
}
