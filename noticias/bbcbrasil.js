function loadBBCBrasilNews(callback) {
    const url = 'https://cors.mosaicoworkers.workers.dev/feeds.bbci.co.uk/portuguese/rss.xml';
    const MAX_NEWS = 25;
    
    fetch(url)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'text/xml');
            const items = xmlDoc.querySelectorAll('item');
            
            console.log('BBC: Itens encontrados:', items.length);
            
            const news = Array.from(items)
                .map(item => {
                    try {
                        const title = item.querySelector('title')?.textContent || '';
                        const link = item.querySelector('link')?.textContent || '#';
                        
                        // Nova estratégia para encontrar imagens
                        let image = null;
                        
                        // 1. Tenta encontrar no namespace media
                        const mediaContent = item.querySelector('media\\:content, content');
                        if (mediaContent) {
                            image = mediaContent.getAttribute('url');
                        }

                        // 2. Tenta encontrar no namespace media:thumbnail
                        if (!image) {
                            const mediaThumbnail = item.querySelector('media\\:thumbnail, thumbnail');
                            if (mediaThumbnail) {
                                image = mediaThumbnail.getAttribute('url');
                            }
                        }

                        // 3. Tenta encontrar na descrição
                        if (!image) {
                            const description = item.querySelector('description')?.textContent || '';
                            const imgMatch = description.match(/src="([^"]+)"/);
                            if (imgMatch) {
                                image = imgMatch[1];
                            }
                        }

                        // Se não encontrou imagem, tenta uma última estratégia
                        if (!image) {
                            const content = item.querySelector('content\\:encoded')?.textContent || '';
                            const imgMatch = content.match(/src="([^"]+)"/);
                            if (imgMatch) {
                                image = imgMatch[1];
                            }
                        }

                        // Se ainda não tem imagem, pula
                        if (!image) {
                            console.log('BBC: Notícia sem imagem:', title);
                            return null;
                        }

                        const pubDate = new Date(item.querySelector('pubDate')?.textContent || new Date());
                        
                        return {
                            title,
                            link,
                            date: pubDate.toLocaleString('pt-BR'),
                            image,
                            source: 'BBC Brasil'
                        };
                    } catch (error) {
                        console.error('BBC: Erro ao processar notícia:', error);
                        return null;
                    }
                })
                .filter(Boolean)
                .slice(0, MAX_NEWS); // Limita a 25 notícias após filtrar as que têm imagem

            console.log('BBC: Notícias processadas com imagem:', news.length);
            callback(news);
        })
        .catch(error => {
            console.error('Erro ao carregar notícias BBC:', error);
            callback([]);
        });
}

