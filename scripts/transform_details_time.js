const fs = require('fs');

const INPUT_FILE = 'subject_details.json';
const OUTPUT_FILE = 'subject_details_minutes.json';

/**
 * Converts a "HH:MM" string to total minutes from midnight.
 * Returns null if the string is empty or invalid.
 * Example: "16:15" -> 975
 */
const timeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) {
        return null;
    }

    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60) + minutes;
};

function transformData() {
    try {
        // 1. Read the existing data
        if (!fs.existsSync(INPUT_FILE)) {
            console.error(`Error: ${INPUT_FILE} not found.`);
            return;
        }

        const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
        const subjects = JSON.parse(rawData);

        console.log(`Processing ${subjects.length} subjects...`);

        // 2. Transform the data
        const transformedSubjects = subjects.map(subject => {
            // The timetable is an array of arrays (timetable: [[events...]])
            const newTimetable = subject.timetable.map(group => {
                return group.map(event => {
                    return {
                        ...event,
                        // Overwrite the string time with the calculated number
                        time_from: timeToMinutes(event.time_from),
                        time_to: timeToMinutes(event.time_to)
                    };
                });
            });

            return {
                ...subject,
                timetable: newTimetable
            };
        });

        // 3. Save the new file
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(transformedSubjects, null, 2), 'utf8');
        console.log(`Success! Transformed data saved to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('An error occurred:', error.message);
    }
}

transformData();
