import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// ── Synthetic demo readings ────────────────────────────────────────────────
const DEMO_READINGS = [
  { id: '1', timestamp: '08:01:12', status: 'Normal',     lightMode: 'Day',   ldrFixed: 812, ldrRaw: 211, speed: 7.2,  timeSec: 0.050000, distanceCm: 34 },
  { id: '2', timestamp: '08:03:44', status: 'Normal',     lightMode: 'Day',   ldrFixed: 798, ldrRaw: 225, speed: 9.1,  timeSec: 0.039560, distanceCm: 28 },
  { id: '3', timestamp: '08:06:21', status: 'Over Speed', lightMode: 'Day',   ldrFixed: 805, ldrRaw: 218, speed: 14.8, timeSec: 0.024324, distanceCm: 22 },
  { id: '4', timestamp: '08:10:05', status: 'Normal',     lightMode: 'Day',   ldrFixed: 790, ldrRaw: 233, speed: 6.4,  timeSec: 0.056250, distanceCm: 41 },
  { id: '5', timestamp: '08:15:33', status: 'Over Speed', lightMode: 'Day',   ldrFixed: 820, ldrRaw: 203, speed: 18.3, timeSec: 0.019672, distanceCm: 19 },
  { id: '6', timestamp: '08:22:18', status: 'Normal',     lightMode: 'Day',   ldrFixed: 771, ldrRaw: 252, speed: 8.7,  timeSec: 0.041379, distanceCm: 30 },
  { id: '7', timestamp: '19:45:02', status: 'Normal',     lightMode: 'Night', ldrFixed: 310, ldrRaw: 713, speed: 5.9,  timeSec: 0.061017, distanceCm: 55 },
  { id: '8', timestamp: '19:51:47', status: 'Over Speed', lightMode: 'Night', ldrFixed: 295, ldrRaw: 728, speed: 21.6, timeSec: 0.016667, distanceCm: 12 },
  { id: '9', timestamp: '19:58:30', status: 'Normal',     lightMode: 'Night', ldrFixed: 302, ldrRaw: 721, speed: 7.5,  timeSec: 0.048000, distanceCm: 47 },
  { id:'10', timestamp: '20:04:10', status: 'Over Speed', lightMode: 'Night', ldrFixed: 289, ldrRaw: 734, speed: 16.2, timeSec: 0.022222, distanceCm: 17 },
]

const DEMO_SERIAL = [
  '-----------------------------',
  'STATUS: Normal',
  'Light: Night',
  'LDR_FIXED: 289',
  'LDR_RAW: 734',
  'Speed: 16.20 km/h',
  'Time: 0.022222 sec',
  '------ VEHICLE DETECTED ------',
  '-----------------------------',
  'STATUS: OVER SPEED!',
  'Light: Night',
  'LDR_FIXED: 302',
  'LDR_RAW: 721',
  'Speed: 7.50 km/h',
  'Time: 0.048000 sec',
  '------ VEHICLE DETECTED ------',
  '-----------------------------',
  'STATUS: OVER SPEED!',
  'Light: Night',
  'LDR_FIXED: 295',
  'LDR_RAW: 728',
  'Speed: 21.60 km/h',
  'Time: 0.016667 sec',
  '------ VEHICLE DETECTED ------',
]

