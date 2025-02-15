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



// Função para carregar notícias da CNN Brasil
async function loadCNNBrasilNews() {
  const url = 'https://cors.mosaicoworkers.workers.dev/www.cnnbrasil.com.br/feed/';
  let newsCount = 0;

  async function loadNews() {
    try {
      const response = await fetch(url);
      const data = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');
  
      for (let i = newsCount; i < Math.min(newsCount + 30, items.length); i++) {
        const item = items[i];
        const title = item.querySelector('title').textContent;
        const link = item.querySelector('link').textContent;
        const pubDate = new Date(item.querySelector('pubDate').textContent).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
  
        // Busca a imagem principal da página do artigo
        const imgURL = await getFeaturedImage(link);
  
        const html = `
          <div class="col-md-4">
            <div class="card mb-4 shadow-sm">
              <img src="${imgURL}" class="bd-placeholder-img card-img-top" width="100%" height="225">
              <div class="card-body">
                <p class="fonte">
                  <span class="badge badge-dark">Fonte: CNN Brasil</span>
                </p>                      
                <h5 class="card-title">${title}</h5>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="btn-group">
                    <a href="${link}" target="_blank" class="btn btn-sm btn-outline-secondary">Ver Notícia</a>
                  </div>
                  <small class="text-muted">${pubDate}</small>
                </div>
              </div>
            </div>
          </div>
        `;
  
        document.querySelector("#newsCards").innerHTML += html;
      }
  
      newsCount += 30;
      document.querySelector("#loadMore").style.display = (newsCount < items.length) ? 'block' : 'none';
    } catch (error) {
      console.error('Erro ao carregar notícias:', error);
    }
  }
  
  document.querySelector("#loadMore").addEventListener('click', loadNews);
  loadNews();
}
