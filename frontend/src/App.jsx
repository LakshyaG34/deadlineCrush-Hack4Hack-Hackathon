import { useState, useMemo } from 'react'
import './App.css'
import { INITIAL_SUBMISSIONS, DEFAULT_DEADLINE } from './constants/mockData'
import { useCountdown } from './hooks/useCountdown'
import { useMultipartUpload } from './hooks/useMultipartUpload'
import { exportSubmissionsCsv } from './utils/exportCsv'
import Icon from './components/common/Icon'
import Sidebar from './components/layout/Sidebar'
import Topbar from './components/layout/Topbar'
import Footer from './components/layout/Footer'
import WelcomeBanner from './components/overview/WelcomeBanner'
import StatsGrid from './components/overview/StatsGrid'
import SubmissionForm from './components/submission/SubmissionForm'
import VersionHistory from './components/submission/VersionHistory'
import ActivityTable from './components/activity/ActivityTable'
import LatestSubmissionPanel from './components/panels/LatestSubmissionPanel'
import ProTipPanel from './components/panels/ProTipPanel'
import QueueStatusPanel from './components/panels/QueueStatusPanel'

export default function App() {
  const [view, setView] = useState('overview')
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS)
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({
    projectName: '',
    description: '',
    githubUrl: '',
    liveUrl: '',
    demoUrl: ''
  })

  const deadline = useMemo(
    () => new Date(import.meta.env.VITE_DEADLINE || DEFAULT_DEADLINE),
    []
  )
  const remaining = useCountdown(deadline)
  const { uploading, progress, notice, uploadSubmission } = useMultipartUpload()

  const stats = useMemo(
    () => ({
      total: submissions.length + 1838,
      checking: 324,
      accepted: 1490,
      failed: 28
    }),
    [submissions]
  )

  const handleSubmit = async event => {
    event.preventDefault()
    await uploadSubmission({
      file,
      form,
      onSuccess: (result, alreadyReceived) => {
        setFile(null)
        if (!alreadyReceived) {
          setForm({
            projectName: '',
            description: '',
            githubUrl: '',
            liveUrl: '',
            demoUrl: ''
          })
          setSubmissions(prev => [
            {
              team: 'Your team',
              project: form.projectName || 'Your project',
              status: 'Checking',
              version: result.version || 'v1',
              time: 'Just now',
              initials: 'YT',
              color: 'violet'
            },
            ...prev
          ])
        }
      }
    })
  }

  const handleExportCsv = () => {
    exportSubmissionsCsv(submissions)
  }

  return (
    <div className="app-shell">
      <Sidebar view={view} onViewChange={setView} />

      <main className="main-area">
        <Topbar view={view} />

        <div className="content">
          <WelcomeBanner view={view} remaining={remaining} />

          {view !== 'submission' && <StatsGrid stats={stats} />}

          <section className="workspace-grid">
            <div className="left-column">
              <section className="panel submit-panel">
                <div className="panel-head">
                  <div>
                    <div className="panel-kicker">YOUR PROJECT</div>
                    <h2>{view === 'history' ? 'Version history' : 'Make your submission'}</h2>
                    <p>
                      {view === 'history'
                        ? 'Every version is saved, so you can always go back.'
                        : 'Share what you’ve been building with the world.'}
                    </p>
                  </div>
                  <button className="text-link" onClick={() => setView('history')}>
                    Version history <Icon name="chevron" size={14} />
                  </button>
                </div>

                {view === 'history' ? (
                  <VersionHistory />
                ) : (
                  <SubmissionForm
                    form={form}
                    onFormChange={setForm}
                    file={file}
                    onFileChange={setFile}
                    uploading={uploading}
                    progress={progress}
                    notice={notice}
                    onSubmit={handleSubmit}
                  />
                )}
              </section>

              {view !== 'history' && (
                <ActivityTable
                  submissions={submissions}
                  onExportCsv={handleExportCsv}
                  onViewAll={() => setView('history')}
                />
              )}
            </div>

            <aside className="right-column">
              <LatestSubmissionPanel onViewSubmission={() => setView('history')} />
              <ProTipPanel />
              <QueueStatusPanel />
            </aside>
          </section>

          <Footer />
        </div>
      </main>
    </div>
  )
}
