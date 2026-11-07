export default function QueueStatusPanel() {
  return (
    <section className="panel queue-panel">
      <div className="queue-head">
        <div>
          <div className="panel-kicker">SYSTEM STATUS</div>
          <h3>The queue is flowing.</h3>
        </div>
        <div className="queue-pulse">
          <i />
        </div>
      </div>
      <p>Every submission is processed safely in the background.</p>
      <div className="queue-stats">
        <div>
          <strong>1,284</strong>
          <span>jobs processed</span>
        </div>
        <div>
          <strong>
            0.8<span>s</span>
          </strong>
          <span>avg. queue time</span>
        </div>
      </div>
      <div className="queue-bottom">
        <span>
          <i /> All services healthy
        </span>
        <span>Updated just now</span>
      </div>
    </section>
  )
}
