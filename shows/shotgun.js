function loadShotgunEvents(callback) {
    const url = 'https://cors.mosaicoworkers.workers.dev/shotgun.live/pt-br/cities/joao-pessoa';
    fetch(url)
        .then(response => response.text())
        .then(html => {
            // Remove todas as ocorrências de "/_next/static/" na string HTML
            html = html.replace(/\/_next\/static\//g, '');
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const eventElements = doc.querySelectorAll('a[data-slot="tracked-link"]');
            const events = Array.from(eventElements).map(el => {
                try {
                    // Link: concatena a URL base se for relativa
                    const relativeLink = el.getAttribute('href');
                    const link = relativeLink.startsWith('http') ? relativeLink : 'https://shotgun.live' + relativeLink;
                    // Título: do <p class="line-clamp-2"> 
                    const titleEl = el.querySelector('p.line-clamp-2');
                    const title = titleEl ? titleEl.textContent.trim() : 'Título não informado';
                    // Imagem: do <img> dentro do primeiro bloco
                    const imgEl = el.querySelector('img');
                    const image = imgEl ? imgEl.getAttribute('src') : 'placeholder.jpg';
                    // Local: do <div class="text-muted-foreground">
                    const locEl = el.querySelector('div.text-muted-foreground');
                    const location = locEl ? locEl.textContent.trim() : 'Local não informado';
                    // Extrai e formata a data
                    const timeEls = el.querySelectorAll('time');
                    let date = 'Data não informada';
                    if (timeEls.length > 0) {
                        const datetime = timeEls[0].getAttribute('datetime');
                        if (datetime) {
                            // Formata a data de forma amigável
                            date = new Date(datetime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
                        } else {
                            date = timeEls[0].textContent.trim();
                        }
                        if(timeEls.length > 1) {
                            // Se houver um segundo time, pode ser usado (opcional)
                            const timeText = timeEls[1].textContent.trim();
                            date += ` ${timeText}`;
                        }
                    }
                    return {
                        title,
                        link,
                        image,
                        date,
                        location,
                        source: 'Shotgun'
                    };
                } catch (error) {
                    console.error('Erro ao processar evento Shotgun:', error);
                    return null;
                }
            }).filter(Boolean);
            // console.log('Eventos Shotgun encontrados:', events.length);
            callback(events);
        })
        .catch(error => {
            console.error('Erro ao carregar eventos Shotgun:', error);
            callback([]);
        });
}
