import fs from 'fs'
import path from 'path'

export interface TimeTableEvent {
    day: string
    time_from: number // Minutes from midnight
    time_to: number // Minutes from midnight
    room: string
    type: string
    lecturer: string
    capacity: string
}

export interface SubjectRestrictions {
    enrollment: string
    recommended: string
    required_experience: string
}

export interface Subject {
    ident: string
    name: string
    ects: number
    year: string
    restrictions: SubjectRestrictions
    timetable: TimeTableEvent[][]
}

let cachedSubjects: Subject[] = []

/**
 * Loads the subjects JSON file into memory.
 * Call this function once in your main app entry point (e.g., index.ts or app.ts).
 */
export const loadSubjectsData = (): void => {
    try {
        // Try multiple candidate locations for subjects.json so the loader
        // works in development (src/) and production after `tsc` (dist/).
        const candidates = [
            path.join(process.cwd(), 'src', 'data', 'subjects.json'), // dev
            path.join(process.cwd(), 'dist', 'src', 'data', 'subjects.json'), // built with dist/src
            path.join(process.cwd(), 'dist', 'data', 'subjects.json'), // alternate build layout
            path.join(process.cwd(), 'src', 'data', 'subjects.json'), // fallback
            path.join(__dirname, 'data', 'subjects.json'), // when running from dist/src
            path.join(__dirname, '..', 'src', 'data', 'subjects.json'),
            path.join(process.cwd(), 'data', 'subjects.json')
        ]

        let filePath: string | undefined

        for (const candidate of candidates) {
            if (fs.existsSync(candidate)) {
                filePath = candidate
                break
            }
        }

        if (!filePath) {
            console.error('[SubjectLoader] Error: subjects.json not found in any candidate location:')
            for (const c of candidates) console.error(` - ${c}`)
            return
        }

        const rawData = fs.readFileSync(filePath, 'utf-8')
        cachedSubjects = JSON.parse(rawData) as Subject[]

        console.log(`[SubjectLoader] Successfully loaded ${cachedSubjects.length} subjects into memory from ${filePath}`)
    } catch (error) {
        console.error('[SubjectLoader] Failed to load subjects data:', error)
        // Optional: process.exit(1) if this data is critical for the app to run
    }
}

/**
 * Returns the full list of subjects currently in memory.
 */
export const getAllSubjects = (): Subject[] => {
    return cachedSubjects
}

/**
 * Helper to find a specific subject by ID (e.g., "4IT580")
 */
export const getSubjectById = (ident: string): Subject | undefined => {
    return cachedSubjects.find(s => s.ident === ident)
}
