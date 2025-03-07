function loadUOLNews(callback) {
    const url = 'https://cors.mosaicoworkers.workers.dev/www.uol.com.br/vueland/api/?loadComponent=XmlFeedRss';
    const MAX_NEWS = 25;
    
    fetch(url)
        .then(response => response.text())
        .then(str => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(str, "text/xml");
            const items = xmlDoc.querySelectorAll('item');
            
            const news = Array.from(items)
                .map(item => {
                    try {
                        const title = item.querySelector("description")?.textContent;
                        const link = item.querySelector("link")?.textContent;
                        
                        // Filtra itens específicos
                        if (link.toLowerCase().includes("ingresso.com/filme") ||
                            link.toLowerCase().includes("uol.com.br/splash") ||
                            link.toLowerCase().includes("uol.com.br/guia-de-compras")) {
                            return null;
                        }

                        // Verifica se tem imagem
                        const imgElement = item.querySelector("*[url]");
                        if (!imgElement || !imgElement.getAttribute('url')) {
                            return null;
                        }
                        const image = imgElement.getAttribute('url');

                        const pubDate = new Date(item.querySelector("pubDate")?.textContent || new Date());

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
                            source: 'UOL'
                        };
                    } catch (err) {
                        console.error('UOL: Erro ao processar item:', err);
                        return null;
                    }
                })
                .filter(Boolean)
                .slice(0, MAX_NEWS);

            console.log('UOL: Notícias processadas:', news.length);
            callback(news);
        })
        .catch(error => {
            console.error('UOL: Erro ao carregar feed:', error);
            callback([]);
        });
}

// Função auxiliar para decodificar entidades HTML
function decodeEntities(text) {
    try {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    } catch (error) {
        console.error('Erro ao decodificar texto:', error);
        return text;
    }
}

