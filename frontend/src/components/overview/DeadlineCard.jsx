import Icon from '../common/Icon'

export default function DeadlineCard({ remaining }) {
  return (
    <div className="deadline-card">
      <div className="deadline-top">
        <div className="deadline-icon">
          <Icon name="clock" size={19} />
        </div>
        <div>
          <span className="deadline-label">SUBMISSION DEADLINE</span>
          <strong>
            December 1, 2026 <span>· 11:59 PM IST</span>
          </strong>
        </div>
      </div>
      <div className="deadline-rule" />
      <div className="countdown-row">
        <span>Time remaining</span>
        <strong>{remaining}</strong>
      </div>
      <div className="countdown-track">
        <span />
      </div>
      <div className="deadline-foot">
        <span className="green-dot" /> Submissions are open <span className="deadline-zone">IST (UTC+5:30)</span>
      </div>
    </div>
  )
}
