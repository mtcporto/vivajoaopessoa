function loadBilheteriaDigitalEvents(callback) {
    const url = 'https://cors.mosaicoworkers.workers.dev/www.bilheteriadigital.com/PB';

    fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const eventos = Array.from(doc.querySelectorAll('.box-li-evento'))
                .map(evento => {
                    try {
                        const diaElement = evento.querySelector('.dia-box-evento');
                        const mesElement = evento.querySelector('.mes-box-evento');
                        const cidade = evento.querySelector('.cidade-box-evento').textContent;

                        if (!cidade.includes('João Pessoa - PB')) return null;

                        return {
                            title: evento.querySelector('.titulo-evento-thumb').textContent,
                            link: 'https://www.bilheteriadigital.com' + evento.querySelector('a').getAttribute('href'),
                            image: evento.querySelector('img').getAttribute('data-src') || evento.querySelector('img').getAttribute('src'),
                            date: `${diaElement.textContent} de ${mesElement.textContent}`,
                            location: cidade,
                            source: 'Bilheteria Digital'
                        };
                    } catch (error) {
                        console.error('Erro ao processar evento Bilheteria Digital:', error);
                        return null;
                    }
                })
                .filter(Boolean);

            callback(eventos);
        })
        .catch(error => {
            console.error('Erro ao carregar Bilheteria Digital:', error);
            callback([]);
        });
}
