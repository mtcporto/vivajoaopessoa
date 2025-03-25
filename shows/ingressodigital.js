function loadIngressoDigitalEvents(callback) {
    const url = 'https://cors.mosaicoworkers.workers.dev/ingressodigital.com/list.php?busca=S&txt_busca=joao+pessoa&txt_busca_m=';

    fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const eventos = Array.from(doc.querySelectorAll('.item-content'))
                .map(evento => {
                    try {
                        const imgElement = evento.querySelector('.item-content__img');
                        const localElement = evento.querySelector('.id-location span');

                        if (!localElement?.textContent.includes('João Pessoa, PB')) return null;

                        const dataElement = evento.querySelector('.d-flex');
                        let datas = [];
                        if (dataElement) {
                            datas = Array.from(dataElement.querySelectorAll('li a'))
                                .map(item => item.textContent.trim().replace(/\+$/, ''))
                                .map(text => text.replace(/^(\d{2}\/\d{2})(\d{2}:\d{2})$/, '$1 $2'));
                        }

                        return {
                            title: evento.querySelector('h2 a').textContent.trim(),
                            link: evento.querySelector('a').getAttribute('href').replace('./evento/', 'https://ingressodigital.com/evento/'),
                            image: imgElement?.style.backgroundImage.match(/url\((.*?)\)/i)?.[1].replace(/['"]/g, '') || 'placeholder.jpg',
                            date: datas.join(", "),
                            location: localElement.textContent,
                            source: 'Ingresso Digital'
                        };
                    } catch (error) {
                        console.error('Erro ao processar evento Ingresso Digital:', error);
                        return null;
                    }
                })
                .filter(Boolean);

            callback(eventos);
        })
        .catch(error => {
            console.error('Erro ao carregar Ingresso Digital:', error);
            callback([]);
        });
}