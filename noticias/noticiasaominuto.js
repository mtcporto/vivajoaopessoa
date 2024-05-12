// noticiasaominuto.js
function loadNoticiasAoMinutoNews() {
    const url = 'https://cors.mosaicoworkers.workers.dev/www.noticiasaominuto.com.br/rss/brasil';
    let newsCount = 0;

    function loadNews() {
      fetch(url)
        .then(response => response.text())
        .then(str => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(str, "text/xml");

          xmlDoc.querySelectorAll('item').forEach((item, index) => {
            if (index >= newsCount && index < newsCount + 30) {
              const titleElement = item.querySelector("title");
              const title = titleElement ? titleElement.textContent : '';

              const linkElement = item.querySelector("link");
              const link = linkElement ? linkElement.textContent : '';

              let imgURL = "https://via.placeholder.com/300x200.png?text=Sem+Imagem";
              const imgElement = item.querySelector("enclosure");
              if (imgElement) {
                imgURL = imgElement.getAttribute('url');
              }

              // Formating the publication date
              const pubDateElement = item.querySelector("pubDate");
              let pubDate = pubDateElement ? new Date(pubDateElement.textContent) : new Date();

              const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              };
              pubDate = pubDate.toLocaleString('pt-BR', options);

              const html = `
                <div class="col-md-4">
                  <div class="card mb-4 shadow-sm">
                    <img src="${imgURL}" class="bd-placeholder-img card-img-top" width="100%" height="225">
                    <div class="card-body">
                    <p class="fonte">
                    <span class="badge badge-info">Fonte: Notícias ao Minuto</span>
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
          });
          newsCount += 30;
          if (newsCount < xmlDoc.querySelectorAll('item').length) {
            document.querySelector("#loadMore").style.display = 'block';
          } else {
            document.querySelector("#loadMore").style.display = 'none';
          }
        })
        .catch(error => console.error('Erro:', error));
    }

    document.querySelector("#loadMore").addEventListener('click', loadNews);
    loadNews();  }
