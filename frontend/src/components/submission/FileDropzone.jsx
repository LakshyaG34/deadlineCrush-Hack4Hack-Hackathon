import { useRef, useState } from 'react'
import Icon from '../common/Icon'

export default function FileDropzone({ file, onFileChange }) {
  const [dragging, setDragging] = useState(false)
  const pickerRef = useRef(null)

  const handleDragOver = e => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleDrop = e => {
    e.preventDefault()
    setDragging(false)
    const droppedFile = e.dataTransfer.files[0] || null
    onFileChange(droppedFile)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      pickerRef.current?.click()
    }
  }

  return (
    <>
      <div className="upload-label">
        <span>
          Project files <b>*</b>
        </span>
        <span>
          MAX FILE SIZE <strong>100 MB</strong>
        </span>
      </div>

      <div
        className={`dropzone ${dragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => pickerRef.current?.click()}
        role="button"
        tabIndex="0"
        onKeyDown={handleKeyDown}
      >
        <input
          ref={pickerRef}
          type="file"
          hidden
          onChange={e => onFileChange(e.target.files[0] || null)}
          accept=".pdf,.zip,.png,.jpg,.jpeg,.mp4"
        />

        <div className="upload-symbol">
          <Icon name="upload" size={20} />
        </div>

        <div className="drop-copy">
          <strong>
            {file ? (
              file.name
            ) : (
              <>
                Drop your file here, or <span>browse</span>
              </>
            )}
          </strong>
          <p>
            {file
              ? `${(file.size / 1024 / 1024).toFixed(1)} MB · ready to upload`
              : 'PDF, ZIP, PNG, JPG, MP4 · up to 100 MB'}
          </p>
        </div>

        {file && (
          <button
            type="button"
            className="remove-file"
            onClick={e => {
              e.stopPropagation()
              onFileChange(null)
            }}
          >
            ×
          </button>
        )}
      </div>
    </>
  )
}
