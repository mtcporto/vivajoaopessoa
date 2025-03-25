document.addEventListener('DOMContentLoaded', function () {
  loadIngressoNacionalEvents();
});

function loadIngressoNacionalEvents() {
  const url = 'https://cors-ingressonacional.mosaicoworkers.workers.dev/?url=https://www.ingressonacional.com.br/show';
  
  let eventosCount = 0;

  fetch(url)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const eventosDiv = document.getElementById('eventos');

      const eventos = doc.querySelectorAll('.col-sm-6.col-md-3.mb-xs-1.ng-scope.show');

      eventos.forEach((evento, index) => {
        if (index >= eventosCount && index < eventosCount + 9) {
          try {
            const nome = evento.querySelector('h2').textContent.toLowerCase().replace(/\s/g, '-').replace(/[áàãâä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[íìîï]/g, 'i').replace(/[óòõôö]/g, 'o').replace(/[úùûü]/g, 'u').replace(/[ç]/g, 'c');
            const linkElement = evento.querySelector('a');
            const link = linkElement.getAttribute('ng-click').match(/evento.urlEvento=['"]([^'"]+)['"]/)[1];
            const title = evento.querySelector('h2').textContent.trim();

            const foto = evento.querySelector('img').src;
            const local = evento.querySelector('h3').textContent.trim();
            const cidade = evento.querySelector('h4').textContent.trim();

            if (cidade.includes('João Pessoa - PB')) {
              const data = evento.querySelector('span').textContent.trim();
              const eventoDiv = document.createElement('div');
              eventoDiv.className = 'col-md-4 col-sm-6 mb-4';
              eventoDiv.innerHTML = `
                <div class="card">
                  <a href="${link}" target="_blank" class="card-link">
                    <img src="${foto}" class="card-img-top" alt="${nome}">
                  </a>
                  <div class="card-body">
                  <p class="fonte">
                  <span class="badge badge-info">Fonte: Ingresso Nacional</span>
                  </p>                        
                    <h5 class="card-title">${title}</h5>
                    <p class="card-text">${data}</p>
                    <p class="card-text">João Pessoa, PB</p>
                  </div>
                </div><br>
              `;
              eventosDiv.appendChild(eventoDiv);
            }
          } catch (error) {
            console.error(`Erro ao processar o evento: ${error}`);
          }
        }
      });

      eventosCount += 50;
      if (eventosCount < eventos.length) {
        document.querySelector("#loadMore").style.display = 'block';
      } else {
        document.querySelector("#loadMore").style.display = 'none';
      }
    })
    .catch(console.error);
}

  