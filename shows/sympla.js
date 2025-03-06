function loadSymplaEvents(callback) {
    const url = 'https://www.sympla.com.br/eventos/joao-pessoa-pb/esta-semana?cl=17-festas-e-shows';

    fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const eventos = Array.from(doc.querySelectorAll('a.sympla-card'))
                .map(evento => {
                    try {
                        return {
                            title: evento.getAttribute('data-name'),
                            link: evento.getAttribute('href'),
                            image: evento.querySelector('img')?.src || 'placeholder.jpg',
                            location: evento.querySelector('.pn67h1a')?.textContent || 'Local não informado',
                            date: evento.querySelector('.qtfy413')?.textContent || 'Data não informada',
                            source: 'Sympla'
                        };
                    } catch (error) {
                        console.error('Erro ao processar evento Sympla:', error);
                        return null;
                    }
                })
                .filter(evento => evento && evento.location.includes('João Pessoa'));

            callback(eventos);
        })
        .catch(error => {
            console.error('Erro ao carregar Sympla:', error);
            callback([]);
        });
}

// Function to parse and standardize date strings
function parseAndStandardizeDate(dateStr) {
    // Trim the string
    dateStr = dateStr.trim();

    // Split the date and time parts
    let [datePart, timePart] = dateStr.split('·').map(s => s.trim());

    // Define a mapping from month abbreviations to numbers
    const monthMap = {
        'jan': '01',
        'fev': '02',
        'mar': '03',
        'abr': '04',
        'mai': '05',
        'jun': '06',
        'jul': '07',
        'ago': '08',
        'set': '09',
        'out': '10',
        'nov': '11',
        'dez': '12'
    };

    let day, month, year;
    const currentYear = new Date().getFullYear();

    // Regular expressions to match different date formats
    const regex1 = /^[A-Za-z]{3},\s*(\d{1,2})\s*([A-Za-z]{3})$/i; // e.g., 'Sex, 20 Set'
    const regex2 = /^(\d{1,2})\s*de\s*([A-Za-z]{3,})$/i;           // e.g., '29 de nov'
    const regex3 = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;            // e.g., '16/09/24'
    const regex4 = /^(\d{1,2})\/(\d{1,2})(\d{2}:\d{2})$/;          // e.g., '26/0920:00'
    const regex5 = /^(\d{1,2})\/(\d{1,2})$/;                       // e.g., '26/09'

    let match;

    if ((match = datePart.match(regex1))) {
        // Format: 'Sex, 20 Set'
        day = match[1];
        month = monthMap[match[2].toLowerCase()];
        year = currentYear;
    } else if ((match = datePart.match(regex2))) {
        // Format: '29 de nov'
        day = match[1];
        month = monthMap[match[2].slice(0, 3).toLowerCase()];
        year = currentYear;
    } else if ((match = datePart.match(regex3))) {
        // Format: '16/09/24' or '16/09/2024'
        day = match[1];
        month = match[2];
        year = match[3].length === 2 ? '20' + match[3] : match[3];
    } else if ((match = dateStr.match(regex4))) {
        // Format: '26/0920:00' (date and time together)
        day = match[1];
        month = match[2];
        timePart = match[3];
        year = currentYear;
    } else if ((match = datePart.match(regex5))) {
        // Format: '26/09'
        day = match[1];
        month = match[2];
        year = currentYear;
    } else {
        // Unrecognized format; return the original string
        return dateStr;
    }

    // Ensure day and month are two digits
    day = day.padStart(2, '0');
    month = month.padStart(2, '0');

    // Assemble the standardized date
    let standardizedDate = `${day}/${month}/${year}`;

    // Append time if available
    if (timePart) {
        standardizedDate += ` ${timePart}`;
    } else if (dateStr.includes(':')) {
        // Handle time if it's present without the '·' separator
        timePart = dateStr.match(/(\d{2}:\d{2})/);
        if (timePart) {
            standardizedDate += ` ${timePart[1]}`;
        }
    }

    return standardizedDate;
}
