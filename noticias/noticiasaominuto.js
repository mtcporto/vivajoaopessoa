// noticiasaominuto.js
function loadNoticiasAoMinutoNews(callback) {
    const url = 'https://cors.mosaicoworkers.workers.dev/www.noticiasaominuto.com.br/rss/brasil';
    const MAX_NEWS = 25;
    
    fetch(url)
        .then(response => response.text())
        .then(str => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(str, "text/xml");
            const items = xmlDoc.querySelectorAll('item');
            
            const news = Array.from(items)
                .slice(0, MAX_NEWS)
                .map(item => {
                    try {
                        const title = item.querySelector("title")?.textContent;
                        const link = item.querySelector("link")?.textContent;
                        const pubDate = new Date(item.querySelector("pubDate")?.textContent || new Date());

                        // Procura imagem no enclosure
                        let image = "https://placehold.co/300x200?text=Sem+Imagem";
                        const imgElement = item.querySelector("enclosure");
                        if (imgElement && imgElement.getAttribute('url')) {
                            image = imgElement.getAttribute('url');
                        }

                        return {
                            title,
                            link,
                            image,
                            date: pubDate.toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            }),
                            source: 'Notícias ao Minuto'
                        };
                    } catch (err) {
                        console.error('NAM: Erro ao processar item:', err);
                        return null;
                    }
                })
                .filter(Boolean);

            console.log('NAM: Notícias processadas:', news.length);
            callback(news);
        })
        .catch(error => {
            console.error('NAM: Erro ao carregar feed:', error);
            callback([]);
        });
}

// Função auxiliar para decodificar entidades HTML
function decodeEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}
