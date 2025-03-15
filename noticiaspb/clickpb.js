// Rename getFeaturedImage to avoid conflict
async function getClickPBFeaturedImage(articleUrl) {
    try {
        console.log('ClickPB: Buscando imagem da matéria:', articleUrl);
        const fixedUrl = 'https://cors.mosaicoworkers.workers.dev/' + articleUrl.replace(/^https?:\/\//, '');
        const response = await fetch(fixedUrl);
        const html = await response.text();
        
        // Busca a imagem no HTML da página usando o padrão específico do WordPress
        const imgMatch = html.match(/<div class="post-thumbnail"><img[^>]+src="([^"]+)".*?class="[^"]*wp-post-image[^"]*"/);
        if (imgMatch) {
            // Pega a primeira URL do src (antes do srcset)
            const imageUrl = imgMatch[1];
            console.log('ClickPB: Imagem encontrada na página:', imageUrl);
            return imageUrl;
        }
        
        // Segunda tentativa: busca qualquer imagem com classe wp-post-image
        const fallbackMatch = html.match(/<img[^>]+class="[^"]*wp-post-image[^"]*"[^>]+src="([^"]+)"/);
        if (fallbackMatch) {
            const imageUrl = fallbackMatch[1];
            console.log('ClickPB: Imagem encontrada (fallback):', imageUrl);
            return imageUrl;
        }
        
        console.log('ClickPB: Imagem não encontrada na página');
        return null;
    } catch (error) {
        console.error('ClickPB: Erro ao buscar imagem:', error);
        return null;
    }
}

async function loadClickPBNews(callback) {
    const url = 'https://cors.mosaicoworkers.workers.dev/www.clickpb.com.br/paraiba/feed';
    const MAX_NEWS = 25;
    
    try {
        console.log('ClickPB: Iniciando carregamento...');
        const response = await fetch(url);
        console.log('ClickPB: Resposta recebida:', response.status);
        const data = await response.text();
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        console.log('ClickPB: Itens encontrados:', items.length);
        
        const newsPromises = Array.from(items)
            .slice(0, MAX_NEWS)
            .map(async item => {
                try {
                    const title = item.querySelector('title')?.textContent || '';
                    const link = item.querySelector('link')?.textContent || '';
                    const pubDate = new Date(item.querySelector('pubDate')?.textContent || '');
                    
                    // Busca a imagem na página da matéria
                    const image = await getClickPBFeaturedImage(link);
                    
                    if (!image) {
                        console.log('ClickPB: Notícia sem imagem:', title);
                        return null;
                    }

                    console.log('ClickPB: Notícia processada com sucesso:', title);
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
                        source: 'ClickPB'
                    };
                } catch (error) {
                    console.error('ClickPB: Erro ao processar item:', error);
                    return null;
                }
            });

        const news = (await Promise.all(newsPromises)).filter(Boolean);
        console.log('ClickPB: Total de notícias processadas:', news.length);
        callback(news);
    } catch (error) {
        console.error('Erro ao carregar notícias ClickPB:', error);
        callback([]);
    }
}
