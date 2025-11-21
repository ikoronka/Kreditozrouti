const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeInsisCatalog() {
    const url = 'https://insis.vse.cz/katalog/index.pl';

    // jenom FIS
    // const formData = 'kredity_od=&kredity_do=&fakulta=31140&obdobi=381&obdobi_fak=1186&vyhledat_rozsirene=Vyhledat+p%C5%99edm%C4%9Bty&jak=rozsirene';

    // Vsechny fakulty
    const formData = 'kredity_od=&kredity_do=&obdobi=381&obdobi_fak=1314&obdobi_fak=1418&obdobi_fak=1458&obdobi_fak=1455&obdobi_fak=1333&obdobi_fak=1430&obdobi_fak=1471&obdobi_fak=1428&obdobi_fak=1415&obdobi_fak=1452&obdobi_fak=1419&obdobi_fak=1451&obdobi_fak=1379&obdobi_fak=1460&obdobi_fak=1456&obdobi_fak=1454&obdobi_fak=1473&obdobi_fak=1157&obdobi_fak=1153&obdobi_fak=1155&obdobi_fak=1363&obdobi_fak=1177&obdobi_fak=1463&obdobi_fak=1373&obdobi_fak=1224&obdobi_fak=1159&obdobi_fak=1212&obdobi_fak=1197&obdobi_fak=1194&obdobi_fak=1186&obdobi_fak=1199&obdobi_fak=1264&obdobi_fak=1417&vyhledat_rozsirene=Vyhledat+p%C5%99edm%C4%9Bty&jak=rozsirene';

    // Headers matching your specific request to ensure access
    const config = {
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'cs-CZ,cs;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': 'https://insis.vse.cz',
            'Referer': 'https://insis.vse.cz/katalog/index.pl?jak=rozsirene',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        }
    };

    try {
        console.log('Sending request to InSIS...');
        const response = await axios.post(url, formData, config);

        const html = response.data;
        const $ = cheerio.load(html);
        const subjects = [];

        // Base URL for constructing absolute links
        const baseUrl = 'https://insis.vse.cz/katalog/';

        // Select all anchor tags that contain "syllabus.pl?predmet="
        $('a[href*="syllabus.pl?predmet="]').each((index, element) => {
            const href = $(element).attr('href');

            if (href) {
                // Ensure the URL is absolute
                // The raw href in the image is like: "syllabus.pl?predmet=..."
                // Sometimes InSIS returns full paths, sometimes relative.
                const fullUrl = href.startsWith('http') ? href : baseUrl + href;

                // Clean up the URL (remove surrounding whitespace if any)
                subjects.push({
                    url: fullUrl.trim()
                });
            }
        });

        // Remove duplicates (optional, but InSIS sometimes lists things twice in table structures)
        const uniqueSubjects = [...new Set(subjects.map(s => s.url))]
            .map(url => ({ url }));

        // Save to file
        fs.writeFileSync('subjects.json', JSON.stringify(uniqueSubjects, null, 2));

        console.log(`Successfully scraped ${uniqueSubjects.length} subjects.`);
        console.log('Data saved to subjects.json');

    } catch (error) {
        console.error('Error scraping InSIS:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
        }
    }
}

scrapeInsisCatalog();
