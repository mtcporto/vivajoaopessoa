function loadEventimEvents(callback) {
    const url = 'https://cors-eventim.mosaicoworkers.workers.dev/api/city/joao-pessoa-1816/';

    fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const eventos = Array.from(doc.querySelectorAll('product-group-item'))
                .map(evento => {
                    try {
                        const script = evento.querySelector('script[type="application/ld+json"]');
                        const data = JSON.parse(script.textContent);
                        
                        const startDate = new Date(data['startDate']);
                        const options = {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            timeZone: 'America/Sao_Paulo'
                        };

                        return {
                            title: data['name'],
                            date: startDate.toLocaleDateString('pt-BR', options),
                            image: data['image'][0],
                            link: data['url'],
                            location: data['location']['address']['addressLocality'],
                            source: 'Eventim'
                        };
                    } catch (error) {
                        console.error('Erro ao processar evento Eventim:', error);
                        return null;
                    }
                })
                .filter(Boolean);

            callback(eventos);
        })
        .catch(error => {
            console.error('Erro ao carregar Eventim:', error);
            callback([]);
        });
}
