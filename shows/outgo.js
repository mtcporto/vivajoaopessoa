function parsePortugueseDate(dateStr) {
  // Exemplo: "Sábado, 8 de fevereiro" ou "8 de fevereiro"
  const regex = /(\d{1,2})\s+de\s+(\w+)/i;
  const match = dateStr.match(regex);
  if(match) {
    const day = parseInt(match[1], 10);
    const monthName = match[2].toLowerCase();
    const months = {
      'janeiro': 0,
      'fevereiro': 1,
      'março': 2,
      'abril': 3,
      'maio': 4,
      'junho': 5,
      'julho': 6,
      'agosto': 7,
      'setembro': 8,
      'outubro': 9,
      'novembro': 10,
      'dezembro': 11,
    };
    const month = months[monthName];
    if (month === undefined) return null;
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, month, day);
  }
  return null;
}

function loadOutgoEvents(callback) {
    const url = 'https://cors.mosaicoworkers.workers.dev/www.outgo.com.br/eventos/PB';

    fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const eventos = Array.from(doc.querySelectorAll('card-event'))
                .map(evento => {
                    try {
                        const titleElement = evento.querySelector('.cardEvent-title');
                        if (!titleElement) return null;

                        const subtitleElements = evento.querySelectorAll('.cardEvent-subtitle');
                        if (!subtitleElements || subtitleElements.length < 2) return null;

                        const data = subtitleElements[0]?.querySelector('time')?.textContent.trim() 
                            || subtitleElements[0]?.textContent.trim();
                        const local = subtitleElements[1]?.textContent.trim() || '';

                        // Filtra eventos que não são de João Pessoa
                        if (!local || !local.includes('João Pessoa')) return null;

                        // Filtra eventos passados
                        const eventDate = parsePortugueseDate(data);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (eventDate && eventDate < today) return null;

                        const link = evento.querySelector('.card-link')?.getAttribute('href');
                        const image = evento.querySelector('.cardEvent-coverpage')?.getAttribute('src');

                        return {
                            title: titleElement.textContent.trim(),
                            link: link ? 'https://www.outgo.com.br' + link : '#',
                            image: image || 'placeholder.jpg',
                            date: data || 'Data não informada',
                            location: local,
                            source: 'Outgo'
                        };
                    } catch (error) {
                        console.error('Erro ao processar evento Outgo:', error);
                        return null;
                    }
                })
                .filter(Boolean);

            console.log('Eventos Outgo encontrados:', eventos.length);
            callback(eventos);
        })
        .catch(error => {
            console.error('Erro ao carregar Outgo:', error);
            callback([]);
        });
}
