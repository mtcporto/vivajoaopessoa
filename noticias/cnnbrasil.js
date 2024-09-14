// cnnbrasil.js
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

      for (let index = newsCount; index < newsCount + 30 && index < items.length; index++) {
        const item = items[index];
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

        let imgURL = "https://via.placeholder.com/300x200.png?text=Sem+Imagem";

        // Fetch the article page to get the image
        try {
          const articleResponse = await fetch(link);
          const htmlString = await articleResponse.text();
          const articleDoc = parser.parseFromString(htmlString, 'text/html');
          const ogImage = articleDoc.querySelector('meta[property="og:image"]');
          if (ogImage) {
            imgURL = ogImage.getAttribute('content');
          }
        } catch (error) {
          console.error('Erro ao buscar imagem:', error);
        }

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
      if (newsCount < items.length) {
        document.querySelector("#loadMore").style.display = 'block';
      } else {
        document.querySelector("#loadMore").style.display = 'none';
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  document.querySelector("#loadMore").addEventListener('click', loadNews);
  loadNews();
}
