const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Konfigurace hlaviček (stejné jako v prohlížeči pro obejití ochran)
const config = {
    headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'cs-CZ,cs;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Cookie': 'safeDevice2FA=v1.1%3A184530%3A20251027174406%3Ac5f345af62e920574746a8c19aa35cce27064da0' // Volitelné, často pomůže, pokud je InSIS náladový
    }
};

// Pomocná funkce pro zpoždění (aby nás server nezablokoval)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- HELPER: Clean text (handles &nbsp; in both Values AND Labels) ---
const cleanText = (text) => {
    if (!text) return "";
    return text
        .replace(/\u00A0/g, ' ') // Replace Unicode non-breaking space
        .replace(/&nbsp;/g, ' ') // Replace HTML entity
        .replace(/\s+/g, ' ')    // Collapse multiple spaces into one
        .trim();
};

// --- HELPER: Flexible finder ---
// Instead of using :contains(), which fails on &nbsp;, we filter elements manually
const getTableValue = ($, targetLabel) => {
    // Normalize the target label (e.g., "Typ a ročník")
    const cleanTarget = cleanText(targetLabel);

    // Find all 'td' elements, filter for the one containing our text
    const labelEl = $('td').filter((i, el) => {
        const cellText = cleanText($(el).text());
        // We check if the cleaned cell text includes our cleaned target label
        return cellText.includes(cleanTarget);
    }).first();

    if (labelEl.length > 0) {
        // Return the text of the *next* cell (the value)
        return cleanText(labelEl.next('td').text());
    }
    return "";
};

async function scrapeSubjectDetails() {
    // 1. Načtení seznamu URL ze souboru
    let subjectsList = [];
    try {
        const rawData = fs.readFileSync('subjects.json', 'utf8');
        subjectsList = JSON.parse(rawData);
    } catch (err) {
        console.error('Chyba: Nelze načíst soubor subjects.json. Spusťte nejprve předchozí skript.', err.message);
        return;
    }

    const results = [];
    console.log(`Nalezeno ${subjectsList.length} předmětů ke zpracování.`);

    // 2. Iterace přes každý předmět
    for (const [index, item] of subjectsList.entries()) {
        const url = item.url;
        console.log(`[${index + 1}/${subjectsList.length}] Stahuji: ${url}`);

        try {
            const response = await axios.get(url, config);
            const html = response.data;
            const $ = cheerio.load(html);

            // replace all &nbsp; with space
            $('body').html($('body').html().replace(/&nbsp;/g, ' '));

            // --- PARSOVÁNÍ ZÁKLADNÍCH DAT ---

            const ident = getTableValue($, 'Kód předmětu:');
            const name = getTableValue($, 'Název v&nbsp;jazyce výuky:');

            // ECTS: parsujeme číslo z textu (např. "8 (1 ECTS...")
            const ectsRaw = getTableValue($, 'Počet přidělených ECTS kreditů:');
            const ects = parseInt(ectsRaw) || 0;

            const year = getTableValue($, 'Doporučený typ a&nbsp;ročník studia:');

            // Restrikce
            const restrictions = {
                enrollment: getTableValue($, 'Omezení pro zápis:'),
                recommended: getTableValue($, 'Doporučené doplňky kurzu:'),
                required_experience: getTableValue($, 'Vyžadovaná praxe:')
            };

            // --- PARSOVÁNÍ ROZVRHU (TIMETABLE) ---

            const timetableEvents = [];

            // Najdeme tabulku, která následuje za nadpisem "Periodické rozvrhové akce"
            // InSIS struktura je často: <b>...Periodické...</b> ... <table>
            const timetableHeader = $('b:contains("Periodické rozvrhové akce:")');

            if (timetableHeader.length > 0) {
                // Najdeme nejbližší následující tabulku
                const table = timetableHeader.closest('tr').next('tr').find('table');

                // Projdeme řádky tabulky (přeskočíme hlavičku)
                table.find('tbody tr').each((i, row) => {
                    const cols = $(row).find('td');
                    if (cols.length < 7) return; // Ochrana proti prázdným řádkům

                    // Funkce, která rozdělí obsah buňky podle <br>, protože InSIS dává více akcí do jednoho řádku
                    const getSplitValues = (colIndex) => {
                        const cellHtml = $(cols[colIndex]).html();
                        if (!cellHtml) return [];
                        // Rozdělíme podle <br> a očistíme od HTML tagů
                        return cellHtml.split(/<br\s*\/?>/i).map(part => {
                            return cheerio.load(part).text().trim();
                        });
                    };

                    // Získáme pole hodnot pro sloupce (protože v jedné buňce může být více řádků oddělených <br>)
                    const days = getSplitValues(0);     // Den
                    const times = getSplitValues(1);    // Čas
                    const rooms = getSplitValues(2);    // Místnost
                    const types = getSplitValues(3);    // Typ akce
                    const lecturers = getSplitValues(5); // Vyučující
                    const capacities = getSplitValues(6); // Kapacita

                    // Předpokládáme, že počet řádků v buňkách odpovídá (zipování)
                    // Někdy InSIS má pro 5 dní jeden čas, pak array times má délku 1 a days délku 5.
                    const maxRows = Math.max(days.length, times.length, rooms.length);

                    for (let k = 0; k < maxRows; k++) {
                        // Parsování času "16:15-17:45"
                        const timeRaw = times[k] || times[0] || ""; // Fallback na první hodnotu, pokud chybí
                        let timeFrom = "";
                        let timeTo = "";

                        if (timeRaw.includes('-')) {
                            const parts = timeRaw.split('-');
                            timeFrom = parts[0].trim();
                            timeTo = parts[1].trim();
                        }

                        timetableEvents.push({
                            day: days[k] || days[0] || "",
                            time_from: timeFrom,
                            time_to: timeTo,
                            room: rooms[k] || rooms[0] || "",
                            type: types[k] || types[0] || "",
                            lecturer: lecturers[k] || lecturers[0] || "",
                            capacity: capacities[k] || capacities[0] || ""
                        });
                    }
                });
            }

            // Sestavení finálního objektu
            const subjectObj = {
                ident,
                name,
                ects,
                year,
                restrictions,
                timetable: [timetableEvents] // Požadovaný formát je pole polí [[...]]
            };

            results.push(subjectObj);

            console.log(JSON.stringify(subjectObj, null, 2));

        } catch (error) {
            console.error(`Chyba při zpracování ${url}:`, error.message);
        }

        // Pauza 1 sekunda mezi požadavky, abychom nebyli podezřelí
        await sleep(1000);
    }

    // 3. Uložení výsledků
    fs.writeFileSync('subject_details.json', JSON.stringify(results, null, 2), 'utf8');
    console.log('Hotovo. Data uložena do subject_details.json');
}

scrapeSubjectDetails();
