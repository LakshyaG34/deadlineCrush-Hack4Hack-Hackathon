export function exportSubmissionsCsv(submissions, filename = 'hackathon-submissions.csv') {
  const rows = [
    ['Team', 'Project', 'Status', 'Version', 'Submitted'],
    ...submissions.map(r => [r.team, r.project, r.status, r.version, r.time])
  ]
  const csv = rows
    .map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
