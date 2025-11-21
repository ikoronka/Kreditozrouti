const fs = require('fs');

const URLS_FILE = 'subjects.json';
const DETAILS_FILE = 'subject_details_minutes.json';
const OUTPUT_FILE = 'data/subjects.json'; // Saving directly to src/data for the app

function mergeFiles() {
    try {
        // 1. Check files exist
        if (!fs.existsSync(URLS_FILE) || !fs.existsSync(DETAILS_FILE)) {
            console.error('Error: One or both input files are missing.');
            console.error(`Looking for: ${URLS_FILE} and ${DETAILS_FILE}`);
            return;
        }

        // 2. Read files
        const urlsList = JSON.parse(fs.readFileSync(URLS_FILE, 'utf8'));
        const detailsList = JSON.parse(fs.readFileSync(DETAILS_FILE, 'utf8'));

        console.log(`Loaded ${urlsList.length} URLs and ${detailsList.length} subject details.`);

        // 3. Warning for mismatch
        if (urlsList.length !== detailsList.length) {
            console.warn('WARNING: The number of URLs does not match the number of scraped subjects.');
            console.warn('Merging by index order. Verify data accuracy if scraping errors occurred previously.');
        }

        // 4. Merge
        // We iterate over the detailsList because that is our main data source.
        // We assume the scraper maintained order.
        const mergedData = detailsList.map((subject, index) => {
            const urlObj = urlsList[index];
            return {
                ...subject,
                url: urlObj ? urlObj.url : null // Add the URL field
            };
        });

        // 5. Save
        // Ensure directory exists if saving to src/data
        const dir = OUTPUT_FILE.substring(0, OUTPUT_FILE.lastIndexOf('/'));
        if (dir && !fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mergedData, null, 2), 'utf8');
        console.log(`Success! Merged data with URLs saved to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Error merging files:', error.message);
    }
}

mergeFiles();
