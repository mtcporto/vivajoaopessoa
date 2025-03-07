async function getFeaturedImage(articleURL) {
  try {
    // Remove o protocolo da URL para funcionar com o proxy
    const fixedArticleURL = articleURL.replace(/^https?:\/\//, '');
    const response = await fetch('https://cors.mosaicoworkers.workers.dev/' + fixedArticleURL);
    const htmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // 1. Tenta buscar a imagem padrão (featured)
    let imgElement = doc.querySelector('.featured-image__img');
    if (imgElement && imgElement.src) {
      return imgElement.src;
    }

    // 2. Tenta pegar a imagem fullscreen (fallback)
    imgElement = doc.querySelector('.fullscreen-img');
    if (imgElement && imgElement.getAttribute('data-src')) {
      return imgElement.getAttribute('data-src');
    }

    // 3. Se for vídeo, procura um elemento com atributo data-youtube-id
    const videoElement = doc.querySelector('[data-youtube-id]');
    if (videoElement) {
      const youtubeId = videoElement.getAttribute('data-youtube-id');
      if (youtubeId) {
        return `https://img.youtube.com/vi/${youtubeId}/sddefault.jpg`;
      }
    }

    // 4. Se não achou pelo data-youtube-id, tenta buscar a thumbnail dentro do container de vídeo
    imgElement = doc.querySelector('.post__video .thumbnail-image');
    if (imgElement && imgElement.src) {
      return imgElement.src;
    }

    // 5. Se for galeria, busca a imagem com a classe gallery__img
    imgElement = doc.querySelector('.gallery__img');
    if (imgElement && imgElement.src) {
      return imgElement.src;
    }

    // Se nada for encontrado, retorna o placeholder
    return "https://placehold.co/300x200?text=Sem+Imagem";
  } catch (error) {
    console.error("Erro ao buscar imagem do artigo:", error);
    return "https://placehold.co/300x200?text=Sem+Imagem";
  }
}

function loadCNNBrasilNews(callback) {
  const url = 'https://cors.mosaicoworkers.workers.dev/www.cnnbrasil.com.br/feed/';
  const MAX_NEWS = 25;
  
  fetch(url)
      .then(response => response.text())
      .then(async data => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data, 'text/xml');
          const items = xmlDoc.querySelectorAll('item');
          
          const newsPromises = Array.from(items)
              .slice(0, MAX_NEWS)  // Limita a 25 notícias
              .map(async item => {
                  try {
                      const title = item.querySelector('title')?.textContent || '';
                      const link = item.querySelector('link')?.textContent || '#';
                      const pubDate = new Date(item.querySelector('pubDate')?.textContent || new Date());
                      
                      // Busca imagem e retorna null se não encontrar
                      const image = await getFeaturedImage(link);
                      if (!image || image.includes('placehold.co')) {
                          return null;
                      }

                      return {
                          title,
                          link,
                          date: pubDate.toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                          }),
                          image,
                          source: 'CNN Brasil'
                      };
                  } catch (error) {
                      console.error('Erro ao processar notícia CNN:', error);
                      return null;
                  }
              });

          const news = (await Promise.all(newsPromises)).filter(Boolean);
          callback(news);
      })
      .catch(error => {
          console.error('Erro ao carregar notícias CNN:', error);
          callback([]);
      });
}
