function loadG1News() {
    // Usando um proxy para evitar problemas de CORS – ajuste se necessário
    const url = 'https://cors.mosaicoworkers.workers.dev/g1.globo.com/rss/g1/';
    let newsCount = 0;
  
    function loadNews() {
      fetch(url)
        .then(response => response.text())
        .then(data => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data, 'text/xml');
          const items = xmlDoc.querySelectorAll('item');
  
          items.forEach((item, index) => {
            // Exibe 30 notícias por chamada
            if (index >= newsCount && index < newsCount + 30) {
              const title = item.querySelector('title') ? item.querySelector('title').textContent : '';
              const link = item.querySelector('link') ? item.querySelector('link').textContent : '#';
              const pubDateElement = item.querySelector('pubDate');
              const pubDate = pubDateElement ? new Date(pubDateElement.textContent) : new Date();
              const formattedDate = pubDate.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              });
  
              // Tenta obter a imagem a partir da tag <media:content> ou, se não encontrar, extrai do <img> dentro da descrição
              let imgURL = "https://placehold.co/300x200?text=Sem+Imagem";
              const mediaContent = item.querySelector('media\\:content, content');
              if (mediaContent && mediaContent.getAttribute('url')) {
                imgURL = mediaContent.getAttribute('url');
              } else {
                const description = item.querySelector('description') ? item.querySelector('description').textContent : '';
                const imgMatch = description.match(/<img.*?src="(.*?)"/);
                if (imgMatch && imgMatch[1]) {
                  imgURL = imgMatch[1];
                }
              }
  
              // Se não houver imagem válida, pula essa notícia
              if (imgURL === "https://placehold.co/300x200?text=Sem+Imagem") {
                return; // Pula esta iteração
              }
  
              const html = `
                <div class="col-md-4">
                  <div class="card mb-4 shadow-sm">
                    <img src="${imgURL}" class="bd-placeholder-img card-img-top" width="100%" height="225" alt="${title}">
                    <div class="card-body">
                      <p class="fonte">
                        <span class="badge badge-danger">Fonte: G1</span>
                      </p>
                      <h5 class="card-title">${title}</h5>
                      <div class="d-flex justify-content-between align-items-center">
                        <div class="btn-group">
                          <a href="${link}" target="_blank" class="btn btn-sm btn-outline-secondary">Ver Notícia</a>
                        </div>
                        <small class="text-muted">${formattedDate}</small>
                      </div>
                    </div>
                  </div>
                </div>
              `;
              document.querySelector("#newsCards").innerHTML += html;
            }
          });
  
          newsCount += 30;
          document.querySelector("#loadMore").style.display = (newsCount < items.length) ? 'block' : 'none';
        })
        .catch(error => console.error('Erro ao carregar notícias do G1:', error));
    }
  
    document.querySelector("#loadMore").addEventListener('click', loadNews);
    loadNews();
  }
  