import Icon from '../common/Icon'

export default function LatestSubmissionPanel({ onViewSubmission }) {
  return (
    <section className="panel latest-panel">
      <div className="latest-top">
        <div className="latest-icon">
          <Icon name="check" size={18} />
        </div>
        <div>
          <div className="panel-kicker">LATEST SUBMISSION</div>
          <strong>Version 3</strong>
        </div>
        <span className="accepted-pill">
          <i /> ACCEPTED
        </span>
      </div>

      <div className="latest-project">
        <strong>Pulse — early signals, better care</strong>
        <span>Submitted Nov 24 at 11:56 PM</span>
      </div>

      <div className="check-list">
        <div>
          <span className="circle-check">
            <Icon name="check" size={11} />
          </span>
          File security scan<span>Passed</span>
        </div>
        <div>
          <span className="circle-check">
            <Icon name="check" size={11} />
          </span>
          Links are reachable<span>Passed</span>
        </div>
        <div>
          <span className="circle-check">
            <Icon name="check" size={11} />
          </span>
          Submission on time<span>Passed</span>
        </div>
      </div>

      <button className="view-submission" onClick={onViewSubmission}>
        View submission <Icon name="chevron" size={14} />
      </button>
    </section>
  )
}
