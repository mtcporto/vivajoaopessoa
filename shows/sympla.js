function loadSymplaEvents() {
  const url = 'https://www.sympla.com.br/eventos/joao-pessoa-pb/show-musica-festa/shows?ordem=month_trending_score';

  let eventosCount = 0;

  fetch(url)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const eventosDiv = document.getElementById('eventos');

      const eventos = doc.querySelectorAll('a.sympla-card');

      eventos.forEach((evento, index) => {
        if (index >= eventosCount && index < eventosCount + 9) {
          try {
            const link = evento.getAttribute('href'); // Link do evento
            const idEvento = evento.getAttribute('id'); // ID do evento
            const nome = evento.getAttribute('data-name'); // Nome do evento
            const foto = evento.querySelector('img')?.src; // Imagem do evento
            const local = evento.querySelector('.pn67h1a')?.textContent || 'Local não informado'; // Local do evento
            const data = evento.querySelector('.qtfy413')?.textContent || 'Data não informada'; // Data do evento

            if (local.includes('João Pessoa, PB')) {
              const eventoDiv = document.createElement('div');
              eventoDiv.className = 'col-md-4 col-sm-6 mb-4';
              eventoDiv.innerHTML = `
                <div class="card">
                  <a href="${link}" target="_blank" class="card-link">
                    <img src="${foto || 'placeholder.jpg'}" class="card-img-top" alt="${nome}">
                  </a>
                  <div class="card-body">
                    <p class="fonte">
                      <span class="badge badge-info">Fonte: Sympla</span>
                    </p>                        
                    <h5 class="card-title">${nome}</h5>
                    <p class="card-text">${data}</p>
                    <p class="card-text">${local}</p>
                  </div>
                </div><br>
              `;
              eventosDiv.appendChild(eventoDiv);
            }
          } catch (error) {
            console.error(`Erro ao processar o evento: ${error}`);
          }
        }
      });

      eventosCount += 50;
      if (eventosCount < eventos.length) {
        document.querySelector("#loadMore").style.display = 'block';
      } else {
        document.querySelector("#loadMore").style.display = 'none';
      }
    })
    .catch(console.error);




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
}
