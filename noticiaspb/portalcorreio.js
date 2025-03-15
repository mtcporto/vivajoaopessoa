async function loadPortalCorreioNews(callback) {
    const url = 'https://portalcorreio.com.br/feed';
    const MAX_NEWS = 25;
    
    try {
        const response = await fetch(url);
        const data = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        
        const news = Array.from(items)
            .slice(0, MAX_NEWS)
            .map(item => {
                const title = item.querySelector('title')?.textContent || '';
                const link = item.querySelector('link')?.textContent || '';
                const pubDate = new Date(item.querySelector('pubDate')?.textContent || '');
                
                // Buscar imagem no content:encoded
                const content = item.querySelector('content\\:encoded')?.textContent || '';
                const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i);
                const image = imgMatch ? imgMatch[1] : null;

                if (!image) return null;

                return {
                    title,
                    link,
                    image,
                    date: pubDate.toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    source: 'Portal Correio'
                };
            })
            .filter(Boolean);

        callback(news);
    } catch (error) {
        console.error('Erro ao carregar notícias Portal Correio:', error);
        callback([]);
    }
}
