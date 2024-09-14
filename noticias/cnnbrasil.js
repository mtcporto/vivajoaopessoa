// cnnbrasil.js
function loadCNNBrasilNews() {
  const url = 'https://cors.mosaicoworkers.workers.dev/www.cnnbrasil.com.br/feed/';
  let newsCount = 0;

  function adjustURL(url) {
      return 'https://cors.mosaicoworkers.workers.dev/' + url.replace('https://', '');
  }

  function loadNews() {
      fetch(url)
          .then(response => response.text())
          .then(data => {
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
                  let contentEncoded = item.querySelector('content\\:encoded, encoded').textContent;
                  const contentDoc = parser.parseFromString(contentEncoded, 'text/html');
                  const imgElement = contentDoc.querySelector('img');
                  if (imgElement) {
                      imgURL = imgElement.getAttribute('src');
                      // Adjust the image URL to use the CORS proxy
                      imgURL = adjustURL(imgURL);
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
          })
          .catch(error => console.error('Erro:', error));
  }

  document.querySelector("#loadMore").addEventListener('click', loadNews);
  loadNews();
}
