import DeadlineCard from './DeadlineCard'

export default function WelcomeBanner({ view, remaining }) {
  const heading =
    view === 'overview' ? (
      <>
        Make it count,
        <br />
        <span>Team Orbit.</span>
      </>
    ) : view === 'submission' ? (
      <>
        Your work,
        <br />
        <span>your moment.</span>
      </>
    ) : (
      <>
        Every iteration,
        <br />
        <span>remembered.</span>
      </>
    )

  return (
    <section className="welcome-row">
      <div>
        <div className="eyebrow">
          <span className="sparkle">✳</span> TUESDAY, NOVEMBER 24, 2026
        </div>
        <h1>{heading}</h1>
        <p className="welcome-copy">The finish line is closer than it looks. Let’s get your project across.</p>
      </div>
      <DeadlineCard remaining={remaining} />
    </section>
  )
}
