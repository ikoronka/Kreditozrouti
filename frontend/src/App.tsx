import { useState } from 'react'
import Button from './components/Button'
import Dropdown from './components/Dropdown'
import ListItem from './components/ListItem'
import './App.css'
import Time from './components/Time'

type Timetable = {
  day: string
  time_from: number
  time_to: number
  room: string
}

type Course = {
  ident: string
  name: string
  ects: number
  year: string
  timetable: Timetable[][]
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function minutesToHHMM(minutes: number): string {
  // e.g. 765 (12*60 + 45) -> "12:45"
  const hh = Math.floor(minutes / 60)
  const mm = minutes % 60
  return `${pad(hh)}:${pad(mm)}`
}

function hhmmToMinutes(s: string): number {
  // e.g. "12:45" -> 765
  const parts = s.split(':')
  const hh = parseInt(parts[0] ?? '0', 10) || 0
  const mm = parseInt(parts[1] ?? '0', 10) || 0
  return hh * 60 + mm
}

function App() {
  const [day, setDay] = useState<string>('Po')
  const [from, setFrom] = useState<number>(540) // 9 * 60 = 540 minutes (09:00)
  const [to, setTo] = useState<number>(720) // 12 * 60 = 720 minutes (12:00)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    try {
      const body = { day, from, to }
      const res = await fetch('http://localhost:6767/subjects/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      const data = await res.json()
      setCourses(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err?.message ?? String(err))
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <h2>Zadej čas</h2>
      <header className="controls-row">
        <div className='input-pill'>
        <div className="input-wrapper">
          <Dropdown value={day as any} onChange={(v) => setDay(v as string)} />
        </div>
        </div>

        <div className="input-wrapper">
          <Time
            value={minutesToHHMM(from)}
            onChange={(val) => setFrom(hhmmToMinutes(val))}
          />
        </div>

        <div className="input-wrapper">
          <Time
            value={minutesToHHMM(to)}
            onChange={(val) => setTo(hhmmToMinutes(val))}
          />
        </div>

        <div className="enter-wrap">
          <Button className="enter-btn" onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching…' : 'Enter'}
          </Button>
        </div>
      </header>

      <main className="bottom-row">
        {error && <div style={{ color: 'salmon' }}>{error}</div>}
        <ul className="bottom-list">
          {courses.map((c) => (
            <ListItem key={c.ident} ident={c.ident} name={c.name} ects={c.ects} year={c.year} />
          ))}
        </ul>
      </main>
    </div>
  )
}

export default App