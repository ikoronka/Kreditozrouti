const fs = require('fs');

// Cesta k souboru s daty (upravte podle toho, který soubor chcete opravit)
// Pokud používáte již sloučený soubor: 'src/data/subjects.json'
// Pokud opravujete výstup ze scraperu: 'subject_details.json'
const INPUT_FILE = 'data/subjects.json';
const OUTPUT_FILE = 'data/subjects_clean.json';

function deduplicateTimetable() {
    try {
        if (!fs.existsSync(INPUT_FILE)) {
            console.error(`Chyba: Soubor ${INPUT_FILE} neexistuje.`);
            return;
        }

        const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
        const subjects = JSON.parse(rawData);

        console.log(`Zpracovávám ${subjects.length} předmětů...`);
        let totalRemoved = 0;

        const cleanedSubjects = subjects.map(subject => {
            // Pokud předmět nemá rozvrh, vrátíme ho beze změny
            if (!subject.timetable || !Array.isArray(subject.timetable)) {
                return subject;
            }

            // Timetable je pole polí (skupiny událostí)
            const newTimetable = subject.timetable.map(group => {
                if (!Array.isArray(group)) return group;

                // Použijeme Set pro uložení unikátních řetězců událostí
                const uniqueEvents = new Set();
                const cleanGroup = [];

                group.forEach(event => {
                    // Vytvoříme unikátní klíč pro porovnání (např. JSON string)
                    const eventKey = JSON.stringify(event);

                    if (!uniqueEvents.has(eventKey)) {
                        uniqueEvents.add(eventKey);
                        cleanGroup.push(event);
                    } else {
                        totalRemoved++;
                    }
                });

                return cleanGroup;
            });

            return {
                ...subject,
                timetable: newTimetable
            };
        });

        // Uložení vyčištěných dat
        // Pokud chcete přepsat původní soubor, změňte OUTPUT_FILE na INPUT_FILE
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanedSubjects, null, 2), 'utf8');

        console.log(`Hotovo! Odstraněno ${totalRemoved} duplicitních událostí.`);
        console.log(`Vyčištěná data uložena do: ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Nastala chyba:', error.message);
    }
}

deduplicateTimetable();
