import Icon from '../common/Icon'
import FileDropzone from './FileDropzone'

export default function SubmissionForm({
  form,
  onFormChange,
  file,
  onFileChange,
  uploading,
  progress,
  notice,
  onSubmit
}) {
  return (
    <form className="submission-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <label className="field full">
          <span>
            Project name <b>*</b>
          </span>
          <input
            value={form.projectName}
            onChange={e => onFormChange({ ...form, projectName: e.target.value })}
            placeholder="Give your project a name"
            required
            maxLength={100}
          />
        </label>

        <label className="field full">
          <span>
            What did you build? <b>*</b>
          </span>
          <textarea
            value={form.description}
            onChange={e => onFormChange({ ...form, description: e.target.value })}
            placeholder="A short description of your project, what it does and why it matters…"
            required
            rows={3}
            maxLength={1200}
          />
          <em>{form.description.length}/1,200</em>
        </label>

        <label className="field">
          <span>
            <Icon name="link" size={14} /> GitHub repository <b>*</b>
          </span>
          <input
            type="url"
            value={form.githubUrl}
            onChange={e => onFormChange({ ...form, githubUrl: e.target.value })}
            placeholder="https://github.com/you/project"
            required
          />
        </label>

        <label className="field">
          <span>
            <Icon name="link" size={14} /> Live deployment
          </span>
          <input
            type="url"
            value={form.liveUrl}
            onChange={e => onFormChange({ ...form, liveUrl: e.target.value })}
            placeholder="https://your-project.com"
          />
        </label>

        <label className="field full">
          <span>
            <Icon name="link" size={14} /> Presentation or demo link
          </span>
          <input
            type="url"
            value={form.demoUrl}
            onChange={e => onFormChange({ ...form, demoUrl: e.target.value })}
            placeholder="https://youtube.com/watch?v=…"
          />
        </label>
      </div>

      <FileDropzone file={file} onFileChange={onFileChange} />

      {uploading && (
        <div className="progress-wrap">
          <div className="progress-meta">
            <span>Uploading directly to secure storage…</span>
            <strong>{progress}%</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {notice && <div className={notice.includes('received') ? 'notice success' : 'notice'}>{notice}</div>}

      <div className="form-footer">
        <span>
          <span className="lock">◈</span> Your submission is private until judging begins.
        </span>
        <button type="submit" className="submit-button" disabled={uploading}>
          <span>{uploading ? 'Uploading…' : 'Submit project'}</span>
          <span className="button-arrow">↗</span>
        </button>
      </div>
    </form>
  )
}
