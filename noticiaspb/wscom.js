async function getWSCOMFeaturedImage(articleUrl) {
    try {
        // console.log('WSCOM: Buscando imagem da matéria:', articleUrl);
        const fixedUrl = 'https://cors.mosaicoworkers.workers.dev/' + articleUrl.replace(/^https?:\/\//, '');
        const response = await fetch(fixedUrl);
        const html = await response.text();
        
        // Busca a imagem no HTML da página
        const imgMatch = html.match(/<figure[^>]*>\s*<img[^>]+src="([^"]+)"/i);
        if (imgMatch) {
            // console.log('WSCOM: Imagem encontrada na página');
            return imgMatch[1];
        }
        
        // console.log('WSCOM: Imagem não encontrada na página');
        return null;
    } catch (error) {
        console.error('WSCOM: Erro ao buscar imagem:', error);
        return null;
    }
}

async function loadWSCOMNews(callback) {
    const url = 'https://cors.mosaicoworkers.workers.dev/wscom.com.br/feed';
    const MAX_NEWS = 25;
    
    try {
        // console.log('WSCOM: Iniciando carregamento...');
        const response = await fetch(url);
        // console.log('WSCOM: Resposta recebida:', response.status);
        const data = await response.text();
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        // console.log('WSCOM: Itens encontrados:', items.length);
        
        const newsPromises = Array.from(items)
            .slice(0, MAX_NEWS)
            .map(async item => {
                try {
                    const title = item.querySelector('title')?.textContent.replace(/<!\[CDATA\[|\]\]>/g, '') || '';
                    const link = item.querySelector('link')?.textContent || '';
                    const pubDate = new Date(item.querySelector('pubDate')?.textContent || '');
                    
                    // Busca a imagem na página da matéria
                    const image = await getWSCOMFeaturedImage(link);
                    
                    if (!image) {
                        // console.log('WSCOM: Notícia sem imagem:', title);
                        return null;
                    }

                    // console.log('WSCOM: Notícia processada com sucesso:', title);
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
                        source: 'WSCOM'
                    };
                } catch (error) {
                    console.error('WSCOM: Erro ao processar item:', error);
                    return null;
                }
            });

        const news = (await Promise.all(newsPromises)).filter(Boolean);
        // console.log('WSCOM: Total de notícias processadas:', news.length);
        callback(news);
    } catch (error) {
        console.error('Erro ao carregar notícias WSCOM:', error);
        callback([]);
    }
}
