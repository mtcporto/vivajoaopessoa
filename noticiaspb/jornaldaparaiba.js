async function getFeaturedImage(articleUrl) {
    try {
        console.log('Jornal da Paraíba: Buscando imagem da matéria:', articleUrl);
        const fixedUrl = 'https://cors.mosaicoworkers.workers.dev/' + articleUrl.replace(/^https?:\/\//, '');
        const response = await fetch(fixedUrl);
        const html = await response.text();
        
        // Busca a imagem pela estrutura do site (figura com picture e source)
        const imgMatch = html.match(/<figure[^>]*>.*?<picture>.*?<source[^>]*srcset="([^"?]+)/i);
        if (imgMatch) {
            console.log('Jornal da Paraíba: Imagem encontrada na página');
            return imgMatch[1];
        }
        
        console.log('Jornal da Paraíba: Imagem não encontrada na página');
        return null;
    } catch (error) {
        console.error('Jornal da Paraíba: Erro ao buscar imagem:', error);
        return null;
    }
}

async function loadJornalDaParaibaNews(callback) {
    const url = 'https://cors.mosaicoworkers.workers.dev/jornaldaparaiba.com.br/feed';
    const MAX_NEWS = 25;
    
    try {
        console.log('Jornal da Paraíba: Iniciando carregamento...');
        const response = await fetch(url);
        console.log('Jornal da Paraíba: Resposta recebida:', response.status);
        const data = await response.text();
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        console.log('Jornal da Paraíba: Itens encontrados:', items.length);
        
        const newsPromises = Array.from(items)
            .slice(0, MAX_NEWS)
            .map(async item => {
                try {
                    const title = item.querySelector('title')?.textContent.replace(/<!\[CDATA\[|\]\]>/g, '') || '';
                    const link = item.querySelector('link')?.textContent.replace(/<!\[CDATA\[|\]\]>/g, '') || '';
                    const pubDate = new Date(item.querySelector('pubDate')?.textContent || '');
                    
                    // Busca a imagem na página da matéria
                    const image = await getFeaturedImage(link);
                    
                    if (!image) {
                        console.log('Jornal da Paraíba: Notícia sem imagem:', title);
                        return null;
                    }

                    console.log('Jornal da Paraíba: Notícia processada com sucesso:', title);
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
                        source: 'Jornal da Paraíba'
                    };
                } catch (error) {
                    console.error('Jornal da Paraíba: Erro ao processar item:', error);
                    return null;
                }
            });

        const news = (await Promise.all(newsPromises)).filter(Boolean);
        console.log('Jornal da Paraíba: Total de notícias processadas:', news.length);
        callback(news);
    } catch (error) {
        console.error('Erro ao carregar notícias Jornal da Paraíba:', error);
        callback([]);
    }
}

// Adiciona função helper
function decodeHTMLEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}
