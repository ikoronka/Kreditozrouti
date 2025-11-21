import { getAllSubjects } from '@api/subjects'
import { Request, Response } from 'express'

export default function FindSubjectsController(req: Request, res: Response) {
    const { day, from, to, faculty } = req.body as { day?: string; from?: number; to?: number; faculty?: string }

    if (!day || !from || !to) {
        return res.status(400).json({ error: 'Missing required parameters: day, from, to' })
    }

    const subjects = getAllSubjects()

    let filteredSubjects = subjects.filter(subject => {
        return subject.timetable.some(dayEvents => {
            return dayEvents.some(event => {
                const matchesDay = day ? event.day.toLowerCase() === day.toLowerCase() : true
                const matchesFrom = from ? event.time_from >= from : true
                const matchesTo = to ? event.time_to <= to : true
                const matchesFaculty = faculty ? subject.ident.toLowerCase().startsWith(faculty.toLowerCase()) : true

                return matchesDay && matchesFrom && matchesTo && matchesFaculty
            })
        })
    })

    // Move the matched subjects to the top of the list
    filteredSubjects = filteredSubjects.sort((a, b) => {
        const aMatches = a.timetable.some(dayEvents => {
            return dayEvents.some(event => {
                const matchesDay = day ? event.day.toLowerCase() === day.toLowerCase() : true
                const matchesFrom = from ? event.time_from >= from : true
                const matchesTo = to ? event.time_to <= to : true
                return matchesDay && matchesFrom && matchesTo
            })
        })
            ? 0
            : 1

        const bMatches = b.timetable.some(dayEvents => {
            return dayEvents.some(event => {
                const matchesDay = day ? event.day.toLowerCase() === day.toLowerCase() : true
                const matchesFrom = from ? event.time_from >= from : true
                const matchesTo = to ? event.time_to <= to : true
                return matchesDay && matchesFrom && matchesTo
            })
        })
            ? 0
            : 1

        return aMatches - bMatches
    })

    return res.status(200).json({ subjects: filteredSubjects })
}
