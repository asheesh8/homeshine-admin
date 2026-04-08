const COLOR_MAP = {
  // quote statuses
  draft:       'gray',
  sent:        'blue',
  approved:    'green',
  rejected:    'red',
  expired:     'orange',
  // job statuses
  scheduled:   'blue',
  'in-progress': 'teal',
  completed:   'green',
  cancelled:   'red',
  // employee
  active:      'green',
  inactive:    'gray',
  // types
  labor:       'blue',
  material:    'green',
  equipment:   'orange',
}

export default function Badge({ status, label, dot = false }) {
  const color = COLOR_MAP[status] || 'gray'
  return (
    <span className={`badge badge-${color}`}>
      {dot && (
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'currentColor', display: 'inline-block',
        }} />
      )}
      {label || status}
    </span>
  )
}