function App() {
  const readings = DEMO_READINGS
  const latestDistance = readings[readings.length - 1]?.distanceCm ?? null

  const metrics = useMemo(() => {
    const vehicles = readings.length
    const overSpeed = readings.filter((e) => e.status === 'Over Speed').length
    const nightCount = readings.filter((e) => e.lightMode === 'Night' || e.lightMode === 'Low Light').length
    const averageSpeed = vehicles ? readings.reduce((s, e) => s + e.speed, 0) / vehicles : 0
    const averageTime  = vehicles ? readings.reduce((s, e) => s + e.timeSec, 0) / vehicles : 0
    const averageLdr   = vehicles ? readings.reduce((s, e) => s + e.ldrFixed, 0) / vehicles : 0
    const distReadings = readings.filter((e) => typeof e.distanceCm === 'number')
    const averageDistance = distReadings.length
      ? distReadings.reduce((s, e) => s + e.distanceCm, 0) / distReadings.length
      : 0
    return {
      vehicles,
      overSpeed,
      nightCount,
      averageSpeed: averageSpeed.toFixed(1),
      averageTime: averageTime.toFixed(3),
      averageLdr: Math.round(averageLdr),
      averageDistance: averageDistance.toFixed(1),
    }
  }, [readings])

  // Demo mode banner state
  const [, forceUpdate] = useState(0)

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Arduino Sensor Dashboard</h1>
          <p>Visualize speed, ultrasonic distance, and light sensing from your Arduino system.</p>
        </div>
        <div>
          <span className="demo-badge">● DEMO MODE – Synthetic Data</span>
        </div>
      </header>

      <section className="summary-grid">
        <article className="summary-card">
          <span className="summary-label">Total Vehicles</span>
          <strong>{metrics.vehicles}</strong>
        </article>
        <article className="summary-card">
          <span className="summary-label">Over-speed Alerts</span>
          <strong style={{ color: '#fb7185' }}>{metrics.overSpeed}</strong>
        </article>
        <article className="summary-card">
          <span className="summary-label">Night / Low Light</span>
          <strong>{metrics.nightCount}</strong>
        </article>
        <article className="summary-card">
          <span className="summary-label">Average Speed (km/h)</span>
          <strong>{metrics.averageSpeed}</strong>
        </article>
        <article className="summary-card">
          <span className="summary-label">Average Pulse Time (sec)</span>
          <strong>{metrics.averageTime}</strong>
        </article>
        <article className="summary-card">
          <span className="summary-label">Average LDR_FIXED</span>
          <strong>{metrics.averageLdr}</strong>
        </article>
        <article className="summary-card">
          <span className="summary-label">Latest US Distance (cm)</span>
          <strong>{latestDistance ?? '--'}</strong>
        </article>
        <article className="summary-card">
          <span className="summary-label">Average US Distance (cm)</span>
          <strong>{metrics.averageDistance}</strong>
        </article>
      </section>

      <section className="chart-panel">
        <div className="chart-card">
          <h2>Arduino Serial Output</h2>
          <div className="serial-panel">
            <div className="serial-status">
              <strong>Port status:</strong> Connected (Demo)
            </div>
            <div className="serial-status">
              <strong>Last line:</strong> {DEMO_SERIAL[0]}
            </div>
            <div className="serial-log">
              {DEMO_SERIAL.map((line, i) => (
                <div key={i} className="serial-line">{line}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="chart-panel">
        <div className="chart-card">
          <h2>Speed / LDR / Distance Trend</h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={readings} margin={{ top: 15, right: 25, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="speed"      stroke="#4f46e5" dot={false} name="Speed (km/h)" />
              <Line type="monotone" dataKey="ldrFixed"   stroke="#f59e0b" dot={false} name="LDR_FIXED" />
              <Line type="monotone" dataKey="timeSec"    stroke="#10b981" dot={false} name="Pulse Time (s)" />
              <Line type="monotone" dataKey="distanceCm" stroke="#38bdf8" dot={false} name="Distance (cm)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>Speed Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={readings} margin={{ top: 15, right: 25, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="speed" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="table-panel">
        <h2>Latest Arduino Readings</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Received</th>
                <th>Status</th>
                <th>Light Mode</th>
                <th>Speed (km/h)</th>
                <th>Time (sec)</th>
                <th>Distance (cm)</th>
                <th>LDR_FIXED</th>
                <th>LDR_RAW</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((row, index) => (
                <tr key={`${row.id}-${index}`}>
                  <td>{row.timestamp}</td>
                  <td className={row.status === 'Over Speed' ? 'status-danger' : 'status-normal'}>{row.status}</td>
                  <td>{row.lightMode}</td>
                  <td>{row.speed}</td>
                  <td>{row.timeSec.toFixed(6)}</td>
                  <td>{row.distanceCm ?? '--'}</td>
                  <td>{row.ldrFixed}</td>
                  <td>{row.ldrRaw}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default App
